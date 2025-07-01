import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { BrandingInfoType } from 'modules/projects/types/branding-info.type';
import { Injectable } from '@nestjs/common';
import { BrandingInfoResponse } from 'modules/accounts/responses/branding-info.response';
import { StorageService } from 'modules/storage/services/storage.service';
import { SocialNetworksResponse } from 'modules/shared-links/responses/social-networks.response';

@Injectable()
export class BrandingInfoResponseFactory extends BaseResponseFactory<
  BrandingInfoType,
  BrandingInfoResponse
> {
  constructor(private readonly storageService: StorageService) {
    super();
  }
  /**
   * Asynchronously creates a response object containing branding information.
   *
   * @param {BrandingInfoType} entity - The branding entity containing information required to generate the response.
   * @return {Promise<BrandingInfoResponse>} A promise that resolves to a BrandingInfoResponse object.
   */
  async createResponse(
    entity: BrandingInfoType,
  ): Promise<BrandingInfoResponse> {
    const companyLogoUrl =
      entity.storage_items_storage_path && entity.storage_items_stored_file_name
        ? await this.storageService.getStorageItemUrl({
            storagePath: entity.storage_items_storage_path,
            storedFileName: entity.storage_items_stored_file_name,
          })
        : null;
    return new BrandingInfoResponse({
      companyName: entity.company_name,
      companyUrl: entity.company_url,
      companyTagline: entity.tagline,
      companyLogoUrl,
      socialNetworks: new SocialNetworksResponse({
        twitterLink: entity.twitter_link,
        linkedinLink: entity.linkedin_link,
        facebookLink: entity.facebook_link,
      }),
    });
  }
}
