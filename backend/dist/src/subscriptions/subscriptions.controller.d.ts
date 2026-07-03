import { SubscriptionsService } from './subscriptions.service';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    createCheckout(req: any): Promise<{
        success: boolean;
        url: any;
    }>;
    handleSuccess(req: any, res: any): any;
    handleError(req: any, res: any): any;
    handleWaveWebhook(payload: any, signature: string): Promise<{
        received: boolean;
    }>;
}
