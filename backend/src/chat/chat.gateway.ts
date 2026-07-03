import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track sockets per user (userId -> Set of socket IDs)
  private userSockets = new Map<number, Set<string>>();

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    try {
      const userIdStr = client.handshake.query['userId'] as string;
      if (!userIdStr) return;

      const userId = parseInt(userIdStr, 10);
      if (isNaN(userId)) return;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      
      const sockets = this.userSockets.get(userId)!;
      const isFirstConnection = sockets.size === 0;
      sockets.add(client.id);

      console.log(`[ChatGateway] Client connected: ${client.id} for user ${userId} (First: ${isFirstConnection})`);

      if (isFirstConnection) {
        await this.chatService.updateUserPresence(userId, true);
        this.server.emit('userStatusChanged', { userId, isOnline: true });
        console.log(`[ChatGateway] Emitted userStatusChanged for user ${userId} (online)`);
      }
    } catch (err) {
      console.error('[ChatGateway] Error in handleConnection:', err);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const userIdStr = client.handshake.query['userId'] as string;
      if (!userIdStr) return;

      const userId = parseInt(userIdStr, 10);
      if (isNaN(userId)) return;

      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
          const lastSeen = new Date();
          await this.chatService.updateUserPresence(userId, false, lastSeen);
          this.server.emit('userStatusChanged', { userId, isOnline: false, lastSeen });
          console.log(`[ChatGateway] Emitted userStatusChanged for user ${userId} (offline)`);
        }
      }

      console.log(`[ChatGateway] Client disconnected: ${client.id}`);
    } catch (err) {
      console.error('[ChatGateway] Error in handleDisconnect:', err);
    }
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `conversation_${data.conversationId}`;
    client.join(room);
    console.log(`Client ${client.id} joined room ${room}`);
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `conversation_${data.conversationId}`;
    client.leave(room);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { 
      conversationId: number; 
      senderId: number; 
      content: string; 
      fileUrl?: string; 
      fileName?: string; 
      fileType?: string; 
      replyToId?: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const message = await this.chatService.saveMessage(
        data.conversationId,
        data.senderId,
        data.content,
        data.fileUrl,
        data.fileName,
        data.fileType,
        data.replyToId
      );

      const room = `conversation_${data.conversationId}`;
      // Emit the message to everyone in the room, including the sender
      this.server.to(room).emit('newMessage', message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { conversationId: number; senderId: number; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `conversation_${data.conversationId}`;
    // Broadcast to everyone else in the room
    client.to(room).emit('userTyping', data);
  }

  @SubscribeMessage('messagesRead')
  handleMessagesRead(
    @MessageBody() data: { conversationId: number; readerId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `conversation_${data.conversationId}`;
    // Broadcast to everyone else in the room
    client.to(room).emit('messagesReadByOtherUser', data);
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @MessageBody() data: { conversationId: number; messageId: number; senderId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatService.deleteMessage(data.messageId, data.senderId);
      const room = `conversation_${data.conversationId}`;
      this.server.to(room).emit('messageDeleted', { messageId: data.messageId });
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  }
  async forceDisconnectUser(userId: number) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      console.log(`[ChatGateway] Force disconnecting user ${userId}`);
      for (const socketId of sockets) {
        this.server.to(socketId).emit('force_logout');
      }
    }
  }
}
