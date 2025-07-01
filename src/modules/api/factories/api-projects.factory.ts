import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { ApiProjectsResponse } from 'modules/api/response/api-projects.response';
import { Injectable } from '@nestjs/common';
import { ApiProjectResponse } from 'modules/api/response/api-project.response';
import { NoteResponse } from 'modules/notes/responses/note.response';
import { getFaviconHelper } from 'modules/projects/helpers/getFaviconHelper';

@Injectable()
export class ApiProjectsFactory extends BaseResponseFactory<
  ProjectEntity[],
  ApiProjectsResponse
> {
  /**
   * Creates an API response object from a list of ProjectEntity instances.
   *
   * @param {ProjectEntity[]} entity - An array of ProjectEntity objects to be transformed into an API response.
   * @param {Record<string, unknown>} [options] - An optional object containing meta-information to be included in the response.
   * @return {Promise<ApiProjectsResponse> | ApiProjectsResponse} A promise that resolves to an ApiProjectsResponse object or the ApiProjectsResponse object itself.
   */
  createResponse(
    entity: ProjectEntity[],
    options?: Record<string, unknown>,
  ): Promise<ApiProjectsResponse> | ApiProjectsResponse {
    return new ApiProjectsResponse({
      items: entity.map((item) => {
        return new ApiProjectResponse({
          ...item,
          name: item.projectName,
          favicon: item.url ? getFaviconHelper(item.url) : null,
          domain: item.url,
          frequency: item.checkFrequency,
          location: item.location.locationName,
          notes: item.notes.map(
            (note) =>
              new NoteResponse({
                ...note,
                date: note.createdAt,
                author: note.author.username,
              }),
          ),
        });
      }),
      meta: options,
    });
  }
}
