import { PrismaService } from '../prisma/prisma.service';
import { SendMailDto } from './dto/send-mail.dto';
import { ChatGateway } from '../chat/chat.gateway';
export declare class AdminService {
    private readonly prisma;
    private readonly chatGateway;
    private transporter;
    constructor(prisma: PrismaService, chatGateway: ChatGateway);
    sendMessageToUser(adminId: number, targetUserId: number, content: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        fileUrl: string | null;
        fileName: string | null;
        fileType: string | null;
        content: string | null;
        isRead: boolean;
        conversationId: number;
        senderId: number;
        replyToId: number | null;
    }>;
    suspendUser(userId: number, durationInDays?: number | null): Promise<{
        id: number;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        twoFactorEnabled: boolean;
        createdAt: Date;
        updatedAt: Date;
        isOnline: boolean;
        lastSeen: Date | null;
        isSuspended: boolean;
        suspendedUntil: Date | null;
    }>;
    unsuspendUser(userId: number): Promise<{
        id: number;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        twoFactorEnabled: boolean;
        createdAt: Date;
        updatedAt: Date;
        isOnline: boolean;
        lastSeen: Date | null;
        isSuspended: boolean;
        suspendedUntil: Date | null;
    }>;
    sendMail(dto: SendMailDto): Promise<{
        success: boolean;
        message: string;
        count?: undefined;
    } | {
        success: boolean;
        count: number;
        message?: undefined;
    }>;
    getStats(): Promise<{
        clients: number;
        freelancers: number;
        projects: number;
        contracts: number;
        commissions: number;
        revenues: number;
    }>;
    getUsers(): Promise<({
        profile: {
            firstName: string | null;
            lastName: string | null;
            avatarUrl: string | null;
            phone: string | null;
        } | null;
    } & {
        id: number;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        twoFactorEnabled: boolean;
        createdAt: Date;
        updatedAt: Date;
        isOnline: boolean;
        lastSeen: Date | null;
        isSuspended: boolean;
        suspendedUntil: Date | null;
    })[]>;
    getProjects(): Promise<({
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
        };
        client: {
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
        } & {
            id: number;
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.Role;
            isEmailVerified: boolean;
            twoFactorEnabled: boolean;
            createdAt: Date;
            updatedAt: Date;
            isOnline: boolean;
            lastSeen: Date | null;
            isSuspended: boolean;
            suspendedUntil: Date | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        status: import("@prisma/client").$Enums.ProjectStatus;
        clientId: number;
        categoryId: number;
        subCategoryId: number;
        budget: import("@prisma/client-runtime-utils").Decimal;
        budgetType: import("@prisma/client").$Enums.BudgetType;
        duration: string | null;
        experienceLevel: import("@prisma/client").$Enums.ExperienceLevel;
    })[]>;
    getCategories(): Promise<({
        _count: {
            projects: number;
        };
        subCategories: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            categoryId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
    })[]>;
    createCategory(name: string, slug: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
    }>;
    updateCategory(id: number, name: string, slug: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
    }>;
    deleteCategory(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
    }>;
    addSubCategory(categoryId: number, name: string, slug: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
        categoryId: number;
    }>;
    removeSubCategory(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
        categoryId: number;
    }>;
    getPayments(): Promise<({
        contract: {
            project: {
                title: string;
            };
            client: {
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
            } & {
                id: number;
                email: string;
                password: string;
                role: import("@prisma/client").$Enums.Role;
                isEmailVerified: boolean;
                twoFactorEnabled: boolean;
                createdAt: Date;
                updatedAt: Date;
                isOnline: boolean;
                lastSeen: Date | null;
                isSuspended: boolean;
                suspendedUntil: Date | null;
            };
            freelancer: {
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
            } & {
                id: number;
                email: string;
                password: string;
                role: import("@prisma/client").$Enums.Role;
                isEmailVerified: boolean;
                twoFactorEnabled: boolean;
                createdAt: Date;
                updatedAt: Date;
                isOnline: boolean;
                lastSeen: Date | null;
                isSuspended: boolean;
                suspendedUntil: Date | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date | null;
            status: import("@prisma/client").$Enums.ContractStatus;
            endDate: Date | null;
            clientId: number;
            projectId: number;
            freelancerId: number;
            amount: import("@prisma/client-runtime-utils").Decimal;
            clientSignature: string | null;
            freelancerSignature: string | null;
            advancePercentage: number | null;
            advanceStatus: string;
            signedAt: Date | null;
        };
    } & {
        id: number;
        createdAt: Date;
        contractId: number;
        transactionId: number;
        method: string;
        feeAmount: import("@prisma/client-runtime-utils").Decimal;
        netAmount: import("@prisma/client-runtime-utils").Decimal;
    })[]>;
    getDisputes(): Promise<never[]>;
    getPendingVerifications(): Promise<({
        user: {
            id: number;
            email: string;
        };
    } & {
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
    })[]>;
    approveVerification(profileId: number): Promise<{
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
    }>;
    rejectVerification(profileId: number, rejectionReason: string): Promise<{
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
    }>;
}
