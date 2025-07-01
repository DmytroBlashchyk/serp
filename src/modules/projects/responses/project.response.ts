import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { DeviceTypeResponse } from 'modules/device-types/responses/device-type.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { LanguageResponse } from 'modules/languages/responses/language.response';
import { SearchEngineResponse } from 'modules/search-engines/responses/search-engine.response';
import { CountryResponse } from 'modules/countries/responses/country.response';
import { CheckFrequencyResponse } from 'modules/check-frequency/responses/check-frequency.response';
import { TagResponse } from 'modules/tags/responses/tag.response';
import { CompetitorResponse } from 'modules/competitors/responses/competitor.response';
import { NoteResponse } from 'modules/notes/responses/note.response';
import { GoogleDomainResponse } from 'modules/google-domains/responses/google-domain.response';

export class ProjectResponse extends BaseResponse<ProjectResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  projectName: string;

  @ResponseProperty()
  url: string;

  @ResponseProperty({ nullable: true })
  location?: string;

  @ResponseProperty({ cls: GoogleDomainResponse, nullable: true })
  region?: GoogleDomainResponse;

  @ResponseProperty({ cls: DeviceTypeResponse, nullable: true })
  deviceType?: DeviceTypeResponse;

  @ResponseProperty({ cls: LanguageResponse, nullable: true })
  language?: LanguageResponse;

  @ResponseProperty({ cls: SearchEngineResponse, nullable: true })
  searchEngine?: SearchEngineResponse;

  @ResponseProperty({ cls: CountryResponse, nullable: true })
  country?: CountryResponse;

  @ResponseProperty({ cls: CheckFrequencyResponse, nullable: true })
  checkFrequency?: CheckFrequencyResponse;

  @ResponseProperty({ each: true, nullable: true, cls: CompetitorResponse })
  competitors?: CompetitorResponse[];

  @ResponseProperty({ each: true, cls: TagResponse, nullable: true })
  tags?: TagResponse[];

  @ResponseProperty({ nullable: true, each: true, cls: NoteResponse })
  notes?: NoteResponse[];
}
