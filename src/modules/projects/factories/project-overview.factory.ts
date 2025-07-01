import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { ProjectOverviewResponse } from 'modules/projects/responses/project-overview.response';
import { Injectable } from '@nestjs/common';
import { AveragePositionResponse } from 'modules/projects/responses/average-position.response';
import { TopResponse } from 'modules/projects/responses/top.response';
import { OverviewType } from 'modules/keywords/types/overview.type';
import { dateHelper } from 'modules/common/utils/dateHelper';
import { formatGoogleStyleDate } from 'modules/common/utils/formatGoogleStyleDate';

@Injectable()
export class ProjectOverviewFactory extends BaseResponseFactory<
  OverviewType,
  ProjectOverviewResponse
> {
  /**
   * Creates a response object containing the overview of a project.
   *
   * @param {OverviewType} entity - The entity containing the overview data.
   * @param {Object} options - Additional options for response creation.
   * @param {Date} options.projectUpdated - The date when the project was last updated.
   * @return {Promise<ProjectOverviewResponse>} A promise that resolves to a ProjectOverviewResponse object.
   */
  async createResponse(
    entity: OverviewType,
    options: any,
  ): Promise<ProjectOverviewResponse> {
    const projectUpdated = options.projectUpdated as Date;
    return new ProjectOverviewResponse({
      improved: entity.improved,
      declined: entity.declined,
      noChange: entity.no_change,
      lost: entity.lost,
      top3: new TopResponse({
        count: entity.top3,
        lostCount: entity.top3_lost,
        newCount: entity.top3_new,
      }),
      top10: new TopResponse({
        count: entity.top10,
        lostCount: entity.top10_lost,
        newCount: entity.top10_new,
      }),
      top30: new TopResponse({
        count: entity.top30,
        lostCount: entity.top30_lost,
        newCount: entity.top30_new,
      }),
      top100: new TopResponse({
        count: entity.top100,
        lostCount: entity.top100_lost,
        newCount: entity.top100_new,
      }),
      avgPos: new AveragePositionResponse({
        avgPos: entity.avg_position,
        progress: entity.avg_change,
        increasingAveragePosition: entity.increasing_average_position,
      }),
      fromDate: entity.from_date,
      toDate: entity.to_date,
      lastUpdate: projectUpdated ? dateHelper(projectUpdated) : undefined,
      lastUpdateFullFormat: projectUpdated
        ? formatGoogleStyleDate(projectUpdated)
        : undefined,
    });
  }
}
