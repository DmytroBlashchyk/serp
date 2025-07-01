import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { CountryResponse } from 'modules/countries/responses/country.response';
import { LanguageResponse } from 'modules/languages/responses/language.response';
import { GoogleDomainResponse } from 'modules/google-domains/responses/google-domain.response';
import { TagResponse } from 'modules/tags/responses/tag.response';
import { FrequencyResponse } from 'modules/email-reports/responses/frequency.response';
import { CompetitorResponse } from 'modules/competitors/responses/competitor.response';
import { NoteResponse } from 'modules/notes/responses/note.response';
import { ProjectUrlTypeResponse } from 'modules/projects/responses/project-url-type.response';

export class ApiProjectResponse extends BaseResponse<ApiProjectResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  name: string;

  @ResponseProperty()
  domain: string;

  @ResponseProperty({ nullable: true })
  favicon?: string;

  @ResponseProperty()
  keywordsCount: number;

  @ResponseProperty({ nullable: true })
  location?: string;

  @ResponseProperty({ cls: CountryResponse })
  country: CountryResponse;

  @ResponseProperty({ cls: LanguageResponse })
  language: LanguageResponse;

  @ResponseProperty()
  tagsCount: number;

  @ResponseProperty({ cls: GoogleDomainResponse })
  region: GoogleDomainResponse;

  @ResponseProperty({ cls: TagResponse, each: true, nullable: true })
  tags?: TagResponse[];

  @ResponseProperty({ cls: FrequencyResponse })
  frequency: FrequencyResponse;

  @ResponseProperty()
  competitorsCount: number;

  @ResponseProperty({ cls: CompetitorResponse, each: true, nullable: true })
  competitors?: CompetitorResponse[];

  @ResponseProperty()
  notesCount: number;

  @ResponseProperty({ cls: NoteResponse, each: true, nullable: true })
  notes?: NoteResponse[];

  @ResponseProperty({ cls: ProjectUrlTypeResponse })
  urlType: ProjectUrlTypeResponse;
}
