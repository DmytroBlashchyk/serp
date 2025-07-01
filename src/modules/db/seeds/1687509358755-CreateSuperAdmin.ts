import { MigrationInterface, QueryRunner } from 'typeorm';
import { UserEntity } from 'modules/users/entities/user.entity';
import { superAdmin } from 'modules/db/seeds/data/1687509358755-CreateSuperAdmin/superAdmin';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { hash } from 'argon2';
import { UserStatusEntity } from 'modules/users/entities/user-status.entity';

export class CreateSuperAdmin1687509358755 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder1 = queryRunner.manager.createQueryBuilder();
    await builder1
      .from('roles', 'roles')
      .where('name = :roleName', { roleName: RoleEnum.SuperAdmin })
      .getOne();
    const status = { id: 1, name: 'Activated' } as UserStatusEntity;
    const builder3 = queryRunner.manager.createQueryBuilder();
    await builder3
      .insert()
      .into(UserEntity)
      .values({
        ...superAdmin,
        password: await hash(process.env.SUPER_ADMIN_PASSWORD),
        status,
      })
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.manager.createQueryBuilder();
  }
}
