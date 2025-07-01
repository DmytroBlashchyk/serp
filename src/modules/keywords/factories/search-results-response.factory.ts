import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { SearchResultsResponse } from 'modules/keywords/responses/search-results.response';
import { Injectable } from '@nestjs/common';
import { SearchResultType } from 'modules/keywords/types/search-result.type';
import { SearchResultResponse } from 'modules/keywords/responses/search-result.response';

@Injectable()
export class SearchResultsResponseFactory extends BaseResponseFactory<
  { position: number; url: string; keywordPosition: boolean }[],
  SearchResultsResponse
> {
  /**
   * Creates a response object for search results.
   *
   * @param {Object[]} entity - An array of objects representing search result entities.
   * @param {number} entity[].position - The position of the search result item.
   * @param {string} entity[].url - The URL of the search result item.
   * @param {boolean} entity[].keywordPosition - Flag indicating if the keyword position is highlighted.
   * @param {Object} [options] - An optional parameter containing additional options for the response.
   * @returns {Promise<SearchResultsResponse> | SearchResultsResponse} A promise that resolves to a SearchResultsResponse instance or a SearchResultsResponse instance.
   */
  createResponse(
    entity: { position: number; url: string; keywordPosition: boolean }[],
    options?: Record<string, unknown>,
  ): Promise<SearchResultsResponse> | SearchResultsResponse {
    return new SearchResultsResponse({
      items: entity.map((item) => {
        return new SearchResultResponse({
          position: item.position,
          url: item.url,
          keywordPosition: item.keywordPosition,
        });
      }),
      meta: options,
    });
  }
}
