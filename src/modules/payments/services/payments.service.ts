import { Injectable } from '@nestjs/common';
import { PaddleService } from 'modules/payments/services/paddle.service';
import { HandlePaddleWebhookType } from 'modules/fastify/types/handle-paddle-webhook.type';
import { EventTypeEnum } from 'modules/payments/enums/event-type.enum';
import { EventBus } from '@nestjs/cqrs';
import { SubscriptionActivationEvent } from 'modules/payments/events/subscription-activation.event';
import { TransactionUpdatedEvent } from 'modules/payments/events/transaction-updated.event';
import { TransactionCreatedEvent } from 'modules/payments/events/transaction-created.event';
import { TransactionReadyEvent } from 'modules/payments/events/transaction-ready.event';
import { TransactionCompletedEvent } from 'modules/payments/events/transaction-completed.event';
import { TransactionPaymentFailedEvent } from 'modules/payments/events/transaction-payment-failed.event';
import { SubscriptionUpdatedEvent } from 'modules/payments/events/subscription-updated.event';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { SubscriptionCanceledEvent } from 'modules/payments/events/subscription-canceled.event';
import { CryptoUtilsService } from 'modules/common/services/crypto-utils.service';
import { CheckoutSettingsResponse } from 'modules/payments/responses/checkout-settings.response';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paddleService: PaddleService,
    private readonly eventBus: EventBus,
    private readonly configService: ConfigService,
    private readonly cryptoUtilsService: CryptoUtilsService,
    private readonly cliLoggingService: CliLoggingService,
  ) {}

  /**
   * Retrieves the checkout settings necessary for the payment process.
   *
   * @return {Promise<CheckoutSettingsResponse>} A promise that resolves to an instance of CheckoutSettingsResponse containing encrypted checkout settings data.
   */
  async getCheckoutSettings(): Promise<CheckoutSettingsResponse> {
    try {
      const data = {
        sellerId: this.configService.get(ConfigEnvEnum.PADDLE_SELLER_ID),
        token: this.configService.get(ConfigEnvEnum.PADDLE_TOKEN),
        environment: this.configService.get(ConfigEnvEnum.PADDLE_ENVIRONMENT),
        paymentMethods: await this.paddleService.settings(),
        showAddDiscounts: this.configService.get(
          ConfigEnvEnum.SHOW_ADD_DISCOUNTS,
        ),
      };
      return new CheckoutSettingsResponse({
        data: this.cryptoUtilsService.encryptData(JSON.stringify(data)),
      });
    } catch (error) {
      this.cliLoggingService.error('getCheckoutSettings', error);
    }
  }

  /**
   * Handles incoming Paddle webhook notifications, verifying the signature and
   * dispatching events based on the event type.
   *
   * @param {HandlePaddleWebhookType} payload - The payload of the webhook
   * notification, containing event type, data, and notification ID.
   * @return {Promise<void>} - A promise that resolves when the webhook handling is complete.
   */
  async handlePaddleWebhook(payload: HandlePaddleWebhookType): Promise<void> {
    if (
      payload.data?.custom_data?.environment !==
      this.configService.get(ConfigEnvEnum.ENVIRONMENT)
    ) {
      return;
    } else {
      await this.paddleService.verifyWebhookSignature(payload.notification_id);
      switch (payload.event_type) {
        case EventTypeEnum['transaction.created']:
          if (payload.data?.custom_data?.id) {
            this.eventBus.publish(
              new TransactionCreatedEvent({
                accountId: payload.data.custom_data.id,
                transactionId: payload.data.id,
              }),
            );
          }

          break;
        case EventTypeEnum['transaction.updated']:
          this.eventBus.publish(
            new TransactionUpdatedEvent({
              transactionId: payload.data.id,
            }),
          );
          break;
        case EventTypeEnum['transaction.ready']:
          this.eventBus.publish(
            new TransactionReadyEvent({ transactionId: payload.data.id }),
          );
          break;
        case EventTypeEnum['transaction.paid']:
          break;
        case EventTypeEnum['transaction.completed']:
          break;
        case EventTypeEnum['subscription.created']:
          break;
        case EventTypeEnum['subscription.activated']:
          this.eventBus.publish(
            new SubscriptionActivationEvent({
              accountId: payload.data.custom_data.id,
              subscriptionId: payload.data.id,
              customerId: payload.data.customer_id,
            }),
          );
          break;
        case EventTypeEnum['transaction.payment_failed']:
          this.eventBus.publish(
            new TransactionPaymentFailedEvent({
              transactionId: payload.data.id,
            }),
          );
          break;
        case EventTypeEnum['subscription.updated']:
          this.eventBus.publish(
            new SubscriptionUpdatedEvent({ subscriptionId: payload.data.id }),
          );

          break;
        case EventTypeEnum['subscription.canceled']:
          this.eventBus.publish(
            new SubscriptionCanceledEvent({ subscriptionId: payload.data.id }),
          );
          break;
        case EventTypeEnum['transaction.billed']:
          break;
        case EventTypeEnum['subscription.past_due']:
          break;
        case EventTypeEnum['transaction.past_due']:
          break;
        default:
          break;
      }
    }
  }
}
