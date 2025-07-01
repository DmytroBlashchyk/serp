import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { AlertKeywordsResponse } from 'modules/alerts/responses/alert-keywords.response';
import { Injectable } from '@nestjs/common';
import { AlertKeywordResponse } from 'modules/alerts/responses/alert-keyword.response';
import { DeviceTypeResponse } from 'modules/device-types/responses/device-type.response';
import moment from 'moment';
import { AlertKeywordEntity } from 'modules/alerts/entities/alert-keyword.entity';

@Injectable()
export class AlertKeywordsResponseFactory extends BaseResponseFactory<
  AlertKeywordEntity[],
  AlertKeywordsResponse
> {
  /**
   * Creates a response for alert keywords based on the provided entities and options.
   *
   * @param {AlertKeywordEntity[]} entity - An array of alert keyword entities which contain the data for each keyword.
   * @param {Record<string, unknown>} [options] - Optional configuration object for additional settings.
   * @return {Promise<AlertKeywordsResponse> | AlertKeywordsResponse} A response wrapped in an instance of AlertKeywordsResponse, either as a promise or directly.
   */
  createResponse(
    entity: AlertKeywordEntity[],
    options?: Record<string, unknown>,
  ): Promise<AlertKeywordsResponse> | AlertKeywordsResponse {
    return new AlertKeywordsResponse({
      items: entity.map((item) => {
        return new AlertKeywordResponse({
          alertKeywordId: item.id,
          keywordName: item.keyword.name,
          difference:
            item.keywordPositionsForDay.previousPosition < 101
              ? Math.abs(
                  item.keywordPositionsForDay.position -
                    item.keywordPositionsForDay.previousPosition,
                )
              : 100 - item.keywordPositionsForDay.position,
          previousPosition: item.keywordPositionsForDay.previousPosition,
          dateOfPreviousPosition: moment(
            item.keywordPositionsForDay.previousUpdateDate,
          ).format('MMM, D YYYY'),

          currentPosition: item.keywordPositionsForDay.position,
          positiveChanges:
            item.keywordPositionsForDay.position <
            item.keywordPositionsForDay.previousPosition,
          dateOfCurrentPosition: moment(
            item.keywordPositionsForDay.updateDate,
          ).format('MMM, D YYYY'),
          deviceType: new DeviceTypeResponse({
            ...item.keyword.deviceType,
          }),
        });
      }),
      meta: options.meta,
    });
  }
}
