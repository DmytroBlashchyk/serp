import { BaseResponse } from 'modules/common/responses/base.response';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { IdType } from 'modules/common/types/id-type.type';

export class CompetitorResponse extends BaseResponse<CompetitorResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty({ nullable: true })
  domainName?: string;

  @ResponseProperty({ nullable: true })
  businessName?: string;

  @ResponseProperty({ nullable: true })
  url?: string;
}
