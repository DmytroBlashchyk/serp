import { BaseResponse } from 'modules/common/responses/base.response';
import { QuantityProperty } from 'modules/common/decorators/quantity-property.decorator';

export class BalanceAccountLimitsResponse extends BaseResponse<BalanceAccountLimitsResponse> {
  @QuantityProperty()
  currentNumberOfDailyUpdatesOfKeywordPositions: number;

  @QuantityProperty()
  currentNumberOfMonthlyUpdatesOfKeywordPositions: number;

  @QuantityProperty()
  currentAvailableNumberOfCompetitors: number;

  @QuantityProperty()
  currentNumberOfAvailableTagsPerProject: number;

  @QuantityProperty()
  currentNumberOfAvailableEmailReports: number;

  @QuantityProperty()
  currentNumberOfTriggersAvailable: number;

  @QuantityProperty()
  currentNumberOfUsersWhoHaveAccessToTheAccount: number;

  @QuantityProperty()
  currentNumberOfAvailableNotes: number;

  @QuantityProperty()
  currentNumberOfSharedLinksAvailable: number;

  @QuantityProperty()
  currentNumberOfDailyAlertsSentByEmail: number;

  @QuantityProperty()
  currentNumberOfAvailableTagsPerKeyword: number;

  @QuantityProperty()
  currentNumberOfLiveModeUpdatesForKeywordsPerDay: number;
}
