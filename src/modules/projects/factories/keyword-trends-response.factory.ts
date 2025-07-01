import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { KeywordTrendsResponse } from 'modules/projects/responses/keyword-trends.response';
import { KeywordTrendType } from 'modules/projects/types/keyword-trend.type';
import { Injectable } from '@nestjs/common';
import { KeywordTrendResponse } from 'modules/projects/responses/keyword-trend.response';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
@Injectable()
export class KeywordTrendsResponseFactory extends BaseResponseFactory<
  KeywordTrendType[],
  KeywordTrendsResponse
> {
  /**
   * Creates a response object containing keyword trend information,
   * filtered based on specified options.
   *
   * @param {KeywordTrendType[]} entity - An array of keyword trend data.
   * @param {Record<string, unknown>} [options] - Optional filters to apply to the keyword trends.
   * @return {Promise<KeywordTrendsResponse> | KeywordTrendsResponse} A response object containing the filtered keyword trend data.
   */
  createResponse(
    entity: KeywordTrendType[],
    options?: Record<string, unknown>,
  ): Promise<KeywordTrendsResponse> | KeywordTrendsResponse {
    return new KeywordTrendsResponse({
      items: entity.map((item) => {
        return new KeywordTrendResponse({
          top3: options.top3Filter === BooleanEnum.TRUE ? item.top3 : undefined,
          date: item.date,
          fromFourToTen:
            options.fromFourToTen === BooleanEnum.TRUE
              ? item.from_four_to_ten
              : undefined,
          fromTwentyOneToFifty:
            options.fromTwentyOneToFifty === BooleanEnum.TRUE
              ? item.from_twenty_one_to_fifty
              : undefined,
          fiftyOneToOneHundred:
            options.fiftyOneToOneHundred === BooleanEnum.TRUE
              ? item.fifty_one_to_one_hundred
              : undefined,
          fromElevenToTwenty:
            options.fromElevenToTwenty === BooleanEnum.TRUE
              ? item.from_eleven_to_twenty
              : undefined,
          notRanked:
            options.notRanked === BooleanEnum.TRUE
              ? item.not_ranked
              : undefined,
          total: item.total,
        });
      }),
    });
  }
}
