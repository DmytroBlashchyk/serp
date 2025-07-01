import { BaseResponse } from 'modules/common/responses/base.response';
import { QuantityProperty } from 'modules/common/decorators/quantity-property.decorator';

export class DefaultAccountLimitsResponse extends BaseResponse<DefaultAccountLimitsResponse> {
  @QuantityProperty()
  numberOfDailyUpdatesOfKeywordPositions: number;

  @QuantityProperty()
  numberOfMonthlyUpdatesOfKeywordPositions: number;

  @QuantityProperty()
  availableNumberOfCompetitors: number;

  @QuantityProperty()
  numberOfAvailableTagsPerProject: number;

  @QuantityProperty()
  numberOfAvailableEmailReports: number;

  @QuantityProperty()
  numberOfAvailableNotes: number;

  @QuantityProperty()
  numberOfTriggersAvailable: number;

  @QuantityProperty()
  numberOfUsersWhoHaveAccessToTheAccount: number;

  @QuantityProperty()
  numberOfSharedLinksAvailable: number;

  @QuantityProperty()
  numberOfDailyAlertsSentByEmail: number;

  @QuantityProperty()
  numberOfAvailableTagsPerKeyword: number;

  @QuantityProperty()
  numberOfLiveModeUpdatesForKeywordsPerDay: number;
}
