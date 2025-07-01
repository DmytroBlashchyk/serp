import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserSearches1702996883796 implements MigrationInterface {
  name = 'CreateUserSearches1702996883796';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_searches" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" bigint, "project_id" bigint, CONSTRAINT "PK_7c02c136d33604d6add483d34af" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_searches" ADD CONSTRAINT "FK_c5e85a562a77219e953db89c882" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_searches" ADD CONSTRAINT "FK_7351a0c417f87344dfe2f194636" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_searches" DROP CONSTRAINT "FK_7351a0c417f87344dfe2f194636"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_searches" DROP CONSTRAINT "FK_c5e85a562a77219e953db89c882"`,
    );
    await queryRunner.query(`DROP TABLE "user_searches"`);
  }
}
