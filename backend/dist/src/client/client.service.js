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
exports.ClientService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClientService = class ClientService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardData(clientId) {
        const projects = await this.prisma.project.findMany({
            where: { clientId },
            include: {
                applications: {
                    include: {
                        freelancer: {
                            include: { profile: true },
                        },
                    },
                },
            },
        });
        const activeContracts = await this.prisma.contract.findMany({
            where: {
                clientId,
                status: 'IN_PROGRESS',
            },
        });
        const completedContracts = await this.prisma.contract.findMany({
            where: {
                clientId,
                status: 'VALIDATED',
            },
        });
        const totalExpenses = completedContracts.reduce((acc, contract) => acc + Number(contract.amount), 0);
        return {
            projects,
            activeContractsCount: activeContracts.length,
            totalExpenses,
        };
    }
    async getCategories() {
        return this.prisma.category.findMany({
            include: {
                subCategories: true,
            },
        });
    }
    async createProject(clientId, dto) {
        return this.prisma.project.create({
            data: {
                clientId,
                title: dto.title,
                description: dto.description,
                categoryId: dto.categoryId,
                subCategoryId: dto.subCategoryId,
                budget: dto.budget,
                budgetType: dto.budgetType,
                experienceLevel: dto.experienceLevel,
                duration: dto.duration,
                status: 'OPEN',
            },
        });
    }
    async updateProject(projectId, dto) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project || project.status !== 'OPEN') {
            throw new Error("Seuls les projets en attente (Ouverts) peuvent être modifiés.");
        }
        const hasContracts = await this.prisma.contract.findFirst({
            where: { projectId },
        });
        if (hasContracts) {
            throw new Error("Impossible de modifier ce projet car une candidature a déjà été acceptée.");
        }
        return this.prisma.project.update({
            where: { id: projectId },
            data: {
                title: dto.title,
                description: dto.description,
                categoryId: dto.categoryId,
                subCategoryId: dto.subCategoryId,
                budget: dto.budget,
                budgetType: dto.budgetType,
                experienceLevel: dto.experienceLevel,
                duration: dto.duration,
            },
        });
    }
    async deleteProject(projectId) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project || project.status !== 'OPEN') {
            throw new Error("Seuls les projets en attente (Ouverts) peuvent être supprimés.");
        }
        const hasContracts = await this.prisma.contract.findFirst({
            where: { projectId },
        });
        if (hasContracts) {
            throw new Error("Impossible de supprimer ce projet car un contrat y est déjà associé.");
        }
        await this.prisma.application.deleteMany({
            where: { projectId }
        });
        return this.prisma.project.delete({
            where: { id: projectId },
        });
    }
    async getPublicProjects() {
        return this.prisma.project.findMany({
            where: {
                status: 'OPEN',
            },
            include: {
                category: true,
                subCategory: true,
                skills: {
                    include: { skill: true }
                },
                client: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                firstName: true,
                                lastName: true,
                                companyName: true,
                                avatarUrl: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
    }
    async getPublicProjectById(id) {
        const project = await this.prisma.project.findFirst({
            where: {
                id
            },
            include: {
                category: true,
                subCategory: true,
                skills: {
                    include: { skill: true }
                },
                client: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                firstName: true,
                                lastName: true,
                                companyName: true,
                                avatarUrl: true
                            }
                        }
                    }
                }
            }
        });
        if (!project) {
            throw new Error('Projet introuvable ou indisponible.');
        }
        return project;
    }
    async getProjectApplications(projectId) {
        const applications = await this.prisma.application.findMany({
            where: {
                projectId
            },
            include: {
                freelancer: {
                    include: {
                        profile: {
                            include: {
                                skills: { include: { skill: true } },
                            },
                        },
                        freelancerReceivedReviews: {
                            select: { ratingAverage: true },
                        },
                        freelancerContracts: {
                            where: { status: 'VALIDATED' },
                            select: { id: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return applications.map((app) => {
            const f = app.freelancer;
            const reviews = f.freelancerReceivedReviews || [];
            const averageRating = reviews.length > 0
                ? reviews.reduce((acc, r) => acc + Number(r.ratingAverage), 0) / reviews.length
                : null;
            return {
                ...app,
                freelancer: {
                    id: f.id,
                    email: f.email,
                    completedMissions: f.freelancerContracts.length,
                    averageRating,
                    reviewsCount: reviews.length,
                    profile: f.profile,
                },
            };
        });
    }
    async getApplication(applicationId) {
        const app = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                project: true,
                freelancer: {
                    include: {
                        profile: true,
                    }
                }
            }
        });
        if (!app) {
            throw new Error("Candidature introuvable.");
        }
        if (app.status === 'ACCEPTED') {
            const contract = await this.prisma.contract.findFirst({
                where: {
                    projectId: app.projectId,
                    freelancerId: app.freelancerId,
                }
            });
            return { ...app, contract };
        }
        return app;
    }
    async updateApplicationStatus(applicationId, status, clientSignature) {
        const updatedApp = await this.prisma.application.update({
            where: { id: applicationId },
            data: { status },
            include: { project: true }
        });
        if (status === 'ACCEPTED') {
            await this.prisma.contract.create({
                data: {
                    projectId: updatedApp.projectId,
                    clientId: updatedApp.project.clientId,
                    freelancerId: updatedApp.freelancerId,
                    amount: updatedApp.bidAmount,
                    status: 'DRAFT',
                }
            });
        }
        const title = status === 'ACCEPTED' ? 'Candidature acceptée !' : 'Candidature refusée';
        const content = `Votre candidature pour le projet "${updatedApp.project.title}" a été ${status === 'ACCEPTED' ? 'acceptée' : 'refusée'}.`;
        await this.prisma.notification.create({
            data: {
                userId: updatedApp.freelancerId,
                title,
                content,
                type: 'application_status'
            }
        });
        return updatedApp;
    }
    async getClientContracts(clientId) {
        const contracts = await this.prisma.contract.findMany({
            where: { clientId },
            include: {
                project: true,
                freelancer: {
                    select: {
                        id: true,
                        email: true,
                        profile: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const contractsWithAppId = await Promise.all(contracts.map(async (contract) => {
            const app = await this.prisma.application.findFirst({
                where: {
                    projectId: contract.projectId,
                    freelancerId: contract.freelancerId,
                },
                select: { id: true }
            });
            return {
                ...contract,
                applicationId: app?.id
            };
        }));
        return contractsWithAppId;
    }
    async inviteFreelancer(clientId, projectId, freelancerId, message) {
        const project = await this.prisma.project.findFirst({
            where: { id: projectId, clientId }
        });
        if (!project) {
            throw new Error("Projet introuvable ou ne vous appartient pas.");
        }
        const existingInvitation = await this.prisma.invitation.findFirst({
            where: { projectId, freelancerId }
        });
        if (existingInvitation) {
            throw new Error("Vous avez déjà invité ce freelance pour ce projet.");
        }
        const invitation = await this.prisma.invitation.create({
            data: {
                projectId,
                clientId,
                freelancerId,
                message,
                status: 'PENDING'
            }
        });
        await this.prisma.notification.create({
            data: {
                userId: freelancerId,
                title: 'Nouvelle invitation',
                content: `Vous avez été invité par un client à postuler pour le projet "${project.title}".`,
                type: 'invitation'
            }
        });
        return invitation;
    }
    async validateDelivery(clientId, contractId, review) {
        const contract = await this.prisma.contract.findUnique({
            where: { id: contractId },
            include: { project: true }
        });
        if (!contract || contract.clientId !== clientId) {
            throw new Error("Contrat introuvable ou accès refusé.");
        }
        if (contract.status !== 'DELIVERED') {
            throw new Error("Vous ne pouvez valider que si le contrat est au statut DELIVERED.");
        }
        const updated = await this.prisma.contract.update({
            where: { id: contractId },
            data: { status: 'VALIDATED' },
            include: { project: true }
        });
        await this.prisma.project.update({
            where: { id: contract.projectId },
            data: { status: 'COMPLETED' }
        });
        const totalAmount = Number(contract.amount);
        let amountToCredit = totalAmount;
        if (contract.advancePercentage && contract.advanceStatus === 'PAID') {
            const advanceAmount = (totalAmount * contract.advancePercentage) / 100;
            amountToCredit = totalAmount - advanceAmount;
        }
        if (amountToCredit > 0) {
            await this.prisma.wallet.upsert({
                where: { userId: contract.freelancerId },
                update: { balance: { increment: amountToCredit } },
                create: { userId: contract.freelancerId, balance: amountToCredit }
            });
            const wallet = await this.prisma.wallet.findUnique({ where: { userId: contract.freelancerId } });
            if (wallet) {
                await this.prisma.transaction.create({
                    data: {
                        walletId: wallet.id,
                        amount: amountToCredit,
                        type: 'PAYMENT',
                        status: 'SUCCESS',
                        description: `Paiement final validé par le client pour la mission "${updated.project.title}"`
                    }
                });
            }
        }
        if (review) {
            const q = review.ratingQuality ?? 5;
            const c = review.ratingCommunication ?? 5;
            const d = review.ratingDeadline ?? 5;
            const p = review.ratingProfessionalism ?? 5;
            const avg = (q + c + d + p) / 4;
            await this.prisma.review.create({
                data: {
                    contractId,
                    reviewerId: clientId,
                    ratingQuality: q,
                    ratingCommunication: c,
                    ratingDeadline: d,
                    ratingProfessionalism: p,
                    ratingAverage: avg,
                    comment: review.comment ?? null,
                    clientReviewerId: clientId,
                    freelancerTargetId: contract.freelancerId,
                }
            });
        }
        await this.prisma.notification.create({
            data: {
                userId: contract.freelancerId,
                title: 'Livraison validée ! 🎉',
                content: `Le client a validé votre livraison pour le projet "${updated.project.title}". ${amountToCredit.toLocaleString('fr-FR')} XOF crédités sur votre portefeuille (solde).`,
                type: 'delivery_validated'
            }
        });
        return updated;
    }
    async cancelContract(clientId, contractId) {
        const contract = await this.prisma.contract.findUnique({
            where: { id: contractId },
            include: { project: true }
        });
        if (!contract || contract.clientId !== clientId) {
            throw new Error("Contrat introuvable.");
        }
        if (contract.status !== 'DRAFT') {
            throw new Error("Le contrat a déjà démarré ou n'est plus à l'état de brouillon.");
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
                userId: contract.freelancerId,
                title: 'Contrat annulé par le client',
                content: `Le client a annulé le contrat pour le projet "${contract.project.title}", probablement suite à un désaccord sur les conditions.`,
                type: 'application_status'
            }
        });
        return { message: "Contrat annulé avec succès." };
    }
    async signContract(clientId, contractId, signature) {
        const contract = await this.prisma.contract.findUnique({
            where: { id: contractId },
            include: { project: true }
        });
        if (!contract || contract.clientId !== clientId) {
            throw new Error("Contrat introuvable.");
        }
        if (contract.status !== 'DRAFT') {
            throw new Error("Ce contrat ne peut plus être signé.");
        }
        if (!contract.freelancerSignature) {
            throw new Error("Le freelance doit d'abord signer le contrat.");
        }
        const nextStatus = contract.advancePercentage && contract.advancePercentage > 0
            ? 'WAITING_FOR_ADVANCE'
            : 'IN_PROGRESS';
        const updated = await this.prisma.contract.update({
            where: { id: contractId },
            data: {
                clientSignature: signature,
                status: nextStatus,
                ...(nextStatus === 'IN_PROGRESS' ? { startDate: new Date() } : {}),
                project: {
                    update: {
                        status: nextStatus
                    }
                }
            }
        });
        await this.prisma.notification.create({
            data: {
                userId: contract.freelancerId,
                title: 'Contrat signé par le client',
                content: `Le client a signé le contrat pour le projet "${contract.project.title}". La mission commence officiellement.`,
                type: 'contract_signed'
            }
        });
        return updated;
    }
    async validateAdvance(clientId, contractId) {
        const contract = await this.prisma.contract.findUnique({
            where: { id: contractId },
            include: { project: true }
        });
        if (!contract || contract.clientId !== clientId) {
            throw new Error("Contrat introuvable.");
        }
        if (contract.advanceStatus !== 'CLAIMED') {
            throw new Error("Aucun acompte en attente de validation.");
        }
        const totalAmount = Number(contract.amount);
        const advanceAmount = (totalAmount * (contract.advancePercentage || 0)) / 100;
        const updated = await this.prisma.contract.update({
            where: { id: contractId },
            data: {
                advanceStatus: 'PAID',
                status: 'IN_PROGRESS',
                startDate: new Date(),
                project: {
                    update: {
                        status: 'IN_PROGRESS'
                    }
                }
            }
        });
        if (advanceAmount > 0) {
            await this.prisma.wallet.upsert({
                where: { userId: contract.freelancerId },
                update: { balance: { increment: advanceAmount } },
                create: { userId: contract.freelancerId, balance: advanceAmount }
            });
            const wallet = await this.prisma.wallet.findUnique({ where: { userId: contract.freelancerId } });
            if (wallet) {
                await this.prisma.transaction.create({
                    data: {
                        walletId: wallet.id,
                        amount: advanceAmount,
                        type: 'PAYMENT',
                        status: 'SUCCESS',
                        description: `Paiement de l'acompte (${contract.advancePercentage}%) validé pour la mission "${contract.project.title}"`
                    }
                });
            }
            await this.prisma.notification.create({
                data: {
                    userId: contract.freelancerId,
                    title: "Acompte validé 🎉",
                    content: `Le client a validé votre acompte. ${advanceAmount.toLocaleString('fr-FR')} XOF crédités sur votre portefeuille.`,
                    type: 'advance_validated'
                }
            });
        }
        return updated;
    }
    async disputeDelivery(clientId, contractId, reason) {
        const contract = await this.prisma.contract.findUnique({
            where: { id: contractId },
            include: { project: true }
        });
        if (!contract || contract.clientId !== clientId) {
            throw new Error("Contrat introuvable ou accès refusé.");
        }
        if (contract.status !== 'DELIVERED') {
            throw new Error("Vous ne pouvez contester que si le contrat est au statut DELIVERED.");
        }
        const updated = await this.prisma.contract.update({
            where: { id: contractId },
            data: { status: 'IN_PROGRESS' },
            include: { project: true }
        });
        await this.prisma.project.update({
            where: { id: contract.projectId },
            data: { status: 'IN_PROGRESS' }
        });
        await this.prisma.notification.create({
            data: {
                userId: contract.freelancerId,
                title: 'Livraison contestée',
                content: `Le client a contesté votre livraison pour le projet "${updated.project.title}". Motif : ${reason || 'Non précisé'}.`,
                type: 'delivery_disputed'
            }
        });
        return updated;
    }
    async getSidebarStats(clientId) {
        const activeProjectsCount = await this.prisma.project.count({
            where: {
                clientId,
                status: { notIn: ['COMPLETED', 'CANCELLED'] }
            }
        });
        const activeContractsCount = await this.prisma.contract.count({
            where: {
                clientId,
                status: { notIn: ['VALIDATED', 'CANCELLED'] }
            }
        });
        const unreadMessagesCount = await this.prisma.message.count({
            where: {
                isRead: false,
                senderId: { not: clientId },
                conversation: {
                    members: {
                        some: { userId: clientId }
                    }
                }
            }
        });
        return {
            activeProjects: activeProjectsCount,
            activeContracts: activeContractsCount,
            unreadMessages: unreadMessagesCount
        };
    }
};
exports.ClientService = ClientService;
exports.ClientService = ClientService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientService);
//# sourceMappingURL=client.service.js.map