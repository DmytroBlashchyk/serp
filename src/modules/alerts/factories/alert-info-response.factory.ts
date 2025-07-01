import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { AlertInfoResponse } from 'modules/alerts/responses/alert-info.response';
import { AlertEntity } from 'modules/alerts/entities/alert.entity';
import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { getFaviconHelper } from 'modules/projects/helpers/getFaviconHelper';

@Injectable()
export class AlertInfoResponseFactory extends BaseResponseFactory<
  AlertEntity & { keywordCount: number },
  AlertInfoResponse
> {
  /**
   * Creates a response object based on the provided alert entity.
   *
   * @param {AlertEntity & { keywordCount: number }} entity - The alert entity containing the essential information and keyword count.
   * @return {Promise<AlertInfoResponse> | AlertInfoResponse} A promise that resolves to an AlertInfoResponse object or the object itself.
   */
  createResponse(
    entity: AlertEntity & { keywordCount: number },
  ): Promise<AlertInfoResponse> | AlertInfoResponse {
    return new AlertInfoResponse({
      id: entity.id,
      date: moment(entity.createdAt).format('MMM, D YYYY'),
      rule: entity.trigger.rule,
      projectName: entity.trigger.project.projectName,
      favicon: entity.trigger.project.url
        ? getFaviconHelper(entity.trigger.project.url)
        : null,
      url: entity.trigger.project.url,
      threshold: entity.trigger.threshold,
      affectedKeywords: entity.keywordCount,
    });
  }
}
