import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Customer,
  Notification,
  NotificationSettings,
  Paddle,
  SubscriptionPreview,
  Transaction,
  TransactionInvoicePDF,
} from '@paddle/paddle-node-sdk';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { UnsubscribeTypesEnum } from 'modules/payments/enums/unsubscribe-types.enum';
import { Subscription } from '@paddle/paddle-node-sdk/dist/types/entities';

@Injectable()
export class PaddleService {
  /**
   * A `Paddle` instance representing a paddle in a game, typically used to interact with a ball object.
   * Its properties track its position, dimensions, and movement within the game's graphical interface.
   */
  private readonly paddle: Paddle;

  /**
   * This variable indicates whether PayPal is available as a payment method.
   *
   * - `true`: PayPal can be used for the transaction.
   * - `false`: PayPal is not available for the transaction.
   *
   * This might be set based on user preferences, geographical availability, or other business rules.
   *
   * @type {boolean}
   */
  private readonly paypalPaymentMethod: boolean;
  /**
   * Indicates the payment method selected by the user in the Apple Pay interface.
   *
   * - `true`: The user has selected Apple Pay as the payment method.
   * - `false`: The user has not selected Apple Pay as the payment method.
   */
  private readonly applePayPaymentMethod: boolean;
  /**
   * Indicates whether Google Pay is selected as the payment method.
   *
   * This boolean variable is used to determine if the user has chosen
   * Google Pay for processing their payment. If true, Google Pay is
   * selected as the payment method; otherwise, it is not.
   */
  private readonly googlePayPaymentMethod: boolean;
  /**
   * Indicates whether the payment method is a card.
   *
   * A boolean value where `true` signifies that the payment method is a card
   * and `false` signifies that it is not.
   *
   * This variable is used in payment processing workflows to determine
   * the type of payment method being utilized.
   *
   * @type {boolean}
   */
  private readonly cardPaymentMethod: boolean;
  /**
   * Indicates if the payment method is considered ideal.
   *
   * This variable is a boolean that represents whether the selected
   * payment method is deemed preferred or suitable for the given
   * context or requirements.
   */
  private readonly idealPaymentMethod: boolean;
  /**
   * Represents the availability of the Bancontact payment method.
   *
   * This boolean variable indicates whether the Bancontact payment method
   * is enabled or disabled within the payment processing system.
   *
   * It is set to true if Bancontact is available, and false otherwise.
   */
  private readonly bancontactPaymentMethod: boolean;

  /**
   * Constructs an instance of the class, initializing various payment methods
   * and the Paddle SDK using configurations provided by the ConfigService.
   *
   * @param {ConfigService} configService - Service to access configuration settings.
   * @param {CliLoggingService} cliLoggingService - Service for CLI logging functionalities.
   * @return {void}
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly cliLoggingService: CliLoggingService,
  ) {
    this.paddle = new Paddle(
      this.configService.get(ConfigEnvEnum.PADDLE_TOKEN),
      { environment: this.configService.get(ConfigEnvEnum.PADDLE_ENVIRONMENT) },
    );
    this.paypalPaymentMethod = this.configService.get(
      ConfigEnvEnum.PAYPAL_PAYMENT_METHOD,
    );
    this.cardPaymentMethod = this.configService.get(
      ConfigEnvEnum.CARD_PAYMENT_METHOD,
    );
    this.idealPaymentMethod = this.configService.get(
      ConfigEnvEnum.IDEAL_PAYMENT_METHOD,
    );
    this.bancontactPaymentMethod = this.configService.get(
      ConfigEnvEnum.BANCONTACT_PAYMENT_METHOD,
    );
    this.googlePayPaymentMethod = this.configService.get(
      ConfigEnvEnum.GOOGLE_PAY_PAYMENT_METHOD,
    );
    this.applePayPaymentMethod = this.configService.get(
      ConfigEnvEnum.APPLE_PAY_PAYMENT_METHOD,
    );
  }

  /**
   * Updates the email address of an existing customer.
   *
   * @param {string} customerId - The unique identifier of the customer whose email is to be updated.
   * @param {string} email - The new email address for the customer.
   * @return {Promise<Customer>} A promise that resolves to the updated customer object.
   */
  async updateCustomerEmail(
    customerId: string,
    email: string,
  ): Promise<Customer> {
    try {
      const result = await this.paddle.customers.update(customerId, { email });
      return result;
    } catch (error) {
      this.cliLoggingService.error('Error: updateCustomerEmail', error);
    }
  }

