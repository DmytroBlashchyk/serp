import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { projectUrlTypes } from 'modules/db/seeds/data/1688559514427-AddProjectUrlTypes/projectUrlTypes';
import { ProjectUrlTypeEntity } from 'modules/projects/entities/project-url-type.entity';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';

export class AddProjectUrlTypes1688559514427 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(ProjectUrlTypeEntity, builder, projectUrlTypes);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(ProjectUrlTypeEntity, builder, projectUrlTypes);
  }
}
