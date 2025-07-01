import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class FreeResponse extends BaseResponse<FreeResponse> {
  @ResponseProperty()
  domainName: string;

  @ResponseProperty()
  keyword: string;

  @ResponseProperty()
  yourPosition: number;

  @ResponseProperty({ nullable: true })
  firstCompetitor?: string;

  @ResponseProperty({ nullable: true })
  firstMoverPosition?: number;

  @ResponseProperty({ nullable: true })
  secondCompetitor?: string;

  @ResponseProperty({ nullable: true })
  secondMoverPosition?: number;

  @ResponseProperty({ nullable: true })
  thirdCompetitor: string;

  @ResponseProperty({ nullable: true })
  thirdPartyPosition: number;
}
