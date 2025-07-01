import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { DeviceTypeResponse } from 'modules/device-types/responses/device-type.response';
import { CheckFrequencyResponse } from 'modules/check-frequency/responses/check-frequency.response';
import { GoogleDomainResponse } from 'modules/google-domains/responses/google-domain.response';
import { DailyAverageResponse } from 'modules/projects/responses/daily-average.response';
import { SearchEngineResponse } from 'modules/search-engines/responses/search-engine.response';

export class ProjectBySharedLinkResponse extends BaseResponse<ProjectBySharedLinkResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  projectName: string;

  @ResponseProperty({ cls: DeviceTypeResponse })
  deviceType: DeviceTypeResponse;

  @ResponseProperty({ cls: GoogleDomainResponse })
  region: GoogleDomainResponse;

  @ResponseProperty()
  url: string;

  @ResponseProperty({ nullable: true })
  favicon?: string;

  @ResponseProperty()
  totalKeywords: number;

  @ResponseProperty()
  improved: number;

  @ResponseProperty()
  declined: number;

  @ResponseProperty()
  noChange: number;

  @ResponseProperty({ cls: DailyAverageResponse, each: true })
  dailyAverage: DailyAverageResponse[];

  @ResponseProperty({ cls: CheckFrequencyResponse })
  frequency: CheckFrequencyResponse;

  @ResponseProperty()
  createdAt: string;

  @ResponseProperty()
  createdAtFullFormat: string;

  @ResponseProperty()
  updatedAt: string;

  @ResponseProperty()
  updatedAtFullFormat: string;

  @ResponseProperty({ cls: SearchEngineResponse })
  searchEngine: SearchEngineResponse;

  @ResponseProperty()
  isUpdated: boolean;
}
