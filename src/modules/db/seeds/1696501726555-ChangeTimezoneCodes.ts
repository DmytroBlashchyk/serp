import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTimezoneCodes1696501726555 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE timezones SET tz_code = 'America/Anguilla' where tz_code = 'America/AnguillaSandy Hill'`,
    );
    await queryRunner.query(
      `UPDATE timezones SET tz_code = 'Pacific/Guam' where tz_code = 'Pacific/GuamVillage'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.manager.createQueryBuilder();
  }
}
