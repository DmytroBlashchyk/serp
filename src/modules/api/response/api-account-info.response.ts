import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { IdProperty } from 'modules/common/decorators/id-property';

export class ApiAccountInfoResponse extends BaseResponse<ApiAccountInfoResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  numberOfAvailableKeywordUpdates: number;

  @ResponseProperty()
  companyName: string;

  @ResponseProperty()
  companyUrl: string;

  @ResponseProperty()
  tagline: string;

  @ResponseProperty()
  twitterLink: string;

  @ResponseProperty()
  facebookLink: string;

  @ResponseProperty()
  linkedinLink: string;

  @ResponseProperty()
  emailReportsCount: number;

  @ResponseProperty()
  sharedLinksCount: number;

  @ResponseProperty()
  projectNumber: number;

  @ResponseProperty()
  keywordCount: number;
}
