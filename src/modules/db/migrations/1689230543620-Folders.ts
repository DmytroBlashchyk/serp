import { MigrationInterface, QueryRunner } from 'typeorm';

export class Folders1689230543620 implements MigrationInterface {
  name = 'Folders1689230543620';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "folders" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, "nsleft" integer NOT NULL DEFAULT '1', "nsright" integer NOT NULL DEFAULT '2', "parent_id" bigint, "account_id" bigint, "owner_id" bigint, CONSTRAINT "PK_8578bd31b0e7f6d6c2480dbbca8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "projects_folders" ("folders_id" bigint NOT NULL, "projects_id" bigint NOT NULL, CONSTRAINT "PK_b95cdf08dee997895dd1ce6b7c7" PRIMARY KEY ("folders_id", "projects_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_516f46c54d6efbaed712ffaf2e" ON "projects_folders" ("folders_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cf1f1474d50837b1613958d943" ON "projects_folders" ("projects_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users_folders" ("folders_id" bigint NOT NULL, "users_id" bigint NOT NULL, CONSTRAINT "PK_badb208d178ca34eb9816ff02f2" PRIMARY KEY ("folders_id", "users_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e95968069c4d56527a89b3fca9" ON "users_folders" ("folders_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9633c83b057a65ac3fc756ade9" ON "users_folders" ("users_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "projects_invitations" ("invitations_id" bigint NOT NULL, "projects_id" bigint NOT NULL, CONSTRAINT "PK_bfe17aa8615d20210ee510fca7f" PRIMARY KEY ("invitations_id", "projects_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e1406900c81855c56b3a7ba5d3" ON "projects_invitations" ("invitations_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fa98479471034e5b0f78497c99" ON "projects_invitations" ("projects_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "folders_invitations" ("invitations_id" bigint NOT NULL, "folders_id" bigint NOT NULL, CONSTRAINT "PK_63f185b6459740be73b86fe0bc0" PRIMARY KEY ("invitations_id", "folders_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5959eff13e7078a7e05fddf73b" ON "folders_invitations" ("invitations_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5102331b972ddc660ae6c6cb1e" ON "folders_invitations" ("folders_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "folders" ADD CONSTRAINT "FK_938a930768697b6ece215667d8e" FOREIGN KEY ("parent_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "folders" ADD CONSTRAINT "FK_ca762063ccc56e72d1cb71642a2" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "folders" ADD CONSTRAINT "FK_ecee72de3b100ef0bbebe47f3c4" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_folders" ADD CONSTRAINT "FK_516f46c54d6efbaed712ffaf2ec" FOREIGN KEY ("folders_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_folders" ADD CONSTRAINT "FK_cf1f1474d50837b1613958d9438" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_folders" ADD CONSTRAINT "FK_e95968069c4d56527a89b3fca96" FOREIGN KEY ("folders_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_folders" ADD CONSTRAINT "FK_9633c83b057a65ac3fc756ade99" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_invitations" ADD CONSTRAINT "FK_e1406900c81855c56b3a7ba5d33" FOREIGN KEY ("invitations_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_invitations" ADD CONSTRAINT "FK_fa98479471034e5b0f78497c99e" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "folders_invitations" ADD CONSTRAINT "FK_5959eff13e7078a7e05fddf73ba" FOREIGN KEY ("invitations_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "folders_invitations" ADD CONSTRAINT "FK_5102331b972ddc660ae6c6cb1ef" FOREIGN KEY ("folders_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "folders_invitations" DROP CONSTRAINT "FK_5102331b972ddc660ae6c6cb1ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "folders_invitations" DROP CONSTRAINT "FK_5959eff13e7078a7e05fddf73ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_invitations" DROP CONSTRAINT "FK_fa98479471034e5b0f78497c99e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_invitations" DROP CONSTRAINT "FK_e1406900c81855c56b3a7ba5d33"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_folders" DROP CONSTRAINT "FK_9633c83b057a65ac3fc756ade99"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_folders" DROP CONSTRAINT "FK_e95968069c4d56527a89b3fca96"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_folders" DROP CONSTRAINT "FK_cf1f1474d50837b1613958d9438"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_folders" DROP CONSTRAINT "FK_516f46c54d6efbaed712ffaf2ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "folders" DROP CONSTRAINT "FK_ecee72de3b100ef0bbebe47f3c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "folders" DROP CONSTRAINT "FK_ca762063ccc56e72d1cb71642a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "folders" DROP CONSTRAINT "FK_938a930768697b6ece215667d8e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5102331b972ddc660ae6c6cb1e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5959eff13e7078a7e05fddf73b"`,
    );
    await queryRunner.query(`DROP TABLE "folders_invitations"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fa98479471034e5b0f78497c99"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e1406900c81855c56b3a7ba5d3"`,
    );
    await queryRunner.query(`DROP TABLE "projects_invitations"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9633c83b057a65ac3fc756ade9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e95968069c4d56527a89b3fca9"`,
    );
    await queryRunner.query(`DROP TABLE "users_folders"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cf1f1474d50837b1613958d943"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_516f46c54d6efbaed712ffaf2e"`,
    );
    await queryRunner.query(`DROP TABLE "projects_folders"`);
    await queryRunner.query(`DROP TABLE "folders"`);
  }
}
