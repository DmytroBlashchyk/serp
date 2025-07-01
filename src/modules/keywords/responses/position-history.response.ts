import { HistoryResponse } from 'modules/keywords/responses/history.response';
import { BaseResponse } from 'modules/common/responses/base.response';
import { CompetitorHistoryResponse } from 'modules/keywords/responses/competitor-history.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class PositionHistoryResponse extends BaseResponse<PositionHistoryResponse> {
  @ResponseProperty({ cls: HistoryResponse, each: true })
  positionHistory: HistoryResponse[];

  @ResponseProperty({ each: true, cls: CompetitorHistoryResponse })
  historyOfCompetitorPositions: CompetitorHistoryResponse[];
}
