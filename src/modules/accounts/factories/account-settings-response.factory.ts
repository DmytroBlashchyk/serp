import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { AccountSettingsResponse } from 'modules/shared-links/responses/account-settings.response';
import { Injectable } from '@nestjs/common';
import { BrandingInfoType } from 'modules/projects/types/branding-info.type';

@Injectable()
export class AccountSettingsResponseFactory extends BaseResponseFactory<
  BrandingInfoType,
  AccountSettingsResponse
> {
  /**
   * Creates an instance of AccountSettingsResponse based on the provided BrandingInfoType entity.
   *
   * @param {BrandingInfoType} entity - The BrandingInfoType object containing branding information.
   * @return {Promise<AccountSettingsResponse> | AccountSettingsResponse} A new instance of AccountSettingsResponse.
   */
  createResponse(
    entity: BrandingInfoType,
  ): Promise<AccountSettingsResponse> | AccountSettingsResponse {
    return new AccountSettingsResponse({
      emailReports: entity.email_reports,
      id: entity.accounts_id,
      sharedLinks: entity.shared_links,
      validatedBySerpneest: entity.validated_by_serpnest,
    });
  }
}
