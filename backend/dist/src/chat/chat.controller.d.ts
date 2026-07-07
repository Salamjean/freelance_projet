import { ChatService } from './chat.service';
interface AuthenticatedRequest extends Request {
    user: {
        id: number;
        email: string;
        role: string;
    };
}
declare class InitiateChatDto {
    targetUserId: number;
}
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getConversations(req: AuthenticatedRequest): Promise<({
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
    getMessages(id: string): Promise<({
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
            sender: {
                profile: {
                    firstName: string | null;
                    lastName: string | null;
                } | null;
            };
            fileUrl: string | null;
            fileName: string | null;
            content: string | null;
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
    getUnreadCount(req: AuthenticatedRequest): Promise<{
        count: number;
    }>;
    initiateConversation(req: AuthenticatedRequest, dto: InitiateChatDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    uploadFile(file: Express.Multer.File): Promise<{
        fileUrl: string;
        fileName: string;
        fileType: string;
    }>;
    markAsRead(req: AuthenticatedRequest, id: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
export {};
