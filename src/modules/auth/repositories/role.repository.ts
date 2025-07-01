import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { RoleEntity } from 'modules/users/entities/role.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository, In } from 'typeorm';
import { RoleEnum } from 'modules/auth/enums/role.enum';

@Injectable()
@EntityRepository(RoleEntity)
export class RoleRepository extends BaseRepository<RoleEntity> {
  /**
   * Retrieves a role entity based on the provided role name.
   *
   * @param {RoleEnum} roleName - The name of the role to be retrieved.
   * @return {Promise<RoleEntity>} - A promise that resolves to the role entity.
   */
  async getRoleByName(roleName: RoleEnum): Promise<RoleEntity> {
    return this.findOne({
      where: { name: roleName },
    });
  }

  /**
   * Fetches all roles from the database except for the 'SuperAdmin' role.
   *
   * @return {Promise<Array<RoleEntity>>} - A promise that resolves to an array of RoleEntity objects, excluding the 'SuperAdmin' role.
   */
  async getAllRolesExceptSuperAdmin(): Promise<Array<RoleEntity>> {
    return this.createQueryBuilder('roles')
      .where('roles.name != :name', { name: RoleEnum.SuperAdmin })
      .getMany();
  }
}
