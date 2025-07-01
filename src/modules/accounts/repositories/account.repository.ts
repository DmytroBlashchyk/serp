import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { AccountEntity } from 'modules/accounts/entities/account.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { IdType } from 'modules/common/types/id-type.type';
import { RemoteAccountUserType } from 'modules/accounts/types/remote-account-user.type';
import { AccountSearchRequest } from 'modules/accounts/requests/account-search.request';
import { SearchTypeEnum } from 'modules/accounts/enums/search-type.enum';
import { AccountSearchType } from 'modules/accounts/types/account-search.type';
import { ApiAccountInfoType } from 'modules/api/types/api-account-info.type';
import { GetPaginatedAccountUsersRequest } from 'modules/users/requests/get-paginated-account-users.request';
import { getKeyByValue } from 'modules/common/utils/get-enum-value-by-key';
import { SortUsersInvitationsEnum } from 'modules/users/enums/sort-users-invitations.enum';
import { Pagination } from 'nestjs-typeorm-paginate';
import { UsersInvitationsType } from 'modules/accounts/types/users-invitations.type';
import { LimitTypesEnum } from 'modules/account-limits/enums/limit-types.enum';

@Injectable()
@EntityRepository(AccountEntity)
export class AccountRepository extends BaseRepository<AccountEntity> {
  /**
   * Retrieves all accounts along with their associated tariff plans.
   *
   * @return {Promise<Array>} A promise that resolves to an array of accounts with their tariff plan data.
   */
  async getAllAccountsWithTariffPlan(): Promise<AccountEntity[]> {
    return this.createQueryBuilder('accounts')
      .leftJoinAndSelect('accounts.subscription', 'subscription')
      .leftJoinAndSelect('accounts.limits', 'limits')
      .leftJoinAndSelect('limits.accountLimitType', 'accountLimitType')
      .leftJoinAndSelect('subscription.tariffPlanSetting', 'tariffPlanSetting')
      .leftJoinAndSelect('tariffPlanSetting.tariffPlan', 'tariffPlan')
      .where('accountLimitType.name not in(:...accountTypeNames)', {
        accountTypeNames: [
          LimitTypesEnum.NumberOfLiveModeUpdatesForKeywordsPerDay,
        ],
      })
      .getMany();
  }

  /**
   * Retrieves an account along with all its associated entities such as owner, account users,
   * projects, folders, company logo, subscription, and account invitations.
   *
   * @param {IdType} accountId - The ID of the account to retrieve.
   * @return {Promise<AccountEntity>} A promise that resolves to the account entity with all associated entities.
   */
  async getAnAccountWithAllEntities(accountId: IdType): Promise<AccountEntity> {
    return this.createQueryBuilder('accounts')
      .withDeleted()
      .leftJoinAndSelect('accounts.owner', 'owner')
      .leftJoinAndSelect('owner.accountUsers', 'ownerAccountUsers')
      .leftJoinAndSelect('owner.projects', 'ownerProjects')
      .leftJoinAndSelect('owner.folders', 'ownerFolders')
      .leftJoinAndSelect('accounts.companyLogo', 'companyLogo')
      .leftJoinAndSelect('accounts.accountUsers', 'accountUsers')
      .leftJoinAndSelect('accounts.projects', 'projects')
      .leftJoinAndSelect('accounts.folders', 'folders')
      .leftJoinAndSelect('accounts.subscription', 'subscription')
      .leftJoinAndSelect('accounts.accountInvitations', 'accountInvitations')
      .where('accounts.id =:accountId', { accountId })
      .getOne();
  }

  /**
   * Retrieves an account entity associated with the given subscription ID.
   *
   * @param {IdType} subscriptionId - The unique identifier of the subscription.
   * @return {Promise<AccountEntity>} A promise that resolves to the account entity corresponding to the provided subscription ID.
   */
  async getAccountBySubscriptionId(
    subscriptionId: IdType,
  ): Promise<AccountEntity> {
    return this.createQueryBuilder('accounts')
      .withDeleted()
      .leftJoin('accounts.subscription', 'subscription')
      .where('subscription.id =:subscriptionId', { subscriptionId })
      .getOne();
  }

  async getYourOwnAccountWithASubscription(userId: IdType) {
    return this.createQueryBuilder('accounts')
      .withDeleted()
      .leftJoinAndSelect('accounts.owner', 'owner')
      .leftJoinAndSelect('accounts.subscription', 'subscription')
      .where('owner.id =:userId', { userId })
      .getOne();
  }

