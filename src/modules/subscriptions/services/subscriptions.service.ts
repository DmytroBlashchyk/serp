import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';
import { SubscriptionRepository } from 'modules/subscriptions/repositories/subscription.repository';
import { BillingResponseFactory } from 'modules/subscriptions/factories/billing-response.factory';
import { BillingResponse } from 'modules/subscriptions/responses/billing.response';
import { UnsubscriptionType } from 'modules/subscriptions/types/unsubscription.type';
import { SubscriptionStatusRepository } from 'modules/subscriptions/repositories/subscription-status.repository';
import { SubscriptionStatusesEnum } from 'modules/subscriptions/enums/subscription-statuses.enum';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { RestoreACanceledSubscriptionType } from 'modules/subscriptions/types/restore-a-canceled-subscription.type';
import { UpdateReviewType } from 'modules/subscriptions/types/update-review.type';
import { TariffPlansService } from 'modules/subscriptions/services/tariff-plans.service';
import { UpdateReviewResponseFactory } from 'modules/subscriptions/factories/update-review-response.factory';
import { UpdateSubscriptionType } from 'modules/subscriptions/types/update-subscription.type';
import { EventBus } from '@nestjs/cqrs';
import { CreateTrialEndReminderEvent } from 'modules/mailing/events/create-trial-end-reminder.event';
import { NotifyTrialEndEvent } from 'modules/mailing/events/notify-trial-end.event';
import { PaddleService } from 'modules/payments/services/paddle.service';
import { TariffPlansEnum } from 'modules/subscriptions/enums/tariff-plans.enum';
import { AccountRepository } from 'modules/accounts/repositories/account.repository';
import { UpdateReviewResponse } from 'modules/subscriptions/responses/update-review.response';
import { UpdatePaymentMethodResponse } from 'modules/subscriptions/responses/update-payment-method.response';
import { UnsubscriptionEvent } from 'modules/subscriptions/events/unsubscription.event';
import { SubscriptionDeactivationEvent } from 'modules/subscriptions/events/subscription-deactivation.event';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly billingResponseFactory: BillingResponseFactory,
    private readonly subscriptionStatusRepository: SubscriptionStatusRepository,
    private readonly tariffPlansService: TariffPlansService,
    private readonly updateReviewResponseFactory: UpdateReviewResponseFactory,
    private readonly eventBus: EventBus,
    private readonly paddleService: PaddleService,
    private readonly accountRepository: AccountRepository,
  ) {}

  /**
   * Deactivates all expired subscriptions by updating their status to 'deactivated'.
   *
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  async deactivateExpiredSubscriptions(): Promise<void> {
    const subscriptions =
      await this.subscriptionRepository.getExpiredSubscriptions();
    if (subscriptions.length > 0) {
      const status =
        await this.subscriptionStatusRepository.getSubscriptionStatusByName(
          SubscriptionStatusesEnum.deactivated,
        );
      await this.subscriptionRepository.save(
        subscriptions.map((subscription) => {
          return { id: subscription.id, status };
        }),
      );
    }
  }

  /**
   * Updates the payment method for the given account.
   *
   * @param {IdType} accountId - The identifier of the account to update the payment method for.
   * @return {Promise<UpdatePaymentMethodResponse>} A promise that resolves to the response containing the transaction id of the updated payment method.
   */
  async updatePaymentMethod(
    accountId: IdType,
  ): Promise<UpdatePaymentMethodResponse> {
    const account = await this.accountRepository.getAccountWithSubscription(
      accountId,
    );
    if (!account) {
      throw new NotFoundException('Subscription account not found.');
    }
    const transaction =
      await this.paddleService.getPaymentMethodChangeTransaction(
        account.subscription.subscriptionId,
      );
    return new UpdatePaymentMethodResponse({ id: transaction.id });
  }

  /**
   * Checks if the trial period for subscriptions has expired and performs necessary actions.
   *
   * This method retrieves account owners whose trial subscription has expired
   * and publishes events to notify users and deactivate subscriptions.
   *
   * @return {Promise<void>} A promise that resolves when the process is complete.
   */
  async checkThatTrialPeriodIsOver(): Promise<void> {
    const owners =
      await this.subscriptionRepository.getAccountOwnersWhoseTrialSubscriptionHasExpired();
    if (owners.length === 0) {
      return;
    }
    await this.eventBus.publish(
      new NotifyTrialEndEvent({
        users: owners,
      }),
    );

    await this.eventBus.publish(
      new SubscriptionDeactivationEvent({
        subscriptionIds: owners.map((owner) => owner.subscriptions_id),
      }),
    );
  }

  /**
   * Checks if any account owners' trial subscriptions are approaching their end,
   * and if so, publishes an event to create a reminder for the trial end.
   *
   * @return {Promise<void>} A promise that resolves when the process is complete.
   */
  async checkThatTrialPeriodIsComingToAnEnd(): Promise<void> {
    const owners =
      await this.subscriptionRepository.getAnAccountOwnersWhoseTrialSubscriptionIsExpiring();
    if (owners.length === 0) {
      return;
    }
    await this.eventBus.publish(
      new CreateTrialEndReminderEvent({
        users: owners,
      }),
    );
  }

  /**
   * Updates the subscription of an account.
   *
   * @param {UpdateSubscriptionType} payload - The subscription update details, including accountId and paddleProductId.
   * @return {Promise<void>} A promise that resolves when the subscription update is complete.
   * @throws {NotFoundException} Thrown if the account with the specified subscription is not found.
   * @throws {BadRequestException} Thrown if attempting to upgrade to the current plan.
   */
  @Transactional()
  async updateSubscription(payload: UpdateSubscriptionType): Promise<void> {
    const account = await this.accountRepository.getAccountWithSubscription(
      payload.accountId,
    );
    if (!account) {
      throw new NotFoundException('Subscription account not found.');
    }
    const tariffPlanSetting = await this.tariffPlansService.getTariffPlan(
      payload.paddleProductId,
    );
    if (account.subscription.tariffPlanSetting.id === tariffPlanSetting.id) {
      throw new BadRequestException(
        'Upgrade to the current plan is prohibited',
      );
    }

    await this.paddleService.subscriptionUpdate(
      account.subscription.subscriptionId,
      payload.paddleProductId,
    );
  }

  /**
   * Updates the review details associated with an account's subscription.
   * Throws NotFoundException if the subscription account is not found.
   * Throws BadRequestException for invalid product id, if account is already on the current plan,
   * or if the account subscription is canceled or deactivated.
   *
   * @param {UpdateReviewType} payload - The data required to update the review, including accountId and paddleProductId.
   *
   * @return {Promise<UpdateReviewResponse|void>} A promise that resolves to an UpdateReviewResponse object if the update is successful,
   * or void if the account is on a trial period. Throws an exception if there are errors.
   */
  async updateReview(
    payload: UpdateReviewType,
  ): Promise<UpdateReviewResponse | void> {
    const account = await this.accountRepository.getAccountWithSubscription(
      payload.accountId,
    );
    if (!account) {
      throw new NotFoundException('Subscription account not found.');
    }
    const tariffPlanSetting = await this.tariffPlansService.getTariffPlan(
      payload.paddleProductId,
    );
    if (!tariffPlanSetting) {
      throw new BadRequestException('Product id is not valid.');
    }
    if (
      account.subscription.tariffPlanSetting.tariffPlan.name ===
      TariffPlansEnum.TrialPeriod
    ) {
      return;
    } else {
      if (account.subscription.tariffPlanSetting.id === tariffPlanSetting.id) {
        throw new BadRequestException(
          'Upgrade to the current plan is prohibited',
        );
      }
      if (
        account.subscription.status.name === SubscriptionStatusesEnum.canceled
      ) {
        throw new BadRequestException('Account subscription canceled.');
      }

      if (
        account.subscription.status.name ===
        SubscriptionStatusesEnum.deactivated
      ) {
        throw new BadRequestException('Account subscription deactivated.');
      }
      const result = await this.paddleService.subscriptionPreviewUpdate(
        account.subscription.subscriptionId,
        tariffPlanSetting.paddleProductId,
      );
      return this.updateReviewResponseFactory.createResponse(result, {
        account,
        tariffPlanSetting,
      });
    }
  }

  /**
   * Restores a canceled subscription for an account if applicable.
   *
   * @param {RestoreACanceledSubscriptionType} payload - The payload containing the account ID and other related information.
   * @return {Promise<void>} - A promise that resolves with no value if the operation is successful.
   * @throws {NotFoundException} If the account or the canceled subscription is not found.
   */
  @Transactional()
  async restoreACanceledSubscription(
    payload: RestoreACanceledSubscriptionType,
  ): Promise<void> {
    const account = await this.accountRepository.getAccountWithSubscription(
      payload.accountId,
    );
    if (!account) {
      throw new NotFoundException('Subscription account not found.');
    }
    if (
      account.subscription.status.name !== SubscriptionStatusesEnum.canceled
    ) {
      throw new NotFoundException('No canceled subscriptions found.');
    }
    const result = await this.paddleService.reinstatementOfCanceledSubscription(
      account.subscription.subscriptionId,
    );
    const status =
      await this.subscriptionStatusRepository.getSubscriptionStatusByName(
        SubscriptionStatusesEnum.updated,
      );
    await this.subscriptionRepository.save({
      ...account.subscription,
      subscriptionId: result.id,
      status,
    });
    if (account.deletedAt !== null) {
      await this.accountRepository.save({ id: account.id, deletedAt: null });
    }
  }

  /**
   * Handles the unsubscription process by publishing an unsubscription event.
   *
   * @param {UnsubscriptionType} payload - The data required to process the unsubscription.
   * @return {Promise<void>} Resolves when the event has been successfully published.
   */
  @Transactional()
  async unsubscription(payload: UnsubscriptionType): Promise<void> {
    await this.eventBus.publish(new UnsubscriptionEvent({ ...payload }));
  }

  /**
   * Processes the billing for the given account.
   *
   * @param {IdType} accountId - The unique identifier of the account for which billing needs to be processed.
   * @return {Promise<BillingResponse>} A promise that resolves to the billing response containing details about the account's subscription or null if the account does not exist.
   */
  async billing(accountId: IdType): Promise<BillingResponse> {
    const account = await this.accountRepository.getAccountWithSubscription(
      accountId,
    );

    if (!account) {
      return null;
    }

    return this.billingResponseFactory.createResponse(account.subscription, {
      ownerEmail: account.owner.email,
      accountId: account.id,
    });
  }
}
