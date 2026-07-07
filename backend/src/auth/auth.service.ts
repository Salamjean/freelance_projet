import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PreferredEmailOption } from './dto/preferred-email.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '465', 10),
      secure: process.env.MAIL_ENCRYPTION === 'ssl',
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async register(dto: RegisterDto) {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Cet e-mail est déjà utilisé');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Créer l'utilisateur, son profil et son portefeuille dans une transaction Prisma
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          role: dto.role,
        },
      });

      // Créer le profil associé
      await tx.profile.create({
        data: {
          userId: newUser.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });

      // Créer le portefeuille associé
      await tx.wallet.create({
        data: {
          userId: newUser.id,
          balance: 0.0,
        },
      });

      return newUser;
    });

    return {
      message: 'Inscription réussie !',
      userId: user.id,
    };
  }

  async login(dto: LoginDto, deviceInfo?: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        profile: true,
        wallet: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (user.isSuspended) {
      if (user.suspendedUntil && user.suspendedUntil > new Date()) {
        throw new UnauthorizedException(
          `Votre compte est suspendu jusqu'au ${user.suspendedUntil.toLocaleDateString()}`,
        );
      } else if (!user.suspendedUntil) {
        throw new UnauthorizedException(
          'Votre compte est suspendu de façon permanente.',
        );
      } else {
        // La suspension est expirée, on la lève
        await this.prisma.user.update({
          where: { id: user.id },
          data: { isSuspended: false, suspendedUntil: null },
        });
      }
    }

    // Générer l'access token et le refresh token
    const accessToken = this.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );
    const refreshToken = this.generateRefreshToken();

    // Calculer la date d'expiration du refresh token (ex: 7 jours)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Enregistrer la session en base de données
    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        deviceInfo,
        ipAddress,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        balance: user.wallet ? Number(user.wallet.balance) : 0,
      },
    };
  }

  async refresh(refreshToken: string, deviceInfo?: string, ipAddress?: string) {
    // Chercher la session par le refresh token
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        // Supprimer la session expirée
        await this.prisma.session.delete({ where: { id: session.id } });
      }
      throw new UnauthorizedException('Session expirée ou invalide');
    }

    // Générer de nouveaux tokens
    const accessToken = this.generateAccessToken(
      session.user.id,
      session.user.email,
      session.user.role,
    );
    const newRefreshToken = this.generateRefreshToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Mettre à jour la session avec le nouveau refresh token
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        deviceInfo,
        ipAddress,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    try {
      await this.prisma.session.delete({
        where: { refreshToken },
      });
      return { message: 'Déconnexion réussie' };
    } catch {
      throw new BadRequestException('Session introuvable');
    }
  }

  async requestPasswordReset(email: string) {
    if (!email) {
      throw new BadRequestException('Adresse e-mail manquante');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const successResponse = {
      message:
        'Un code OTP de réinitialisation a été envoyé à votre adresse e-mail.',
    };

    if (!user) {
      throw new BadRequestException("Cette adresse e-mail n'existe pas.");
    }

    await this.prisma.passwordReset.deleteMany({ where: { userId: user.id } });

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: otpHash,
        expiresAt,
      },
    });

    try {
      await this.transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME || 'Support'}" <${process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME}>`,
        to: user.email,
        subject: 'Votre code OTP de réinitialisation',
        text: `Votre code OTP de réinitialisation est: ${otp}\n\nCe code expire dans 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.5;">
            <h2 style="margin: 0 0 12px;">Code OTP de réinitialisation</h2>
            <p>Utilisez le code suivant pour réinitialiser votre mot de passe:</p>
            <p style="display: inline-block; margin: 10px 0; padding: 12px 16px; border-radius: 8px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-size: 24px; letter-spacing: 6px; font-weight: 700;">${otp}</p>
            <p style="font-size: 13px; color: #64748b;">Ce code expire dans 10 minutes.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Erreur envoi e-mail reset password:', error);
      throw new BadRequestException(
        "Impossible d'envoyer l'e-mail de réinitialisation",
      );
    }

    return successResponse;
  }

  async sendEmailVerification(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.role !== 'FREELANCER') {
      throw new BadRequestException(
        'La vérification e-mail est réservée aux freelances',
      );
    }

    if (user.isEmailVerified) {
      return { message: 'Adresse e-mail déjà vérifiée' };
    }

    const verifyToken = this.jwtService.sign(
      { sub: user.id, email: user.email, purpose: 'verify-email' },
      {
        secret: process.env['JWT_SECRET'] || 'supersecretkey',
        expiresIn: '24h',
      },
    );

    const frontendBaseUrl =
      process.env.FRONTEND_URL || 'http://192.168.1.18:5173';
    const verifyUrl = `${frontendBaseUrl}/verify-email?token=${encodeURIComponent(verifyToken)}`;

    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME || 'Support'}" <${process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME}>`,
        to: user.email,
        subject: 'Confirmation de votre adresse e-mail',
        text: `Cliquez sur ce lien pour confirmer votre e-mail: ${verifyUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.5;">
            <h2 style="margin: 0 0 12px;">Confirmez votre adresse e-mail</h2>
            <p>Merci de confirmer votre e-mail pour sécuriser votre compte freelance.</p>
            <p>
              <a href="${verifyUrl}" style="display: inline-block; padding: 10px 14px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Confirmer mon e-mail
              </a>
            </p>
            <p>Si le bouton ne fonctionne pas, copiez ce lien :</p>
            <p style="word-break: break-all;">${verifyUrl}</p>
            <p style="font-size: 13px; color: #64748b;">Ce lien expire dans 24 heures.</p>
          </div>
        `,
      });

      if (info.rejected && info.rejected.length > 0) {
        throw new BadRequestException(
          `L'adresse ${user.email} a été rejetée par le serveur SMTP`,
        );
      }
    } catch (error) {
      console.error('Erreur envoi e-mail verification:', error);
      throw new BadRequestException(
        "Impossible d'envoyer l'e-mail de vérification",
      );
    }

    return { message: `E-mail de vérification envoyé à ${user.email}` };
  }

  async setSecondaryEmail(userId: number, secondaryEmail: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    if (user.role !== 'FREELANCER') {
      throw new BadRequestException(
        'Le second e-mail est réservé aux freelances',
      );
    }

    if (typeof secondaryEmail !== 'string') {
      throw new BadRequestException('Adresse e-mail secondaire manquante');
    }

    const normalizedSecondary = secondaryEmail.trim().toLowerCase();
    if (!normalizedSecondary) {
      throw new BadRequestException('Adresse e-mail secondaire manquante');
    }
    if (normalizedSecondary === user.email.toLowerCase()) {
      throw new BadRequestException(
        'Le second e-mail doit être différent du mail principal',
      );
    }

    const existingOwner = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedSecondary },
          { secondaryEmail: normalizedSecondary },
        ],
        NOT: { id: userId },
      },
    });

    if (existingOwner) {
      throw new BadRequestException('Cette adresse e-mail est déjà utilisée');
    }

    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          secondaryEmail: normalizedSecondary,
          isSecondaryEmailVerified: false,
          preferredEmailType: 'PRIMARY',
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Cette adresse e-mail est déjà utilisée');
      }
      throw error;
    }

    return {
      message:
        'Second e-mail enregistré. Vérifiez-le pour pouvoir le définir en principal.',
      secondaryEmail: normalizedSecondary,
      isSecondaryEmailVerified: false,
    };
  }

  async sendSecondaryEmailVerification(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    if (user.role !== 'FREELANCER') {
      throw new BadRequestException(
        'Le second e-mail est réservé aux freelances',
      );
    }
    if (!user.secondaryEmail) {
      throw new BadRequestException('Aucun second e-mail renseigné');
    }
    if (user.isSecondaryEmailVerified) {
      return { message: 'Second e-mail déjà vérifié' };
    }

    const verifyToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        secondaryEmail: user.secondaryEmail,
        purpose: 'verify-secondary-email',
      },
      {
        secret: process.env['JWT_SECRET'] || 'supersecretkey',
        expiresIn: '24h',
      },
    );

    const frontendBaseUrl =
      process.env.FRONTEND_URL || 'http://192.168.1.18:5173';
    const verifyUrl = `${frontendBaseUrl}/verify-email?type=secondary&token=${encodeURIComponent(verifyToken)}`;

    try {
      await this.transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME || 'Support'}" <${process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME}>`,
        to: user.secondaryEmail,
        subject: 'Confirmation de votre second e-mail',
        text: `Cliquez sur ce lien pour confirmer votre second e-mail: ${verifyUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.5;">
            <h2 style="margin: 0 0 12px;">Confirmez votre second e-mail</h2>
            <p>Confirmez cet e-mail pour pouvoir le définir comme e-mail principal.</p>
            <p>
              <a href="${verifyUrl}" style="display: inline-block; padding: 10px 14px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Confirmer mon second e-mail
              </a>
            </p>
            <p>Si le bouton ne fonctionne pas, copiez ce lien :</p>
            <p style="word-break: break-all;">${verifyUrl}</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Erreur envoi e-mail secondary verification:', error);
      throw new BadRequestException(
        "Impossible d'envoyer l'e-mail de vérification du second e-mail",
      );
    }

    return {
      message: `E-mail de vérification envoyé à ${user.secondaryEmail}`,
    };
  }

  async verifySecondaryEmailToken(token: string) {
    if (!token) {
      throw new BadRequestException('Token de vérification manquant');
    }

    let payload: {
      sub: number;
      email: string;
      secondaryEmail: string;
      purpose: string;
    };
    try {
      payload = this.jwtService.verify<{
        sub: number;
        email: string;
        secondaryEmail: string;
        purpose: string;
      }>(token, {
        secret: process.env['JWT_SECRET'] || 'supersecretkey',
      });
    } catch {
      throw new BadRequestException('Lien de vérification invalide ou expiré');
    }

    if (!payload || payload.purpose !== 'verify-secondary-email') {
      throw new BadRequestException('Lien de vérification invalide');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (
      user.email !== payload.email ||
      !user.secondaryEmail ||
      user.secondaryEmail !== payload.secondaryEmail
    ) {
      throw new BadRequestException('Lien de vérification invalide');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isSecondaryEmailVerified: true },
    });

    return { message: 'Second e-mail vérifié avec succès' };
  }

  async setPreferredEmailType(
    userId: number,
    preferredEmailType: PreferredEmailOption,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    if (user.role !== 'FREELANCER') {
      throw new BadRequestException(
        'Le choix du mail principal est réservé aux freelances',
      );
    }

    if (preferredEmailType === PreferredEmailOption.SECONDARY) {
      if (!user.secondaryEmail) {
        throw new BadRequestException('Aucun second e-mail renseigné');
      }
      if (!user.isSecondaryEmailVerified) {
        throw new BadRequestException(
          'Veuillez vérifier le second e-mail avant de le définir en principal',
        );
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { preferredEmailType },
    });

    return {
      message:
        preferredEmailType === PreferredEmailOption.SECONDARY
          ? 'Le second e-mail est maintenant le mail principal'
          : "Le mail principal est revenu sur l'adresse principale",
      preferredEmailType,
    };
  }

  async verifyEmailToken(token: string) {
    if (!token) {
      throw new BadRequestException('Token de vérification manquant');
    }

    let payload: { sub: number; email: string; purpose: string };
    try {
      payload = this.jwtService.verify<{
        sub: number;
        email: string;
        purpose: string;
      }>(token, {
        secret: process.env['JWT_SECRET'] || 'supersecretkey',
      });
    } catch {
      throw new BadRequestException('Lien de vérification invalide ou expiré');
    }

    if (!payload || payload.purpose !== 'verify-email') {
      throw new BadRequestException('Lien de vérification invalide');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.email !== payload.email) {
      throw new BadRequestException('Lien de vérification invalide');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });

    return { message: 'Adresse e-mail vérifiée avec succès' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    if (!email || !otp || !newPassword) {
      throw new BadRequestException('Informations manquantes');
    }
    if (newPassword.length < 8) {
      throw new BadRequestException(
        'Le mot de passe doit contenir au moins 8 caractères',
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user) {
      throw new BadRequestException('Code OTP invalide ou expiré');
    }

    const resetEntry = await this.prisma.passwordReset.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!resetEntry || resetEntry.expiresAt < new Date()) {
      if (resetEntry) {
        await this.prisma.passwordReset.delete({
          where: { id: resetEntry.id },
        });
      }
      throw new BadRequestException('Code OTP invalide ou expiré');
    }

    const otpValid = await bcrypt.compare(otp, resetEntry.token);
    if (!otpValid) {
      throw new BadRequestException('Code OTP invalide ou expiré');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: resetEntry.userId },
        data: { password: hashedPassword },
      });

      // Invalider toutes les sessions actives de l'utilisateur.
      await tx.session.deleteMany({ where: { userId: resetEntry.userId } });

      await tx.passwordReset.deleteMany({
        where: { userId: resetEntry.userId },
      });
    });

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  private generateAccessToken(
    userId: number,
    email: string,
    role: string,
  ): string {
    return this.jwtService.sign(
      { sub: userId, email, role },
      {
        secret: process.env['JWT_SECRET'] || 'supersecretkey',
        expiresIn: '15m',
      },
    );
  }

  private generateRefreshToken(): string {
    return bcrypt.hashSync(Math.random().toString(36).substring(2), 10);
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        experiences: { orderBy: { startDate: 'desc' } },
        educations: { orderBy: { startDate: 'desc' } },
        certificates: { orderBy: { issueDate: 'desc' } },
        portfolios: {
          include: { files: true },
          orderBy: { createdAt: 'desc' },
        },
        profile: {
          include: {
            skills: {
              include: { skill: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return {
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      secondaryEmail: user.secondaryEmail,
      isSecondaryEmailVerified: user.isSecondaryEmailVerified,
      preferredEmailType: user.preferredEmailType,
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      title: user.profile?.title || '',
      bio: user.profile?.bio || '',
      location: user.profile?.location || '',
      phone: user.profile?.phone || '',
      hourlyRate: user.profile?.hourlyRate || null,
      githubLink: user.profile?.githubLink || '',
      linkedinLink: user.profile?.linkedinLink || '',
      websiteLink: user.profile?.websiteLink || '',
      skills: user.profile?.skills || [],
      idVerificationStatus:
        user.profile?.idVerificationStatus || 'NOT_SUBMITTED',
      idType: user.profile?.idType || null,
      idRectoUrl: user.profile?.idRectoUrl || null,
      idVersoUrl: user.profile?.idVersoUrl || null,
      idRejectionReason: user.profile?.idRejectionReason || null,
      avatarUrl: user.profile?.avatarUrl || '',
      cvUrl: user.profile?.cvUrl || '',
      isSubscribed: user.subscription?.status === 'ACTIVE',
      experiences: user.experiences || [],
      educations: user.educations || [],
      certificates: user.certificates || [],
      portfolios: user.portfolios || [],
    };
  }

  // --- Experiences ---
  async addExperience(
    userId: number,
    dto: {
      company: string;
      position: string;
      description?: string;
      startDate: string;
      endDate?: string;
      isCurrent: boolean;
    },
  ) {
    return this.prisma.experience.create({
      data: {
        userId,
        company: dto.company,
        position: dto.position,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isCurrent: dto.isCurrent,
      },
    });
  }

  async deleteExperience(userId: number, id: number) {
    return this.prisma.experience.deleteMany({
      where: { id, userId },
    });
  }

  // --- Educations ---
  async addEducation(
    userId: number,
    dto: {
      school: string;
      degree: string;
      fieldOfStudy?: string;
      startDate: string;
      endDate?: string;
    },
  ) {
    return this.prisma.education.create({
      data: {
        userId,
        school: dto.school,
        degree: dto.degree,
        fieldOfStudy: dto.fieldOfStudy,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }

  async deleteEducation(userId: number, id: number) {
    return this.prisma.education.deleteMany({
      where: { id, userId },
    });
  }

  // --- Certificates ---
  async addCertificate(
    userId: number,
    dto: {
      name: string;
      issuer: string;
      issueDate: string;
      expiryDate?: string;
      credentialUrl?: string;
    },
  ) {
    return this.prisma.certificate.create({
      data: {
        userId,
        name: dto.name,
        issuer: dto.issuer,
        issueDate: new Date(dto.issueDate),
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        credentialUrl: dto.credentialUrl,
      },
    });
  }

  async deleteCertificate(userId: number, id: number) {
    return this.prisma.certificate.deleteMany({
      where: { id, userId },
    });
  }

  // --- Portfolios ---
  async addPortfolio(
    userId: number,
    dto: {
      title: string;
      description?: string;
      githubLink?: string;
      demoLink?: string;
      fileUrl?: string;
      fileName?: string;
      fileType?: string;
    },
  ) {
    const portfolio = await this.prisma.portfolio.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        githubLink: dto.githubLink,
        demoLink: dto.demoLink,
      },
    });

    if (dto.fileUrl && dto.fileName && dto.fileType) {
      await this.prisma.portfolioFile.create({
        data: {
          portfolioId: portfolio.id,
          fileUrl: dto.fileUrl,
          fileName: dto.fileName,
          fileType: dto.fileType,
        },
      });
    }

    return this.prisma.portfolio.findUnique({
      where: { id: portfolio.id },
      include: { files: true },
    });
  }

  async deletePortfolio(userId: number, id: number) {
    return this.prisma.portfolio.deleteMany({
      where: { id, userId },
    });
  }

  async submitVerification(
    userId: number,
    dto: { idType: string; idRectoUrl: string; idVersoUrl: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    let profile = user.profile;
    if (!profile) {
      profile = await this.prisma.profile.create({
        data: { userId },
      });
    }

    const updatedProfile = await this.prisma.profile.update({
      where: { id: profile.id },
      data: {
        idType: dto.idType,
        idRectoUrl: dto.idRectoUrl,
        idVersoUrl: dto.idVersoUrl,
        idVerificationStatus: 'PENDING',
        idRejectionReason: null,
      },
    });

    return {
      message: 'Demande de vérification soumise avec succès',
      profile: updatedProfile,
    };
  }

  async updateProfile(userId: number, dto: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    let profile = user.profile;

    // Si le profil n'existe pas, on le crée
    if (!profile) {
      profile = await this.prisma.profile.create({
        data: { userId },
      });
    }

    // Mettre à jour les informations du profil
    const updatedProfile = await this.prisma.profile.update({
      where: { id: profile.id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        title: dto.title,
        bio: dto.bio,
        location: dto.location,
        phone: dto.phone,
        hourlyRate: dto.hourlyRate,
        githubLink: dto.githubLink,
        linkedinLink: dto.linkedinLink,
        websiteLink: dto.websiteLink,
        avatarUrl: dto.avatarUrl,
        cvUrl: dto.cvUrl,
      },
    });

    // Mettre à jour les compétences
    if (dto.skillNames && Array.isArray(dto.skillNames)) {
      // 1. Supprimer toutes les compétences actuelles du profil
      await this.prisma.freelancerSkill.deleteMany({
        where: { profileId: profile.id },
      });

      // 2. Associer les nouvelles compétences
      for (const skillName of dto.skillNames) {
        // Trouver ou créer la compétence par son nom
        const skill = await this.prisma.skill.upsert({
          where: { name: skillName },
          update: {},
          create: { name: skillName },
        });

        // Lier la compétence au freelance
        await this.prisma.freelancerSkill.create({
          data: {
            profileId: profile.id,
            skillId: skill.id,
          },
        });
      }
    }

    return {
      message: 'Profil mis à jour avec succès',
      profile: updatedProfile,
    };
  }

  async getNotifications(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20, // limit to recent 20
    });
  }

  async markNotificationAsRead(notificationId: number) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }
}
