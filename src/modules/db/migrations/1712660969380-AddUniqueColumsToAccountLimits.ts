import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueColumsToAccountLimits1712660969380
  implements MigrationInterface
{
  name = 'AddUniqueColumsToAccountLimits1712660969380';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account_limits" ADD CONSTRAINT "account_limit_type" UNIQUE ("account_id", "account_limit_type_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account_limits" DROP CONSTRAINT "account_limit_type"`,
    );
  }
}
