import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class KeywordTrendResponse extends BaseResponse<KeywordTrendResponse> {
  @ResponseProperty()
  date: Date;

  @ResponseProperty()
  top3: number;

  @ResponseProperty()
  fromFourToTen: number;

  @ResponseProperty()
  fromElevenToTwenty: number;

  @ResponseProperty()
  fromTwentyOneToFifty: number;

  @ResponseProperty()
  fiftyOneToOneHundred: number;

  @ResponseProperty()
  notRanked: number;

  @ResponseProperty()
  total: number;
}
