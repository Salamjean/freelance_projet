"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
let ChatGateway = class ChatGateway {
    chatService;
    server;
    userSockets = new Map();
    constructor(chatService) {
        this.chatService = chatService;
    }
    async handleConnection(client) {
        try {
            const userIdStr = client.handshake.query['userId'];
            if (!userIdStr)
                return;
            const userId = parseInt(userIdStr, 10);
            if (isNaN(userId))
                return;
            if (!this.userSockets.has(userId)) {
                this.userSockets.set(userId, new Set());
            }
            const sockets = this.userSockets.get(userId);
            const isFirstConnection = sockets.size === 0;
            sockets.add(client.id);
            console.log(`[ChatGateway] Client connected: ${client.id} for user ${userId} (First: ${isFirstConnection})`);
            if (isFirstConnection) {
                await this.chatService.updateUserPresence(userId, true);
                this.server.emit('userStatusChanged', { userId, isOnline: true });
                console.log(`[ChatGateway] Emitted userStatusChanged for user ${userId} (online)`);
            }
        }
        catch (err) {
            console.error('[ChatGateway] Error in handleConnection:', err);
        }
    }
    async handleDisconnect(client) {
        try {
            const userIdStr = client.handshake.query['userId'];
            if (!userIdStr)
                return;
            const userId = parseInt(userIdStr, 10);
            if (isNaN(userId))
                return;
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
        }
        catch (err) {
            console.error('[ChatGateway] Error in handleDisconnect:', err);
        }
    }
    handleJoinConversation(data, client) {
        const room = `conversation_${data.conversationId}`;
        client.join(room);
        console.log(`Client ${client.id} joined room ${room}`);
    }
    handleLeaveConversation(data, client) {
        const room = `conversation_${data.conversationId}`;
        client.leave(room);
    }
    async handleSendMessage(data, client) {
        try {
            const message = await this.chatService.saveMessage(data.conversationId, data.senderId, data.content, data.fileUrl, data.fileName, data.fileType, data.replyToId);
            const room = `conversation_${data.conversationId}`;
            this.server.to(room).emit('newMessage', message);
        }
        catch (error) {
            console.error('Error sending message:', error);
        }
    }
    handleTyping(data, client) {
        const room = `conversation_${data.conversationId}`;
        client.to(room).emit('userTyping', data);
    }
    handleMessagesRead(data, client) {
        const room = `conversation_${data.conversationId}`;
        client.to(room).emit('messagesReadByOtherUser', data);
    }
    async handleDeleteMessage(data, client) {
        try {
            await this.chatService.deleteMessage(data.messageId, data.senderId);
            const room = `conversation_${data.conversationId}`;
            this.server.to(room).emit('messageDeleted', { messageId: data.messageId });
        }
        catch (err) {
            console.error('Error deleting message:', err);
        }
    }
    async forceDisconnectUser(userId) {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            console.log(`[ChatGateway] Force disconnecting user ${userId}`);
            for (const socketId of sockets) {
                this.server.to(socketId).emit('force_logout');
            }
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinConversation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveConversation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('messagesRead'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleMessagesRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('deleteMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleDeleteMessage", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map