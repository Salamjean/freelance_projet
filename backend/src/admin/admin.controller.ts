import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SendMailDto } from './dto/send-mail.dto';

@ApiTags('admin')
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('send-mail')
  @ApiOperation({ summary: 'Envoyer un email aux utilisateurs' })
  async sendMail(@Body() dto: SendMailDto) {
    return this.adminService.sendMail(dto);
  }

  @Post('users/:id/message')
  @ApiOperation({ summary: 'Envoyer un message unidirectionnel à un utilisateur' })
  async sendMessageToUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() body: { adminId: number, content: string }
  ) {
    return this.adminService.sendMessageToUser(body.adminId, userId, body.content);
  }

  @Post('users/:id/suspend')
  @ApiOperation({ summary: 'Suspendre un utilisateur' })
  async suspendUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() body: { durationInDays?: number | null }
  ) {
    return this.adminService.suspendUser(userId, body.durationInDays);
  }

  @Post('users/:id/unsuspend')
  @ApiOperation({ summary: 'Lever la suspension d\'un utilisateur' })
  async unsuspendUser(@Param('id', ParseIntPipe) userId: number) {
    return this.adminService.unsuspendUser(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques globales pour le dashboard admin' })
  @ApiResponse({ status: 200, description: 'Statistiques obtenues avec succès.' })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Obtenir la liste complète des utilisateurs' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs récupérée avec succès.' })
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Get('projects')
  @ApiOperation({ summary: 'Obtenir la liste complète des projets' })
  async getProjects() {
    return this.adminService.getProjects();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Obtenir la liste des catégories' })
  async getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Créer une nouvelle catégorie' })
  async createCategory(@Body() body: { name: string, slug: string }) {
    return this.adminService.createCategory(body.name, body.slug);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Modifier une catégorie' })
  async updateCategory(@Param('id', ParseIntPipe) id: number, @Body() body: { name: string, slug: string }) {
    return this.adminService.updateCategory(id, body.name, body.slug);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Supprimer une catégorie' })
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCategory(id);
  }

  @Post('categories/:id/subcategories')
  @ApiOperation({ summary: 'Ajouter une sous-catégorie' })
  async addSubCategory(@Param('id', ParseIntPipe) id: number, @Body() body: { name: string, slug: string }) {
    return this.adminService.addSubCategory(id, body.name, body.slug);
  }

  @Delete('subcategories/:id')
  @ApiOperation({ summary: 'Supprimer une sous-catégorie' })
  async removeSubCategory(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.removeSubCategory(id);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Obtenir la liste des paiements' })
  async getPayments() {
    return this.adminService.getPayments();
  }

  @Get('disputes')
  @ApiOperation({ summary: 'Obtenir la liste des litiges' })
  async getDisputes() {
    return this.adminService.getDisputes();
  }

  @Get('verifications')
  @ApiOperation({ summary: 'Obtenir les demandes de vérification d\'identité en attente' })
  @ApiResponse({ status: 200, description: 'Liste récupérée avec succès.' })
  async getVerifications() {
    return this.adminService.getPendingVerifications();
  }

  @Post('verifications/:profileId/approve')
  @ApiOperation({ summary: 'Approuver la vérification d\'identité d\'un freelance' })
  @ApiResponse({ status: 200, description: 'Identité approuvée.' })
  async approve(@Param('profileId', ParseIntPipe) profileId: number) {
    return this.adminService.approveVerification(profileId);
  }

  @Post('verifications/:profileId/reject')
  @ApiOperation({ summary: 'Rejeter la vérification d\'identité d\'un freelance' })
  @ApiResponse({ status: 200, description: 'Identité rejetée.' })
  async reject(
    @Param('profileId', ParseIntPipe) profileId: number,
    @Body('rejectionReason') rejectionReason: string,
  ) {
    return this.adminService.rejectVerification(profileId, rejectionReason);
  }
}
