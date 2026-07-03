import { PrismaService } from '../prisma/prisma.service';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    getConversations(userId: number): Promise<({
        _count: {
            messages: number;
        };
        members: ({
            user: {
                id: number;
                email: string;
                role: import("@prisma/client").$Enums.Role;
                isOnline: boolean;
                lastSeen: Date | null;
                profile: {
                    firstName: string | null;
                    lastName: string | null;
                    avatarUrl: string | null;
                } | null;
            };
        } & {
            userId: number;
            conversationId: number;
        })[];
        messages: {
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
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getMessages(conversationId: number): Promise<({
        sender: {
            id: number;
            role: import("@prisma/client").$Enums.Role;
            profile: {
                firstName: string | null;
                lastName: string | null;
                avatarUrl: string | null;
            } | null;
        };
        replyTo: {
            id: number;
            fileUrl: string | null;
            fileName: string | null;
            content: string | null;
            sender: {
                profile: {
                    firstName: string | null;
                    lastName: string | null;
                } | null;
            };
        } | null;
    } & {
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
    })[]>;
    getUnreadCount(userId: number): Promise<number>;
    initiateConversation(user1Id: number, user2Id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    saveMessage(conversationId: number, senderId: number, content: string, fileUrl?: string, fileName?: string, fileType?: string, replyToId?: number): Promise<{
        sender: {
            id: number;
            role: import("@prisma/client").$Enums.Role;
            profile: {
                firstName: string | null;
                lastName: string | null;
                avatarUrl: string | null;
            } | null;
        };
        replyTo: {
            id: number;
            fileUrl: string | null;
            fileName: string | null;
            content: string | null;
            sender: {
                profile: {
                    firstName: string | null;
                    lastName: string | null;
                } | null;
            };
        } | null;
    } & {
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
    markAsRead(conversationId: number, userId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    updateUserPresence(userId: number, isOnline: boolean, lastSeen?: Date): Promise<{
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
    deleteMessage(messageId: number, senderId: number): Promise<{
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
    } | null>;
}
