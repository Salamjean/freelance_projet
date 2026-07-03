import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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
          balance: 0.00,
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
        throw new UnauthorizedException(`Votre compte est suspendu jusqu'au ${user.suspendedUntil.toLocaleDateString()}`);
      } else if (!user.suspendedUntil) {
        throw new UnauthorizedException('Votre compte est suspendu de façon permanente.');
      } else {
        // La suspension est expirée, on la lève
        await this.prisma.user.update({
          where: { id: user.id },
          data: { isSuspended: false, suspendedUntil: null }
        });
      }
    }

    // Générer l'access token et le refresh token
    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
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
    const accessToken = this.generateAccessToken(session.user.id, session.user.email, session.user.role);
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

  private generateAccessToken(userId: number, email: string, role: string): string {
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
        portfolios: { include: { files: true }, orderBy: { createdAt: 'desc' } },
        profile: {
          include: {
            skills: {
              include: { skill: true }
            }
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return {
      email: user.email,
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
      idVerificationStatus: user.profile?.idVerificationStatus || 'NOT_SUBMITTED',
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
  async addExperience(userId: number, dto: { company: string; position: string; description?: string; startDate: string; endDate?: string; isCurrent: boolean }) {
    return this.prisma.experience.create({
      data: {
        userId,
        company: dto.company,
        position: dto.position,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isCurrent: dto.isCurrent,
      }
    });
  }

  async deleteExperience(userId: number, id: number) {
    return this.prisma.experience.deleteMany({
      where: { id, userId }
    });
  }

  // --- Educations ---
  async addEducation(userId: number, dto: { school: string; degree: string; fieldOfStudy?: string; startDate: string; endDate?: string }) {
    return this.prisma.education.create({
      data: {
        userId,
        school: dto.school,
        degree: dto.degree,
        fieldOfStudy: dto.fieldOfStudy,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      }
    });
  }

  async deleteEducation(userId: number, id: number) {
    return this.prisma.education.deleteMany({
      where: { id, userId }
    });
  }

  // --- Certificates ---
  async addCertificate(userId: number, dto: { name: string; issuer: string; issueDate: string; expiryDate?: string; credentialUrl?: string }) {
    return this.prisma.certificate.create({
      data: {
        userId,
        name: dto.name,
        issuer: dto.issuer,
        issueDate: new Date(dto.issueDate),
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        credentialUrl: dto.credentialUrl,
      }
    });
  }

  async deleteCertificate(userId: number, id: number) {
    return this.prisma.certificate.deleteMany({
      where: { id, userId }
    });
  }

  // --- Portfolios ---
  async addPortfolio(userId: number, dto: { title: string; description?: string; githubLink?: string; demoLink?: string; fileUrl?: string; fileName?: string; fileType?: string }) {
    const portfolio = await this.prisma.portfolio.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        githubLink: dto.githubLink,
        demoLink: dto.demoLink,
      }
    });

    if (dto.fileUrl && dto.fileName && dto.fileType) {
      await this.prisma.portfolioFile.create({
        data: {
          portfolioId: portfolio.id,
          fileUrl: dto.fileUrl,
          fileName: dto.fileName,
          fileType: dto.fileType,
        }
      });
    }

    return this.prisma.portfolio.findUnique({
      where: { id: portfolio.id },
      include: { files: true }
    });
  }

  async deletePortfolio(userId: number, id: number) {
    return this.prisma.portfolio.deleteMany({
      where: { id, userId }
    });
  }

  async submitVerification(userId: number, dto: { idType: string; idRectoUrl: string; idVersoUrl: string }) {
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
