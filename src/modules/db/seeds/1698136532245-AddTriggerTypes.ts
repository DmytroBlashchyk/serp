import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { TriggerTypeEntity } from 'modules/triggers/entities/trigger-type.entity';
import { triggerTypes } from 'modules/db/seeds/data/1698136532245-AddTriggerTypes/triggerTypes';

export class AddTriggerTypes1698136532245 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(TriggerTypeEntity, builder, triggerTypes);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(TriggerTypeEntity, builder, triggerTypes);
  }
}
