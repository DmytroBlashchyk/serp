import { Injectable } from '@nestjs/common';
import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { AccountEntity } from 'modules/accounts/entities/account.entity';
import { CurrentAccountResponse } from 'modules/accounts/responses/current-account.response';
import { CountryResponse } from 'modules/countries/responses/country.response';
import { SocialProfilesResponse } from 'modules/accounts/responses/social-profiles.response';
import { AccountOptionsResponse } from 'modules/accounts/responses/account-options.response';
import { TimezoneResponse } from 'modules/timezones/responses/timezone.response';
import { FolderResponse } from 'modules/folders/responses/folder.response';
import { ApiAccessResponse } from 'modules/accounts/responses/api-access.response';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { ConfigService } from '@nestjs/config';
import { TariffPlanResponse } from 'modules/subscriptions/responses/tariff-plan.response';
import { TariffPlanSettingsResponse } from 'modules/subscriptions/responses/tariff-plan-settings.response';

@Injectable()
export class CurrentResponseFactory extends BaseResponseFactory<
  AccountEntity,
  CurrentAccountResponse
> {
  constructor(private readonly configService: ConfigService) {
    super();
  }
  /**
   * Creates a response object for the given account entity, including additional options if provided.
   *
   * @param {AccountEntity} entity - The account entity from which to create the response.
   * @param {Object} [options] - Additional options for the response.
   * @param {string} options.companyLogoUrl - The URL of the company's logo.
   * @param {FolderResponse} options.folderTree - The folder tree structure.
   * @return {Promise<CurrentAccountResponse>} A promise that resolves to the response for the current account.
   */
  async createResponse(
    entity: AccountEntity,
    options?: {
      companyLogoUrl: string;
      folderTree: FolderResponse;
    },
  ): Promise<CurrentAccountResponse> {
    return new CurrentAccountResponse({
      id: entity.id,
      firstName: entity.owner.firstName,
      lastName: entity.owner.lastName,
      country: new CountryResponse(entity.country),
      timezone: new TimezoneResponse(entity.timezone),
      companyName: entity.companyName,
      companyUrl: entity.companyUrl,
      tagline: entity.tagline,
      companyLogoUrl: options?.companyLogoUrl ?? null,
      socialProfiles: new SocialProfilesResponse({
        twitterLink: entity.twitterLink,
        facebookLink: entity.facebookLink,
        linkedinLink: entity.linkedinLink,
      }),
      options: new AccountOptionsResponse({
        emailReports: entity.emailReports,
        sharedLinks: entity.sharedLinks,
        validatedBySerpnest: entity.validatedBySerpnest,
      }),
      deletedAt: entity.deletedAt,
      ...entity,
      folderTree: options.folderTree,
      apiAccess: new ApiAccessResponse({
        apiKey: entity.apiKey,
        apiEndpoints: `${this.configService.get(
          ConfigEnvEnum.APP_BACKEND_URL,
        )}/v1/documentation`,
        apiCredits: 0,
      }),

      actionRequired: !!entity.owner.emailConfirmationToken,
      preferredTariffPlan: entity.preferredTariffPlan
        ? new TariffPlanResponse({
            id: entity.preferredTariffPlan.tariffPlan.id,
            name: entity.preferredTariffPlan.tariffPlan.name,
            settings: new TariffPlanSettingsResponse({
              ...entity.preferredTariffPlan,
            }),
          })
        : null,
    });
  }
}
