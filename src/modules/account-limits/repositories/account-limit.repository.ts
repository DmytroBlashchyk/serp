import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { AccountLimitEntity } from 'modules/account-limits/entities/account-limit.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';
import { LimitTypesEnum } from 'modules/account-limits/enums/limit-types.enum';
import { AllLimitsOfCurrentAccountType } from 'modules/accounts/types/all-limits-of-current-account.type';
import { SubscriptionStatusesEnum } from 'modules/subscriptions/enums/subscription-statuses.enum';
import { AccountType } from 'modules/account-limits/types/account-type';
import { DefaultTariffPlanLimitEntity } from 'modules/account-limits/entities/default-tariff-plan-limit.entity';

@Injectable()
@EntityRepository(AccountLimitEntity)
export class AccountLimitRepository extends BaseRepository<AccountLimitEntity> {
  /**
   * Updates the account limits for a given account with the specified tariff plan limits.
   *
   * @param {DefaultTariffPlanLimitEntity[]} tariffPlanLimits - An array of default tariff plan limit entities containing limit types and values.
   * @param {IdType} accountId - The unique identifier of the account to update limits for.
   * @return {Promise<void>} A promise that resolves when the limits have been successfully updated.
   */
  async updateAccountLimits(
    tariffPlanLimits: DefaultTariffPlanLimitEntity[],
    accountId: IdType,
  ) {
    await this.createQueryBuilder()
      .insert()
      .into('account_limits')
      .values(
        tariffPlanLimits.map((limit) => ({
          account: { id: accountId },
          accountLimitType: limit.limitType,
          limit: limit.limit,
        })),
      )
      .orIgnore()
      .execute();
  }

  /**
   * Removes account limits associated with the specified account ID.
   *
   * @param {IdType} accountId - The unique identifier of the account whose limits are to be removed.
   * @return {Promise<void>} - A promise that resolves when the operation is complete.
   */
  async removeAccountLimits(accountId: IdType): Promise<void> {
    await this.createQueryBuilder('account_limits')
      .leftJoin('account_limits.account', 'account')
      .where('account.id =:accountId', { accountId })
      .delete()
      .execute();
  }

  /**
   * Get the number of distinct shared links in a specified account.
   *
   * @param {IdType} accountId - The ID of the account to query for shared links.
   * @return {Promise<number>} - A promise that resolves to the count of unique shared links in the given account.
   */
  async getNumberOfSharedLinksInAccount(accountId: IdType): Promise<number> {
    const result = await this.query(
      `
select COUNT(DISTINCT shared_links.id)::FLOAT from shared_links
left join projects_shared_links on shared_links.id = projects_shared_links.shared_links_id
left join projects on projects_shared_links.projects_id = projects.id
where projects.account_id = $1`,
      [accountId],
    );
    return result[0].count ?? 0;
  }

  /**
   * Retrieves the total number of triggers associated with a specified account.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @return {Promise<number>} A promise that resolves to the count of triggers.
   */
  async getNumberOfAllTriggersInAccount(accountId: IdType): Promise<number> {
    const result = await this.query(
      `select COUNT(*)::FLOAT from triggers
left join projects on triggers.project_id = projects.id
where projects.account_id = $1`,
      [accountId],
    );
    return result[0].count ?? 0;
  }

  /**
   * Retrieves the number of all invitations associated with a specific account
   * that have not been accepted by any user.
   *
   * @param {IdType} accountId - The unique identifier of the account whose invitations are to be counted.
   * @return {Promise<number>} A promise that resolves to the count of all pending invitations for the specified account.
   */
  async getNumberOfAllInvitationsInAccount(accountId: IdType): Promise<number> {
    const result = await this.query(
      `
select COUNT(invitations.id)::FLOAT as invitation_count
from invitations
left join users on invitations.invitation_user = users.email
where invitations.account_id = $1 and users is null`,
      [accountId],
    );
    return result[0].invitation_count ?? 0;
  }

  /**
   * Retrieves the total number of users associated with a given account.
   *
   * @param {IdType} accountId - The unique identifier of the account to query.
   * @return {Promise<number>} A promise that resolves to the count of users in the specified account.
   */
  async getNumberOfAllUsersInAccount(accountId: IdType): Promise<number> {
    const result = await this.query(
      'select COUNT(*)::FLOAT from account_users where account_id = $1',
      [accountId],
    );
    return result[0].count ?? 0;
  }

