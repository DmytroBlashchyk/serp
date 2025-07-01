import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { DailyPositionResponse } from 'modules/keywords/responses/daily-position.response';
import { LifeResponse } from 'modules/keywords/responses/life.response';
import { DeviceTypeResponse } from 'modules/device-types/responses/device-type.response';
import { PositionResponse } from 'modules/keywords/responses/position.response';
import { FirstPositionResponse } from 'modules/keywords/responses/first-position.response';

export class KeywordRankingResponse extends BaseResponse<KeywordRankingResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  name: string;

  @ResponseProperty({ cls: PositionResponse })
  position: PositionResponse;

  @ResponseProperty({ cls: DailyPositionResponse })
  d1: DailyPositionResponse;

  @ResponseProperty({ cls: DailyPositionResponse })
  d7: DailyPositionResponse;

  @ResponseProperty({ cls: DailyPositionResponse })
  d30: DailyPositionResponse;

  @ResponseProperty({ cls: LifeResponse })
  life: LifeResponse;

  @ResponseProperty({ cls: FirstPositionResponse })
  first: FirstPositionResponse;

  @ResponseProperty()
  best: number;

  @ResponseProperty()
  lVol: number;

  @ResponseProperty()
  url: string;

  @ResponseProperty()
  updated: string;

  @ResponseProperty()
  updatedFullFormat: string;

  @ResponseProperty()
  positionUpdate: boolean;

  @ResponseProperty({ cls: DeviceTypeResponse })
  deviceType: DeviceTypeResponse;

  @ResponseProperty()
  cpc: number;

  @ResponseProperty()
  searchValue: number;

  @ResponseProperty()
  updateAllowed: boolean;
}
