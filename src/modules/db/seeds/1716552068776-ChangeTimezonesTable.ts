import { MigrationInterface, QueryRunner } from 'typeorm';
import { TimezoneEntity } from 'modules/timezones/entities/timezone.entity';

export class ChangeTimezonesTable1716552068776 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const repository = queryRunner.manager.getRepository(TimezoneEntity);

    const timezone = await repository
      .createQueryBuilder('timezones')
      .where('timezones.tz_code =:tzCode', { tzCode: 'Europe/Zaporizhzhia' })
      .getOne();
    if (timezone) {
      await repository.save({ ...timezone, tzCode: 'Europe/Kiev' });
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
