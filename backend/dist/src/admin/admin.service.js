"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const nodemailer = __importStar(require("nodemailer"));
const send_mail_dto_1 = require("./dto/send-mail.dto");
const chat_gateway_1 = require("../chat/chat.gateway");
let AdminService = class AdminService {
    prisma;
    chatGateway;
    transporter;
    constructor(prisma, chatGateway) {
        this.prisma = prisma;
        this.chatGateway = chatGateway;
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
    async sendMessageToUser(adminId, targetUserId, content) {
        let conversation = await this.prisma.conversation.findFirst({
            where: {
                AND: [
                    { members: { some: { userId: adminId } } },
                    { members: { some: { userId: targetUserId } } }
                ]
            }
        });
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
    async suspendUser(userId, durationInDays) {
        let suspendedUntil = null;
        if (durationInDays) {
            suspendedUntil = new Date();
            suspendedUntil.setDate(suspendedUntil.getDate() + durationInDays);
        }
        await this.prisma.session.deleteMany({
            where: { userId }
        });
        await this.chatGateway.forceDisconnectUser(userId);
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isSuspended: true,
                suspendedUntil
            }
        });
    }
    async unsuspendUser(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isSuspended: false,
                suspendedUntil: null
            }
        });
    }
    async sendMail(dto) {
        let whereClause = {};
        if (dto.targetRole === send_mail_dto_1.TargetRole.CLIENT) {
            whereClause = { role: 'CLIENT' };
        }
        else if (dto.targetRole === send_mail_dto_1.TargetRole.FREELANCER) {
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
        try {
            await this.transporter.sendMail({
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                bcc: emails,
                subject: dto.subject,
                text: dto.message,
                html: `<div style="font-family: Arial, sans-serif; white-space: pre-wrap;">${dto.message}</div>`,
            });
            return { success: true, count: emails.length };
        }
        catch (error) {
            console.error('Erreur SMTP:', error);
            throw new Error('Impossible d\'envoyer l\'e-mail.');
        }
    }
    async getStats() {
        const clientsCount = await this.prisma.user.count({ where: { role: 'CLIENT' } });
        const freelancersCount = await this.prisma.user.count({ where: { role: 'FREELANCER' } });
        const projectsCount = await this.prisma.project.count();
        const contractsCount = await this.prisma.contract.count();
        return {
            clients: clientsCount,
            freelancers: freelancersCount,
            projects: projectsCount,
            contracts: contractsCount,
            commissions: 0,
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
    async createCategory(name, slug) {
        return this.prisma.category.create({
            data: { name, slug }
        });
    }
    async updateCategory(id, name, slug) {
        return this.prisma.category.update({
            where: { id },
            data: { name, slug }
        });
    }
    async deleteCategory(id) {
        return this.prisma.category.delete({
            where: { id }
        });
    }
    async addSubCategory(categoryId, name, slug) {
        return this.prisma.subCategory.create({
            data: { categoryId, name, slug }
        });
    }
    async removeSubCategory(id) {
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
    async approveVerification(profileId) {
        return this.prisma.profile.update({
            where: { id: profileId },
            data: {
                idVerificationStatus: 'APPROVED',
                idRejectionReason: null,
            },
        });
    }
    async rejectVerification(profileId, rejectionReason) {
        return this.prisma.profile.update({
            where: { id: profileId },
            data: {
                idVerificationStatus: 'REJECTED',
                idRejectionReason: rejectionReason,
            },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        chat_gateway_1.ChatGateway])
], AdminService);
//# sourceMappingURL=admin.service.js.map