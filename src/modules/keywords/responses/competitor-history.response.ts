import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { HistoryResponse } from 'modules/keywords/responses/history.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class CompetitorHistoryResponse extends BaseResponse<CompetitorHistoryResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty({ nullable: true })
  domainName: string;

  @ResponseProperty({ nullable: true })
  businessName: string;

  @ResponseProperty({ nullable: true })
  url: string;

  @ResponseProperty({ each: true, cls: HistoryResponse })
  items: HistoryResponse[];
}
