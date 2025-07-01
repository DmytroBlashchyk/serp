import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectUrlTypeRepository } from 'modules/projects/repositories/project-url-type.repository';
import { ProjectUrlTypesResponse } from 'modules/projects/responses/project-url-types.response';
import { ProjectUrlTypesEnum } from 'modules/projects/enums/project-url-types.enum';
import { ProjectUrlTypeEntity } from 'modules/projects/entities/project-url-type.entity';

@Injectable()
export class ProjectUrlTypesService {
  constructor(
    private readonly projectUrlTypeRepository: ProjectUrlTypeRepository,
  ) {}

  /**
   * Fetches a ProjectUrlTypeEntity based on the provided name.
   *
   * @param {ProjectUrlTypesEnum} name - The name of the ProjectUrlType to retrieve.
   * @return {Promise<ProjectUrlTypeEntity>} A promise that resolves to the matching ProjectUrlTypeEntity.
   * @throws {NotFoundException} If no ProjectUrlTypeEntity is found with the given name.
   */
  async getUrlTypeByName(
    name: ProjectUrlTypesEnum,
  ): Promise<ProjectUrlTypeEntity> {
    const urlType = await this.projectUrlTypeRepository.findOne({
      where: { name },
    });
    if (!urlType) {
      throw new NotFoundException('Project Url Type not found.');
    }
    return urlType;
  }

  /**
   * Retrieves all project URL types from the repository.
   *
   * @return {Promise<ProjectUrlTypesResponse>} A promise that resolves to a response containing the list of project URL types.
   */
  async getAll(): Promise<ProjectUrlTypesResponse> {
    const projectUrlTypes = await this.projectUrlTypeRepository.find();
    return new ProjectUrlTypesResponse({ items: projectUrlTypes });
  }
}
