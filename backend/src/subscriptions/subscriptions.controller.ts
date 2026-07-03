import { Controller, Post, Body, Req, Res, Get, UseGuards, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckout(@Req() req: any) {
    // req.user from JWT payload
    const userId = req.user.id;
    const checkoutData = await this.subscriptionsService.createWaveCheckout(userId);
    return {
      success: true,
      url: checkoutData.waveCheckoutUrl,
    };
  }

  @Get('success')
  handleSuccess(@Req() req: any, @Res() res: any) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/dashboard/subscription?status=success`);
  }

  @Get('error')
  handleError(@Req() req: any, @Res() res: any) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/dashboard/subscription?status=error`);
  }

  @Post('webhook/wave')
  @HttpCode(HttpStatus.OK)
  async handleWaveWebhook(
    @Body() payload: any,
    @Headers('wave-signature') signature: string,
  ) {
    // Le webhook de Wave appellera cette route
    await this.subscriptionsService.handleWaveWebhook(payload, signature);
    return { received: true };
  }
}
