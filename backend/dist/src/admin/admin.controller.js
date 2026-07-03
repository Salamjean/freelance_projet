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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const send_mail_dto_1 = require("./dto/send-mail.dto");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async sendMail(dto) {
        return this.adminService.sendMail(dto);
    }
    async sendMessageToUser(userId, body) {
        return this.adminService.sendMessageToUser(body.adminId, userId, body.content);
    }
    async suspendUser(userId, body) {
        return this.adminService.suspendUser(userId, body.durationInDays);
    }
    async unsuspendUser(userId) {
        return this.adminService.unsuspendUser(userId);
    }
    async getStats() {
        return this.adminService.getStats();
    }
    async getUsers() {
        return this.adminService.getUsers();
    }
    async getProjects() {
        return this.adminService.getProjects();
    }
    async getCategories() {
        return this.adminService.getCategories();
    }
    async createCategory(body) {
        return this.adminService.createCategory(body.name, body.slug);
    }
    async updateCategory(id, body) {
        return this.adminService.updateCategory(id, body.name, body.slug);
    }
    async deleteCategory(id) {
        return this.adminService.deleteCategory(id);
    }
    async addSubCategory(id, body) {
        return this.adminService.addSubCategory(id, body.name, body.slug);
    }
    async removeSubCategory(id) {
        return this.adminService.removeSubCategory(id);
    }
    async getPayments() {
        return this.adminService.getPayments();
    }
    async getDisputes() {
        return this.adminService.getDisputes();
    }
    async getVerifications() {
        return this.adminService.getPendingVerifications();
    }
    async approve(profileId) {
        return this.adminService.approveVerification(profileId);
    }
    async reject(profileId, rejectionReason) {
        return this.adminService.rejectVerification(profileId, rejectionReason);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('send-mail'),
    (0, swagger_1.ApiOperation)({ summary: 'Envoyer un email aux utilisateurs' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_mail_dto_1.SendMailDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "sendMail", null);
__decorate([
    (0, common_1.Post)('users/:id/message'),
    (0, swagger_1.ApiOperation)({ summary: 'Envoyer un message unidirectionnel à un utilisateur' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "sendMessageToUser", null);
__decorate([
    (0, common_1.Post)('users/:id/suspend'),
    (0, swagger_1.ApiOperation)({ summary: 'Suspendre un utilisateur' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "suspendUser", null);
__decorate([
    (0, common_1.Post)('users/:id/unsuspend'),
    (0, swagger_1.ApiOperation)({ summary: 'Lever la suspension d\'un utilisateur' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "unsuspendUser", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les statistiques globales pour le dashboard admin' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistiques obtenues avec succès.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir la liste complète des utilisateurs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des utilisateurs récupérée avec succès.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('projects'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir la liste complète des projets' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getProjects", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir la liste des catégories' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une nouvelle catégorie' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Put)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une catégorie' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une catégorie' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Post)('categories/:id/subcategories'),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter une sous-catégorie' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "addSubCategory", null);
__decorate([
    (0, common_1.Delete)('subcategories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une sous-catégorie' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "removeSubCategory", null);
__decorate([
    (0, common_1.Get)('payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir la liste des paiements' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Get)('disputes'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir la liste des litiges' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDisputes", null);
__decorate([
    (0, common_1.Get)('verifications'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les demandes de vérification d\'identité en attente' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste récupérée avec succès.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getVerifications", null);
__decorate([
    (0, common_1.Post)('verifications/:profileId/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approuver la vérification d\'identité d\'un freelance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Identité approuvée.' }),
    __param(0, (0, common_1.Param)('profileId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)('verifications/:profileId/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Rejeter la vérification d\'identité d\'un freelance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Identité rejetée.' }),
    __param(0, (0, common_1.Param)('profileId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('rejectionReason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "reject", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map