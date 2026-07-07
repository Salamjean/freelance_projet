import { PrismaService } from '../prisma/prisma.service';
export declare class ClientService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardData(clientId: number): Promise<{
        projects: ({
            applications: ({
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
                status: import("@prisma/client").$Enums.ApplicationStatus;
                projectId: number;
                freelancerId: number;
                bidAmount: import("@prisma/client-runtime-utils").Decimal;
                deliveryDelay: number;
                coverLetter: string;
            })[];
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
        })[];
        activeContractsCount: number;
        totalExpenses: number;
    }>;
    getCategories(): Promise<({
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
    createProject(clientId: number, dto: any): Promise<{
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
    }>;
    updateProject(projectId: number, dto: any): Promise<{
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
    }>;
    deleteProject(projectId: number): Promise<{
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
    }>;
    getPublicProjects(): Promise<({
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
        };
        subCategory: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            categoryId: number;
        };
        skills: ({
            skill: {
                id: number;
                createdAt: Date;
                name: string;
            };
        } & {
            skillId: number;
            projectId: number;
        })[];
        client: {
            id: number;
            email: string;
            profile: {
                firstName: string | null;
                lastName: string | null;
                avatarUrl: string | null;
                companyName: string | null;
            } | null;
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
    getPublicProjectById(id: number): Promise<{
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
        };
        subCategory: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            categoryId: number;
        };
        skills: ({
            skill: {
                id: number;
                createdAt: Date;
                name: string;
            };
        } & {
            skillId: number;
            projectId: number;
        })[];
        client: {
            id: number;
            email: string;
            profile: {
                firstName: string | null;
                lastName: string | null;
                avatarUrl: string | null;
                companyName: string | null;
            } | null;
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
    }>;
    getProjectApplications(projectId: number): Promise<{
        freelancer: {
            id: number;
            email: string;
            completedMissions: number;
            averageRating: number | null;
            reviewsCount: number;
            profile: ({
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
            }) | null;
        };
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        projectId: number;
        freelancerId: number;
        bidAmount: import("@prisma/client-runtime-utils").Decimal;
        deliveryDelay: number;
        coverLetter: string;
    }[]>;
    getApplication(applicationId: number): Promise<({
        project: {
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
        status: import("@prisma/client").$Enums.ApplicationStatus;
        projectId: number;
        freelancerId: number;
        bidAmount: import("@prisma/client-runtime-utils").Decimal;
        deliveryDelay: number;
        coverLetter: string;
    }) | {
        contract: {
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
        } | null;
        project: {
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
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        projectId: number;
        freelancerId: number;
        bidAmount: import("@prisma/client-runtime-utils").Decimal;
        deliveryDelay: number;
        coverLetter: string;
    }>;
    updateApplicationStatus(applicationId: number, status: 'ACCEPTED' | 'REJECTED', clientSignature?: string): Promise<{
        project: {
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
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        projectId: number;
        freelancerId: number;
        bidAmount: import("@prisma/client-runtime-utils").Decimal;
        deliveryDelay: number;
        coverLetter: string;
    }>;
    getClientContracts(clientId: number): Promise<{
        applicationId: number | undefined;
        project: {
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
        };
        freelancer: {
            id: number;
            email: string;
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
        };
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
    }[]>;
    inviteFreelancer(clientId: number, projectId: number, freelancerId: number, message: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        message: string | null;
        status: import("@prisma/client").$Enums.InvitationStatus;
        clientId: number;
        projectId: number;
        freelancerId: number;
    }>;
    validateDelivery(clientId: number, contractId: number, review?: {
        ratingQuality?: number;
        ratingCommunication?: number;
        ratingDeadline?: number;
        ratingProfessionalism?: number;
        comment?: string;
    }): Promise<{
        project: {
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
    }>;
    cancelContract(clientId: number, contractId: number): Promise<{
        message: string;
    }>;
    signContract(clientId: number, contractId: number, signature: string): Promise<{
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
    }>;
    validateAdvance(clientId: number, contractId: number): Promise<{
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
    }>;
    disputeDelivery(clientId: number, contractId: number, reason: string): Promise<{
        project: {
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
    }>;
    getSidebarStats(clientId: number): Promise<{
        activeProjects: number;
        activeContracts: number;
        unreadMessages: number;
    }>;
}
