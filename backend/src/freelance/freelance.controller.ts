import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { FreelanceService } from './freelance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('freelance')
@Controller('freelance')
export class FreelanceController {
  constructor(private readonly freelanceService: FreelanceService) {}

  @Get('public')
  @ApiOperation({ summary: 'Lister tous les freelances publiquement pour les clients' })
  @ApiResponse({ status: 200, description: 'Liste des freelances récupérée avec succès.' })
  async getPublicFreelancers() {
    return this.freelanceService.getPublicFreelancers();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Obtenir les données du tableau de bord freelance par son ID' })
  @ApiResponse({ status: 200, description: 'Données récupérées avec succès.' })
  async getDashboard(@Param('id', ParseIntPipe) freelancerId: number) {
    return this.freelanceService.getDashboardData(freelancerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/wallet')
  @ApiOperation({ summary: 'Obtenir le portefeuille du freelance' })
  @ApiResponse({ status: 200, description: 'Portefeuille récupéré avec succès.' })
  async getWallet(@Param('id', ParseIntPipe) freelancerId: number) {
    return this.freelanceService.getWallet(freelancerId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/applications')
  @ApiOperation({ summary: 'Soumettre une candidature pour un projet' })
  @ApiResponse({ status: 201, description: 'Candidature soumise avec succès.' })
  async applyToProject(
    @Param('id', ParseIntPipe) freelancerId: number,
    @Body() dto: { projectId: number; bidAmount: number; deliveryDelay: number; coverLetter: string },
  ) {
    try {
      return await this.freelanceService.applyToProject(freelancerId, dto);
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/applications')
  @ApiOperation({ summary: 'Obtenir toutes les candidatures d\'un freelance' })
  @ApiResponse({ status: 200, description: 'Liste des candidatures récupérée.' })
  async getApplications(@Param('id', ParseIntPipe) freelancerId: number) {
    return this.freelanceService.getApplications(freelancerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/missions')
  @ApiOperation({ summary: 'Obtenir toutes les missions (contrats) d\'un freelance' })
  @ApiResponse({ status: 200, description: 'Liste des missions récupérée.' })
  async getMissions(@Param('id', ParseIntPipe) freelancerId: number) {
    return this.freelanceService.getMissions(freelancerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/missions/:contractId')
  @ApiOperation({ summary: 'Obtenir une mission spécifique' })
  @ApiResponse({ status: 200, description: 'Mission récupérée avec succès.' })
  async getMission(
    @Param('id', ParseIntPipe) freelancerId: number,
    @Param('contractId', ParseIntPipe) contractId: number
  ) {
    return this.freelanceService.getMission(freelancerId, contractId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/missions/:contractId/sign')
  @ApiOperation({ summary: 'Signer un contrat de mission et définir l\'acompte' })
  @ApiResponse({ status: 200, description: 'Contrat signé avec succès.' })
  async signContract(
    @Param('id', ParseIntPipe) freelancerId: number,
    @Param('contractId', ParseIntPipe) contractId: number,
    @Body('signature') signature: string,
    @Body('advancePercentage') advancePercentage: number
  ) {
    if (!signature) {
      throw new BadRequestException('La signature est requise.');
    }
    return this.freelanceService.signContract(freelancerId, contractId, signature, advancePercentage || 0);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/missions/:contractId/reject')
  @ApiOperation({ summary: 'Refuser un contrat proposé' })
  @ApiResponse({ status: 200, description: 'Contrat refusé avec succès.' })
  async rejectContract(
    @Param('id', ParseIntPipe) freelancerId: number,
    @Param('contractId', ParseIntPipe) contractId: number
  ) {
    return this.freelanceService.rejectContract(freelancerId, contractId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/missions/:contractId/advance/claim')
  @ApiOperation({ summary: 'Réclamer le paiement de l\'acompte' })
  @ApiResponse({ status: 200, description: 'Acompte réclamé avec succès.' })
  async claimAdvance(
    @Param('id', ParseIntPipe) freelancerId: number,
    @Param('contractId', ParseIntPipe) contractId: number
  ) {
    return this.freelanceService.claimAdvance(freelancerId, contractId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/missions/:contractId/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une mission (DELIVERED, DISPUTE)' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour.' })
  async updateMissionStatus(
    @Param('id', ParseIntPipe) freelancerId: number,
    @Param('contractId', ParseIntPipe) contractId: number,
    @Body('status') status: 'DELIVERED' | 'DISPUTE'
  ) {
    if (!['DELIVERED', 'DISPUTE'].includes(status)) {
      throw new BadRequestException('Statut invalide.');
    }
    try {
      return await this.freelanceService.updateMissionStatus(freelancerId, contractId, status);
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/stripe/verify')
  @ApiOperation({ summary: 'Vérifier le statut du compte Stripe Connect' })
  @ApiResponse({ status: 200, description: 'Statut du compte Stripe récupéré.' })
  async verifyStripeAccount(@Param('id', ParseIntPipe) id: number) {
    return this.freelanceService.verifyStripeAccount('acct_dummy');
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/sidebar-stats')
  @ApiOperation({ summary: 'Obtenir les statistiques de la sidebar pour le freelance' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées avec succès.' })
  async getSidebarStats(@Param('id', ParseIntPipe) id: number) {
    return this.freelanceService.getSidebarStats(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/invitations')
  @ApiOperation({ summary: 'Obtenir toutes les invitations d\'un freelance' })
  @ApiResponse({ status: 200, description: 'Liste des invitations récupérée.' })
  async getInvitations(@Param('id', ParseIntPipe) freelancerId: number) {
    return this.freelanceService.getInvitations(freelancerId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('invitations/:id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une invitation' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour.' })
  async updateInvitationStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'ACCEPTED' | 'DECLINED'
  ) {
    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      throw new BadRequestException('Statut invalide.');
    }
    return this.freelanceService.updateInvitationStatus(id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/favorites/:projectId')
  @ApiOperation({ summary: 'Ajouter ou retirer un projet des favoris' })
  @ApiResponse({ status: 200, description: 'Favori mis à jour.' })
  async toggleFavoriteProject(
    @Param('id', ParseIntPipe) freelancerId: number,
    @Param('projectId', ParseIntPipe) projectId: number
  ) {
    return this.freelanceService.toggleFavoriteProject(freelancerId, projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/favorites')
  @ApiOperation({ summary: 'Obtenir tous les projets favoris d\'un freelance' })
  @ApiResponse({ status: 200, description: 'Liste des projets favoris récupérée.' })
  async getFavoriteProjects(@Param('id', ParseIntPipe) freelancerId: number) {
    return this.freelanceService.getFavoriteProjects(freelancerId);
  }
}

