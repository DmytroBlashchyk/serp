import { BaseResponse } from 'modules/common/responses/base.response';
import { IdProperty } from 'modules/common/decorators/id-property';
import { IdType } from 'modules/common/types/id-type.type';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { ContentTypeEnum } from 'modules/folders/enums/content-type.enum';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';
import { TagResponse } from 'modules/tags/responses/tag.response';
import { DailyAverageResponse } from 'modules/projects/responses/daily-average.response';
import { SearchEngineResponse } from 'modules/search-engines/responses/search-engine.response';
import { GoogleDomainResponse } from 'modules/google-domains/responses/google-domain.response';

export class ContentResponse extends BaseResponse<ContentResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  name: string;

  @ResponseProperty()
  url: string;

  @ResponseProperty({ nullable: true })
  favicon?: string;

  @ResponseProperty({ enum: ContentTypeEnum })
  type: ContentTypeEnum;

  @IdProperty()
  frequencyId: IdType;

  @ResponseProperty({ enum: CheckFrequencyEnum })
  frequencyName: CheckFrequencyEnum;

  @ResponseProperty()
  keywordsStatus: number;

  @ResponseProperty()
  updated: string;

  @ResponseProperty()
  updatedFullFormat: string;

  @ResponseProperty()
  lastModified: string;

  @ResponseProperty()
  lastModifiedFullFormat: string;

  @ResponseProperty()
  createdAt: string;

  @ResponseProperty()
  createdAtFullFormat: string;

  @ResponseProperty()
  totalKeywords: number;

  @ResponseProperty()
  deviceTypeName: string;

  @ResponseProperty()
  createdBy: string;

  @ResponseProperty()
  improved: number;

  @ResponseProperty()
  declined: number;

  @ResponseProperty()
  noChange: number;

  @ResponseProperty({ nullable: true })
  updateDate?: string;

  @ResponseProperty({ nullable: true })
  previousUpdateDate?: string;

  @ResponseProperty({ cls: DailyAverageResponse, each: true, nullable: true })
  dailyAverage: DailyAverageResponse[];

  @ResponseProperty({ cls: TagResponse, each: true, nullable: true })
  tags?: TagResponse[];

  @ResponseProperty({ cls: SearchEngineResponse, nullable: true })
  searchEngine?: SearchEngineResponse;

  @ResponseProperty({ cls: GoogleDomainResponse, nullable: true })
  region?: GoogleDomainResponse;

  @ResponseProperty()
  isUpdated: boolean;
}
