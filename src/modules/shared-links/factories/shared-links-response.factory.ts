import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { SharedLinksResponse } from 'modules/shared-links/responses/shared-links.response';
import { SharedLinkEntity } from 'modules/shared-links/entities/shared-link.entity';
import { Injectable } from '@nestjs/common';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { dateHelper } from 'modules/common/utils/dateHelper';
import { ConfigService } from '@nestjs/config';
import { formatGoogleStyleDate } from 'modules/common/utils/formatGoogleStyleDate';

@Injectable()
export class SharedLinksResponseFactory extends BaseResponseFactory<
  SharedLinkEntity[],
  SharedLinksResponse
> {
  constructor(private readonly configService: ConfigService) {
    super();
  }
  /**
   * Creates a response object for shared links.
   *
   * @param {SharedLinkEntity[]} entity - An array of shared link entities to be included in the response.
   * @param {Record<string, unknown>} [options] - Optional metadata or additional options to be included in the response.
   * @return {Promise<SharedLinksResponse> | SharedLinksResponse} A promise that resolves to a SharedLinksResponse object or the SharedLinksResponse object itself.
   */
  createResponse(
    entity: SharedLinkEntity[],
    options?: Record<string, unknown>,
  ): Promise<SharedLinksResponse> | SharedLinksResponse {
    return new SharedLinksResponse({
      items: entity.map((item) => {
        return {
          ...item,
          lastViewed: item.lastViewed ? dateHelper(item.lastViewed) : '',
          lastViewedFullFormat: item.lastViewed
            ? formatGoogleStyleDate(item.lastViewed)
            : '',
          link: `${this.configService.get(
            ConfigEnvEnum.APP_FRONTEND_URL,
          )}/shared/${item.link}`,
          created: dateHelper(item.createdAt),
          createdFullFormat: formatGoogleStyleDate(item.createdAt),
        };
      }),
      meta: options,
    });
  }
}
