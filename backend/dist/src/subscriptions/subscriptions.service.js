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
var SubscriptionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
let SubscriptionsService = SubscriptionsService_1 = class SubscriptionsService {
    prisma;
    configService;
    logger = new common_1.Logger(SubscriptionsService_1.name);
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async createWaveCheckout(userId, amount = 100) {
        try {
            const apiKey = this.configService.get('WAVE_API_KEY');
            const response = await fetch('https://api.wave.com/v1/checkout/sessions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount.toString(),
                    currency: 'XOF',
                    error_url: `${this.configService.get('API_URL') || 'https://freelance-api.ngrok.app'}/api/subscriptions/error`,
                    success_url: `${this.configService.get('API_URL') || 'https://freelance-api.ngrok.app'}/api/subscriptions/success`,
                    client_reference: userId.toString(),
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Wave API Error: ${errorText}`);
                throw new common_1.HttpException('Failed to create Wave checkout session', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            const data = await response.json();
            return {
                waveCheckoutUrl: data.wave_launch_url,
                sessionId: data.id,
            };
        }
        catch (error) {
            this.logger.error('Error creating Wave checkout session', error);
            throw new common_1.HttpException(error.message || 'Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async handleWaveWebhook(payload, signature) {
        const webhookSecret = this.configService.get('WAVE_WEBHOOK_SECRET');
        if (payload.type === 'checkout.session.completed') {
            const session = payload.data;
            const userId = parseInt(session.client_reference, 10);
            if (userId) {
                const endDate = new Date();
                endDate.setMonth(endDate.getMonth() + 1);
                await this.prisma.subscription.upsert({
                    where: { userId },
                    update: {
                        status: 'ACTIVE',
                        waveTransactionId: session.id,
                        startDate: new Date(),
                        endDate: endDate,
                    },
                    create: {
                        userId: userId,
                        status: 'ACTIVE',
                        waveTransactionId: session.id,
                        startDate: new Date(),
                        endDate: endDate,
                        plan: 'PREMIUM',
                    },
                });
                this.logger.log(`Subscription activated for user ${userId}`);
            }
        }
        return { received: true };
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = SubscriptionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map