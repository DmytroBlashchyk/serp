import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeKeywords1689060266351 implements MigrationInterface {
  name = 'ChangeKeywords1689060266351';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects_tags" DROP CONSTRAINT "FK_416a9861c673428f6923a135276"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" DROP CONSTRAINT "FK_c546454310a5b1cdcc1c18a7813"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_bb15272a8b5cf443d62e3129992"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c546454310a5b1cdcc1c18a781"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_416a9861c673428f6923a13527"`,
    );
    await queryRunner.query(
      `CREATE TABLE "batch_start_periods" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_9a32cc137901b4b1f939f04a860" UNIQUE ("name"), CONSTRAINT "PK_048314e62825b695c09fd64c0d9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "keywords_tags" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, CONSTRAINT "PK_b3fc31f3d2bbfa68988cca514cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "keywords_tags_keywords_tags" ("keywords_id" bigint NOT NULL, "keywords_tags_id" bigint NOT NULL, CONSTRAINT "PK_5e0f5e1c638749fb62c4d7038cb" PRIMARY KEY ("keywords_id", "keywords_tags_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_82b9c475c4dda2d26de3d0d081" ON "keywords_tags_keywords_tags" ("keywords_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac671596ffcbc12b91a0a678da" ON "keywords_tags_keywords_tags" ("keywords_tags_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "projects_tags_projects_tags" ("projects_id" bigint NOT NULL, "projects_tags_id" bigint NOT NULL, CONSTRAINT "PK_1fac5cac0bb6ba05a1a26bd522a" PRIMARY KEY ("projects_id", "projects_tags_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ee692aa05b843227e005193888" ON "projects_tags_projects_tags" ("projects_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1165245ec589132e4d89924f73" ON "projects_tags_projects_tags" ("projects_tags_id") `,
    );
    await queryRunner.query(`ALTER TABLE "batches" DROP COLUMN "start_time"`);
    await queryRunner.query(
      `ALTER TABLE "projects_tags" DROP CONSTRAINT "PK_1b08cf31acec794e9b8cb6c3d84"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" ADD CONSTRAINT "PK_416a9861c673428f6923a135276" PRIMARY KEY ("tags_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" DROP COLUMN "projects_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" DROP CONSTRAINT "PK_416a9861c673428f6923a135276"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" DROP COLUMN "tags_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP COLUMN "device_type_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ADD "start_period_id" bigint`,
    );
    await queryRunner.query(`ALTER TABLE "batches" ADD "frequency_id" bigint`);
    await queryRunner.query(`ALTER TABLE "keywords" ADD "batch_id" bigint`);
    await queryRunner.query(
      `ALTER TABLE "keywords" ADD "device_type_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" ADD "id" BIGSERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" ADD CONSTRAINT "PK_ade84f5af611e1caefe0422bb86" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" ADD "name" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ADD CONSTRAINT "FK_96224f24b139770c506e32fc4c5" FOREIGN KEY ("start_period_id") REFERENCES "batch_start_periods"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ADD CONSTRAINT "FK_cef89c1856dd686110a816612f0" FOREIGN KEY ("frequency_id") REFERENCES "check-frequency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords" ADD CONSTRAINT "FK_5e396c2fd75ba89ac3d32e08292" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords" ADD CONSTRAINT "FK_8120aae9b0c3c98bc4a164eadab" FOREIGN KEY ("device_type_id") REFERENCES "desktop_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords_tags_keywords_tags" ADD CONSTRAINT "FK_82b9c475c4dda2d26de3d0d0813" FOREIGN KEY ("keywords_id") REFERENCES "keywords"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords_tags_keywords_tags" ADD CONSTRAINT "FK_ac671596ffcbc12b91a0a678da1" FOREIGN KEY ("keywords_tags_id") REFERENCES "keywords_tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags_projects_tags" ADD CONSTRAINT "FK_ee692aa05b843227e0051938889" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags_projects_tags" ADD CONSTRAINT "FK_1165245ec589132e4d89924f736" FOREIGN KEY ("projects_tags_id") REFERENCES "projects_tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects_tags_projects_tags" DROP CONSTRAINT "FK_1165245ec589132e4d89924f736"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags_projects_tags" DROP CONSTRAINT "FK_ee692aa05b843227e0051938889"`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords_tags_keywords_tags" DROP CONSTRAINT "FK_ac671596ffcbc12b91a0a678da1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords_tags_keywords_tags" DROP CONSTRAINT "FK_82b9c475c4dda2d26de3d0d0813"`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords" DROP CONSTRAINT "FK_8120aae9b0c3c98bc4a164eadab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords" DROP CONSTRAINT "FK_5e396c2fd75ba89ac3d32e08292"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" DROP CONSTRAINT "FK_cef89c1856dd686110a816612f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" DROP CONSTRAINT "FK_96224f24b139770c506e32fc4c5"`,
    );
    await queryRunner.query(`ALTER TABLE "projects_tags" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "projects_tags" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" DROP CONSTRAINT "PK_ade84f5af611e1caefe0422bb86"`,
    );
    await queryRunner.query(`ALTER TABLE "projects_tags" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "keywords" DROP COLUMN "device_type_id"`,
    );
    await queryRunner.query(`ALTER TABLE "keywords" DROP COLUMN "batch_id"`);
    await queryRunner.query(`ALTER TABLE "batches" DROP COLUMN "frequency_id"`);
    await queryRunner.query(
      `ALTER TABLE "batches" DROP COLUMN "start_period_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD "device_type_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" ADD "tags_id" bigint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" ADD CONSTRAINT "PK_416a9861c673428f6923a135276" PRIMARY KEY ("tags_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" ADD "projects_id" bigint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" DROP CONSTRAINT "PK_416a9861c673428f6923a135276"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" ADD CONSTRAINT "PK_1b08cf31acec794e9b8cb6c3d84" PRIMARY KEY ("projects_id", "tags_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ADD "start_time" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1165245ec589132e4d89924f73"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ee692aa05b843227e005193888"`,
    );
    await queryRunner.query(`DROP TABLE "projects_tags_projects_tags"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ac671596ffcbc12b91a0a678da"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_82b9c475c4dda2d26de3d0d081"`,
    );
    await queryRunner.query(`DROP TABLE "keywords_tags_keywords_tags"`);
    await queryRunner.query(`DROP TABLE "keywords_tags"`);
    await queryRunner.query(`DROP TABLE "batch_start_periods"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_416a9861c673428f6923a13527" ON "projects_tags" ("tags_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c546454310a5b1cdcc1c18a781" ON "projects_tags" ("projects_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_bb15272a8b5cf443d62e3129992" FOREIGN KEY ("device_type_id") REFERENCES "desktop_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" ADD CONSTRAINT "FK_c546454310a5b1cdcc1c18a7813" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" ADD CONSTRAINT "FK_416a9861c673428f6923a135276" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
