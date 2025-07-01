import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { ListAvailableProjectsResponse } from 'modules/projects/responses/list-available-projects.response';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { Injectable } from '@nestjs/common';
import { AvailableProjectResponse } from 'modules/projects/responses/available-project.response';
import { getFaviconHelper } from 'modules/projects/helpers/getFaviconHelper';

@Injectable()
export class ListAvailableProjectsResponseFactory extends BaseResponseFactory<
  ProjectEntity[],
  ListAvailableProjectsResponse
> {
  /**
   * Creates a response for a given list of project entities.
   *
   * @param {ProjectEntity[]} entity - The list of project entities to process.
   * @return {Promise<ListAvailableProjectsResponse>} A promise that resolves to the list of available project responses.
   */
  async createResponse(
    entity: ProjectEntity[],
  ): Promise<ListAvailableProjectsResponse> {
    return new ListAvailableProjectsResponse({
      items: await Promise.all(
        entity.map(async (item) => {
          return new AvailableProjectResponse({
            ...item,
            favicon: item.url ? getFaviconHelper(item.url) : null,
          });
        }),
      ),
    });
  }
}
