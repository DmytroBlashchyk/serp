import { BaseResponse } from 'modules/common/responses/base.response';
import { QuantityProperty } from 'modules/common/decorators/quantity-property.decorator';

export class NecessaryRemovalResponse extends BaseResponse<NecessaryRemovalResponse> {
  @QuantityProperty()
  numberOfKeywords: number;

  @QuantityProperty()
  numberOfTriggers: number;

  @QuantityProperty()
  numberOfEmailReports: number;

  @QuantityProperty()
  numberOfNotes: number;
}
