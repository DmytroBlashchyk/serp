import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RolesResponse } from 'modules/auth/responses/roles.response';
import { UserAuth } from 'modules/auth/decorators/user-auth.decorator';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { RolesService } from 'modules/users/services/roles.service';

@Controller('roles')
@ApiTags('Roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Retrieves all user roles except for the Super Admin role.
   *
   * @return {Promise<RolesResponse>} A promise that resolves to a RolesResponse object containing the list of roles.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: RolesResponse })
  @UserAuth(RoleEnum.ViewOnly, RoleEnum.Addon, RoleEnum.Admin)
  @Get()
  async getUsersRoles(): Promise<RolesResponse> {
    return this.rolesService.getAllRolesExceptSuperAdmin();
  }
}
