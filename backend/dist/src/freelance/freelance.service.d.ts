import { PrismaService } from '../prisma/prisma.service';
export declare class FreelanceService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardData(freelancerId: number): Promise<{
        applicationsCount: number;
        activeMissionsCount: number;
        activeMissions: ({
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
        })[];
        balance: number | import("@prisma/client-runtime-utils").Decimal;
        isSubscribed: boolean;
    }>;
    getWallet(userId: number): Promise<{
        transactions: {
            id: number;
            createdAt: Date;
            type: import("@prisma/client").$Enums.TransactionType;
            description: string | null;
            status: import("@prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client-runtime-utils").Decimal;
            walletId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        balance: import("@prisma/client-runtime-utils").Decimal;
    }>;
    getPublicFreelancers(): Promise<{
        id: number;
        email: string;
        profile: {
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
            portfolios: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                githubLink: string | null;
                userId: number;
                description: string | null;
                demoLink: string | null;
            }[];
            skills?: ({
                skill: {
                    id: number;
                    createdAt: Date;
                    name: string;
                };
            } & {
                profileId: number;
                skillId: number;
            })[] | undefined;
            id?: number | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            firstName?: string | null | undefined;
            lastName?: string | null | undefined;
            avatarUrl?: string | null | undefined;
            cvUrl?: string | null | undefined;
            bio?: string | null | undefined;
            location?: string | null | undefined;
            phone?: string | null | undefined;
            companyName?: string | null | undefined;
            title?: string | null | undefined;
            hourlyRate?: import("@prisma/client-runtime-utils").Decimal | null | undefined;
            githubLink?: string | null | undefined;
            linkedinLink?: string | null | undefined;
            websiteLink?: string | null | undefined;
            idVerificationStatus?: string | undefined;
            idType?: string | null | undefined;
            idRectoUrl?: string | null | undefined;
            idVersoUrl?: string | null | undefined;
            idRejectionReason?: string | null | undefined;
            userId?: number | undefined;
        };
        completedMissions: number;
        averageRating: number | null;
        reviewsCount: number;
    }[]>;
    applyToProject(freelancerId: number, dto: {
        projectId: number;
        bidAmount: number;
        deliveryDelay: number;
        coverLetter: string;
    }): Promise<{
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
    verifyStripeAccount(accountId: string): Promise<{
        status: string;
        details: string;
    }>;
    getSidebarStats(freelancerId: number): Promise<{
        activeMissions: number;
        pendingApplications: number;
        pendingInvitations: number;
        unreadMessages: number;
    }>;
    getApplications(freelancerId: number): Promise<({
        project: {
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
    })[]>;
    getMission(freelancerId: number, contractId: number): Promise<{
        applications: ({
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.ApplicationStatus;
            projectId: number;
            freelancerId: number;
            bidAmount: import("@prisma/client-runtime-utils").Decimal;
            deliveryDelay: number;
            coverLetter: string;
        } | null)[];
        project: {
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
    signContract(freelancerId: number, contractId: number, signature: string, advancePercentage: number): Promise<{
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
    rejectContract(freelancerId: number, contractId: number): Promise<{
        message: string;
    }>;
    claimAdvance(freelancerId: number, contractId: number): Promise<{
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
    updateMissionStatus(freelancerId: number, contractId: number, status: 'DELIVERED' | 'DISPUTE'): Promise<{
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
    getMissions(freelancerId: number): Promise<({
        project: {
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
    })[]>;
    getInvitations(freelancerId: number): Promise<({
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
        client: {
            email: string;
            profile: {
                firstName: string | null;
                lastName: string | null;
                companyName: string | null;
            } | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        message: string | null;
        status: import("@prisma/client").$Enums.InvitationStatus;
        clientId: number;
        projectId: number;
        freelancerId: number;
    })[]>;
    updateInvitationStatus(id: number, status: 'ACCEPTED' | 'DECLINED'): Promise<{
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
        client: {
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
        message: string | null;
        status: import("@prisma/client").$Enums.InvitationStatus;
        clientId: number;
        projectId: number;
        freelancerId: number;
    }>;
    toggleFavoriteProject(freelancerId: number, projectId: number): Promise<{
        status: string;
    }>;
    getFavoriteProjects(freelancerId: number): Promise<(({
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
    }) | null)[]>;
}
