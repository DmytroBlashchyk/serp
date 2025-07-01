import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { DeviceTypeResponse } from 'modules/device-types/responses/device-type.response';
import { BaseResponse } from 'modules/common/responses/base.response';

export class TriggerKeywordResponse extends BaseResponse<TriggerKeywordResponse> {
  @IdProperty()
  triggerKeywordId: IdType;

  @ResponseProperty()
  name: string;

  @ResponseProperty({ cls: DeviceTypeResponse })
  deviceType: DeviceTypeResponse;

  @IdProperty()
  keywordId: IdType;
}
