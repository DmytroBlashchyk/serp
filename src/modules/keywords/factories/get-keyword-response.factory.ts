import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { Injectable } from '@nestjs/common';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';
import { GetKeywordResponse } from 'modules/keywords/responses/get-keyword.response';
import { getFaviconHelper } from 'modules/projects/helpers/getFaviconHelper';

@Injectable()
export class GetKeywordResponseFactory extends BaseResponseFactory<
  KeywordEntity,
  GetKeywordResponse
> {
  createResponse(
    entity: KeywordEntity,
  ): Promise<GetKeywordResponse> | GetKeywordResponse {
    return new GetKeywordResponse({
      id: entity.id,
      keyword: entity.name,
      domain: entity.project.url,
      businessName: entity.project.businessName,
      favicon: entity.project.url ? getFaviconHelper(entity.project.url) : null,
      region: entity.project.region,
      competitors: entity.project.competitors,
      searchEngine: entity.project.searchEngine,
    });
  }
}
