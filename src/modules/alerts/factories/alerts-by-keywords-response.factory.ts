import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { AlertsByKeywordsResponse } from 'modules/alerts/responses/alerts-by-keywords.response';
import { Injectable } from '@nestjs/common';
import { AlertByKeywordResponse } from 'modules/alerts/responses/alert-by-keyword.response';
import { TriggerRuleResponse } from 'modules/triggers/responses/trigger-rule.response';
import { DeviceTypeResponse } from 'modules/device-types/responses/device-type.response';
import { dateHelper } from 'modules/common/utils/dateHelper';
import { formatGoogleStyleDate } from 'modules/common/utils/formatGoogleStyleDate';
import { AlertKeywordEntity } from 'modules/alerts/entities/alert-keyword.entity';
import moment from 'moment/moment';
import { getFaviconHelper } from 'modules/projects/helpers/getFaviconHelper';

@Injectable()
export class AlertsByKeywordsResponseFactory extends BaseResponseFactory<
  AlertKeywordEntity[],
  AlertsByKeywordsResponse
> {
  /**
   * Creates a response object from an array of AlertKeywordEntity and additional options.
   *
   * @param {AlertKeywordEntity[]} entity - Array of alert keyword entities that contain the data required for response construction.
   * @param {Record<string, unknown>} [options] - Optional parameters to customize the response. May contain userId and meta information.
   * @return {Promise<AlertsByKeywordsResponse> | AlertsByKeywordsResponse} The constructed response object containing alert details mapped from input entities.
   */
  createResponse(
    entity: AlertKeywordEntity[],
    options?: Record<string, unknown>,
  ): Promise<AlertsByKeywordsResponse> | AlertsByKeywordsResponse {
    return new AlertsByKeywordsResponse({
      items: entity.map((item) => {
        return new AlertByKeywordResponse({
          date: dateHelper(item.createdAt),
          dateFullFormat: formatGoogleStyleDate(item.createdAt),
          id: item.id,
          keywordId: item.keyword.id,
          keywordName: item.keyword.name,
          projectId: item.alert.trigger.project.id,
          projectName: item.alert.trigger.project.projectName,
          favicon: item.alert.trigger.project.url
            ? getFaviconHelper(item.alert.trigger.project.url)
            : null,
          rule: new TriggerRuleResponse({
            ...item.alert.trigger.rule,
          }),
          positiveChanges:
            item.keywordPositionsForDay.position <
            item.keywordPositionsForDay.previousPosition,
          newRank: item.keywordPositionsForDay.position,
          newDate: moment(item.keywordPositionsForDay.updateDate).format(
            'MMM D, YYYY',
          ),
          difference:
            item.keywordPositionsForDay.previousPosition < 101
              ? Math.abs(
                  item.keywordPositionsForDay.position -
                    item.keywordPositionsForDay.previousPosition,
                )
              : 100 - item.keywordPositionsForDay.position,
          threshold: item.alert.trigger.threshold,
          previousRank: item.keywordPositionsForDay.previousPosition,
          previousDate: moment(
            item.keywordPositionsForDay.previousUpdateDate,
          ).format('MMM D, YYYY'),
          deviceType: new DeviceTypeResponse({
            ...item.keyword.deviceType,
          }),
          viewed: !!item.views.find((view) => view.user.id === options.userId),
        });
      }),
      meta: options.meta,
    });
  }
}
