import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { BaseResponse } from 'modules/common/responses/base.response';

export class AveragePositionResponse extends BaseResponse<AveragePositionResponse> {
  @ResponseProperty()
  avgPos: number;

  @ResponseProperty()
  progress: number;

  @ResponseProperty()
  increasingAveragePosition: boolean;
}
