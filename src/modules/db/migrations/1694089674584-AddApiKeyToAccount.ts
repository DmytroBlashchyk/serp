import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApiKeyToAccount1694089674584 implements MigrationInterface {
  name = 'AddApiKeyToAccount1694089674584';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "accounts" ADD "api_key" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "api_key"`);
  }
}
