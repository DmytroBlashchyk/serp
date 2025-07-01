import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { TriggersByKeywordsResponse } from 'modules/triggers/responses/triggers-by-keywords.response';
import { Injectable } from '@nestjs/common';
import { TriggerByKeywordResponse } from 'modules/triggers/responses/trigger-by-keyword.response';
import { TriggerRuleResponse } from 'modules/triggers/responses/trigger-rule.response';
import { TriggerEntity } from 'modules/triggers/entities/trigger.entity';
import { TriggerKeywordRepository } from 'modules/triggers/repositories/trigger-keyword.repository';
import { getFaviconHelper } from 'modules/projects/helpers/getFaviconHelper';

@Injectable()
export class TriggersByKeywordsResponseFactory extends BaseResponseFactory<
  TriggerEntity[],
  TriggersByKeywordsResponse
> {
  constructor(
    private readonly triggerKeywordRepository: TriggerKeywordRepository,
  ) {
    super();
  }
  /**
   * Creates a response object containing trigger details based on the input entities.
   *
   * @param {TriggerEntity[]} entity - An array of TriggerEntity objects that need to be transformed into response objects.
   * @param {Record<string, unknown>} [options] - Optional metadata that can be included in the response.
   *
   * @return {Promise<TriggersByKeywordsResponse>} - A promise that resolves to a TriggersByKeywordsResponse containing the processed trigger details.
   */
  async createResponse(
    entity: TriggerEntity[],
    options?: Record<string, unknown>,
  ): Promise<TriggersByKeywordsResponse> {
    return new TriggersByKeywordsResponse({
      items: await Promise.all(
        entity.map(async (item) => {
          return new TriggerByKeywordResponse({
            ...item,
            projectName: item.project.projectName,
            favicon: item.project.url
              ? getFaviconHelper(item.project.url)
              : null,
            rule: new TriggerRuleResponse({ ...item.rule }),
            keywordCount:
              await this.triggerKeywordRepository.getTriggerKeywordsCount(
                item.id,
              ),
          });
        }),
      ),
      meta: options,
    });
  }
}
