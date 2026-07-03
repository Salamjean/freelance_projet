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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Cet e-mail est déjà utilisé');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email: dto.email,
                    password: hashedPassword,
                    role: dto.role,
                },
            });
            await tx.profile.create({
                data: {
                    userId: newUser.id,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                },
            });
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
    async login(dto, deviceInfo, ipAddress) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: {
                profile: true,
                wallet: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        if (user.isSuspended) {
            if (user.suspendedUntil && user.suspendedUntil > new Date()) {
                throw new common_1.UnauthorizedException(`Votre compte est suspendu jusqu'au ${user.suspendedUntil.toLocaleDateString()}`);
            }
            else if (!user.suspendedUntil) {
                throw new common_1.UnauthorizedException('Votre compte est suspendu de façon permanente.');
            }
            else {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { isSuspended: false, suspendedUntil: null }
                });
            }
        }
        const accessToken = this.generateAccessToken(user.id, user.email, user.role);
        const refreshToken = this.generateRefreshToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
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
    async refresh(refreshToken, deviceInfo, ipAddress) {
        const session = await this.prisma.session.findUnique({
            where: { refreshToken },
            include: { user: true },
        });
        if (!session || session.expiresAt < new Date()) {
            if (session) {
                await this.prisma.session.delete({ where: { id: session.id } });
            }
            throw new common_1.UnauthorizedException('Session expirée ou invalide');
        }
        const accessToken = this.generateAccessToken(session.user.id, session.user.email, session.user.role);
        const newRefreshToken = this.generateRefreshToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
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
    async logout(refreshToken) {
        try {
            await this.prisma.session.delete({
                where: { refreshToken },
            });
            return { message: 'Déconnexion réussie' };
        }
        catch {
            throw new common_1.BadRequestException('Session introuvable');
        }
    }
    generateAccessToken(userId, email, role) {
        return this.jwtService.sign({ sub: userId, email, role }, {
            secret: process.env['JWT_SECRET'] || 'supersecretkey',
            expiresIn: '15m',
        });
    }
    generateRefreshToken() {
        return bcrypt.hashSync(Math.random().toString(36).substring(2), 10);
    }
    async getProfile(userId) {
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
            throw new common_1.NotFoundException('Utilisateur non trouvé');
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
    async addExperience(userId, dto) {
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
    async deleteExperience(userId, id) {
        return this.prisma.experience.deleteMany({
            where: { id, userId }
        });
    }
    async addEducation(userId, dto) {
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
    async deleteEducation(userId, id) {
        return this.prisma.education.deleteMany({
            where: { id, userId }
        });
    }
    async addCertificate(userId, dto) {
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
    async deleteCertificate(userId, id) {
        return this.prisma.certificate.deleteMany({
            where: { id, userId }
        });
    }
    async addPortfolio(userId, dto) {
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
    async deletePortfolio(userId, id) {
        return this.prisma.portfolio.deleteMany({
            where: { id, userId }
        });
    }
    async submitVerification(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur non trouvé');
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
    async updateProfile(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur non trouvé');
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
        if (dto.skillNames && Array.isArray(dto.skillNames)) {
            await this.prisma.freelancerSkill.deleteMany({
                where: { profileId: profile.id },
            });
            for (const skillName of dto.skillNames) {
                const skill = await this.prisma.skill.upsert({
                    where: { name: skillName },
                    update: {},
                    create: { name: skillName },
                });
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
    async getNotifications(userId) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }
    async markNotificationAsRead(notificationId) {
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map