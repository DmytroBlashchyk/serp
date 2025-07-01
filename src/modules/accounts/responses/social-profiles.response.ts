import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class SocialProfilesResponse extends BaseResponse<SocialProfilesResponse> {
  @ResponseProperty()
  twitterLink?: string;

  @ResponseProperty()
  facebookLink?: string;

  @ResponseProperty()
  linkedinLink?: string;
}
