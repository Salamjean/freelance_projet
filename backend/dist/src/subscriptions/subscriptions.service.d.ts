import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class SubscriptionsService {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
    createWaveCheckout(userId: number, amount?: number): Promise<{
        waveCheckoutUrl: any;
        sessionId: any;
    }>;
    handleWaveWebhook(payload: any, signature: string): Promise<{
        received: boolean;
    }>;
}