  /**
   * Retrieves a list of enabled payment method names based on the current settings.
   *
   * @return {Promise<string[]>} A promise that resolves to an array of enabled payment method names.
   */
  async settings(): Promise<string[]> {
    const settings = [
      { methodName: 'paypal', enabled: this.paypalPaymentMethod },
      { methodName: 'card', enabled: this.cardPaymentMethod },
      { methodName: 'ideal', enabled: this.idealPaymentMethod },
      { methodName: 'bancontact', enabled: this.bancontactPaymentMethod },
      {
        methodName: 'google_pay',
        enabled: this.googlePayPaymentMethod,
      },
      {
        methodName: 'apple_pay',
        enabled: this.applePayPaymentMethod,
      },
    ];
    return settings
      .filter((setting) => setting.enabled === true)
      .map((item) => item.methodName);
  }

  /**
   * Retrieves the payment method change transaction for a given subscription.
   *
   * @param {string} subscriptionId - The unique identifier of the subscription.
   * @return {Promise<Transaction>} - A promise that resolves to the Transaction object representing the payment method change.
   */
  async getPaymentMethodChangeTransaction(
    subscriptionId: string,
  ): Promise<Transaction> {
    return this.paddle.subscriptions.getPaymentMethodChangeTransaction(
      subscriptionId,
    );
  }

  /**
   * Asynchronously retrieves the invoice PDF for a given transaction ID.
   *
   * @param {string} transactionId - The unique identifier of the transaction.
   * @return {Promise<TransactionInvoicePDF>} A promise that resolves to the transaction invoice PDF.
   * @throws {BadRequestException} If the invoice retrieval fails.
   */
  async getInvoice(transactionId: string): Promise<TransactionInvoicePDF> {
    try {
      const result = await this.paddle.transactions.getInvoicePDF(
        transactionId,
      );
      return result;
    } catch (errors) {
      throw new BadRequestException(errors.code);
    }
  }

  /**
   * Retrieves the details of a specific transaction using the transaction ID provided.
   *
   * @param {string} transactionId - The unique identifier of the transaction to retrieve.
   * @return {Promise<Transaction>} A promise that resolves to the details of the transaction.
   */
  async getTransaction(transactionId: string): Promise<Transaction> {
    return this.paddle.transactions.get(transactionId);
  }

  /**
   * Retrieves the details of an existing subscription by its ID.
   *
   * @param {string} subscriptionId - The unique identifier of the subscription to retrieve.
   * @return {Promise<Subscription>} A promise that resolves to the subscription details.
   */
  async getSubscription(subscriptionId: string): Promise<Subscription> {
    return this.paddle.subscriptions.get(subscriptionId);
  }

  /**
   * Reinstates a previously canceled subscription by removing its scheduled change.
   *
   * @param {string} subscriptionId - The unique identifier of the subscription to reinstate.
   * @return {Promise<Subscription>} A promise that resolves to the reinstated subscription object.
   */
  async reinstatementOfCanceledSubscription(
    subscriptionId: string,
  ): Promise<Subscription> {
    try {
      const result = await this.paddle.subscriptions.update(subscriptionId, {
        scheduledChange: null,
      });
      return result;
    } catch (error) {
      throw new BadRequestException(error.detail);
    }
  }

  /**
   * Unsubscribes from a subscription by cancelling it effective from the next billing period.
   *
   * @param {string} subscriptionId - The ID of the subscription to cancel.
   * @return {Promise<Subscription>} - A promise that resolves to the canceled subscription details.
   */
  async unsubscribe(subscriptionId: string): Promise<Subscription> {
    try {
      const result = await this.paddle.subscriptions.cancel(subscriptionId, {
        effectiveFrom: UnsubscribeTypesEnum.next_billing_period,
      });
      return result;
    } catch (error) {
      this.cliLoggingService.error('Error: unsubscribe', error);
    }
  }

