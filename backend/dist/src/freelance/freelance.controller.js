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
exports.FreelanceController = void 0;
const common_1 = require("@nestjs/common");
const freelance_service_1 = require("./freelance.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const common_2 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let FreelanceController = class FreelanceController {
    freelanceService;
    constructor(freelanceService) {
        this.freelanceService = freelanceService;
    }
    async getPublicFreelancers() {
        return this.freelanceService.getPublicFreelancers();
    }
    async getDashboard(freelancerId) {
        return this.freelanceService.getDashboardData(freelancerId);
    }
    async getWallet(freelancerId) {
        return this.freelanceService.getWallet(freelancerId);
    }
    async applyToProject(freelancerId, dto) {
        try {
            return await this.freelanceService.applyToProject(freelancerId, dto);
        }
        catch (err) {
            throw new common_1.BadRequestException(err.message);
        }
    }
    async getApplications(freelancerId) {
        return this.freelanceService.getApplications(freelancerId);
    }
    async getMissions(freelancerId) {
        return this.freelanceService.getMissions(freelancerId);
    }
    async getMission(freelancerId, contractId) {
        return this.freelanceService.getMission(freelancerId, contractId);
    }
    async signContract(freelancerId, contractId, signature, advancePercentage) {
        if (!signature) {
            throw new common_1.BadRequestException('La signature est requise.');
        }
        return this.freelanceService.signContract(freelancerId, contractId, signature, advancePercentage || 0);
    }
    async rejectContract(freelancerId, contractId) {
        return this.freelanceService.rejectContract(freelancerId, contractId);
    }
    async claimAdvance(freelancerId, contractId) {
        return this.freelanceService.claimAdvance(freelancerId, contractId);
    }
    async updateMissionStatus(freelancerId, contractId, status) {
        if (!['DELIVERED', 'DISPUTE'].includes(status)) {
            throw new common_1.BadRequestException('Statut invalide.');
        }
        try {
            return await this.freelanceService.updateMissionStatus(freelancerId, contractId, status);
        }
        catch (err) {
            throw new common_1.BadRequestException(err.message);
        }
    }
    async verifyStripeAccount(id) {
        return this.freelanceService.verifyStripeAccount('acct_dummy');
    }
    async getSidebarStats(id) {
        return this.freelanceService.getSidebarStats(id);
    }
    async getInvitations(freelancerId) {
        return this.freelanceService.getInvitations(freelancerId);
    }
    async updateInvitationStatus(id, status) {
        if (!['ACCEPTED', 'DECLINED'].includes(status)) {
            throw new common_1.BadRequestException('Statut invalide.');
        }
        return this.freelanceService.updateInvitationStatus(id, status);
    }
    async toggleFavoriteProject(freelancerId, projectId) {
        return this.freelanceService.toggleFavoriteProject(freelancerId, projectId);
    }
    async getFavoriteProjects(freelancerId) {
        return this.freelanceService.getFavoriteProjects(freelancerId);
    }
};
exports.FreelanceController = FreelanceController;
__decorate([
    (0, common_1.Get)('public'),
    (0, swagger_1.ApiOperation)({ summary: 'Lister tous les freelances publiquement pour les clients' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des freelances récupérée avec succès.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FreelanceController.prototype, "getPublicFreelancers", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les données du tableau de bord freelance par son ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Données récupérées avec succès.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FreelanceController.prototype, "getDashboard", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/wallet'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir le portefeuille du freelance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Portefeuille récupéré avec succès.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FreelanceController.prototype, "getWallet", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/applications'),
    (0, swagger_1.ApiOperation)({ summary: 'Soumettre une candidature pour un projet' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Candidature soumise avec succès.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FreelanceController.prototype, "applyToProject", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/applications'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir toutes les candidatures d\'un freelance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des candidatures récupérée.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FreelanceController.prototype, "getApplications", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/missions'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir toutes les missions (contrats) d\'un freelance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des missions récupérée.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FreelanceController.prototype, "getMissions", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/missions/:contractId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir une mission spécifique' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mission récupérée avec succès.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('contractId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], FreelanceController.prototype, "getMission", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/missions/:contractId/sign'),
    (0, swagger_1.ApiOperation)({ summary: 'Signer un contrat de mission et définir l\'acompte' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contrat signé avec succès.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('contractId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)('signature')),
    __param(3, (0, common_1.Body)('advancePercentage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, Number]),
    __metadata("design:returntype", Promise)
], FreelanceController.prototype, "signContract", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id/missions/:contractId/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Refuser un contrat proposé' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contrat refusé avec succès.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('contractId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], FreelanceController.prototype, "rejectContract", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id/missions/:contractId/advance/claim'),
    (0, swagger_1.ApiOperation)({ summary: 'Réclamer le paiement de l\'acompte' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Acompte réclamé avec succès.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('contractId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], FreelanceController.prototype, "claimAdvance", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id/missions/:contractId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour le statut d\'une mission (DELIVERED, DISPUTE)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statut mis à jour.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('contractId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], FreelanceController.prototype, "updateMissionStatus", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/stripe/verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Vérifier le statut du compte Stripe Connect' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statut du compte Stripe récupéré.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FreelanceController.prototype, "verifyStripeAccount", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/sidebar-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les statistiques de la sidebar pour le freelance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistiques récupérées avec succès.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FreelanceController.prototype, "getSidebarStats", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/invitations'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir toutes les invitations d\'un freelance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des invitations récupérée.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FreelanceController.prototype, "getInvitations", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('invitations/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour le statut d\'une invitation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statut mis à jour.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], FreelanceController.prototype, "updateInvitationStatus", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/favorites/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter ou retirer un projet des favoris' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Favori mis à jour.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], FreelanceController.prototype, "toggleFavoriteProject", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/favorites'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir tous les projets favoris d\'un freelance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des projets favoris récupérée.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FreelanceController.prototype, "getFavoriteProjects", null);
exports.FreelanceController = FreelanceController = __decorate([
    (0, swagger_1.ApiTags)('freelance'),
    (0, common_1.Controller)('freelance'),
    __metadata("design:paramtypes", [freelance_service_1.FreelanceService])
], FreelanceController);
//# sourceMappingURL=freelance.controller.js.map