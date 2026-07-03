import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: number) {
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

  async getMessages(conversationId: number) {
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

  async getUnreadCount(userId: number) {
    const conversations = await this.prisma.conversation.findMany({
      where: { members: { some: { userId } } },
      select: { id: true }
    });
    
    const conversationIds = conversations.map(c => c.id);
    
    if (conversationIds.length === 0) return 0;

    return this.prisma.message.count({
      where: {
        conversationId: { in: conversationIds },
        senderId: { not: userId },
        isRead: false
      }
    });
  }

  async initiateConversation(user1Id: number, user2Id: number) {
    // Check if conversation exists
    const existing = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { members: { some: { userId: user1Id } } },
          { members: { some: { userId: user2Id } } }
        ]
      }
    });

    if (existing) return existing;

    // Create new conversation
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

  async saveMessage(
    conversationId: number, 
    senderId: number, 
    content: string, 
    fileUrl?: string, 
    fileName?: string, 
    fileType?: string,
    replyToId?: number
  ) {
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

  async markAsRead(conversationId: number, userId: number) {
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

  async updateUserPresence(userId: number, isOnline: boolean, lastSeen?: Date) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isOnline,
        ...(lastSeen && { lastSeen })
      }
    });
  }

  async deleteMessage(messageId: number, senderId: number) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message) return null;
    if (message.senderId !== senderId) throw new Error("Unauthorized to delete this message");

    await this.prisma.message.delete({ where: { id: messageId } });
    return message;
  }
}
