import { BaseResponse } from 'modules/common/responses/base.response';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class OverviewResponse extends BaseResponse<OverviewResponse> {
  @ResponseProperty({ cls: KeywordEntity, each: true })
  priorPeriodKeywords: KeywordEntity[];

  @ResponseProperty({ cls: KeywordEntity, each: true })
  keywordsForSpecifiedPeriod: KeywordEntity[];
}
