import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FreelanceService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(freelancerId: number) {
    const applications = await this.prisma.application.findMany({
      where: { freelancerId },
      include: {
        project: true,
      },
    });

    const activeContracts = await this.prisma.contract.findMany({
      where: {
        freelancerId,
        status: { in: ['IN_PROGRESS', 'WAITING_FOR_ADVANCE'] },
      },
      include: {
        project: true,
      },
    });

    // Calcul des revenus validés
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: freelancerId },
    });

    // Vérifier l'abonnement (désactivé pour le moment, on retourne toujours true)
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId: freelancerId }
    });
    const isSubscribed = true; // Désactivation de la contrainte d'abonnement

    return {
      applicationsCount: applications.length,
      activeMissionsCount: activeContracts.length,
      activeMissions: activeContracts,
      balance: wallet ? wallet.balance : 0,
      isSubscribed,
    };
  }

  async getWallet(userId: number) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          balance: 0
        },
        include: {
          transactions: true
        }
      });
    }

    return wallet;
  }

  // Liste publique de tous les freelances (accessible aux clients connectés)
  async getPublicFreelancers() {
    const freelancers = await this.prisma.user.findMany({
      where: { 
        role: 'FREELANCER',
        // subscription: {
        //   status: 'ACTIVE'
        // }
      },
      include: {
        profile: {
          include: {
            skills: {
              include: { skill: true },
            },
          },
        },
        experiences: true,
        educations: true,
        certificates: true,
        portfolios: true,
        freelancerReceivedReviews: {
          select: { ratingAverage: true },
        },
        freelancerContracts: {
          where: { status: 'VALIDATED' },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Ne garder que les freelances dont le profil est complété à au moins 80%
    const completeFreelancers = freelancers.filter((user) => {
      const p = user.profile;
      if (!p) return false;

      let filledCount = 0;

      // 1-6. Champs textuels
      if (p.firstName && p.firstName.trim().length > 0) filledCount++;
      if (p.lastName && p.lastName.trim().length > 0) filledCount++;
      if (p.title && p.title.trim().length > 0) filledCount++;
      if (p.bio && p.bio.trim().length > 0) filledCount++;
      if (p.location && p.location.trim().length > 0) filledCount++;
      if (p.phone && p.phone.trim().length > 0) filledCount++;

      // 7. Tarif horaire
      if (p.hourlyRate !== null && p.hourlyRate !== undefined && Number(p.hourlyRate) > 0) {
        filledCount++;
      }

      // 8. Compétences
      const hasSkills = p.skills && p.skills.length > 0;
      if (hasSkills) filledCount++;

      // 9. Liens professionnels
      const hasLinks = !!(
        (p.githubLink && p.githubLink.trim().length > 0) ||
        (p.linkedinLink && p.linkedinLink.trim().length > 0) ||
        (p.websiteLink && p.websiteLink.trim().length > 0)
      );
      if (hasLinks) filledCount++;

      // 10. Photo de profil
      if (p.avatarUrl && p.avatarUrl.trim().length > 0) {
        filledCount++;
      }

      // 11. Portfolio
      if (user.portfolios && user.portfolios.length > 0) filledCount++;
      // 12. Experiences
      if (user.experiences && user.experiences.length > 0) filledCount++;
      // 13. Formations
      if (user.educations && user.educations.length > 0) filledCount++;
      // 14. Certifications
      if (user.certificates && user.certificates.length > 0) filledCount++;

      const completionPercentage = Math.round((filledCount / 14) * 100);
      return completionPercentage >= 80;
    });

    return completeFreelancers.map((user) => {
      const reviews = user.freelancerReceivedReviews;
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + Number(r.ratingAverage), 0) / reviews.length
          : null;

      return {
        id: user.id,
        email: user.email,
        profile: {
          ...user.profile,
          experiences: user.experiences,
          educations: user.educations,
          certificates: user.certificates,
          portfolios: user.portfolios,
        },
        completedMissions: user.freelancerContracts.length,
        averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        reviewsCount: reviews.length,
      };
    });
  }

  async applyToProject(
    freelancerId: number,
    dto: { projectId: number; bidAmount: number; deliveryDelay: number; coverLetter: string }
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project || project.status !== 'OPEN') {
      throw new Error("Ce projet n'est pas ouvert aux candidatures.");
    }

    const alreadyApplied = await this.prisma.application.findFirst({
      where: {
        projectId: dto.projectId,
        freelancerId,
      },
    });
    if (alreadyApplied) {
      throw new Error("Vous avez déjà postulé à ce projet.");
    }

    const application = await this.prisma.application.create({
      data: {
        projectId: dto.projectId,
        freelancerId,
        bidAmount: dto.bidAmount,
        deliveryDelay: dto.deliveryDelay,
        coverLetter: dto.coverLetter,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: project.clientId,
        title: 'Nouvelle candidature',
        content: `Un freelance a postulé à votre projet "${project.title}".`,
        type: 'new_application'
      }
    });

    return application;
  }

  async verifyStripeAccount(accountId: string) {
    return { status: 'pending', details: 'Vérification en cours' };
  }

  async getSidebarStats(freelancerId: number) {
    const activeMissionsCount = await this.prisma.contract.count({
      where: {
        freelancerId,
        status: { notIn: ['VALIDATED', 'CANCELLED', 'DRAFT', 'REFUSED'] }
      }
    });

    const pendingApplicationsCount = await this.prisma.application.count({
      where: {
        freelancerId,
        status: 'PENDING'
      }
    });

    const pendingInvitationsCount = await this.prisma.invitation.count({
      where: {
        freelancerId,
        status: 'PENDING'
      }
    });

    const unreadMessagesCount = await this.prisma.message.count({
      where: {
        isRead: false,
        senderId: { not: freelancerId },
        conversation: {
          members: {
            some: { userId: freelancerId }
          }
        }
      }
    });

    return {
      activeMissions: activeMissionsCount,
      pendingApplications: pendingApplicationsCount,
      pendingInvitations: pendingInvitationsCount,
      unreadMessages: unreadMessagesCount
    };
  }

  async getApplications(freelancerId: number) {
    return this.prisma.application.findMany({
      where: { freelancerId },
      include: {
        project: {
          include: {
            client: {
              include: { profile: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMission(freelancerId: number, contractId: number) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        project: {
          include: {
            category: true,
            subCategories: true
          }
        },
        client: {
          include: { profile: true },
        }
      }
    });

    if (!contract || contract.freelancerId !== freelancerId) {
      throw new BadRequestException("Contrat introuvable ou accès refusé.");
    }

    const application = await this.prisma.application.findFirst({
      where: { projectId: contract.projectId, freelancerId: contract.freelancerId }
    });

    return { ...contract, applications: [application] };
  }

  async signContract(freelancerId: number, contractId: number, signature: string, advancePercentage: number) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { project: true }
    });

    if (!contract || contract.freelancerId !== freelancerId) {
      throw new BadRequestException("Contrat introuvable ou vous n'êtes pas autorisé à le signer.");
    }

    if (contract.status !== 'DRAFT') {
      throw new BadRequestException("Ce contrat ne peut plus être signé.");
    }

    const updatedContract = await this.prisma.contract.update({
      where: { id: contractId },
      data: {
        freelancerSignature: signature,
        advancePercentage: advancePercentage,
        advanceStatus: 'PENDING',
      },
      include: {
        project: true
      }
    });

    // Notify client that freelancer has signed
    await this.prisma.notification.create({
      data: {
        userId: updatedContract.clientId,
        title: 'Contrat signé par le freelance',
        content: `Le freelance a signé le contrat pour le projet "${updatedContract.project.title}" et a défini ses conditions (Acompte de ${advancePercentage}%). Veuillez le consulter et le signer pour démarrer la mission.`,
        type: 'contract_signed'
      }
    });

    return updatedContract;
  }

  async rejectContract(freelancerId: number, contractId: number) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { project: true }
    });

    if (!contract || contract.freelancerId !== freelancerId) {
      throw new BadRequestException("Contrat introuvable.");
    }

    if (contract.status !== 'DRAFT') {
      throw new BadRequestException("Vous ne pouvez pas refuser un contrat qui n'est plus à l'état de brouillon.");
    }

    // Remettre la candidature en REJECTED (ou la laisser PENDING, mais REJECTED est plus logique)
    const application = await this.prisma.application.findFirst({
      where: { projectId: contract.projectId, freelancerId: contract.freelancerId }
    });

    if (application) {
      await this.prisma.application.update({
        where: { id: application.id },
        data: { status: 'REJECTED' }
      });
    }

    // Supprimer le contrat brouillon
    await this.prisma.contract.delete({
      where: { id: contractId }
    });

    await this.prisma.notification.create({
      data: {
        userId: contract.clientId,
        title: 'Contrat refusé',
        content: `Le freelance a refusé le contrat pour le projet "${contract.project.title}".`,
        type: 'application_status'
      }
    });

    return { message: 'Contrat refusé et supprimé avec succès.' };
  }

  async claimAdvance(freelancerId: number, contractId: number) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { project: true }
    });

    if (!contract || contract.freelancerId !== freelancerId) {
      throw new BadRequestException("Contrat introuvable.");
    }

    if (contract.status !== 'IN_PROGRESS' && contract.status !== 'WAITING_FOR_ADVANCE') {
      throw new BadRequestException("Le contrat n'est pas éligible pour réclamer un acompte.");
    }

    if (contract.advanceStatus !== 'PENDING') {
      throw new BadRequestException("L'acompte a déjà été réclamé ou payé.");
    }

    if (!contract.advancePercentage || contract.advancePercentage <= 0) {
      throw new BadRequestException("Aucun acompte défini pour ce contrat.");
    }

    const updatedContract = await this.prisma.contract.update({
      where: { id: contractId },
      data: { advanceStatus: 'CLAIMED' }
    });

    await this.prisma.notification.create({
      data: {
        userId: contract.clientId,
        title: "Demande d'acompte",
        content: `Le freelance a réclamé son acompte de ${contract.advancePercentage}% pour le projet "${contract.project.title}". Veuillez le valider dans vos contrats.`,
        type: 'advance_claimed'
      }
    });

    return updatedContract;
  }

  async updateMissionStatus(freelancerId: number, contractId: number, status: 'DELIVERED' | 'DISPUTE') {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { project: true }
    });

    if (!contract || contract.freelancerId !== freelancerId) {
      throw new BadRequestException("Contrat introuvable ou accès refusé.");
    }

    const allowed: Record<string, string[]> = {
      DELIVERED: ['IN_PROGRESS'],
      DISPUTE: ['IN_PROGRESS', 'DELIVERED']
    };

    if (!allowed[status].includes(contract.status)) {
      throw new BadRequestException(`Impossible de passer au statut "${status}" depuis "${contract.status}".`);
    }

    const updated = await this.prisma.contract.update({
      where: { id: contractId },
      data: {
        status,
        ...(status === 'DELIVERED' ? { endDate: new Date() } : {})
      },
      include: { project: true }
    });

    // Mettre à jour le statut du projet en conséquence
    const projectStatusMap: Record<string, string> = {
      DELIVERED: 'DELIVERED',
      DISPUTE: 'UNDER_DISPUTE'
    };
    await this.prisma.project.update({
      where: { id: contract.projectId },
      data: { status: projectStatusMap[status] as any }
    });

    const notifMessages: Record<string, string> = {
      DELIVERED: `Le freelance a marqué la mission "${updated.project.title}" comme livrée. Veuillez valider ou contester.`,
      DISPUTE: `Un litige a été signalé pour la mission "${updated.project.title}".`
    };

    await this.prisma.notification.create({
      data: {
        userId: updated.clientId,
        title: status === 'DELIVERED' ? 'Mission livrée' : 'Litige signalé',
        content: notifMessages[status],
        type: status === 'DELIVERED' ? 'mission_delivered' : 'mission_dispute'
      }
    });

    return updated;
  }

  async getMissions(freelancerId: number) {
    return this.prisma.contract.findMany({
      where: { freelancerId },
      include: {
        project: {
          include: {
            category: true,
            subCategories: true
          }
        },
        client: {
          include: { profile: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getInvitations(freelancerId: number) {
    return this.prisma.invitation.findMany({
      where: { freelancerId },
      include: {
        project: true,
        client: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                companyName: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateInvitationStatus(id: number, status: 'ACCEPTED' | 'DECLINED') {
    const invitation = await this.prisma.invitation.update({
      where: { id },
      data: { status },
      include: { project: true, client: true }
    });

    await this.prisma.notification.create({
      data: {
        userId: invitation.clientId,
        title: status === 'ACCEPTED' ? 'Invitation acceptée' : 'Invitation déclinée',
        content: `Le freelance a ${status === 'ACCEPTED' ? 'accepté' : 'décliné'} votre invitation pour le projet "${invitation.project.title}".`,
        type: 'invitation_status'
      }
    });

    return invitation;
  }

  // --- Favoris ---
  async toggleFavoriteProject(freelancerId: number, projectId: number) {
    const existing = await this.prisma.favorite.findFirst({
      where: {
        userId: freelancerId,
        projectId,
      },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { status: 'removed' };
    } else {
      await this.prisma.favorite.create({
        data: {
          userId: freelancerId,
          projectId,
        },
      });
      return { status: 'added' };
    }
  }

  async getFavoriteProjects(freelancerId: number) {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        userId: freelancerId,
        projectId: { not: null },
      },
      include: {
        project: {
          include: {
            client: { select: { email: true, profile: true } },
            skills: { include: { skill: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((fav) => fav.project);
  }
}

