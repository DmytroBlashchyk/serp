import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { GoogleDomainResponse } from 'modules/google-domains/responses/google-domain.response';
import { DeviceTypeResponse } from 'modules/device-types/responses/device-type.response';
import { LanguageResponse } from 'modules/languages/responses/language.response';
import { SearchEngineResponse } from 'modules/search-engines/responses/search-engine.response';
import { CompetitorResponse } from 'modules/competitors/responses/competitor.response';
import { CheckFrequencyResponse } from 'modules/check-frequency/responses/check-frequency.response';
import { TagResponse } from 'modules/tags/responses/tag.response';
import { NoteResponse } from 'modules/notes/responses/note.response';

export class ProjectInfoResponse extends BaseResponse<ProjectInfoResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  projectName: string;

  @ResponseProperty({ nullable: true })
  businessName?: string;

  @ResponseProperty()
  url: string;

  @ResponseProperty({ nullable: true })
  favicon?: string;

  @ResponseProperty({ nullable: true })
  location?: string;

  @ResponseProperty({ cls: GoogleDomainResponse })
  region: GoogleDomainResponse;

  @ResponseProperty({ cls: DeviceTypeResponse })
  deviceType: DeviceTypeResponse;

  @ResponseProperty({ cls: LanguageResponse })
  language: LanguageResponse;

  @ResponseProperty({ cls: SearchEngineResponse })
  searchEngine: SearchEngineResponse;

  @ResponseProperty()
  keywordCount: number;

  @ResponseProperty({ cls: CompetitorResponse, each: true })
  competitors: CompetitorResponse[];

  @ResponseProperty()
  emailReportCount: number;

  @ResponseProperty()
  triggerCount: number;

  @ResponseProperty()
  lastUpdate: string;

  @ResponseProperty()
  lastUpdateFullFormat: string;

  @ResponseProperty()
  updateDate: string;

  @ResponseProperty()
  previousUpdateDate: string;

  @ResponseProperty()
  keywordProjectType: string;

  @ResponseProperty()
  numberOfTagsAttached: number;

  @ResponseProperty({ cls: CheckFrequencyResponse })
  checkFrequency: CheckFrequencyResponse;

  @ResponseProperty({ cls: TagResponse, each: true })
  tags: TagResponse[];

  @ResponseProperty({ cls: TagResponse, each: true })
  keywordTags: TagResponse[];

  @ResponseProperty({ cls: NoteResponse, each: true })
  notes: NoteResponse[];

  @ResponseProperty()
  isUpdated: boolean;
}