  async getAccountWithSubscription(accountId: IdType): Promise<AccountEntity> {
    return this.createQueryBuilder('accounts')
      .withDeleted()
      .leftJoinAndSelect('accounts.owner', 'owner')
      .innerJoinAndSelect('accounts.subscription', 'subscription')
      .leftJoinAndSelect('subscription.paymentMethod', 'paymentMethod')
      .leftJoinAndSelect('subscription.card', 'card')
      .leftJoinAndSelect('subscription.status', 'status')
      .leftJoinAndSelect('subscription.tariffPlanSetting', 'tariffPlanSetting')
      .leftJoinAndSelect('tariffPlanSetting.tariffPlan', 'tariffPlan')
      .leftJoinAndSelect('tariffPlanSetting.type', 'type')
      .where('accounts.id =:accountId', { accountId })
      .withDeleted()
      .getOne();
  }

  async getCurrentTimeByAccountId(
    accountId: IdType,
  ): Promise<{ hours: number; minutes: number }> {
    const result = await this.query(
      `
select 
    EXTRACT(HOUR FROM NOW()::timestamp AT TIME ZONE 'UTC' AT TIME ZONE timezones.tz_code) as hours,
    EXTRACT(MINUTE FROM NOW()::timestamp AT TIME ZONE 'UTC' AT TIME ZONE timezones.tz_code) as minutes 
from accounts
left join timezones on accounts.timezone_id = timezones.id
where accounts.id =$1`,
      [accountId],
    );
    return result.length > 0
      ? { hours: result[0].hours, minutes: result[0].minutes }
      : null;
  }

  async searchByAccount(
    accountId: IdType,
    options: AccountSearchRequest,
  ): Promise<AccountSearchType[]> {
    return this.query(
      `
  select 
      projects.id as id, 
      projects.project_name as name, 
      projects.url as domain, 
      '' as keyword_name, 
      '${SearchTypeEnum.projects}' as type,
      projects.id as project_id
  from projects
  where account_id =$1 and projects.project_name ILIKE $2
union
  select 
    folders.id as id, 
    folders.name as name, 
    '' as domain, 
    '' as keyword_name, 
    '${SearchTypeEnum.folders}' as type,
    0 as project_id
  from folders where folders.account_id=$1 and folders.name ILIKE $2
union
  select 
    keywords.id as id,
    '' as name, 
    p2.url as domain,
    keywords.name as keyword_name, 
    '${SearchTypeEnum.keywords}' as type,
    keywords.project_id as project_id
  from keywords left join projects p2 on keywords.project_id = p2.id
  where p2.account_id =$1 and keywords.name ILIKE $2
union
  select 
    projects_tags.id as id, 
    projects_tags.name as name, 
    '' as domain,
    '' as keyword_name, 
    '${SearchTypeEnum.project_tags}' as type,
         0 as project_id
     from projects_tags
  left join projects_tags_projects_tags ptpt on projects_tags.id = ptpt.projects_tags_id
  left join projects p3 on ptpt.projects_id = p3.id
  where p3.account_id = $1 and projects_tags.name ILIKE $2 group by p3.id, projects_tags.id
union
  select 
    keywords_tags.id as id, 
    keywords_tags.name as name, 
    '' as domain,
    '' as keyword_name, 
    '${SearchTypeEnum.keyword_tags}' as type,
    0 as project_id
     from keywords_tags
  left join keywords_tags_keywords_tags ktkt on keywords_tags.id = ktkt.keywords_tags_id
  left outer join keywords k on k.id = ktkt.keywords_id
  left join projects p4 on k.project_id = p4.id
  where p4.account_id=$1 and keywords_tags.name ILIKE $2`,
      [accountId, `%${options.search}%`],
    );
  }