  /**
   * Retrieves the count of all notes associated with a given account.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @return {Promise<number>} The total count of notes in the specified account.
   */
  async getACountOfAllNotesInAccount(accountId: IdType): Promise<number> {
    const result = await this.query(
      `select COUNT(*)::FLOAT from notes
left join projects on notes.project_id = projects.id
where projects.account_id = $1`,
      [accountId],
    );
    return result[0].count ?? 0;
  }

  /**
   * Retrieves the number of all competitors associated with a given account.
   *
   * @param {IdType} accountId - The ID of the account to query for competitors.
   * @return {Promise<number>} A promise that resolves to the count of competitors.
   */
  async getNumberOfAllCompetitorsInAccount(accountId: IdType): Promise<number> {
    const result = await this.query(
      `select COUNT(*)::FLOAT from competitors
left join projects on competitors.project_id = projects.id
where projects.account_id = $1`,
      [accountId],
    );
    return result[0].count ?? 0;
  }

  /**
   * Retrieves the total number of emails associated with a given account.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @return {Promise<number>} A promise that resolves to the number of emails in the account.
   */
  async getNumberOfAllEmailsInAccount(accountId: IdType): Promise<number> {
    const result = await this.query(
      `
select COUNT(*)::FLOAT from email_reports
left join projects on email_reports.project_id = projects.id
where projects.account_id = $1`,
      [accountId],
    );
    return result[0].count ?? 0;
  }

  /**
   * Retrieves the total number of keywords associated with a specific account.
   *
   * @param {IdType} accountId - The ID of the account for which to count the keywords.
   * @return {Promise<number>} A promise that resolves to the number of keywords.
   */
  async getNumberOfAllKeywordsInAccount(accountId: IdType): Promise<number> {
    const result = await this.query(
      `select COUNT(keywords.id)::FLOAT from keywords
left join projects on keywords.project_id = projects.id
where projects.account_id = $1`,
      [accountId],
    );
    return result[0].count ?? 0;
  }

  /**
   * Updates the number of daily email alerts sent for each account based on the current tariff plan settings and subscription statuses.
   *
   * This method executes a SQL query to update the `account_limits` table with the appropriate limit values derived from the default tariff plan limits.
   * It considers only active subscriptions and evaluates accounts whose subscription status update date is within the current timeframe.
   *
   * @return {Promise<void>} A promise that resolves when the update operation is complete.
   */
  async updatingNumberOfDailyEmailAlertsSent() {
    await this.query(`
UPDATE account_limits AS al
SET "limit" = sub_query.limit
FROM (
    SELECT accounts.id as account_id,
           default_result."limit" as limit,
           default_result.id as limit_type_id
    FROM tariff_plan_settings
    LEFT JOIN tariff_plans ON tariff_plan_settings.tariff_plan_id = tariff_plans.id
    INNER JOIN subscriptions ON tariff_plan_settings.id = subscriptions.tariff_plan_setting_id
    INNER JOIN subscription_statuses on subscriptions.status_id = subscription_statuses.id
    INNER JOIN accounts on subscriptions.id = accounts.subscription_id
    LEFT JOIN (
        SELECT default_tariff_plan_limits."limit", default_tariff_plan_limits.tariff_plan_id, limit_types.id, limit_types.name as limit_types_name
        FROM default_tariff_plan_limits
        LEFT JOIN limit_types ON default_tariff_plan_limits.limit_type_id = limit_types.id
    ) AS default_result ON tariff_plans.id = default_result.tariff_plan_id
        AND default_result.limit_types_name = '${LimitTypesEnum.NumberOfDailyAlertsSentByEmail}'
    AND subscriptions.status_update_date > NOW() AND subscription_statuses.name not in ('${SubscriptionStatusesEnum.deactivated}')
) AS sub_query
WHERE al.account_id = sub_query.account_id
AND al.account_limit_type_id = sub_query.limit_type_id
`);
  }

  /**
   * Resets the limits of deactivated subscriptions by setting them to zero.
   *
   * This method executes a SQL query to update the `account_limits` table. It joins several tables
   * (`account_limits`, `accounts`, `subscriptions`, and `subscription_statuses`) to find accounts
   * associated with deactivated subscriptions and sets their limits to zero.
   *
   * @return {Promise<void>} A promise that resolves when the limits have been reset.
   */
  async resetDeactivatedSubscriptionLimits(): Promise<void> {
    await this.query(`
UPDATE account_limits AS al
SET "limit" = 0
FROM (
select account_limits.id from account_limits
left join accounts on account_limits.account_id = accounts.id
left join subscriptions on accounts.subscription_id = subscriptions.id
left join subscription_statuses on subscriptions.status_id = subscription_statuses.id
where subscription_statuses.name = '${SubscriptionStatusesEnum.deactivated}'
) AS sub_query
WHERE al.id = sub_query.id
    `);
  }

