import { AdminService } from './admin.service';
import { SendMailDto } from './dto/send-mail.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    sendMail(dto: SendMailDto): Promise<{
        success: boolean;
        message: string;
        count?: undefined;
    } | {
        success: boolean;
        count: number;
        message?: undefined;
    }>;
    sendMessageToUser(userId: number, body: {
        adminId: number;
        content: string;
    }): Promise<{
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
    suspendUser(userId: number, body: {
        durationInDays?: number | null;
    }): Promise<{
        id: number;
        email: string;
        secondaryEmail: string | null;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        isSecondaryEmailVerified: boolean;
        preferredEmailType: import("@prisma/client").$Enums.PreferredEmailType;
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
        secondaryEmail: string | null;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        isSecondaryEmailVerified: boolean;
        preferredEmailType: import("@prisma/client").$Enums.PreferredEmailType;
        twoFactorEnabled: boolean;
        createdAt: Date;
        updatedAt: Date;
        isOnline: boolean;
        lastSeen: Date | null;
        isSuspended: boolean;
        suspendedUntil: Date | null;
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
        secondaryEmail: string | null;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        isSecondaryEmailVerified: boolean;
        preferredEmailType: import("@prisma/client").$Enums.PreferredEmailType;
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
            secondaryEmail: string | null;
            password: string;
            role: import("@prisma/client").$Enums.Role;
            isEmailVerified: boolean;
            isSecondaryEmailVerified: boolean;
            preferredEmailType: import("@prisma/client").$Enums.PreferredEmailType;
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
    createCategory(body: {
        name: string;
        slug: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
    }>;
    updateCategory(id: number, body: {
        name: string;
        slug: string;
    }): Promise<{
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
    addSubCategory(id: number, body: {
        name: string;
        slug: string;
    }): Promise<{
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
                secondaryEmail: string | null;
                password: string;
                role: import("@prisma/client").$Enums.Role;
                isEmailVerified: boolean;
                isSecondaryEmailVerified: boolean;
                preferredEmailType: import("@prisma/client").$Enums.PreferredEmailType;
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
                secondaryEmail: string | null;
                password: string;
                role: import("@prisma/client").$Enums.Role;
                isEmailVerified: boolean;
                isSecondaryEmailVerified: boolean;
                preferredEmailType: import("@prisma/client").$Enums.PreferredEmailType;
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
    getVerifications(): Promise<({
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
    approve(profileId: number): Promise<{
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
    reject(profileId: number, rejectionReason: string): Promise<{
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
