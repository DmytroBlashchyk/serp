import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSerpBaiduToLanguagesTable1727757213400
  implements MigrationInterface
{
  name = 'AddSerpBaiduToLanguagesTable1727757213400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "languages" ADD "serp_baidu" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "languages" DROP COLUMN "serp_baidu"`);
  }
}
