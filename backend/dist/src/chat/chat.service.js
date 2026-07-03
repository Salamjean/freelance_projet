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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ChatService = class ChatService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getConversations(userId) {
        return this.prisma.conversation.findMany({
            where: {
                members: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                role: true,
                                isOnline: true,
                                lastSeen: true,
                                profile: { select: { firstName: true, lastName: true, avatarUrl: true } }
                            }
                        }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                isRead: false,
                                senderId: { not: userId }
                            }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
    }
    async getMessages(conversationId) {
        return this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: {
                    select: { id: true, role: true, profile: { select: { firstName: true, lastName: true, avatarUrl: true } } }
                },
                replyTo: {
                    select: {
                        id: true,
                        content: true,
                        fileUrl: true,
                        fileName: true,
                        sender: {
                            select: { profile: { select: { firstName: true, lastName: true } } }
                        }
                    }
                }
            }
        });
    }
    async getUnreadCount(userId) {
        const conversations = await this.prisma.conversation.findMany({
            where: { members: { some: { userId } } },
            select: { id: true }
        });
        const conversationIds = conversations.map(c => c.id);
        if (conversationIds.length === 0)
            return 0;
        return this.prisma.message.count({
            where: {
                conversationId: { in: conversationIds },
                senderId: { not: userId },
                isRead: false
            }
        });
    }
    async initiateConversation(user1Id, user2Id) {
        const existing = await this.prisma.conversation.findFirst({
            where: {
                AND: [
                    { members: { some: { userId: user1Id } } },
                    { members: { some: { userId: user2Id } } }
                ]
            }
        });
        if (existing)
            return existing;
        return this.prisma.conversation.create({
            data: {
                members: {
                    create: [
                        { userId: user1Id },
                        { userId: user2Id }
                    ]
                }
            }
        });
    }
    async saveMessage(conversationId, senderId, content, fileUrl, fileName, fileType, replyToId) {
        const message = await this.prisma.message.create({
            data: {
                conversationId,
                senderId,
                content: content || null,
                fileUrl: fileUrl || null,
                fileName: fileName || null,
                fileType: fileType || null,
                replyToId: replyToId || null,
            },
            include: {
                sender: {
                    select: { id: true, role: true, profile: { select: { firstName: true, lastName: true, avatarUrl: true } } }
                },
                replyTo: {
                    select: {
                        id: true,
                        content: true,
                        fileUrl: true,
                        fileName: true,
                        sender: {
                            select: { profile: { select: { firstName: true, lastName: true } } }
                        }
                    }
                }
            }
        });
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });
        return message;
    }
    async markAsRead(conversationId, userId) {
        return this.prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: userId },
                isRead: false
            },
            data: {
                isRead: true
            }
        });
    }
    async updateUserPresence(userId, isOnline, lastSeen) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isOnline,
                ...(lastSeen && { lastSeen })
            }
        });
    }
    async deleteMessage(messageId, senderId) {
        const message = await this.prisma.message.findUnique({ where: { id: messageId } });
        if (!message)
            return null;
        if (message.senderId !== senderId)
            throw new Error("Unauthorized to delete this message");
        await this.prisma.message.delete({ where: { id: messageId } });
        return message;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map