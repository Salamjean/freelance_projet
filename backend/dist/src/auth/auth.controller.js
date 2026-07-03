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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const swagger_1 = require("@nestjs/swagger");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async getProfile(userId) {
        return this.authService.getProfile(userId);
    }
    async updateProfile(userId, dto) {
        return this.authService.updateProfile(userId, dto);
    }
    async verifyIdentity(userId, dto) {
        return this.authService.submitVerification(userId, dto);
    }
    async addExperience(userId, dto) {
        return this.authService.addExperience(userId, dto);
    }
    async deleteExperience(userId, id) {
        return this.authService.deleteExperience(userId, id);
    }
    async addEducation(userId, dto) {
        return this.authService.addEducation(userId, dto);
    }
    async deleteEducation(userId, id) {
        return this.authService.deleteEducation(userId, id);
    }
    async addCertificate(userId, dto) {
        return this.authService.addCertificate(userId, dto);
    }
    async deleteCertificate(userId, id) {
        return this.authService.deleteCertificate(userId, id);
    }
    async addPortfolio(userId, dto) {
        return this.authService.addPortfolio(userId, dto);
    }
    async deletePortfolio(userId, id) {
        return this.authService.deletePortfolio(userId, id);
    }
    async register(dto) {
        return this.authService.register(dto);
    }
    async login(dto, req, userAgent) {
        const ipAddress = req.ip || req.socket.remoteAddress;
        return this.authService.login(dto, userAgent, ipAddress);
    }
    async refresh(refreshToken, req, userAgent) {
        if (!refreshToken) {
            throw new common_1.BadRequestException('Refresh token manquant');
        }
        const ipAddress = req.ip || req.socket.remoteAddress;
        return this.authService.refresh(refreshToken, userAgent, ipAddress);
    }
    async logout(refreshToken) {
        if (!refreshToken) {
            throw new common_1.BadRequestException('Refresh token manquant');
        }
        return this.authService.logout(refreshToken);
    }
    async getNotifications(userId) {
        return this.authService.getNotifications(userId);
    }
    async markNotificationAsRead(notificationId) {
        return this.authService.markNotificationAsRead(notificationId);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir le profil complet d\'un utilisateur par son ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profil récupéré avec succès.' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('profile/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour le profil d\'un utilisateur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profil mis à jour avec succès.' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('profile/:userId/verify-identity'),
    (0, swagger_1.ApiOperation)({ summary: 'Soumettre une demande de vérification d\'identité' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Demande soumise avec succès.' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyIdentity", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('profile/:userId/experience'),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter une expérience' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "addExperience", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('profile/:userId/experience/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une expérience' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deleteExperience", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('profile/:userId/education'),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter une éducation' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "addEducation", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('profile/:userId/education/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une éducation' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deleteEducation", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('profile/:userId/certificate'),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter un certificat' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "addCertificate", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('profile/:userId/certificate/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un certificat' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deleteCertificate", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('profile/:userId/portfolio'),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter un élément au portfolio' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "addPortfolio", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('profile/:userId/portfolio/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un élément du portfolio' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deletePortfolio", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un compte client ou freelance' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Utilisateur créé avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données invalides ou e-mail déjà existant.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Connexion de l\'utilisateur et retour des tokens' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Connexion réussie.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Identifiants invalides.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Renouveler l\'access token à partir du refresh token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tokens rafraîchis avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Session expirée ou invalide.' }),
    __param(0, (0, common_1.Body)('refreshToken')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiOperation)({ summary: 'Déconnecter l\'utilisateur et invalider son refresh token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Déconnexion réussie.' }),
    __param(0, (0, common_1.Body)('refreshToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile/:userId/notifications'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les notifications de l\'utilisateur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notifications récupérées avec succès.' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('notifications/:notificationId/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Marquer une notification comme lue' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification marquée comme lue avec succès.' }),
    __param(0, (0, common_1.Param)('notificationId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "markNotificationAsRead", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map