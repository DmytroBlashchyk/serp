import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTzCode1696415770234 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const allTimezones = await queryRunner.query(
      `UPDATE timezones SET tz_code = 'Europe/Kiev' where tz_code = 'Europe/Kyiv'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.manager.createQueryBuilder();
  }
}