  /**
   * Updates the number of live mode updates for keywords per day for all applicable accounts.
   * This method performs an SQL query to set account limits based on the current tariff plans,
   * subscriptions and their statuses. It updates the 'limit' value in the account_limits table
   * for each account that meets the criteria specified within the query.
   *
   * @return {Promise<void>} A promise that is resolved when the update operation is completed.
   */
  async updateNumberOfLiveModeUpdatesForKeywordsPerDay(): Promise<void> {
    await this.query(`
UPDATE account_limits AS al
SET "limit" = sub_query.limit
FROM (
SELECT accounts.id as account_id,
           default_result."limit" as limit,
           default_result.id as limit_type_id
    FROM tariff_plan_settings
    LEFT JOIN tariff_plans ON tariff_plan_settings.tariff_plan_id = tariff_plans.id
    INNER JOIN subscriptions ON tariff_plan_settings.id = subscriptions.tariff_plan_setting_id
    inner join accounts on subscriptions.id = accounts.subscription_id
    INNER JOIN subscription_statuses on subscriptions.status_id = subscription_statuses.id
    LEFT JOIN (
        SELECT default_tariff_plan_limits."limit", default_tariff_plan_limits.tariff_plan_id, limit_types.id, limit_types.name as limit_types_name
        FROM default_tariff_plan_limits
        LEFT JOIN limit_types ON default_tariff_plan_limits.limit_type_id = limit_types.id
    ) AS default_result ON tariff_plans.id = default_result.tariff_plan_id
        AND default_result.limit_types_name = '${LimitTypesEnum.NumberOfLiveModeUpdatesForKeywordsPerDay}'
       AND subscriptions.status_update_date > NOW() AND subscription_statuses.name not in ('${SubscriptionStatusesEnum.deactivated}')
) AS sub_query
WHERE al.account_id = sub_query.account_id
AND al.account_limit_type_id = sub_query.limit_type_id
    `);
  }

  /**
   * Updates the number of available keyword updates per day for each account
   * based on the current active subscription and the default tariff plan limits.
   *
   * This method performs an SQL query that updates account limits.
   *
   * @return {Promise<void>} A promise that resolves when the update operation is complete.
   */
  async updateNumberOfAvailableKeywordUpdatesPerDay(): Promise<void> {
    await this.query(`
UPDATE account_limits AS al
SET "limit" = sub_query.limit
FROM (
SELECT accounts.id as account_id,
           default_result."limit" as limit,
           default_result.id as limit_type_id
    FROM tariff_plan_settings
    LEFT JOIN tariff_plans ON tariff_plan_settings.tariff_plan_id = tariff_plans.id
    INNER JOIN subscriptions ON tariff_plan_settings.id = subscriptions.tariff_plan_setting_id
    inner join accounts on subscriptions.id = accounts.subscription_id
    INNER JOIN subscription_statuses on subscriptions.status_id = subscription_statuses.id
    LEFT JOIN (
        SELECT default_tariff_plan_limits."limit", default_tariff_plan_limits.tariff_plan_id, limit_types.id, limit_types.name as limit_types_name
        FROM default_tariff_plan_limits
        LEFT JOIN limit_types ON default_tariff_plan_limits.limit_type_id = limit_types.id
    ) AS default_result ON tariff_plans.id = default_result.tariff_plan_id
        AND default_result.limit_types_name = '${LimitTypesEnum.NumberOfDailyUpdatesOfKeywordPositions}'
       AND subscriptions.status_update_date > NOW() AND subscription_statuses.name not in ('${SubscriptionStatusesEnum.deactivated}')
) AS sub_query
WHERE al.account_id = sub_query.account_id
AND al.account_limit_type_id = sub_query.limit_type_id
    `);
  }

