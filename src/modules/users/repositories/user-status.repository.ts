import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { UserStatusEntity } from 'modules/users/entities/user-status.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { UserStatusEnum } from 'modules/users/enums/user-status.enum';

@Injectable()
@EntityRepository(UserStatusEntity)
export class UserStatusRepository extends BaseRepository<UserStatusEntity> {
  /**
   * Retrieves a user status entity by its name.
   *
   * @param {UserStatusEnum} name - The name of the user status to retrieve.
   * @return {Promise<UserStatusEntity>} A promise that resolves to the user status entity.
   */
  async getStatusByName(name: UserStatusEnum): Promise<UserStatusEntity> {
    return this.findOne({ where: { name } });
  }
}
