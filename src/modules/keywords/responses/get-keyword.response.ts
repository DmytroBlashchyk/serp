import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { CompetitorResponse } from 'modules/competitors/responses/competitor.response';
import { GoogleDomainResponse } from 'modules/google-domains/responses/google-domain.response';
import { SearchEngineResponse } from 'modules/search-engines/responses/search-engine.response';

export class GetKeywordResponse extends BaseResponse<GetKeywordResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  keyword: string;

  @ResponseProperty({ nullable: true })
  businessName?: string;

  @ResponseProperty()
  domain: string;

  @ResponseProperty({ nullable: true })
  favicon?: string;

  @ResponseProperty({ cls: GoogleDomainResponse })
  region: GoogleDomainResponse;

  @ResponseProperty({ cls: CompetitorResponse, each: true })
  competitors: CompetitorResponse[];

  @ResponseProperty({ cls: SearchEngineResponse })
  searchEngine: SearchEngineResponse;
}
