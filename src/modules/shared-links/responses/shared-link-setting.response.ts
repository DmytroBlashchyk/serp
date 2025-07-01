import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class SharedLinkSettingResponse extends BaseResponse<SharedLinkSettingResponse> {
  @IdProperty()
  id: IdType;
  @ResponseProperty()
  position: boolean;

  @ResponseProperty()
  oneDayChange: boolean;

  @ResponseProperty()
  sevenDayChange: boolean;

  @ResponseProperty()
  thirtyDayChange: boolean;

  @ResponseProperty()
  startingRank: boolean;

  @ResponseProperty()
  bestRank: boolean;

  @ResponseProperty()
  lifeTimeChange: boolean;

  @ResponseProperty()
  volume: boolean;

  @ResponseProperty()
  url: boolean;

  @ResponseProperty()
  updated: boolean;
}
