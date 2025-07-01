import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { Injectable } from '@nestjs/common';
import { CurrentAccountLimitResponse } from 'modules/accounts/responses/current-account-limit.response';
import { AccountLimitsUsedResponse } from 'modules/accounts/responses/account-limits-used.response';
import { AllLimitsOfCurrentAccountType } from 'modules/accounts/types/all-limits-of-current-account.type';
import { LimitTypesEnum } from 'modules/account-limits/enums/limit-types.enum';
import { AccountLimitRepository } from 'modules/account-limits/repositories/account-limit.repository';
import { IdType } from 'modules/common/types/id-type.type';
import { DefaultAccountLimitsResponse } from 'modules/accounts/responses/default-account-limits.response';
import { BalanceAccountLimitsResponse } from 'modules/accounts/responses/balance-account-limits.response';

@Injectable()
export class CurrentAccountLimitsResponseFactory extends BaseResponseFactory<
  AllLimitsOfCurrentAccountType,
  CurrentAccountLimitResponse
> {
  constructor(private readonly accountLimitRepository: AccountLimitRepository) {
    super();
  }
  /**
   * Creates a response object that contains account limits information.
   *
   * @param {AllLimitsOfCurrentAccountType} entity - The entity containing limit information.
   * @param {Record<string, unknown>} [options] - Optional parameters.
   * @param {string} [options.accountId] - The account identifier.
   * @return {Promise<CurrentAccountLimitResponse>} - A promise that resolves to a response object containing account limits.
   */
  async createResponse(
    entity: AllLimitsOfCurrentAccountType,
    options?: Record<string, unknown>,
  ): Promise<CurrentAccountLimitResponse> {
    const accountId = options.accountId as IdType;
    const accountLimits = await this.accountLimitRepository.getAllAccountLimits(
      accountId,
    );

    let numberOfAvailableEmailReports = 0;
    let numberOfAvailableTagsPerProject = 0;
    let numberOfAvailableTagsPerKeyword = 0;
    let numberOfDailyAlertsSentByEmail = 0;
    let numberOfDailyUpdatesOfKeywordPositions = 0;
    let numberOfMonthlyUpdatesOfKeywordPositions = 0;
    let numberOfSharedLinksAvailable = 0;
    let numberOfAvailableNotes = 0;
    let numberOfTriggersAvailable = 0;
    let numberOfUsersWhoHaveAccessToTheAccount = 0;
    let numberOfLiveModeUpdatesForKeywordsPerDay = 0;
    let availableNumberOfCompetitors = 0;
    let currentNumberOfAvailableEmailReports = 0;
    let currentNumberOfAvailableTagsPerProject = 0;
    let currentNumberOfAvailableTagsPerKeyword = 0;
    let currentNumberOfDailyAlertsSentByEmail = 0;
    let currentNumberOfDailyUpdatesOfKeywordPositions = 0;
    let currentNumberOfMonthlyUpdatesOfKeywordPositions = 0;
    let currentNumberOfSharedLinksAvailable = 0;
    let currentNumberOfTriggersAvailable = 0;
    let currentNumberOfAvailableNotes = 0;
    let currentNumberOfUsersWhoHaveAccessToTheAccount = 0;
    let currentAvailableNumberOfCompetitors = 0;
    let currentNumberOfLiveModeUpdatesForKeywordsPerDay = 0;
    for (const item of accountLimits) {
      switch (item.limit_types_name) {
        case LimitTypesEnum.NumberOfUsersWhoHaveAccessToTheAccount:
          numberOfUsersWhoHaveAccessToTheAccount = item.default_limit;
          currentNumberOfUsersWhoHaveAccessToTheAccount = item.current_limit;
          break;
        case LimitTypesEnum.NumberOfLiveModeUpdatesForKeywordsPerDay:
          numberOfLiveModeUpdatesForKeywordsPerDay = item.default_limit;
          currentNumberOfLiveModeUpdatesForKeywordsPerDay = item.current_limit;
          break;
        case LimitTypesEnum.AvailableNumberOfCompetitors:
          availableNumberOfCompetitors = item.default_limit;
          currentAvailableNumberOfCompetitors = item.current_limit;
          break;
        case LimitTypesEnum.NumberOfNotesAvailableForTheAccount:
          numberOfAvailableNotes = item.default_limit;
          currentNumberOfAvailableNotes = item.current_limit;
          break;
        case LimitTypesEnum.NumberOfTriggersAvailable:
          numberOfTriggersAvailable = item.default_limit;
          currentNumberOfTriggersAvailable = item.current_limit;
          break;
        case LimitTypesEnum.NumberOfSharedLinksAvailable:
          numberOfSharedLinksAvailable = item.default_limit;
          currentNumberOfSharedLinksAvailable = item.current_limit;
          break;
        case LimitTypesEnum.NumberOfMonthlyUpdatesOfKeywordPositions:
          numberOfMonthlyUpdatesOfKeywordPositions = item.default_limit;
          currentNumberOfMonthlyUpdatesOfKeywordPositions = item.current_limit;
          break;
        case LimitTypesEnum.NumberOfDailyUpdatesOfKeywordPositions:
          numberOfDailyUpdatesOfKeywordPositions = item.default_limit;
          currentNumberOfDailyUpdatesOfKeywordPositions = item.current_limit;
          break;
        case LimitTypesEnum.NumberOfDailyAlertsSentByEmail:
          numberOfDailyAlertsSentByEmail = item.default_limit;
          currentNumberOfDailyAlertsSentByEmail = item.current_limit;
          break;
        case LimitTypesEnum.NumberOfAvailableTagsPerProject:
          numberOfAvailableTagsPerProject = item.default_limit;
          currentNumberOfAvailableTagsPerProject = item.current_limit;
          break;
        case LimitTypesEnum.NumberOfAvailableTagsPerKeyword:
          numberOfAvailableTagsPerKeyword = item.default_limit;
          currentNumberOfAvailableTagsPerKeyword = item.current_limit;
          break;
        case LimitTypesEnum.NumberOfAvailableEmailReports:
          numberOfAvailableEmailReports = item.default_limit;
          currentNumberOfAvailableEmailReports = item.current_limit;
          break;
      }
    }
    return new CurrentAccountLimitResponse({
      accountLimitsUsed: new AccountLimitsUsedResponse({
        numberOfTriggers: entity.trigger_count,
        numberOfInvitations: entity.invitation_count,
        numberOfCompetitors: entity.competitor_count,
        numberOfNotes: entity.note_count,
        numberOfSharedLinks: entity.shared_link_count,
        numberOfKeywords: entity.keyword_count,
        numberOfProjects: entity.project_count,
        numberOfUsers: entity.user_count,
        numberOfEmailReports: entity.email_report_count,
        numberOfRecipientsOfEmailReports:
          entity.number_of_recipients_of_email_reports,
      }),
      balanceAccountLimits: new BalanceAccountLimitsResponse({
        currentNumberOfAvailableEmailReports,
        currentNumberOfAvailableTagsPerProject,
        currentNumberOfDailyAlertsSentByEmail,
        currentNumberOfDailyUpdatesOfKeywordPositions,
        currentNumberOfMonthlyUpdatesOfKeywordPositions,
        currentNumberOfSharedLinksAvailable,
        currentNumberOfTriggersAvailable,
        currentNumberOfUsersWhoHaveAccessToTheAccount,
        currentAvailableNumberOfCompetitors,
        currentNumberOfAvailableNotes,
        currentNumberOfAvailableTagsPerKeyword,
        currentNumberOfLiveModeUpdatesForKeywordsPerDay,
      }),
      defaultAccountLimits: new DefaultAccountLimitsResponse({
        numberOfAvailableEmailReports,
        numberOfAvailableTagsPerProject,
        numberOfDailyAlertsSentByEmail,
        numberOfDailyUpdatesOfKeywordPositions,
        numberOfMonthlyUpdatesOfKeywordPositions,
        numberOfSharedLinksAvailable,
        numberOfTriggersAvailable,
        numberOfUsersWhoHaveAccessToTheAccount,
        availableNumberOfCompetitors,
        numberOfAvailableNotes,
        numberOfAvailableTagsPerKeyword,
        numberOfLiveModeUpdatesForKeywordsPerDay,
      }),
    });
  }
}
