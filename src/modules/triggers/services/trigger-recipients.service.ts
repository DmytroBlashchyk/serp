import { Injectable, NotFoundException } from '@nestjs/common';
import { TriggerRecipientRepository } from 'modules/triggers/repositories/trigger-recipient.repository';
import { IdType } from 'modules/common/types/id-type.type';
import { SubscriptionChangeRequest } from 'modules/triggers/requests/subscription-change.request';

@Injectable()
export class TriggerRecipientsService {
  constructor(
    private readonly triggerRecipientRepository: TriggerRecipientRepository,
  ) {}

  /**
   * Handles subscription changes for a given recipient based on the payload received.
   *
   * @param {SubscriptionChangeRequest} payload - The payload containing subscription change request details, including the recipient and whether to suppress sending notifications.
   * @return {Promise<void>} A promise that resolves when the subscription changes have been processed and saved.
   */
  async subscriptionChange(payload: SubscriptionChangeRequest): Promise<void> {
    const subscribes =
      await this.triggerRecipientRepository.getAllSubscriptionsByEmail(
        payload.Recipient,
      );
    if (subscribes.length > 0) {
      if (payload.SuppressSending) {
        await this.triggerRecipientRepository.save(
          subscribes.map((item) => {
            return {
              ...item,
              subscribed: false,
            };
          }),
        );
      } else {
        await this.triggerRecipientRepository.save(
          subscribes.map((item) => {
            return {
              ...item,
              subscribed: true,
            };
          }),
        );
      }
    }
  }

  /**
   * Unsubscribes a user from receiving alerts.
   *
   * @param {IdType} triggerRecipientId - The unique identifier of the user to unsubscribe.
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   * @throws {NotFoundException} If the user's subscription to notifications is not found.
   */
  async unsubscribe(triggerRecipientId: IdType): Promise<void> {
    const subscribe =
      await this.triggerRecipientRepository.getUserSubscriptionToAlerts(
        triggerRecipientId,
      );
    if (!subscribe || !subscribe.subscribed) {
      throw new NotFoundException(
        'User subscription to notifications not found',
      );
    }
    await this.triggerRecipientRepository.save({
      ...subscribe,
      subscribed: false,
    });
  }
}
