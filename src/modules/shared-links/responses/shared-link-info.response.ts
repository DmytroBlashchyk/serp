import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { SharedLinkSettingResponse } from 'modules/shared-links/responses/shared-link-setting.response';
import { AccountSettingsResponse } from 'modules/shared-links/responses/account-settings.response';
import { SocialNetworksResponse } from 'modules/shared-links/responses/social-networks.response';

export class SharedLinkInfoResponse extends BaseResponse<SharedLinkInfoResponse> {
  @ResponseProperty({ cls: AccountSettingsResponse })
  accountInfo: AccountSettingsResponse;

  @ResponseProperty()
  companyName: string;

  @ResponseProperty()
  companyUrl: string;

  @ResponseProperty()
  tagline: string;

  @ResponseProperty()
  companyLogoUrl: string;

  @ResponseProperty({ cls: SocialNetworksResponse })
  socialNetworks: SocialNetworksResponse;

  @ResponseProperty({ cls: SharedLinkSettingResponse })
  settings: SharedLinkSettingResponse;
}
