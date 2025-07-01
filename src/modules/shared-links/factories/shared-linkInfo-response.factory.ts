import { Injectable } from '@nestjs/common';
import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { SharedLinkEntity } from 'modules/shared-links/entities/shared-link.entity';
import { SharedLinkInfoResponse } from 'modules/shared-links/responses/shared-link-info.response';
import { StorageService } from 'modules/storage/services/storage.service';
import { SharedLinkSettingResponse } from 'modules/shared-links/responses/shared-link-setting.response';
import { AccountSettingsResponse } from 'modules/shared-links/responses/account-settings.response';
import { SocialNetworksResponse } from 'modules/shared-links/responses/social-networks.response';

@Injectable()
export class SharedLinkInfoResponseFactory extends BaseResponseFactory<
  SharedLinkEntity,
  SharedLinkInfoResponse
> {
  constructor(private readonly storageService: StorageService) {
    super();
  }
  /**
   * Creates a response object containing the information of a shared link entity.
   *
   * @param {SharedLinkEntity} entity - The entity containing shared link information.
   * @return {Promise<SharedLinkInfoResponse>} A promise that resolves to a shared link information response.
   */
  async createResponse(
    entity: SharedLinkEntity,
  ): Promise<SharedLinkInfoResponse> {
    return new SharedLinkInfoResponse({
      accountInfo: new AccountSettingsResponse({
        id: entity.account.id,
        sharedLinks: entity.account.sharedLinks,
        emailReports: entity.account.emailReports,
        validatedBySerpneest: entity.account.validatedBySerpnest,
      }),
      companyName: entity.account.companyName,
      companyUrl: entity.account.sharedLinks
        ? entity.account.companyUrl
        : undefined,
      tagline: entity.account.sharedLinks ? entity.account.tagline : undefined,
      companyLogoUrl: entity.account.sharedLinks
        ? entity.account.companyLogo
          ? await this.storageService.getStorageItemUrl(
              entity.account.companyLogo,
            )
          : null
        : undefined,
      socialNetworks: new SocialNetworksResponse({
        twitterLink: entity.account.twitterLink,
        facebookLink: entity.account.facebookLink,
        linkedinLink: entity.account.linkedinLink,
      }),
      settings: new SharedLinkSettingResponse({ ...entity.settings }),
    });
  }
}
