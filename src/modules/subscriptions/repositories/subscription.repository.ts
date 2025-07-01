import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { SubscriptionEntity } from 'modules/subscriptions/entities/subscription.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { AccountOwnerType } from 'modules/accounts/types/account-owner.type';
import { TariffPlansEnum } from 'modules/subscriptions/enums/tariff-plans.enum';
import { SubscriptionStatusesEnum } from 'modules/subscriptions/enums/subscription-statuses.enum';
import { IdType } from 'modules/common/types/id-type.type';

@Injectable()
@EntityRepository(SubscriptionEntity)
export class SubscriptionRepository extends BaseRepository<SubscriptionEntity> {
  /**
   * Retrieves a list of expired subscriptions.
   * An expired subscription is determined by comparing the subscription's status_update_date with the current date
   * and checking that the status is not 'deactivated'.
   *
   * @return {Promise<{ id: IdType }[]>} A promise that resolves to an array of objects, each containing the id of an expired subscription.
   */
  async getExpiredSubscriptions(): Promise<{ id: IdType }[]> {
    return this.query(`
select subscriptions.id as id from subscriptions
left join subscription_statuses on subscriptions.status_id = subscription_statuses.id
where status_update_date < now() and subscription_statuses.name not in('${SubscriptionStatusesEnum.deactivated}')`);
  }
  /**
   * Fetches a list of account owners whose trial subscriptions have expired.
   *
   * @return {Promise<AccountOwnerType[]>} A promise that resolves to an array of account owners whose trial subscriptions have expired.
   */
  async getAccountOwnersWhoseTrialSubscriptionHasExpired(): Promise<
    AccountOwnerType[]
  > {
    return this.query(
      `
SELECT users.email, users.username, users.first_name, subscriptions.id as subscriptions_id
FROM subscriptions
LEFT JOIN tariff_plan_settings ON subscriptions.tariff_plan_setting_id = tariff_plan_settings.id
LEFT JOIN tariff_plans ON tariff_plan_settings.tariff_plan_id = tariff_plans.id
LEFT JOIN accounts on subscriptions.id = accounts.subscription_id
LEFT JOIN users on accounts.owner_id = users.id
WHERE
    tariff_plans.name = $1
    AND EXTRACT(HOUR FROM subscriptions.status_update_date AT TIME ZONE 'UTC') = EXTRACT(HOUR FROM NOW() AT TIME ZONE 'UTC')
    AND EXTRACT(MINUTE FROM subscriptions.status_update_date AT TIME ZONE 'UTC') = EXTRACT(MINUTE FROM NOW() AT TIME ZONE 'UTC')
    AND DATE(subscriptions.status_update_date AT TIME ZONE 'UTC') = DATE(NOW() AT TIME ZONE 'UTC')
    `,
      [TariffPlansEnum.TrialPeriod],
    );
  }
  /**
   * Fetches a list of account owners whose trial subscription is expiring within the next two days.
   *
   * @return {Promise<AccountOwnerType[]>} A promise that resolves to an array of account owner details, including first name and email, whose trial subscription is expiring.
   */
  async getAnAccountOwnersWhoseTrialSubscriptionIsExpiring(): Promise<
    AccountOwnerType[]
  > {
    return this.query(
      `
SELECT users.first_name, users.email
FROM subscriptions
LEFT JOIN tariff_plan_settings ON subscriptions.tariff_plan_setting_id = tariff_plan_settings.id
LEFT JOIN tariff_plans ON tariff_plan_settings.tariff_plan_id = tariff_plans.id
LEFT JOIN accounts on subscriptions.id = accounts.subscription_id
LEFT JOIN users on accounts.owner_id = users.id
WHERE
    tariff_plans.name = $1
    AND EXTRACT(HOUR FROM DATE_ADD(subscriptions.status_update_date, INTERVAL '-2 DAY') AT TIME ZONE 'UTC') = EXTRACT(HOUR FROM NOW() AT TIME ZONE 'UTC')
    AND EXTRACT(MINUTE FROM DATE_ADD(subscriptions.status_update_date, INTERVAL '-2 DAY') AT TIME ZONE 'UTC') = EXTRACT(MINUTE FROM NOW() AT TIME ZONE 'UTC')
    AND DATE(DATE_ADD(subscriptions.status_update_date, INTERVAL '-2 DAY') AT TIME ZONE 'UTC') = DATE(NOW() AT TIME ZONE 'UTC')
    `,
      [TariffPlansEnum.TrialPeriod],
    );
  }

  /**
   * Retrieves a subscription entity based on the given subscription ID.
   *
   * @param {string} subscriptionId - The unique identifier of the subscription.
   * @return {Promise<SubscriptionEntity>} - A promise that resolves to the subscription entity.
   */
  async getSubscriptionBySubscriptionId(
    subscriptionId: string,
  ): Promise<SubscriptionEntity> {
    return this.createQueryBuilder('subscriptions')
      .leftJoinAndSelect('subscriptions.tariffPlanSetting', 'tariffPlanSetting')
      .leftJoinAndSelect('tariffPlanSetting.tariffPlan', 'tariffPlan')
      .leftJoinAndSelect('subscriptions.status', 'status')
      .leftJoinAndSelect('subscriptions.card', 'card')
      .where('subscriptions.subscriptionId =:subscriptionId', {
        subscriptionId,
      })
      .getOne();
  }
}
