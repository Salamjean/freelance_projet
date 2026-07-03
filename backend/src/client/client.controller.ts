import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, BadRequestException } from '@nestjs/common';
import { ClientService } from './client.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateProjectDto } from './dto/create-project.dto';

@ApiTags('client')
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Obtenir toutes les catégories et sous-catégories de projets' })
  @ApiResponse({ status: 200, description: 'Liste récupérée avec succès.' })
  async getCategories() {
    return this.clientService.getCategories();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Obtenir les données du tableau de bord client par son ID' })
  @ApiResponse({ status: 200, description: 'Données récupérées avec succès.' })
  async getDashboard(@Param('id', ParseIntPipe) clientId: number) {
    return this.clientService.getDashboardData(clientId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/projects')
  @ApiOperation({ summary: 'Créer un nouveau projet pour un client' })
  @ApiResponse({ status: 201, description: 'Projet créé avec succès.' })
  async createProject(
    @Param('id', ParseIntPipe) clientId: number,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.clientService.createProject(clientId, createProjectDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('projects/:projectId')
  @ApiOperation({ summary: 'Modifier un projet existant' })
  @ApiResponse({ status: 200, description: 'Projet mis à jour avec succès.' })
  async updateProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.clientService.updateProject(projectId, createProjectDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('projects/:projectId')
  @ApiOperation({ summary: 'Supprimer un projet' })
  @ApiResponse({ status: 200, description: 'Projet supprimé avec succès.' })
  async deleteProject(@Param('projectId', ParseIntPipe) projectId: number) {
    try {
      return await this.clientService.deleteProject(projectId);
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Get('projects/public')
  @ApiOperation({ summary: 'Obtenir les projets récents pour la page d\'accueil' })
  @ApiResponse({ status: 200, description: 'Liste des projets récents récupérée.' })
  async getPublicProjects() {
    return this.clientService.getPublicProjects();
  }

  @Get('projects/public/:id')
  @ApiOperation({ summary: 'Obtenir un projet public spécifique par son ID' })
  @ApiResponse({ status: 200, description: 'Projet récupéré.' })
  async getPublicProjectById(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.getPublicProjectById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('projects/:projectId/applications')
  @ApiOperation({ summary: 'Obtenir toutes les candidatures pour un projet spécifique' })
  @ApiResponse({ status: 200, description: 'Liste des candidatures récupérée avec succès.' })
  async getProjectApplications(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.clientService.getProjectApplications(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('applications/:applicationId')
  @ApiOperation({ summary: 'Obtenir les détails d\'une candidature spécifique' })
  @ApiResponse({ status: 200, description: 'Candidature récupérée avec succès.' })
  async getApplication(@Param('applicationId', ParseIntPipe) applicationId: number) {
    try {
      return await this.clientService.getApplication(applicationId);
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('applications/:applicationId/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une candidature (Accepter/Refuser)' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour avec succès.' })
  async updateApplicationStatus(
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Body('status') status: 'ACCEPTED' | 'REJECTED',
    @Body('clientSignature') clientSignature?: string
  ) {
    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      throw new BadRequestException('Statut invalide. Utilisez ACCEPTED ou REJECTED.');
    }
    return this.clientService.updateApplicationStatus(applicationId, status, clientSignature);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':clientId/contracts')
  @ApiOperation({ summary: 'Obtenir tous les contrats d\'un client' })
  @ApiResponse({ status: 200, description: 'Liste des contrats récupérée avec succès.' })
  async getClientContracts(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.clientService.getClientContracts(clientId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':clientId/projects/:projectId/invite/:freelancerId')
  @ApiOperation({ summary: 'Inviter un freelance à un projet' })
  @ApiResponse({ status: 201, description: 'Invitation envoyée avec succès.' })
  async inviteFreelancer(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('freelancerId', ParseIntPipe) freelancerId: number,
    @Body('message') message: string
  ) {
    try {
      return await this.clientService.inviteFreelancer(clientId, projectId, freelancerId, message);
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':clientId/contracts/:contractId/validate')
  @ApiOperation({ summary: 'Valider la livraison d\'un contrat' })
  @ApiResponse({ status: 200, description: 'Livraison validée avec succès.' })
  async validateDelivery(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Param('contractId', ParseIntPipe) contractId: number,
    @Body() body: { ratingQuality?: number; ratingCommunication?: number; ratingDeadline?: number; ratingProfessionalism?: number; comment?: string }
  ) {
    try {
      return await this.clientService.validateDelivery(clientId, contractId, body);
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':clientId/contracts/:contractId/advance/validate')
  @ApiOperation({ summary: 'Valider l\'acompte d\'un contrat' })
  @ApiResponse({ status: 200, description: 'Acompte validé avec succès.' })
  async validateAdvance(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Param('contractId', ParseIntPipe) contractId: number
  ) {
    try {
      return await this.clientService.validateAdvance(clientId, contractId);
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':clientId/contracts/:contractId/cancel')
  @ApiOperation({ summary: 'Annuler un contrat' })
  @ApiResponse({ status: 200, description: 'Contrat annulé avec succès.' })
  async cancelContract(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Param('contractId', ParseIntPipe) contractId: number
  ) {
    try {
      return await this.clientService.cancelContract(clientId, contractId);
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':clientId/contracts/:contractId/sign')
  @ApiOperation({ summary: 'Signer un contrat par le client' })
  @ApiResponse({ status: 200, description: 'Contrat signé.' })
  async signContract(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Param('contractId', ParseIntPipe) contractId: number,
    @Body('signature') signature: string
  ) {
    try {
      return await this.clientService.signContract(clientId, contractId, signature);
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':clientId/contracts/:contractId/dispute')
  @ApiOperation({ summary: 'Contester la livraison d\'un contrat' })
  @ApiResponse({ status: 200, description: 'Litige signalé avec succès.' })
  async disputeDelivery(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Param('contractId', ParseIntPipe) contractId: number,
    @Body('reason') reason: string
  ) {
    try {
      return await this.clientService.disputeDelivery(clientId, contractId, reason);
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }
  @UseGuards(JwtAuthGuard)
  @Get(':clientId/sidebar-stats')
  @ApiOperation({ summary: 'Obtenir les statistiques de la sidebar pour le client' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées avec succès.' })
  async getSidebarStats(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.clientService.getSidebarStats(clientId);
  }
}
