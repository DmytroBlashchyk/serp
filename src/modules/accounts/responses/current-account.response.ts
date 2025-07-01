import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { CountryResponse } from 'modules/countries/responses/country.response';
import { SocialProfilesResponse } from 'modules/accounts/responses/social-profiles.response';
import { AccountOptionsResponse } from 'modules/accounts/responses/account-options.response';
import { TimezoneResponse } from 'modules/timezones/responses/timezone.response';
import { FolderResponse } from 'modules/folders/responses/folder.response';
import { ApiAccessResponse } from 'modules/accounts/responses/api-access.response';
import { TariffPlanResponse } from 'modules/subscriptions/responses/tariff-plan.response';

export class CurrentAccountResponse extends BaseResponse<CurrentAccountResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  firstName: string;

  @ResponseProperty()
  lastName: string;

  @ResponseProperty({ cls: CountryResponse })
  country: CountryResponse;

  @ResponseProperty({ cls: TimezoneResponse })
  timezone: TimezoneResponse;

  @ResponseProperty({ nullable: true })
  companyName?: string;

  @ResponseProperty({ nullable: true })
  companyUrl?: string;

  @ResponseProperty({ nullable: true })
  tagline?: string;

  @ResponseProperty()
  companyLogoUrl?: string;

  @ResponseProperty({ cls: SocialProfilesResponse })
  socialProfiles: SocialProfilesResponse;

  @ResponseProperty({ cls: AccountOptionsResponse })
  options: AccountOptionsResponse;

  @ResponseProperty({ nullable: true, cls: Date })
  deletedAt?: Date;

  @ResponseProperty({ cls: FolderResponse })
  folderTree: FolderResponse;

  @ResponseProperty({ cls: ApiAccessResponse })
  apiAccess: ApiAccessResponse;

  @ResponseProperty()
  actionRequired: boolean;

  @ResponseProperty({ cls: TariffPlanResponse })
  preferredTariffPlan: TariffPlanResponse;
}
