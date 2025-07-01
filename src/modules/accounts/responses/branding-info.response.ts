import { BaseResponse } from 'modules/common/responses/base.response';
import { SocialNetworksResponse } from 'modules/shared-links/responses/social-networks.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class BrandingInfoResponse extends BaseResponse<BrandingInfoResponse> {
  @ResponseProperty()
  companyName: string;

  @ResponseProperty()
  companyTagline: string;

  @ResponseProperty()
  companyUrl: string;

  @ResponseProperty()
  companyLogoUrl: string;

  @ResponseProperty({ cls: SocialNetworksResponse })
  socialNetworks: SocialNetworksResponse;
}
