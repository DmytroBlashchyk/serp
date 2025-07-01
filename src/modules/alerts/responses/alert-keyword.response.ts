import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { DeviceTypeResponse } from 'modules/device-types/responses/device-type.response';
import { QuantityProperty } from 'modules/common/decorators/quantity-property.decorator';

export class AlertKeywordResponse extends BaseResponse<AlertKeywordResponse> {
  @IdProperty()
  alertKeywordId: IdType;

  @ResponseProperty()
  keywordName: string;

  @ResponseProperty({ cls: DeviceTypeResponse })
  deviceType: DeviceTypeResponse;

  @QuantityProperty()
  previousPosition: number;

  @ResponseProperty()
  dateOfPreviousPosition: Date;

  @QuantityProperty()
  currentPosition: number;

  @ResponseProperty()
  dateOfCurrentPosition: Date;

  @QuantityProperty()
  difference: number;

  @ResponseProperty()
  positiveChanges: boolean;
}
