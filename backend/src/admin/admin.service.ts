import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { TargetRole, SendMailDto } from './dto/send-mail.dto';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class AdminService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatGateway: ChatGateway
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '465', 10),
      secure: process.env.MAIL_ENCRYPTION === 'ssl', // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendMessageToUser(adminId: number, targetUserId: number, content: string) {
    // 1. Chercher une conversation existante entre l'admin et l'utilisateur
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { members: { some: { userId: adminId } } },
          { members: { some: { userId: targetUserId } } }
        ]
      }
    });

    // 2. Créer la conversation si elle n'existe pas
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          members: {
            create: [
              { userId: adminId },
              { userId: targetUserId }
            ]
          }
        }
      });
    }

    // 3. Créer le message
    const message = await this.prisma.message.create({
      data: {
        content,
        senderId: adminId,
        conversationId: conversation.id,
        isRead: false
      }
    });

    return message;
  }

  async suspendUser(userId: number, durationInDays?: number | null) {
    let suspendedUntil: Date | null = null;
    
    if (durationInDays) {
      suspendedUntil = new Date();
      suspendedUntil.setDate(suspendedUntil.getDate() + durationInDays);
    }

    // Supprimer toutes les sessions actives de l'utilisateur pour forcer la déconnexion
    await this.prisma.session.deleteMany({
      where: { userId }
    });

    // Forcer la déconnexion via WebSocket
    await this.chatGateway.forceDisconnectUser(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: true,
        suspendedUntil
      }
    });
  }

  async unsuspendUser(userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: false,
        suspendedUntil: null
      }
    });
  }

  async sendMail(dto: SendMailDto) {
    let whereClause = {};
    if (dto.targetRole === TargetRole.CLIENT) {
      whereClause = { role: 'CLIENT' };
    } else if (dto.targetRole === TargetRole.FREELANCER) {
      whereClause = { role: 'FREELANCER' };
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      select: { email: true }
    });

    const emails = users.map(u => u.email);

    if (emails.length === 0) {
      return { success: false, message: 'Aucun utilisateur trouvé pour cette cible.' };
    }

    // On utilise bcc pour envoyer à tout le monde sans qu'ils voient les adresses des autres
    // Alternativement on pourrait faire une boucle de sendMail
    try {
      await this.transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
        bcc: emails,
        subject: dto.subject,
        text: dto.message, // On envoie le message en texte brut
        html: `<div style="font-family: Arial, sans-serif; white-space: pre-wrap;">${dto.message}</div>`,
      });
      return { success: true, count: emails.length };
    } catch (error) {
      console.error('Erreur SMTP:', error);
      throw new Error('Impossible d\'envoyer l\'e-mail.');
    }
  }

  async getStats() {
    const clientsCount = await this.prisma.user.count({ where: { role: 'CLIENT' } });
    const freelancersCount = await this.prisma.user.count({ where: { role: 'FREELANCER' } });
    const projectsCount = await this.prisma.project.count();
    const contractsCount = await this.prisma.contract.count();

    // Renvoyer les statistiques de base pour le dashboard Admin
    return {
      clients: clientsCount,
      freelancers: freelancersCount,
      projects: projectsCount,
      contracts: contractsCount,
      commissions: 0, // À calculer selon les transactions réelles
      revenues: 0,
    };
  }

  async getUsers() {
    return this.prisma.user.findMany({
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            phone: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getProjects() {
    return this.prisma.project.findMany({
      include: {
        client: {
          include: {
            profile: true
          }
        },
        category: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCategories() {
    return this.prisma.category.findMany({
      include: {
        subCategories: true,
        _count: {
          select: { projects: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async createCategory(name: string, slug: string) {
    return this.prisma.category.create({
      data: { name, slug }
    });
  }

  async updateCategory(id: number, name: string, slug: string) {
    return this.prisma.category.update({
      where: { id },
      data: { name, slug }
    });
  }

  async deleteCategory(id: number) {
    return this.prisma.category.delete({
      where: { id }
    });
  }

  async addSubCategory(categoryId: number, name: string, slug: string) {
    return this.prisma.subCategory.create({
      data: { categoryId, name, slug }
    });
  }

  async removeSubCategory(id: number) {
    return this.prisma.subCategory.delete({
      where: { id }
    });
  }



  async getPayments() {
    return this.prisma.payment.findMany({
      include: {
        contract: {
          include: {
            project: { select: { title: true } },
            freelancer: { include: { profile: true } },
            client: { include: { profile: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getDisputes() {
    // Il faut utiliser un modèle pour les litiges si existant, ou mock pour l'instant
    return []; 
  }

  async getPendingVerifications() {
    return this.prisma.profile.findMany({
      where: { idVerificationStatus: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async approveVerification(profileId: number) {
    return this.prisma.profile.update({
      where: { id: profileId },
      data: {
        idVerificationStatus: 'APPROVED',
        idRejectionReason: null,
      },
    });
  }

  async rejectVerification(profileId: number, rejectionReason: string) {
    return this.prisma.profile.update({
      where: { id: profileId },
      data: {
        idVerificationStatus: 'REJECTED',
        idRejectionReason: rejectionReason,
      },
    });
  }
}
