import { BaseResponse } from 'modules/common/responses/base.response';
import { QuantityProperty } from 'modules/common/decorators/quantity-property.decorator';

export class AccountLimitsUsedResponse extends BaseResponse<AccountLimitsUsedResponse> {
  @QuantityProperty()
  numberOfKeywords: number;

  @QuantityProperty()
  numberOfTriggers: number;

  @QuantityProperty()
  numberOfEmailReports: number;

  @QuantityProperty()
  numberOfUsers: number;

  @QuantityProperty()
  numberOfProjects: number;

  @QuantityProperty()
  numberOfInvitations: number;

  @QuantityProperty()
  numberOfCompetitors: number;

  @QuantityProperty()
  numberOfNotes: number;

  @QuantityProperty()
  numberOfSharedLinks: number;

  @QuantityProperty()
  numberOfRecipientsOfEmailReports: number;
}
