import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { ProjectInfoResponse } from 'modules/shared-links/responses/project-info.response';
import { Injectable } from '@nestjs/common';
import { GoogleDomainResponse } from 'modules/google-domains/responses/google-domain.response';
import { LanguageResponse } from 'modules/languages/responses/language.response';
import { SearchEngineResponse } from 'modules/search-engines/responses/search-engine.response';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { DeviceTypesRepository } from 'modules/device-types/repositories/device-types.repository';
import { ProjectInfoType } from 'modules/projects/types/project-info.type';
import { CompetitorResponse } from 'modules/competitors/responses/competitor.response';
import { CompetitorEntity } from 'modules/competitors/entities/competitor.entity';
import { dateHelper } from 'modules/common/utils/dateHelper';
import { formatGoogleStyleDate } from 'modules/common/utils/formatGoogleStyleDate';
import { CheckFrequencyResponse } from 'modules/check-frequency/responses/check-frequency.response';
import { ProjectTagEntity } from 'modules/tags/entities/project-tag.entity';
import { TagResponse } from 'modules/tags/responses/tag.response';
import { NoteResponse } from 'modules/notes/responses/note.response';
import { NoteEntity } from 'modules/notes/entities/note.entity';
import { KeywordTagEntity } from 'modules/tags/entities/keyword-tag.entity';
import { getFaviconHelper } from 'modules/projects/helpers/getFaviconHelper';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';

@Injectable()
export class ProjectInfoResponseFactory extends BaseResponseFactory<
  ProjectInfoType,
  ProjectInfoResponse
> {
  constructor(private readonly desktopTypesRepository: DeviceTypesRepository) {
    super();
  }
  /**
   * Assembles and returns a comprehensive response object for a given project entity.
   *
   * @param {ProjectInfoType} entity - The entity containing the core project information.
   * @param {Record<string, unknown>} [options] - Optional parameters that may include additional data like tags, notes, competitors, and device types.
   * @param {DeviceTypesEnum} [options.keywordDeviceType] - Optional device type keyword.
   * @param {ProjectTagEntity[]} [options.tags] - Optional list of project tags.
   * @param {KeywordTagEntity[]} [options.keywordTags] - Optional list of keyword tags.
   * @param {NoteEntity[]} [options.notes] - Optional list of notes associated with the project.
   * @param {CompetitorEntity[]} [options.competitors] - Optional list of competitors.
   * @return {Promise<ProjectInfoResponse>} - A promise that resolves to a ProjectInfoResponse object containing all aggregated data.
   */
  async createResponse(
    entity: ProjectInfoType,
    options?: Record<string, unknown>,
  ): Promise<ProjectInfoResponse> {
    const keywordDeviceType = options.keywordDeviceType as DeviceTypesEnum;
    const deviceType = await this.desktopTypesRepository.getDeviceTypeByName(
      keywordDeviceType ?? entity.keyword_project_type,
    );
    const tags = options.tags as ProjectTagEntity[];
    const keywordTags: KeywordTagEntity[] =
      options.keywordTags as KeywordTagEntity[];
    const notes = options.notes as NoteEntity[];
    const competitors = options.competitors as CompetitorEntity[];
    return new ProjectInfoResponse({
      id: entity.id,
      projectName: entity.project_name,
      businessName: entity.business_name,
      url: entity.url,
      favicon: entity.url ? getFaviconHelper(entity.url) : null,
      location: entity.location,
      region: new GoogleDomainResponse({
        id: entity.region_id,
        name: entity.region_name,
        countryName: entity.region_country_name,
      }),
      deviceType,
      language: new LanguageResponse({
        id: entity.language_id,
        name: entity.language_name,
        code: entity.language_code,
      }),
      searchEngine: new SearchEngineResponse({
        id: entity.search_engine_id,
        name: entity.search_engine_name,
      }),
      keywordCount: +entity.keywords_count,
      emailReportCount: entity.email_report_count,
      triggerCount: entity.trigger_count,
      competitors: competitors?.map((item) => {
        return new CompetitorResponse({ ...item });
      }),
      lastUpdate: dateHelper(entity.updated_at),
      lastUpdateFullFormat: formatGoogleStyleDate(entity.updated_at),
      updateDate: entity.update_date,
      previousUpdateDate: entity.previous_update_date,
      checkFrequency: new CheckFrequencyResponse({
        id: entity.check_frequency_id,
        name: entity.check_frequency_name,
      }),
      keywordProjectType: entity.keyword_project_type,
      numberOfTagsAttached: entity.tag_count,
      tags: tags?.map((tag) => new TagResponse({ ...tag })),
      keywordTags: keywordTags?.map((tag) => new TagResponse({ ...tag })),
      notes: notes?.map(
        (note) =>
          new NoteResponse({
            ...note,
            author: note.author.username,
          }),
      ),
      isUpdated: entity.number_of_keywords_that_are_updated > 0,
    });
  }
}
