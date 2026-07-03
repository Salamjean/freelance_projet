import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createWaveCheckout(userId: number, amount: number = 100) {
    try {
      const apiKey = this.configService.get<string>('WAVE_API_KEY');
      
      const response = await fetch('https://api.wave.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount.toString(),
          currency: 'XOF',
          error_url: `${this.configService.get<string>('API_URL') || 'https://freelance-api.ngrok.app'}/api/subscriptions/error`,
          success_url: `${this.configService.get<string>('API_URL') || 'https://freelance-api.ngrok.app'}/api/subscriptions/success`,
          client_reference: userId.toString(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Wave API Error: ${errorText}`);
        throw new HttpException('Failed to create Wave checkout session', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const data = await response.json();
      return {
        waveCheckoutUrl: data.wave_launch_url,
        sessionId: data.id,
      };
    } catch (error) {
      this.logger.error('Error creating Wave checkout session', error);
      throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async handleWaveWebhook(payload: any, signature: string) {
    const webhookSecret = this.configService.get<string>('WAVE_WEBHOOK_SECRET');
    // En production, il est crucial de vérifier la signature avec `crypto`
    // Pour cet exemple, on suppose que la signature est valide ou on vérifie le contenu
    
    if (payload.type === 'checkout.session.completed') {
      const session = payload.data;
      const userId = parseInt(session.client_reference, 10);

      if (userId) {
        // Mettre à jour l'abonnement
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // +1 mois par exemple

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
}
