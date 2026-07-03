import { Controller, Get, Post, Put, Param, Body, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsNumber, IsNotEmpty } from 'class-validator';

interface AuthenticatedRequest extends Request {
  user: { id: number; email: string; role: string };
}

class InitiateChatDto {
  @IsNumber()
  @IsNotEmpty()
  targetUserId: number;
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  async getConversations(@Req() req: AuthenticatedRequest) {
    return this.chatService.getConversations(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations/:id/messages')
  async getMessages(@Param('id') id: string) {
    return this.chatService.getMessages(parseInt(id));
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  async getUnreadCount(@Req() req: AuthenticatedRequest) {
    const count = await this.chatService.getUnreadCount(req.user.id);
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  async initiateConversation(@Req() req: AuthenticatedRequest, @Body() dto: InitiateChatDto) {
    try {
      return await this.chatService.initiateConversation(req.user.id, dto.targetUserId);
    } catch (err: any) {
      console.error('ERROR in initiateConversation:', err);
      throw err;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/chat';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Allow images, videos, and common documents (pdf, word, excel)
        const allowedTypes = ['image/', 'video/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument'];
        const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
        
        if (!isAllowed) {
          return cb(new BadRequestException('Format de fichier non supporté.'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 1024 * 1024 * 1024, // 1 GB max
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    return {
      fileUrl: `/uploads/chat/${file.filename}`,
      fileName: file.originalname,
      fileType: file.mimetype,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('conversations/:id/read')
  async markAsRead(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.chatService.markAsRead(parseInt(id), req.user.id);
  }
}
