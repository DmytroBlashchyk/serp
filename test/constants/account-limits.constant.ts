import { CurrentAccountLimitResponse } from 'modules/accounts/responses/current-account-limit.response';
import { AccountLimitsUsedResponse } from 'modules/accounts/responses/account-limits-used.response';
import { BalanceAccountLimitsResponse } from 'modules/accounts/responses/balance-account-limits.response';
import { DefaultAccountLimitsResponse } from 'modules/accounts/responses/default-account-limits.response';

export const expectedAccountLimits: CurrentAccountLimitResponse =
  new CurrentAccountLimitResponse({
    accountLimitsUsed: new AccountLimitsUsedResponse({
      numberOfTriggers: 0,
      numberOfInvitations: 0,
      numberOfCompetitors: 0,
      numberOfNotes: 0,
      numberOfSharedLinks: 0,
      numberOfKeywords: 0,
      numberOfProjects: 0,
      numberOfUsers: 1,
      numberOfEmailReports: 0,
      numberOfRecipientsOfEmailReports: 0,
    }),
    balanceAccountLimits: new BalanceAccountLimitsResponse({
      currentNumberOfAvailableEmailReports: 5,
      currentNumberOfAvailableTagsPerProject: 5,
      currentNumberOfDailyAlertsSentByEmail: 5,
      currentNumberOfDailyUpdatesOfKeywordPositions: 10,
      currentNumberOfLiveModeUpdatesForKeywordsPerDay: 10,
      currentNumberOfMonthlyUpdatesOfKeywordPositions: 150,
      currentNumberOfSharedLinksAvailable: 10,
      currentNumberOfTriggersAvailable: 5,
      currentNumberOfUsersWhoHaveAccessToTheAccount: 5,
      currentAvailableNumberOfCompetitors: 5,
      currentNumberOfAvailableNotes: 10,
      currentNumberOfAvailableTagsPerKeyword: 2,
    }),
    defaultAccountLimits: new DefaultAccountLimitsResponse({
      numberOfAvailableEmailReports: 5,
      numberOfAvailableTagsPerProject: 5,
      numberOfDailyAlertsSentByEmail: 5,
      numberOfDailyUpdatesOfKeywordPositions: 10,
      numberOfLiveModeUpdatesForKeywordsPerDay: 10,
      numberOfMonthlyUpdatesOfKeywordPositions: 150,
      numberOfSharedLinksAvailable: 10,
      numberOfTriggersAvailable: 5,
      numberOfUsersWhoHaveAccessToTheAccount: 5,
      availableNumberOfCompetitors: 5,
      numberOfAvailableNotes: 10,
      numberOfAvailableTagsPerKeyword: 2,
    }),
  });
