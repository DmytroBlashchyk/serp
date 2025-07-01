import { Injectable, NotFoundException } from '@nestjs/common';
import { RolesResponse } from 'modules/auth/responses/roles.response';
import { RoleRepository } from 'modules/auth/repositories/role.repository';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { RoleEntity } from 'modules/users/entities/role.entity';

@Injectable()
export class RolesService {
  constructor(private readonly roleRepository: RoleRepository) {}

  /**
   * Retrieves all roles from the repository except for the Super Admin role.
   *
   * @return {Promise<RolesResponse>} A promise that resolves to a RolesResponse instance containing the roles.
   */
  async getAllRolesExceptSuperAdmin(): Promise<RolesResponse> {
    const roles = await this.roleRepository.getAllRolesExceptSuperAdmin();
    return new RolesResponse({ items: roles });
  }

  /**
   * Retrieves a role entity based on the provided role name.
   *
   * @param {RoleEnum} roleName - The name of the role to retrieve.
   * @return {Promise<RoleEntity>} - A promise that resolves to the role entity.
   * @throws {NotFoundException} - If no role is found with the provided name.
   */
  async getRoleByName(roleName: RoleEnum): Promise<RoleEntity> {
    const role = await this.roleRepository.getRoleByName(roleName);
    if (!role) {
      throw new NotFoundException('Role not found.');
    }
    return role;
  }
}
