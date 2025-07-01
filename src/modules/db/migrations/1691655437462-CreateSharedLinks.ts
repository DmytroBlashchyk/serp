import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSharedLinks1691655437462 implements MigrationInterface {
  name = 'CreateSharedLinks1691655437462';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "shared_link_types" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_257c8d720579f547bdbfffe1949" UNIQUE ("name"), CONSTRAINT "PK_ec90e284528171f0e1dbe8906cf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "shared_link_settings" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "one_day_change" boolean NOT NULL DEFAULT true, "seven_day_change" boolean NOT NULL DEFAULT true, "thirty_day_change" boolean NOT NULL DEFAULT true, "starting_rank" boolean NOT NULL DEFAULT true, "best_rank" boolean NOT NULL DEFAULT true, "life_time_change" boolean NOT NULL DEFAULT true, "c_pc" boolean NOT NULL DEFAULT true, "local_search_volume" boolean NOT NULL DEFAULT true, "global_search_volume" boolean NOT NULL DEFAULT true, "date_added" boolean NOT NULL DEFAULT true, "shared_link_id" bigint NOT NULL, CONSTRAINT "REL_9cde37ab6bd6f40ebf673c9339" UNIQUE ("shared_link_id"), CONSTRAINT "PK_bbf2ef747e21f3251f37a80ea59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "shared_links" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "enable_sharing" boolean NOT NULL, "require_password" boolean NOT NULL, "password" text, "link" text NOT NULL, "last_viewed" TIMESTAMP WITH TIME ZONE, "account_id" bigint, "type_id" bigint, CONSTRAINT "PK_642e2b0f619e4876e5f90a43465" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "folders_shared_links" ("folders_id" bigint NOT NULL, "shared_links_id" bigint NOT NULL, CONSTRAINT "PK_a9ebda4a4c90bd6bdeb105324ad" PRIMARY KEY ("folders_id", "shared_links_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6158a27858da5985231c21029b" ON "folders_shared_links" ("folders_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_135614d671f8e0ca78819e5731" ON "folders_shared_links" ("shared_links_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "projects_shared_links" ("projects_id" bigint NOT NULL, "shared_links_id" bigint NOT NULL, CONSTRAINT "PK_760198763fff658585f4566bf1a" PRIMARY KEY ("projects_id", "shared_links_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8c7d5d008a8aaaa70c1a4478dc" ON "projects_shared_links" ("projects_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bb1841092e20aa86191ce89814" ON "projects_shared_links" ("shared_links_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" ADD CONSTRAINT "FK_9cde37ab6bd6f40ebf673c9339c" FOREIGN KEY ("shared_link_id") REFERENCES "shared_links"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_links" ADD CONSTRAINT "FK_d24067378c8db02f50097fe5f6f" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_links" ADD CONSTRAINT "FK_6ec59b0bd04ae15791e7e74fc35" FOREIGN KEY ("type_id") REFERENCES "shared_link_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "folders_shared_links" ADD CONSTRAINT "FK_6158a27858da5985231c21029b2" FOREIGN KEY ("folders_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "folders_shared_links" ADD CONSTRAINT "FK_135614d671f8e0ca78819e5731f" FOREIGN KEY ("shared_links_id") REFERENCES "shared_links"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_shared_links" ADD CONSTRAINT "FK_8c7d5d008a8aaaa70c1a4478dc7" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_shared_links" ADD CONSTRAINT "FK_bb1841092e20aa86191ce898143" FOREIGN KEY ("shared_links_id") REFERENCES "shared_links"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects_shared_links" DROP CONSTRAINT "FK_bb1841092e20aa86191ce898143"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_shared_links" DROP CONSTRAINT "FK_8c7d5d008a8aaaa70c1a4478dc7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "folders_shared_links" DROP CONSTRAINT "FK_135614d671f8e0ca78819e5731f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "folders_shared_links" DROP CONSTRAINT "FK_6158a27858da5985231c21029b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_links" DROP CONSTRAINT "FK_6ec59b0bd04ae15791e7e74fc35"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_links" DROP CONSTRAINT "FK_d24067378c8db02f50097fe5f6f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" DROP CONSTRAINT "FK_9cde37ab6bd6f40ebf673c9339c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bb1841092e20aa86191ce89814"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8c7d5d008a8aaaa70c1a4478dc"`,
    );
    await queryRunner.query(`DROP TABLE "projects_shared_links"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_135614d671f8e0ca78819e5731"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6158a27858da5985231c21029b"`,
    );
    await queryRunner.query(`DROP TABLE "folders_shared_links"`);
    await queryRunner.query(`DROP TABLE "shared_links"`);
    await queryRunner.query(`DROP TABLE "shared_link_settings"`);
    await queryRunner.query(`DROP TABLE "shared_link_types"`);
  }
}
