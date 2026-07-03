import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    server: Server;
    private userSockets;
    constructor(chatService: ChatService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleJoinConversation(data: {
        conversationId: number;
    }, client: Socket): void;
    handleLeaveConversation(data: {
        conversationId: number;
    }, client: Socket): void;
    handleSendMessage(data: {
        conversationId: number;
        senderId: number;
        content: string;
        fileUrl?: string;
        fileName?: string;
        fileType?: string;
        replyToId?: number;
    }, client: Socket): Promise<void>;
    handleTyping(data: {
        conversationId: number;
        senderId: number;
        isTyping: boolean;
    }, client: Socket): void;
    handleMessagesRead(data: {
        conversationId: number;
        readerId: number;
    }, client: Socket): void;
    handleDeleteMessage(data: {
        conversationId: number;
        messageId: number;
        senderId: number;
    }, client: Socket): Promise<void>;
    forceDisconnectUser(userId: number): Promise<void>;
}
