import { BaseResponse } from 'modules/common/responses/base.response';
import { ProjectInfoResponse } from 'modules/shared-links/responses/project-info.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { ProjectOverviewResponse } from 'modules/projects/responses/project-overview.response';
import { ImprovedVsDeclinedArrayResponse } from 'modules/projects/responses/improved-vs-declined-array.response';
import { KeywordTrendsResponse } from 'modules/projects/responses/keyword-trends.response';
import { ProjectPerformanceResponse } from 'modules/keywords/responses/project-performance.response';
import { BrandingInfoResponse } from 'modules/accounts/responses/branding-info.response';
import { AccountSettingsResponse } from 'modules/shared-links/responses/account-settings.response';

export class DataForPdfResponse extends BaseResponse<DataForPdfResponse> {
  @ResponseProperty({ cls: BrandingInfoResponse })
  brandingInfo: BrandingInfoResponse;

  @ResponseProperty({ cls: AccountSettingsResponse })
  accountSettings: AccountSettingsResponse;

  @ResponseProperty({ cls: ProjectInfoResponse })
  projectInfo: ProjectInfoResponse;

  @ResponseProperty({ cls: ProjectOverviewResponse })
  overview: ProjectOverviewResponse;

  @ResponseProperty({ cls: ImprovedVsDeclinedArrayResponse })
  improvedVsDeclined: ImprovedVsDeclinedArrayResponse;

  @ResponseProperty({ cls: KeywordTrendsResponse })
  keywordTrends: KeywordTrendsResponse;

  @ResponseProperty({ cls: ProjectPerformanceResponse })
  projectPerformance: ProjectPerformanceResponse;
}
