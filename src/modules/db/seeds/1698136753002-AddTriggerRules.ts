import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { TriggerRuleEntity } from 'modules/triggers/entities/trigger-rule.entity';
import { triggerRules } from 'modules/db/seeds/data/1698136753002-AddTriggerRules/triggerRules';

export class AddTriggerRules1698136753002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(TriggerRuleEntity, builder, triggerRules);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(TriggerRuleEntity, builder, triggerRules);
  }
}
