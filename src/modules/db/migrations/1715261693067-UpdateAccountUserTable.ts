import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAccountUserTable1715261693067 implements MigrationInterface {
  name = 'UpdateAccountUserTable1715261693067';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account_users" DROP CONSTRAINT "FK_a8dbedf16dd542e59bbb3b510a1"`,
    );

    await queryRunner.query(
      `ALTER TABLE "account_users" ADD CONSTRAINT "FK_a8dbedf16dd542e59bbb3b510a1" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account_users" DROP CONSTRAINT "FK_a8dbedf16dd542e59bbb3b510a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_users" ADD CONSTRAINT "FK_a8dbedf16dd542e59bbb3b510a1" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
