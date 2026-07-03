import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Request } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getProfile(userId: number): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        title: string;
        bio: string;
        location: string;
        phone: string;
        hourlyRate: import("@prisma/client-runtime-utils").Decimal | null;
        githubLink: string;
        linkedinLink: string;
        websiteLink: string;
        skills: ({
            skill: {
                id: number;
                createdAt: Date;
                name: string;
            };
        } & {
            profileId: number;
            skillId: number;
        })[];
        idVerificationStatus: string;
        idType: string | null;
        idRectoUrl: string | null;
        idVersoUrl: string | null;
        idRejectionReason: string | null;
        avatarUrl: string;
        cvUrl: string;
        isSubscribed: boolean;
        experiences: {
            id: number;
            createdAt: Date;
            userId: number;
            description: string | null;
            startDate: Date;
            endDate: Date | null;
            company: string;
            position: string;
            isCurrent: boolean;
        }[];
        educations: {
            id: number;
            createdAt: Date;
            userId: number;
            startDate: Date;
            endDate: Date | null;
            school: string;
            degree: string;
            fieldOfStudy: string | null;
        }[];
        certificates: {
            id: number;
            createdAt: Date;
            name: string;
            userId: number;
            issueDate: Date;
            issuer: string;
            expiryDate: Date | null;
            credentialId: string | null;
            credentialUrl: string | null;
        }[];
        portfolios: ({
            files: {
                id: number;
                createdAt: Date;
                fileUrl: string;
                fileName: string;
                fileType: string;
                portfolioId: number;
            }[];
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            githubLink: string | null;
            userId: number;
            description: string | null;
            demoLink: string | null;
        })[];
    }>;
    updateProfile(userId: number, dto: any): Promise<{
        message: string;
        profile: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            firstName: string | null;
            lastName: string | null;
            avatarUrl: string | null;
            cvUrl: string | null;
            bio: string | null;
            location: string | null;
            phone: string | null;
            companyName: string | null;
            title: string | null;
            hourlyRate: import("@prisma/client-runtime-utils").Decimal | null;
            githubLink: string | null;
            linkedinLink: string | null;
            websiteLink: string | null;
            idVerificationStatus: string;
            idType: string | null;
            idRectoUrl: string | null;
            idVersoUrl: string | null;
            idRejectionReason: string | null;
            userId: number;
        };
    }>;
    verifyIdentity(userId: number, dto: {
        idType: string;
        idRectoUrl: string;
        idVersoUrl: string;
    }): Promise<{
        message: string;
        profile: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            firstName: string | null;
            lastName: string | null;
            avatarUrl: string | null;
            cvUrl: string | null;
            bio: string | null;
            location: string | null;
            phone: string | null;
            companyName: string | null;
            title: string | null;
            hourlyRate: import("@prisma/client-runtime-utils").Decimal | null;
            githubLink: string | null;
            linkedinLink: string | null;
            websiteLink: string | null;
            idVerificationStatus: string;
            idType: string | null;
            idRectoUrl: string | null;
            idVersoUrl: string | null;
            idRejectionReason: string | null;
            userId: number;
        };
    }>;
    addExperience(userId: number, dto: {
        company: string;
        position: string;
        description?: string;
        startDate: string;
        endDate?: string;
        isCurrent: boolean;
    }): Promise<{
        id: number;
        createdAt: Date;
        userId: number;
        description: string | null;
        startDate: Date;
        endDate: Date | null;
        company: string;
        position: string;
        isCurrent: boolean;
    }>;
    deleteExperience(userId: number, id: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    addEducation(userId: number, dto: {
        school: string;
        degree: string;
        fieldOfStudy?: string;
        startDate: string;
        endDate?: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        userId: number;
        startDate: Date;
        endDate: Date | null;
        school: string;
        degree: string;
        fieldOfStudy: string | null;
    }>;
    deleteEducation(userId: number, id: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    addCertificate(userId: number, dto: {
        name: string;
        issuer: string;
        issueDate: string;
        expiryDate?: string;
        credentialUrl?: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        name: string;
        userId: number;
        issueDate: Date;
        issuer: string;
        expiryDate: Date | null;
        credentialId: string | null;
        credentialUrl: string | null;
    }>;
    deleteCertificate(userId: number, id: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    addPortfolio(userId: number, dto: {
        title: string;
        description?: string;
        githubLink?: string;
        demoLink?: string;
        fileUrl?: string;
        fileName?: string;
        fileType?: string;
    }): Promise<({
        files: {
            id: number;
            createdAt: Date;
            fileUrl: string;
            fileName: string;
            fileType: string;
            portfolioId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        githubLink: string | null;
        userId: number;
        description: string | null;
        demoLink: string | null;
    }) | null>;
    deletePortfolio(userId: number, id: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    register(dto: RegisterDto): Promise<{
        message: string;
        userId: number;
    }>;
    login(dto: LoginDto, req: Request, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: number;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            profile: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                firstName: string | null;
                lastName: string | null;
                avatarUrl: string | null;
                cvUrl: string | null;
                bio: string | null;
                location: string | null;
                phone: string | null;
                companyName: string | null;
                title: string | null;
                hourlyRate: import("@prisma/client-runtime-utils").Decimal | null;
                githubLink: string | null;
                linkedinLink: string | null;
                websiteLink: string | null;
                idVerificationStatus: string;
                idType: string | null;
                idRectoUrl: string | null;
                idVersoUrl: string | null;
                idRejectionReason: string | null;
                userId: number;
            } | null;
            balance: number;
        };
    }>;
    refresh(refreshToken: string, req: Request, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    getNotifications(userId: number): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        userId: number;
        type: string;
        content: string;
        isRead: boolean;
    }[]>;
    markNotificationAsRead(notificationId: number): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        userId: number;
        type: string;
        content: string;
        isRead: boolean;
    }>;
}
