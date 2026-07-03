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
exports.ClientController = void 0;
const common_1 = require("@nestjs/common");
const client_service_1 = require("./client.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const create_project_dto_1 = require("./dto/create-project.dto");
let ClientController = class ClientController {
    clientService;
    constructor(clientService) {
        this.clientService = clientService;
    }
    async getCategories() {
        return this.clientService.getCategories();
    }
    async getDashboard(clientId) {
        return this.clientService.getDashboardData(clientId);
    }
    async createProject(clientId, createProjectDto) {
        return this.clientService.createProject(clientId, createProjectDto);
    }
    async updateProject(projectId, createProjectDto) {
        return this.clientService.updateProject(projectId, createProjectDto);
    }
    async deleteProject(projectId) {
        try {
            return await this.clientService.deleteProject(projectId);
        }
        catch (err) {
            throw new common_1.BadRequestException(err.message);
        }
    }
    async getPublicProjects() {
        return this.clientService.getPublicProjects();
    }
    async getPublicProjectById(id) {
        return this.clientService.getPublicProjectById(id);
    }
    async getProjectApplications(projectId) {
        return this.clientService.getProjectApplications(projectId);
    }
    async getApplication(applicationId) {
        try {
            return await this.clientService.getApplication(applicationId);
        }
        catch (err) {
            throw new common_1.BadRequestException(err.message);
        }
    }
    async updateApplicationStatus(applicationId, status, clientSignature) {
        if (!['ACCEPTED', 'REJECTED'].includes(status)) {
            throw new common_1.BadRequestException('Statut invalide. Utilisez ACCEPTED ou REJECTED.');
        }
        return this.clientService.updateApplicationStatus(applicationId, status, clientSignature);
    }
    async getClientContracts(clientId) {
        return this.clientService.getClientContracts(clientId);
    }
    async inviteFreelancer(clientId, projectId, freelancerId, message) {
        try {
            return await this.clientService.inviteFreelancer(clientId, projectId, freelancerId, message);
        }
        catch (err) {
            throw new common_1.BadRequestException(err.message);
        }
    }
    async validateDelivery(clientId, contractId, body) {
        try {
            return await this.clientService.validateDelivery(clientId, contractId, body);
        }
        catch (err) {
            throw new common_1.BadRequestException(err.message);
        }
    }
    async validateAdvance(clientId, contractId) {
        try {
            return await this.clientService.validateAdvance(clientId, contractId);
        }
        catch (err) {
            throw new common_1.BadRequestException(err.message);
        }
    }
    async cancelContract(clientId, contractId) {
        try {
            return await this.clientService.cancelContract(clientId, contractId);
        }
        catch (err) {
            throw new common_1.BadRequestException(err.message);
        }
    }
    async signContract(clientId, contractId, signature) {
        try {
            return await this.clientService.signContract(clientId, contractId, signature);
        }
        catch (err) {
            throw new common_1.BadRequestException(err.message);
        }
    }
    async disputeDelivery(clientId, contractId, reason) {
        try {
            return await this.clientService.disputeDelivery(clientId, contractId, reason);
        }
        catch (err) {
            throw new common_1.BadRequestException(err.message);
        }
    }
    async getSidebarStats(clientId) {
        return this.clientService.getSidebarStats(clientId);
    }
};
exports.ClientController = ClientController;
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir toutes les catégories et sous-catégories de projets' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste récupérée avec succès.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "getCategories", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les données du tableau de bord client par son ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Données récupérées avec succès.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/projects'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un nouveau projet pour un client' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Projet créé avec succès.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "createProject", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('projects/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un projet existant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Projet mis à jour avec succès.' }),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "updateProject", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('projects/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un projet' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Projet supprimé avec succès.' }),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "deleteProject", null);
__decorate([
    (0, common_1.Get)('projects/public'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les projets récents pour la page d\'accueil' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des projets récents récupérée.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "getPublicProjects", null);
__decorate([
    (0, common_1.Get)('projects/public/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir un projet public spécifique par son ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Projet récupéré.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "getPublicProjectById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('projects/:projectId/applications'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir toutes les candidatures pour un projet spécifique' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des candidatures récupérée avec succès.' }),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "getProjectApplications", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('applications/:applicationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les détails d\'une candidature spécifique' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Candidature récupérée avec succès.' }),
    __param(0, (0, common_1.Param)('applicationId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "getApplication", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('applications/:applicationId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour le statut d\'une candidature (Accepter/Refuser)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statut mis à jour avec succès.' }),
    __param(0, (0, common_1.Param)('applicationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('clientSignature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "updateApplicationStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':clientId/contracts'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir tous les contrats d\'un client' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des contrats récupérée avec succès.' }),
    __param(0, (0, common_1.Param)('clientId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "getClientContracts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':clientId/projects/:projectId/invite/:freelancerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Inviter un freelance à un projet' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Invitation envoyée avec succès.' }),
    __param(0, (0, common_1.Param)('clientId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('freelancerId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Body)('message')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, String]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "inviteFreelancer", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':clientId/contracts/:contractId/validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Valider la livraison d\'un contrat' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Livraison validée avec succès.' }),
    __param(0, (0, common_1.Param)('clientId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('contractId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "validateDelivery", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':clientId/contracts/:contractId/advance/validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Valider l\'acompte d\'un contrat' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Acompte validé avec succès.' }),
    __param(0, (0, common_1.Param)('clientId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('contractId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "validateAdvance", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':clientId/contracts/:contractId/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Annuler un contrat' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contrat annulé avec succès.' }),
    __param(0, (0, common_1.Param)('clientId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('contractId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "cancelContract", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':clientId/contracts/:contractId/sign'),
    (0, swagger_1.ApiOperation)({ summary: 'Signer un contrat par le client' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contrat signé.' }),
    __param(0, (0, common_1.Param)('clientId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('contractId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)('signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "signContract", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':clientId/contracts/:contractId/dispute'),
    (0, swagger_1.ApiOperation)({ summary: 'Contester la livraison d\'un contrat' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Litige signalé avec succès.' }),
    __param(0, (0, common_1.Param)('clientId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('contractId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "disputeDelivery", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':clientId/sidebar-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les statistiques de la sidebar pour le client' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistiques récupérées avec succès.' }),
    __param(0, (0, common_1.Param)('clientId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "getSidebarStats", null);
exports.ClientController = ClientController = __decorate([
    (0, swagger_1.ApiTags)('client'),
    (0, common_1.Controller)('client'),
    __metadata("design:paramtypes", [client_service_1.ClientService])
], ClientController);
//# sourceMappingURL=client.controller.js.map