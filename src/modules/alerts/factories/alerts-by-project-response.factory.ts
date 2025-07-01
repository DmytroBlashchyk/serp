import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { AlertsByProjectResponse } from 'modules/alerts/responses/alerts-by-project.response';
import { AlertEntity } from 'modules/alerts/entities/alert.entity';
import { Injectable } from '@nestjs/common';
import { AlertByProjectResponse } from 'modules/alerts/responses/alert-by-project.response';
import { UserPayload } from 'modules/common/types/user-payload.type';
import { AlertRepository } from 'modules/alerts/repositories/alert.repository';
import { dateHelper } from 'modules/common/utils/dateHelper';
import { formatGoogleStyleDate } from 'modules/common/utils/formatGoogleStyleDate';
import { getFaviconHelper } from 'modules/projects/helpers/getFaviconHelper';

@Injectable()
export class AlertsByProjectResponseFactory extends BaseResponseFactory<
  Array<AlertEntity & { alertKeywordsCount: number }>,
  AlertsByProjectResponse
> {
  constructor(private readonly alertRepository: AlertRepository) {
    super();
  }
  /**
   * Creates a response object containing alert information by project.
   *
   * @param {Array<AlertEntity & { alertKeywordsCount: number }>} entity - An array of alert entities combined with their alert keywords count.
   * @param {Record<string, unknown>} [options] - Optional parameters for the response creation.
   * @param {UserPayload} options.user - The user payload containing user information.
   * @param {object} options.meta - Metadata to include in the response.
   * @return {Promise<AlertsByProjectResponse>} The formatted alert response by project.
   */
  async createResponse(
    entity: Array<AlertEntity & { alertKeywordsCount: number }>,
    options?: Record<string, unknown>,
  ): Promise<AlertsByProjectResponse> {
    const user = options.user as UserPayload;

    return new AlertsByProjectResponse({
      items: await Promise.all(
        entity.map(async (item) => {
          const viewed = await this.alertRepository.viewInformation(
            user.id,
            item.id,
          );
          return new AlertByProjectResponse({
            id: item.id,
            projectName: item.trigger.project.projectName,
            favicon: item.trigger.project.url
              ? getFaviconHelper(item.trigger.project.url)
              : null,
            date: dateHelper(item.createdAt),
            dateFullFormat: formatGoogleStyleDate(item.createdAt),
            rule: item.trigger.rule,
            numberOfKeywords: item.alertKeywordsCount,
            threshold: item.trigger.threshold,
            viewed,
          });
        }),
      ),
      meta: options.meta,
    });
  }
}
