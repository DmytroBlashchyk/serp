import { ProjectInfoResponse } from 'modules/shared-links/responses/project-info.response';
import { ProjectOverviewResponse } from 'modules/projects/responses/project-overview.response';
import { ImprovedVsDeclinedArrayResponse } from 'modules/projects/responses/improved-vs-declined-array.response';
import { KeywordTrendsResponse } from 'modules/projects/responses/keyword-trends.response';
import { ProjectPerformanceResponse } from 'modules/keywords/responses/project-performance.response';
import { BrandingInfoResponse } from 'modules/accounts/responses/branding-info.response';
import { AccountSettingsResponse } from 'modules/shared-links/responses/account-settings.response';

export interface DataForPdfResponseFactoryType {
  project: ProjectInfoResponse;
  overview: ProjectOverviewResponse;
  improvedVsDeclined: ImprovedVsDeclinedArrayResponse;
  keywordTrends: KeywordTrendsResponse;
  projectPerformance: ProjectPerformanceResponse;
  brandingInfo: BrandingInfoResponse;
  accountSettings: AccountSettingsResponse;
}
