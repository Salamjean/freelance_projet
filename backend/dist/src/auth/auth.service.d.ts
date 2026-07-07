import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PreferredEmailOption } from './dto/preferred-email.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private transporter;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        message: string;
        userId: number;
    }>;
    login(dto: LoginDto, deviceInfo?: string, ipAddress?: string): Promise<{
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
                hourlyRate: Prisma.Decimal | null;
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
    refresh(refreshToken: string, deviceInfo?: string, ipAddress?: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    sendEmailVerification(userId: number): Promise<{
        message: string;
    }>;
    setSecondaryEmail(userId: number, secondaryEmail: string): Promise<{
        message: string;
        secondaryEmail: string;
        isSecondaryEmailVerified: boolean;
    }>;
    sendSecondaryEmailVerification(userId: number): Promise<{
        message: string;
    }>;
    verifySecondaryEmailToken(token: string): Promise<{
        message: string;
    }>;
    setPreferredEmailType(userId: number, preferredEmailType: PreferredEmailOption): Promise<{
        message: string;
        preferredEmailType: PreferredEmailOption;
    }>;
    verifyEmailToken(token: string): Promise<{
        message: string;
    }>;
    resetPassword(email: string, otp: string, newPassword: string): Promise<{
        message: string;
    }>;
    private generateAccessToken;
    private generateRefreshToken;
    getProfile(userId: number): Promise<{
        email: string;
        isEmailVerified: boolean;
        secondaryEmail: string | null;
        isSecondaryEmailVerified: boolean;
        preferredEmailType: import("@prisma/client").$Enums.PreferredEmailType;
        firstName: string;
        lastName: string;
        title: string;
        bio: string;
        location: string;
        phone: string;
        hourlyRate: Prisma.Decimal | null;
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
    deleteExperience(userId: number, id: number): Promise<Prisma.BatchPayload>;
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
    deleteEducation(userId: number, id: number): Promise<Prisma.BatchPayload>;
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
    deleteCertificate(userId: number, id: number): Promise<Prisma.BatchPayload>;
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
    deletePortfolio(userId: number, id: number): Promise<Prisma.BatchPayload>;
    submitVerification(userId: number, dto: {
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
            hourlyRate: Prisma.Decimal | null;
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
            hourlyRate: Prisma.Decimal | null;
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
