import { Controller, Post, Delete, Body, Req, Headers, BadRequestException, Get, Patch, Put, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile/:userId')
  @ApiOperation({ summary: 'Obtenir le profil complet d\'un utilisateur par son ID' })
  @ApiResponse({ status: 200, description: 'Profil récupéré avec succès.' })
  async getProfile(@Param('userId', ParseIntPipe) userId: number) {
    return this.authService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/:userId')
  @ApiOperation({ summary: 'Mettre à jour le profil d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Profil mis à jour avec succès.' })
  async updateProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: any,
  ) {
    return this.authService.updateProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/:userId/verify-identity')
  @ApiOperation({ summary: 'Soumettre une demande de vérification d\'identité' })
  @ApiResponse({ status: 200, description: 'Demande soumise avec succès.' })
  async verifyIdentity(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: { idType: string; idRectoUrl: string; idVersoUrl: string },
  ) {
    return this.authService.submitVerification(userId, dto);
  }

  // --- Experiences ---
  @UseGuards(JwtAuthGuard)
  @Post('profile/:userId/experience')
  @ApiOperation({ summary: 'Ajouter une expérience' })
  async addExperience(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: { company: string; position: string; description?: string; startDate: string; endDate?: string; isCurrent: boolean },
  ) {
    return this.authService.addExperience(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile/:userId/experience/:id')
  @ApiOperation({ summary: 'Supprimer une expérience' })
  async deleteExperience(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.authService.deleteExperience(userId, id);
  }

  // --- Educations ---
  @UseGuards(JwtAuthGuard)
  @Post('profile/:userId/education')
  @ApiOperation({ summary: 'Ajouter une éducation' })
  async addEducation(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: { school: string; degree: string; fieldOfStudy?: string; startDate: string; endDate?: string },
  ) {
    return this.authService.addEducation(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile/:userId/education/:id')
  @ApiOperation({ summary: 'Supprimer une éducation' })
  async deleteEducation(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.authService.deleteEducation(userId, id);
  }

  // --- Certificates ---
  @UseGuards(JwtAuthGuard)
  @Post('profile/:userId/certificate')
  @ApiOperation({ summary: 'Ajouter un certificat' })
  async addCertificate(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: { name: string; issuer: string; issueDate: string; expiryDate?: string; credentialUrl?: string },
  ) {
    return this.authService.addCertificate(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile/:userId/certificate/:id')
  @ApiOperation({ summary: 'Supprimer un certificat' })
  async deleteCertificate(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.authService.deleteCertificate(userId, id);
  }

  // --- Portfolios ---
  @UseGuards(JwtAuthGuard)
  @Post('profile/:userId/portfolio')
  @ApiOperation({ summary: 'Ajouter un élément au portfolio' })
  async addPortfolio(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: { title: string; description?: string; githubLink?: string; demoLink?: string; fileUrl?: string; fileName?: string; fileType?: string },
  ) {
    return this.authService.addPortfolio(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile/:userId/portfolio/:id')
  @ApiOperation({ summary: 'Supprimer un élément du portfolio' })
  async deletePortfolio(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.authService.deletePortfolio(userId, id);
  }

  @Post('register')
  @ApiOperation({ summary: 'Créer un compte client ou freelance' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides ou e-mail déjà existant.' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Connexion de l\'utilisateur et retour des tokens' })
  @ApiResponse({ status: 200, description: 'Connexion réussie.' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides.' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.login(dto, userAgent, ipAddress);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renouveler l\'access token à partir du refresh token' })
  @ApiResponse({ status: 200, description: 'Tokens rafraîchis avec succès.' })
  @ApiResponse({ status: 401, description: 'Session expirée ou invalide.' })
  async refresh(
    @Body('refreshToken') refreshToken: string,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token manquant');
    }
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.refresh(refreshToken, userAgent, ipAddress);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Déconnecter l\'utilisateur et invalider son refresh token' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie.' })
  async logout(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token manquant');
    }
    return this.authService.logout(refreshToken);
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile/:userId/notifications')
  @ApiOperation({ summary: 'Obtenir les notifications de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Notifications récupérées avec succès.' })
  async getNotifications(@Param('userId', ParseIntPipe) userId: number) {
    return this.authService.getNotifications(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('notifications/:notificationId/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  @ApiResponse({ status: 200, description: 'Notification marquée comme lue avec succès.' })
  async markNotificationAsRead(@Param('notificationId', ParseIntPipe) notificationId: number) {
    return this.authService.markNotificationAsRead(notificationId);
  }
}