  /**
   * Decreases the limit counter for a given account and limit type.
   *
   * @param {IdType} accountId - The ID of the account for which to decrease the limit counter.
   * @param {number} numberOfChanges - The number of times to decrease the limit counter.
   * @param {LimitTypesEnum} limitType - The type of limit to decrease.
   * @return {Promise<boolean>} - A promise that resolves to a boolean indicating whether the limit decrease was successful.
   */
  async limitDecreaseCounter(
    accountId: IdType,
    numberOfChanges: number,
    limitType: LimitTypesEnum,
  ): Promise<boolean> {
    const result = await this.query(`SELECT update_limit($1, $2, $3)`, [
      accountId,
      limitType,
      numberOfChanges,
    ]);
    return result[0].update_limit;
  }

  /**
   * Fetches all limits related to the current account.
   *
   * @param {IdType} accountId - The ID of the account whose limits are to be fetched.
   * @param {IdType} userId - The ID of the user making the request for limits.
   * @return {Promise<AllLimitsOfCurrentAccountType[]>} A promise that resolves to an array containing the limits associated with the current account.
   */
  async getAllLimitsOfCurrentAccount(
    accountId: IdType,
    userId: IdType,
  ): Promise<AllLimitsOfCurrentAccountType[]> {
    return this.query(
      `
select COUNT(keywords.id)::FLOAT as keyword_count,
(select COUNT(triggers.id) from triggers left join projects on triggers.project_id = projects.id where projects.account_id = $1)::FLOAT as trigger_count,
(select COUNT(email_reports.id)::FLOAT 
    from email_reports
    left join projects on email_reports.project_id = projects.id
    left join accounts on projects.account_id = accounts.id
    where accounts.id = $1
)::FLOAT as email_report_count,
(select COUNT(account_users.id) 
    from account_users 
    where account_users.account_id = $1
)::FLOAT as user_count,
(select COUNT(*) 
    from projects
    left join users_projects on projects.id = users_projects.projects_id
    where projects.account_id = $1 and users_projects.users_id = $2
)::FLOAT as project_count,
(select COUNT(invitations.id)
    from invitations
    left join users on invitations.invitation_user = users.email
    where invitations.account_id = $1 and users is null
)::FLOAT as invitation_count,
(select COUNT(competitors.id) 
    from competitors
    left join projects on competitors.project_id = projects.id
    where projects.account_id = $1
)::FLOAT as competitor_count,
(select COUNT(notes.id) 
    from notes
    left join projects on notes.project_id = projects.id
    where projects.account_id = $1
)::FLOAT as note_count,
(select COUNT(shared_links.id) 
    from shared_links 
    where shared_links.account_id = $1
)::FLOAT as shared_link_count,
$1 as account_id,
(select COUNT(report_recipients.id) from report_recipients
left join email_reports on report_recipients.email_report_id = email_reports.id
left join projects on email_reports.project_id = projects.id
where projects.account_id = $1
)::FLOAT as number_of_recipients_of_email_reports
from accounts
left join projects on accounts.id = projects.account_id
left join keywords on projects.id = keywords.project_id
where accounts.id = $1
    `,
      [accountId, userId],
    );
  }

  /**
   * Fetches all account limits for a specified account.
   *
   * @param {IdType} accountId - The unique identifier of the account for which the limits are to be retrieved.
   * @return {Promise<AccountType[]>} A promise that resolves to an array of account limits, each containing the current limit, limit type id, limit type name, and default limit.
   */
  async getAllAccountLimits(accountId: IdType): Promise<AccountType[]> {
    return this.query(
      `
select account_limits."limit"::FLOAT as current_limit,
       limit_types.id as limit_types_id,
       limit_types.name as limit_types_name,
       CASE WHEN subscription_statuses.name = '${SubscriptionStatusesEnum.deactivated}' THEN 0 ELSE COALESCE(default_tariff_plan_limits."limit", 0)::FLOAT END as default_limit
from account_limits
left join accounts on account_limits.account_id = accounts.id
left join subscriptions on accounts.subscription_id = subscriptions.id
left join subscription_statuses on subscriptions.status_id = subscription_statuses.id
left join tariff_plan_settings on subscriptions.tariff_plan_setting_id = tariff_plan_settings.id
left join tariff_plans on tariff_plan_settings.tariff_plan_id = tariff_plans.id
left join limit_types on account_limits.account_limit_type_id = limit_types.id
left join default_tariff_plan_limits on tariff_plans.id = default_tariff_plan_limits.tariff_plan_id and limit_types.id = default_tariff_plan_limits.limit_type_id
where account_limits.account_id = $1
    `,
      [accountId],
    );
  }
}
