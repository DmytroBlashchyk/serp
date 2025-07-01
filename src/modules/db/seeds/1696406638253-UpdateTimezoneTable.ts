import { MigrationInterface, QueryRunner } from 'typeorm';
import timezones from 'timezones-list';
import { TimezoneEntity } from 'modules/timezones/entities/timezone.entity';

export class UpdateTimezoneTable1696406638253 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const data = [];
    const timezoneRepository =
      queryRunner.manager.getRepository(TimezoneEntity);
    const allTimezones = (await queryRunner.query(
      `SELECT * FROM timezones`,
    )) as TimezoneEntity[];
    for (const item of allTimezones) {
      const result = timezones.find((timezone) => timezone.name == item.name);
      if (result) {
        data.push({ ...item, utc: result.utc, tzCode: result.tzCode });
      }
    }
    await timezoneRepository.save(data);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = queryRunner.manager.createQueryBuilder();
  }
}
