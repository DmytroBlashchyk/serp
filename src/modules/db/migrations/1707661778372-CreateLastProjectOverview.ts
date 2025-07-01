import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLastProjectOverview1707661778372
  implements MigrationInterface
{
  name = 'CreateLastProjectOverview1707661778372';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "latest_project_overview" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "declined" double precision NOT NULL DEFAULT '0', "improved" double precision NOT NULL DEFAULT '0', "no_change" double precision NOT NULL DEFAULT '0', "lost" double precision NOT NULL DEFAULT '0', "top3" double precision NOT NULL DEFAULT '0', "top3_lost" double precision NOT NULL DEFAULT '0', "top3_new" double precision NOT NULL DEFAULT '0', "top10" double precision NOT NULL DEFAULT '0', "top10_lost" double precision NOT NULL DEFAULT '0', "top10_new" double precision NOT NULL DEFAULT '0', "top30" double precision NOT NULL DEFAULT '0', "top30_lost" double precision NOT NULL DEFAULT '0', "top30_new" double precision NOT NULL DEFAULT '0', "top100" double precision NOT NULL DEFAULT '0', "top100_lost" double precision NOT NULL DEFAULT '0', "top100_new" double precision NOT NULL DEFAULT '0', "avg" double precision NOT NULL DEFAULT '0', "avg_change" double precision NOT NULL DEFAULT '0', CONSTRAINT "PK_ac26e226e83aad51455986217c3" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "latest_project_overview"`);
  }
}
