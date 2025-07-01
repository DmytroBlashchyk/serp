import { Controller, Post, Body, Get } from '@nestjs/common';
import { PaymentsService } from 'modules/payments/services/payments.service';
import { CheckoutSettingsResponse } from 'modules/payments/responses/checkout-settings.response';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}
  /**
   * Handles payment processing by receiving and managing data from Paddle webhook.
   *
   * @param {any} body - The request body containing Paddle webhook data.
   * @return {Promise<void>} A promise that resolves when the webhook handling is complete.
   */
  @Post('')
  async payments(@Body() body: any): Promise<void> {
    return this.paymentsService.handlePaddleWebhook(body);
  }

  /**
   * Retrieves the checkout settings.
   *
   * @return {Promise<CheckoutSettingsResponse>} A promise that resolves with the checkout settings.
   */
  @Get('checkout-settings')
  checkoutSettings(): Promise<CheckoutSettingsResponse> {
    return this.paymentsService.getCheckoutSettings();
  }
}