  /**
   * Cancels the subscription immediately based on the given subscription ID.
   *
   * @param {string} subscriptionId - The unique identifier of the subscription to be canceled.
   * @return {Promise<Subscription>} A promise that resolves to the subscription object that has been canceled.
   */
  async unsubscribeNow(subscriptionId: string): Promise<Subscription> {
    return this.paddle.subscriptions.cancel(subscriptionId, {
      effectiveFrom: UnsubscribeTypesEnum.immediately,
    });
  }

  /**
   * Updates the subscription with the given subscription ID to the new price ID.
   *
   * @param {string} subscriptionId - The ID of the subscription to be updated.
   * @param {string} priceId - The new price ID to update the subscription to.
   * @return {Promise<Subscription>} - A promise that resolves to the updated subscription details.
   * @throws {BadRequestException} - Throws an exception if the update operation fails.
   */
  async subscriptionUpdate(
    subscriptionId: string,
    priceId: string,
  ): Promise<Subscription> {
    try {
      const result = await this.paddle.subscriptions.update(subscriptionId, {
        items: [{ priceId, quantity: 1 }],
        prorationBillingMode: 'prorated_immediately',
      });
      return result;
    } catch (errors) {
      throw new BadRequestException(errors.code);
    }
  }

  /**
   * Updates the subscription preview with a new price and returns the updated preview details.
   *
   * @param {string} subscriptionId - The ID of the subscription to be updated.
   * @param {string} priceId - The price ID to be applied to the subscription.
   * @return {Promise<SubscriptionPreview>} - A promise that resolves to the updated subscription preview.
   * @throws {BadRequestException} - Throws an exception if the update fails.
   */
  async subscriptionPreviewUpdate(
    subscriptionId: string,
    priceId: string,
  ): Promise<SubscriptionPreview> {
    try {
      const result = await this.paddle.subscriptions.previewUpdate(
        subscriptionId,
        {
          items: [{ priceId: priceId, quantity: 1 }],
          prorationBillingMode: 'prorated_immediately',
        },
      );
      return result;
    } catch (error) {
      throw new BadRequestException(error.detail);
    }
  }

  /**
   * Retrieves a notification by its unique identifier.
   *
   * @param {string} notification_id - The unique identifier of the notification to be retrieved.
   * @return {Promise<Notification>} A promise that resolves to a Notification object.
   * @throws {BadRequestException} If there is an error during the retrieval process.
   */
  async getNotification(notification_id: string): Promise<Notification> {
    try {
      const result = await this.paddle.notifications.get(notification_id);
      return result;
    } catch (error) {
      throw new BadRequestException(error.detail);
    }
  }

  /**
   * Retrieves the notification settings for a given notification setting ID.
   *
   * @param {string} notificationSettingId - The unique identifier for the notification setting.
   * @return {Promise<NotificationSettings>} A promise that resolves to the notification settings object.
   */
  async getNotificationSetting(
    notificationSettingId: string,
  ): Promise<NotificationSettings> {
    return this.paddle.notificationSettings.get(notificationSettingId);
  }

  /**
   * Retrieves customer information based on the provided customer ID.
   *
   * @param {string} customerId - The unique identifier of the customer.
   * @return {Promise<Customer>} A promise that resolves to the customer information.
   */
  async getCustomer(customerId: string): Promise<Customer> {
    return this.paddle.customers.get(customerId);
  }

  /**
   * Verifies the signature of a webhook notification.
   *
   * @param {string} notification_id - The ID of the notification to verify.
   * @return {Promise<void>} A promise that resolves if the verification is successful, otherwise throws an error.
   */
  async verifyWebhookSignature(notification_id: string): Promise<void> {
    const notification = await this.getNotification(notification_id);
    const notificationSetting = await this.getNotificationSetting(
      notification.notificationSettingId,
    );
    const secretKey =
      this.configService.get(ConfigEnvEnum.PADDLE_WEBHOOK_SECRET_KEY) || '';
    if (notificationSetting.endpointSecretKey !== secretKey) {
      throw new BadRequestException('Webhook validation failed');
    }
  }
}
