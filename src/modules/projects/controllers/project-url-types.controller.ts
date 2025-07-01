import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProjectUrlTypesService } from 'modules/projects/services/project-url-types.service';
import { ProjectUrlTypesResponse } from 'modules/projects/responses/project-url-types.response';

@ApiTags('Project Url Types')
@Controller('project-url-types')
export class ProjectUrlTypesController {
  constructor(
    private readonly projectUrlTypesService: ProjectUrlTypesService,
  ) {}

  /**
   * Retrieves all project URL types.
   *
   * @return {Promise<ProjectUrlTypesResponse>} A promise that resolves to the response containing all project URL types.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: ProjectUrlTypesResponse })
  @Get()
  getAll(): Promise<ProjectUrlTypesResponse> {
    return this.projectUrlTypesService.getAll();
  }
}