  async getAccountInfoById(accountId: IdType): Promise<ApiAccountInfoType> {
    const query = await this.query(
      `
select 
    accounts.id,
    accounts.company_name,
    accounts.company_url,
    accounts.tagline,
    accounts.twitter_link,
    accounts.facebook_link,
    accounts.linkedin_link,
    (select COUNT(email_reports.id) as emailReportsCount 
        from email_reports
        left join projects on email_reports.project_id = projects.id
        where projects.account_id =$1
    )::FLOAT as email_reports_count,
    (select COUNT(shared_links.id) as sharedLinksCount
        from shared_links 
        where shared_links.account_id =$1
    )::FLOAT as shared_links_count,
    (select COUNT(projects.id) 
        from projects where projects.account_id =$1
    )::FLOAT as project_number,
    (select COUNT(keywords.id) 
        from keywords left join projects on keywords.project_id = projects.id
        where projects.account_id =$1
    )::FLOAT as keyword_count,
    (select COUNT(triggers.id)
     from triggers left join projects on triggers.project_id = projects.id where projects.account_id = $1)::FLOAT as trigger_count
from accounts
where accounts.id =$1`,
      [accountId],
    );
    return query[0];
  }
  async getAccountById(accountId: IdType): Promise<AccountEntity> {
    return this.createQueryBuilder('accounts')
      .withDeleted()
      .leftJoinAndSelect('accounts.owner', 'owner')
      .leftJoinAndSelect('owner.status', 'status')
      .leftJoinAndSelect('owner.account', 'account')
      .leftJoinAndSelect('account.timezone', 'timezone')
      .leftJoinAndSelect('accounts.subscription', 'subscription')
      .withDeleted()
      .where('accounts.id =:accountId', { accountId })
      .getOne();
  }

  async deleteAccountsByIds(accountIds: IdType[]) {
    await this.createQueryBuilder()
      .where('id IN(:...accountIds)', { accountIds })
      .delete()
      .execute();
  }

  async getAccountsToDelete(): Promise<Array<RemoteAccountUserType>> {
    return this.query(`
select users.id, users.email, users.username, accounts.id as account_id
from accounts 
left outer join users on users.id = accounts.owner_id
where deleted_at < now() - interval '30 days'`);
  }

  async getAccountsThatAreAboutToExpireForDeletion(): Promise<
    Array<RemoteAccountUserType>
  > {
    return this.query(`
select users.id, users.email, users.first_name 
from accounts 
left outer join users on users.id = accounts.owner_id
where deleted_at < now() - interval '25 days' and accounts.deleted_at > now() - interval '26 days'`);
  }

  async paginateAccountUsersInvitations(
    accountId: IdType,
    options: GetPaginatedAccountUsersRequest,
  ): Promise<Pagination<UsersInvitationsType>> {
    const itemsPerPage = Number(options.limit);
    const currentPage = Number(options.page);

    const query = `
      SELECT *
      FROM (SELECT u.id as id,
               u.email as email,
               u.username as username,
               r.id as role_id,
               r.name as role_name,
               au.created_at as created_at,
               u.updated_at as updated_at,
               1 as registered
        FROM users u
         LEFT JOIN account_users au ON u.id = au.user_id
         LEFT JOIN roles r ON au.role_id = r.id
        WHERE au.account_id = $1
        UNION
        SELECT i.id as id,
               i.invitation_user as email,
               null as username,
               r.id as role_id,
               r.name as role_name,
               null as created_at,
               null as updated_at,
               0 as registered
        FROM invitations i
           LEFT JOIN roles r ON i.role_id = r.id
        WHERE i.account_id = $1 AND i.invitation_user != ALL(      
          SELECT u.email as email
            FROM users u
              LEFT JOIN account_users au ON u.id = au.user_id
              LEFT JOIN roles r ON au.role_id = r.id
            WHERE au.account_id = $1    
          )
      )
      WHERE (username ILIKE($2) OR email ILIKE($2) OR role_name ILIKE($2))`;

    const result = await this.query(`SELECT COUNT(*) FROM (${query})`, [
      accountId,
      options.search ? `%${options.search}%` : '%%',
    ]);

    const items = await this.query(
      `
      ${query} ORDER BY registered DESC ${
        options.sortBy
          ? `, ${getKeyByValue(SortUsersInvitationsEnum, options.sortBy)} ${
              options.sortOrder
            }`
          : ', email ASC'
      }
      OFFSET $3 LIMIT $4`,
      [
        accountId,
        options.search ? `%${options.search}%` : '%%',
        (currentPage - 1) * itemsPerPage,
        itemsPerPage,
      ],
    );
    const count = result[0]?.count ?? 0;

    return {
      items,
      meta: {
        itemCount: items.length,
        totalItems: +count,
        itemsPerPage,
        totalPages: Math.ceil(count / itemsPerPage),
        currentPage,
      },
    };
  }
}
