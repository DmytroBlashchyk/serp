import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { GetKeywordsWithKeywordPositionsType } from 'modules/keywords/types/get-keywords-with-keyword-positions.type';
import { KeywordRankingsResponse } from 'modules/keywords/responses/keyword-rankings.response';
import { Injectable } from '@nestjs/common';
import { KeywordRankingResponse } from 'modules/keywords/responses/keyword-ranking.response';
import { dateHelper } from 'modules/common/utils/dateHelper';
import { DailyPositionResponse } from 'modules/keywords/responses/daily-position.response';
import { LifeResponse } from 'modules/keywords/responses/life.response';
import { DeviceTypeResponse } from 'modules/device-types/responses/device-type.response';
import { PositionResponse } from 'modules/keywords/responses/position.response';
import { PositionInfoResponse } from 'modules/keywords/responses/position-info.response';
import moment from 'moment';
import { formatGoogleStyleDate } from 'modules/common/utils/formatGoogleStyleDate';
import { FirstPositionResponse } from 'modules/keywords/responses/first-position.response';
import { displayUrlHelper } from 'modules/projects/helpers/display-url.helper';

@Injectable()
export class KeywordRankingsResponseFactory extends BaseResponseFactory<
  GetKeywordsWithKeywordPositionsType[],
  KeywordRankingsResponse
> {
  /**
   * Creates a comprehensive response for keyword rankings based on the provided
   * entity data and optional parameters.
   *
   * @param {GetKeywordsWithKeywordPositionsType[]} entity - An array of keyword
   *        positions and related details to be converted to a response object.
   * @param {Record<string, unknown>} [options] - Optional parameters that may
   *        include metadata or additional configuration.
   * @return {Promise<KeywordRankingsResponse>} A promise that resolves to a
   *         KeywordRankingsResponse object containing the structured keyword
   *         ranking information.
   */
  async createResponse(
    entity: GetKeywordsWithKeywordPositionsType[],
    options?: Record<string, unknown>,
  ): Promise<KeywordRankingsResponse> {
    return new KeywordRankingsResponse({
      items: await Promise.all(
        entity.map(async (item) => {
          return new KeywordRankingResponse({
            id: item.id,
            d1: new DailyPositionResponse({
              isImproved: item.day1_is_improved,
              dash: item.day1_dash,
              changes: item.day1_difference,
              isDeclined: item.day1_is_declined,
              positionInfo: new PositionInfoResponse({
                difference: item.day1_difference,
                isDeclined: item.day1_is_declined,
                lastPosition: item.position,
                lastPositionDate: item.date
                  ? moment(item.date).format('MMM D, YYYY')
                  : null,
                periodPosition: item.day1_position,
                isImproved: item.day1_is_improved,
                positionDateForPeriod: item.day1_date
                  ? moment(item.day1_date).format('MMM D, YYYY')
                  : null,
              }),
            }),
            name: item.name,
            cpc: item.cpc,
            searchValue: item.search_volume,
            d7: new DailyPositionResponse({
              isImproved: item.day7_is_improved,
              dash: item.day7_result_dash,
              changes: item.day7_difference,
              isDeclined: item.day7_is_declined,
              positionInfo: new PositionInfoResponse({
                difference: item.day7_difference,
                isDeclined: item.day7_is_declined,
                lastPosition: item.position,
                lastPositionDate: item.date
                  ? moment(item.date).format('MMM D, YYYY')
                  : null,
                periodPosition: item.day7_position,
                isImproved: item.day7_is_improved,
                positionDateForPeriod: item.day7_date
                  ? moment(item.day7_date).format('MMM D, YYYY')
                  : null,
              }),
            }),
            d30: new DailyPositionResponse({
              isImproved: item.day30_is_improved,
              dash: item.day30_result_dash,
              changes: item.day30_difference,
              isDeclined: item.day30_is_declined,
              positionInfo: new PositionInfoResponse({
                difference: item.day30_difference,
                isDeclined: item.day30_is_declined,
                lastPosition: item.position,
                lastPositionDate: item.date
                  ? moment(item.date).format('MMM D, YYYY')
                  : null,
                periodPosition: item.day30_position,
                isImproved: item.day30_is_improved,
                positionDateForPeriod: item.day30_date
                  ? moment(item.day30_date).format('MMM D, YYYY')
                  : null,
              }),
            }),
            first: new FirstPositionResponse({
              position: item.first_position ?? 0,
              dash: item.first_position_dash,
            }),
            best: item.best_position ?? 0,
            url: item.url
              ? displayUrlHelper(item.project_domain, item.url)
              : '',
            life: new LifeResponse({
              isImproved: item.life_is_improved,
              dash: item.life_dash,
              changes: item.life_difference,
              isDeclined: item.life_is_declined,
              positionInfo: new PositionInfoResponse({
                isImproved: item.life_is_improved,
                lastPosition: item.position,
                lastPositionDate: item.date
                  ? moment(item.date).format('MMM D, YYYY')
                  : null,
                periodPosition: item.first_position,
                positionDateForPeriod: item.first_date
                  ? moment(item.first_date).format('MMM D, YYYY')
                  : null,
                isDeclined: item.life_is_declined,
                difference: item.life_difference,
              }),
            }),
            position: new PositionResponse({
              position: item.position ?? 0,
              trophy: item.position_trophy,
              greenCheckMark: item.position_green_check_mark,
              dash: item.position_dash,
            }),
            updated: item.updated_at ? dateHelper(item.updated_at) : null,
            updateAllowed: item.update_allowed,
            updatedFullFormat: item.updated_at
              ? formatGoogleStyleDate(item.updated_at)
              : null,
            positionUpdate: item.position_update,
            deviceType: new DeviceTypeResponse({
              id: item.device_type_id,
              name: item.device_type_name,
            }),
          });
        }),
      ),
      meta: options?.meta ?? undefined,
    });
  }
}
