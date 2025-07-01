import { QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { TimezoneEntity } from 'modules/timezones/entities/timezone.entity';
import { zones } from 'modules/db/seeds/data/1686753953819-Accounts/timezones';

export class Accounts1686753953819 {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = queryRunner.manager.createQueryBuilder();
    await applySeedEnum(TimezoneEntity, builder, zones);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(TimezoneEntity, builder, zones);
  }
}
