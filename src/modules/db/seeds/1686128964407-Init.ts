import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { RoleEntity } from 'modules/users/entities/role.entity';
import { roles } from 'modules/db/seeds/data/1686128964407-Init/roles';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { UserStatusEntity } from 'modules/users/entities/user-status.entity';
import { userStatuses } from 'modules/db/seeds/data/1686128964407-Init/userStatuses';

export class Init1686128964407 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = queryRunner.manager.createQueryBuilder();
    await applySeedEnum(RoleEntity, builder, roles);
    await applySeedEnum(UserStatusEntity, builder, userStatuses);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(RoleEntity, builder, roles);
    await revertSeedEnum(UserStatusEntity, builder, userStatuses);
  }
}
