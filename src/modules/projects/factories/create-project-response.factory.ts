import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { CreateProjectResponse } from 'modules/projects/responses/create-project.response';
import { Injectable } from '@nestjs/common';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { IdType } from 'modules/common/types/id-type.type';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';

/**
 * CreateProjectResponseFactory is responsible for generating responses
 * specific to project creation actions. It extends the BaseResponseFactory
 * to leverage common functionality while providing tailored responses for
 * the CreateProject workflow.
 *
 * @class
 * @extends BaseResponseFactory<ProjectEntity, CreateProjectResponse>
 * @injectable
 */
@Injectable()
export class CreateProjectResponseFactory extends BaseResponseFactory<
  ProjectEntity,
  CreateProjectResponse
> {
  constructor(private readonly accountLimitsService: AccountLimitsService) {
    super();
  }
  async createResponse(
    entity: ProjectEntity,
    options?: {
      numberOfNewKeywords: number;
      numberOfKeywordsToBeAdded: number;
      accountId: IdType;
    },
  ): Promise<CreateProjectResponse> {
    const duplicateKeywordsWereMissed =
      options.numberOfNewKeywords !== options.numberOfKeywordsToBeAdded;
    let offset;
    switch (entity.searchEngine.name) {
      case SearchEnginesEnum.YouTube:
        offset = 5;
        break;
      case SearchEnginesEnum.GoogleMyBusiness:
        offset = 5;
        break;
      default:
        break;
    }
    const keywordCount =
      await this.accountLimitsService.limitNewKeywordUpdatesToADailyLimit(
        options.accountId,
        options.numberOfKeywordsToBeAdded,
        offset,
      );
    const keywordUpdateWasSkipped =
      options.numberOfKeywordsToBeAdded != keywordCount;
    return new CreateProjectResponse({
      projectId: entity.id,
      duplicateKeywordsWereMissed,
      keywordUpdateWasSkipped,
    });
  }
}
