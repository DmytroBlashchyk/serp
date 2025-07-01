import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class PositionResponse extends BaseResponse<PositionResponse> {
  @ResponseProperty()
  position: number;

  @ResponseProperty()
  trophy: boolean;

  @ResponseProperty()
  greenCheckMark: boolean;

  @ResponseProperty()
  dash: boolean;
}
