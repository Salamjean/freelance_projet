"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreelanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FreelanceService = class FreelanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardData(freelancerId) {
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
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId: freelancerId },
        });
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId: freelancerId }
        });
        const isSubscribed = true;
        return {
            applicationsCount: applications.length,
            activeMissionsCount: activeContracts.length,
            activeMissions: activeContracts,
            balance: wallet ? wallet.balance : 0,
            isSubscribed,
        };
    }
    async getWallet(userId) {
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
    async getPublicFreelancers() {
        const freelancers = await this.prisma.user.findMany({
            where: {
                role: 'FREELANCER',
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
        const completeFreelancers = freelancers.filter((user) => {
            const p = user.profile;
            if (!p)
                return false;
            let filledCount = 0;
            if (p.firstName && p.firstName.trim().length > 0)
                filledCount++;
            if (p.lastName && p.lastName.trim().length > 0)
                filledCount++;
            if (p.title && p.title.trim().length > 0)
                filledCount++;
            if (p.bio && p.bio.trim().length > 0)
                filledCount++;
            if (p.location && p.location.trim().length > 0)
                filledCount++;
            if (p.phone && p.phone.trim().length > 0)
                filledCount++;
            if (p.hourlyRate !== null && p.hourlyRate !== undefined && Number(p.hourlyRate) > 0) {
                filledCount++;
            }
            const hasSkills = p.skills && p.skills.length > 0;
            if (hasSkills)
                filledCount++;
            const hasLinks = !!((p.githubLink && p.githubLink.trim().length > 0) ||
                (p.linkedinLink && p.linkedinLink.trim().length > 0) ||
                (p.websiteLink && p.websiteLink.trim().length > 0));
            if (hasLinks)
                filledCount++;
            if (p.avatarUrl && p.avatarUrl.trim().length > 0) {
                filledCount++;
            }
            if (user.portfolios && user.portfolios.length > 0)
                filledCount++;
            if (user.experiences && user.experiences.length > 0)
                filledCount++;
            if (user.educations && user.educations.length > 0)
                filledCount++;
            if (user.certificates && user.certificates.length > 0)
                filledCount++;
            const completionPercentage = Math.round((filledCount / 14) * 100);
            return completionPercentage >= 80;
        });
        return completeFreelancers.map((user) => {
            const reviews = user.freelancerReceivedReviews;
            const avgRating = reviews.length > 0
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
    async applyToProject(freelancerId, dto) {
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
    async verifyStripeAccount(accountId) {
        return { status: 'pending', details: 'Vérification en cours' };
    }
    async getSidebarStats(freelancerId) {
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
    async getApplications(freelancerId) {
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
    async getMission(freelancerId, contractId) {
        const contract = await this.prisma.contract.findUnique({
            where: { id: contractId },
            include: {
                project: {
                    include: {
                        category: true,
                        subCategory: true
                    }
                },
                client: {
                    include: { profile: true },
                }
            }
        });
        if (!contract || contract.freelancerId !== freelancerId) {
            throw new common_1.BadRequestException("Contrat introuvable ou accès refusé.");
        }
        const application = await this.prisma.application.findFirst({
            where: { projectId: contract.projectId, freelancerId: contract.freelancerId }
        });
        return { ...contract, applications: [application] };
    }
    async signContract(freelancerId, contractId, signature, advancePercentage) {
        const contract = await this.prisma.contract.findUnique({
            where: { id: contractId },
            include: { project: true }
        });
        if (!contract || contract.freelancerId !== freelancerId) {
            throw new common_1.BadRequestException("Contrat introuvable ou vous n'êtes pas autorisé à le signer.");
        }
        if (contract.status !== 'DRAFT') {
            throw new common_1.BadRequestException("Ce contrat ne peut plus être signé.");
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
    async rejectContract(freelancerId, contractId) {
        const contract = await this.prisma.contract.findUnique({
            where: { id: contractId },
            include: { project: true }
        });
        if (!contract || contract.freelancerId !== freelancerId) {
            throw new common_1.BadRequestException("Contrat introuvable.");
        }
        if (contract.status !== 'DRAFT') {
            throw new common_1.BadRequestException("Vous ne pouvez pas refuser un contrat qui n'est plus à l'état de brouillon.");
        }
        const application = await this.prisma.application.findFirst({
            where: { projectId: contract.projectId, freelancerId: contract.freelancerId }
        });
        if (application) {
            await this.prisma.application.update({
                where: { id: application.id },
                data: { status: 'REJECTED' }
            });
        }
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
    async claimAdvance(freelancerId, contractId) {
        const contract = await this.prisma.contract.findUnique({
            where: { id: contractId },
            include: { project: true }
        });
        if (!contract || contract.freelancerId !== freelancerId) {
            throw new common_1.BadRequestException("Contrat introuvable.");
        }
        if (contract.status !== 'IN_PROGRESS' && contract.status !== 'WAITING_FOR_ADVANCE') {
            throw new common_1.BadRequestException("Le contrat n'est pas éligible pour réclamer un acompte.");
        }
        if (contract.advanceStatus !== 'PENDING') {
            throw new common_1.BadRequestException("L'acompte a déjà été réclamé ou payé.");
        }
        if (!contract.advancePercentage || contract.advancePercentage <= 0) {
            throw new common_1.BadRequestException("Aucun acompte défini pour ce contrat.");
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
    async updateMissionStatus(freelancerId, contractId, status) {
        const contract = await this.prisma.contract.findUnique({
            where: { id: contractId },
            include: { project: true }
        });
        if (!contract || contract.freelancerId !== freelancerId) {
            throw new common_1.BadRequestException("Contrat introuvable ou accès refusé.");
        }
        const allowed = {
            DELIVERED: ['IN_PROGRESS'],
            DISPUTE: ['IN_PROGRESS', 'DELIVERED']
        };
        if (!allowed[status].includes(contract.status)) {
            throw new common_1.BadRequestException(`Impossible de passer au statut "${status}" depuis "${contract.status}".`);
        }
        const updated = await this.prisma.contract.update({
            where: { id: contractId },
            data: {
                status,
                ...(status === 'DELIVERED' ? { endDate: new Date() } : {})
            },
            include: { project: true }
        });
        const projectStatusMap = {
            DELIVERED: 'DELIVERED',
            DISPUTE: 'UNDER_DISPUTE'
        };
        await this.prisma.project.update({
            where: { id: contract.projectId },
            data: { status: projectStatusMap[status] }
        });
        const notifMessages = {
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
    async getMissions(freelancerId) {
        return this.prisma.contract.findMany({
            where: { freelancerId },
            include: {
                project: {
                    include: {
                        category: true,
                        subCategory: true
                    }
                },
                client: {
                    include: { profile: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getInvitations(freelancerId) {
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
    async updateInvitationStatus(id, status) {
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
    async toggleFavoriteProject(freelancerId, projectId) {
        const existing = await this.prisma.favorite.findFirst({
            where: {
                userId: freelancerId,
                projectId,
            },
        });
        if (existing) {
            await this.prisma.favorite.delete({ where: { id: existing.id } });
            return { status: 'removed' };
        }
        else {
            await this.prisma.favorite.create({
                data: {
                    userId: freelancerId,
                    projectId,
                },
            });
            return { status: 'added' };
        }
    }
    async getFavoriteProjects(freelancerId) {
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
};
exports.FreelanceService = FreelanceService;
exports.FreelanceService = FreelanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FreelanceService);
//# sourceMappingURL=freelance.service.js.map