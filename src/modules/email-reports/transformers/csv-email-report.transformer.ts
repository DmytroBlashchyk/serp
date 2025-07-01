import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { Injectable } from '@nestjs/common';
import { GetKeywordsWithKeywordPositionsType } from 'modules/keywords/types/get-keywords-with-keyword-positions.type';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { KeywordTagRepository } from 'modules/tags/repositories/keyword-tag.repository';

@Injectable()
export class CsvEmailReportTransformer {
  constructor(private readonly keywordTagRepository: KeywordTagRepository) {}
  /**
   * Transforms keyword ranking data along with project details into a specific
   * formatted array of keyword information.
   *
   * @param {GetKeywordsWithKeywordPositionsType[]} keywordRanking - An array of keyword ranking data.
   * @param {ProjectEntity} project - The project entity containing details like search engine, URL, region, location, and language.
   * @return {Promise<any[]>} A promise that resolves to an array of transformed keyword data.
   */
  async transform(
    keywordRanking: GetKeywordsWithKeywordPositionsType[],
    project: ProjectEntity,
  ): Promise<any[]> {
    const data: any[] = [];
    let keywordFor = '';
    switch (project.searchEngine.name) {
      case SearchEnginesEnum.GoogleMyBusiness:
        keywordFor = `Keyword for (Business name: ${project.businessName} / ${
          project.url ? `Business URL: ${project.url} /` : ''
        } Search Engine: ${project.searchEngine.name} ${
          project.location ? `/ Location: ${project.location.locationName}` : ''
        } / Language: ${project.language.name})`;
        break;
      case SearchEnginesEnum.GoogleMaps:
        keywordFor = `Keyword for (Business Name: ${project.businessName} / ${
          project.url ? `Business URL: ${project.url} /` : ''
        } Search Engine: ${project.searchEngine.name} / Region: ${
          project.region.name
        } ${
          project.location ? `/ Location: ${project.location.locationName}` : ''
        } / Language: ${project.language.name})`;
        break;
      case SearchEnginesEnum.YouTube:
        keywordFor = `Keyword for (Video URL: ${project.url} / Search Engine: ${
          project.searchEngine.name
        } ${
          project.location ? `/ Location: ${project.location.locationName}` : ''
        } / Language: ${project.language.name})`;
        break;
      case SearchEnginesEnum.Google:
        keywordFor = `Keyword for (Domain: ${project.url} / Search Engine: ${
          project.searchEngine.name
        } / Region: ${project.region.name} ${
          project.location ? `/ Location: ${project.location.locationName}` : ''
        } / Language: ${project.language.name})`;
        break;
      default:
        keywordFor = `Keyword for (Domain: ${project.url} / Search Engine: ${
          project.searchEngine.name
        } ${
          project.location ? `/ Location: ${project.location.locationName}` : ''
        } / Language: ${project.language.name})`;
        break;
    }

    for (const item of keywordRanking) {
      const keywordTags =
        await this.keywordTagRepository.getKeywordTagsByKeywordId(item.id);
      const volume =
        project.searchEngine.name === SearchEnginesEnum.Google ||
        project.searchEngine.name === SearchEnginesEnum.Bing
          ? { Volume: `${item.search_volume?.toString()}` }
          : {};
      const cpc =
        project.searchEngine.name === SearchEnginesEnum.Google ||
        project.searchEngine.name === SearchEnginesEnum.Bing
          ? { CPC: ` ${item.cpc}` }
          : {};
      const url =
        project.searchEngine.name === SearchEnginesEnum.GoogleMaps ||
        project.searchEngine.name === SearchEnginesEnum.GoogleMyBusiness ||
        project.searchEngine.name === SearchEnginesEnum.YouTube
          ? {}
          : { URL: item.url };
      data.push({
        [keywordFor]: item.name,
        Type: item.device_type_name,
        Position: item.position < 101 ? item.position?.toString() : '>100',
        '1d': `${
          item.day1_is_improved
            ? `-${item.day1_difference?.toString()}`
            : `${item.day1_difference?.toString()}`
        }`,
        '7d': `${
          item.day7_is_improved
            ? `-${item.day7_difference?.toString()}`
            : `${item.day7_difference?.toString()}`
        }`,
        '30d': `${
          item.day30_is_improved
            ? `-${item.day30_difference?.toString()}`
            : `${item.day30_difference?.toString()}`
        }`,
        Life:
          item.life_difference > 0
            ? `${
                item.life_is_improved
                  ? `-${item.life_difference?.toString()}`
                  : `${item.life_difference?.toString()}`
              }`
            : `0`,
        Best:
          item.best_position < 101 ? item.best_position?.toString() : '>100',
        Start:
          item.first_position < 101 ? item.first_position?.toString() : '>100',
        ...volume,
        ...cpc,
        ...url,
        Tags: `${
          keywordTags.length > 0
            ? keywordTags.map((tag) => tag.name).join(', ')
            : ''
        }`,
      });
    }
    return data;
  }
}
