import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrigger1698146109384 implements MigrationInterface {
  name = 'CreateTrigger1698146109384';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "triggers_keywords" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "trigger_id" bigint, "keyword_id" bigint, CONSTRAINT "PK_2d89d82e7c7c619f77220d6f18e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "trigger_rules" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_7cee7579e0451402c22eecb07eb" UNIQUE ("name"), CONSTRAINT "PK_5ca7fe28e147151c8df045630fb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "trigger_types" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_7307bf8d7bca97dce6753bdda52" UNIQUE ("name"), CONSTRAINT "PK_da51a69d563e11af6f14342b614" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "triggers" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "threshold" numeric NOT NULL DEFAULT '0', "project_id" bigint, "rule_id" bigint, "type_id" bigint, "owner_id" bigint, CONSTRAINT "PK_c32a7768b269f07efe1fdca3216" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "trigger_recipients" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" text NOT NULL, "trigger_id" bigint, CONSTRAINT "PK_dc584addeae250aafaf05ebdebe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers_keywords" ADD CONSTRAINT "FK_0a4e302031d3c318915bcb847c3" FOREIGN KEY ("trigger_id") REFERENCES "triggers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers_keywords" ADD CONSTRAINT "FK_7d83823ffe9a45d154509e9b4d5" FOREIGN KEY ("keyword_id") REFERENCES "keywords"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers" ADD CONSTRAINT "FK_e1f7051c03aa27314e02aa34796" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers" ADD CONSTRAINT "FK_d4fa3919635a396154bc3b4879c" FOREIGN KEY ("rule_id") REFERENCES "trigger_rules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers" ADD CONSTRAINT "FK_640346ed0c564abf23ebe748631" FOREIGN KEY ("type_id") REFERENCES "trigger_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers" ADD CONSTRAINT "FK_e45ad55240ef645a192ad19cf91" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "trigger_recipients" ADD CONSTRAINT "FK_24fa8c791627a07bdf90184e164" FOREIGN KEY ("trigger_id") REFERENCES "triggers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "trigger_recipients" DROP CONSTRAINT "FK_24fa8c791627a07bdf90184e164"`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers" DROP CONSTRAINT "FK_e45ad55240ef645a192ad19cf91"`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers" DROP CONSTRAINT "FK_640346ed0c564abf23ebe748631"`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers" DROP CONSTRAINT "FK_d4fa3919635a396154bc3b4879c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers" DROP CONSTRAINT "FK_e1f7051c03aa27314e02aa34796"`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers_keywords" DROP CONSTRAINT "FK_7d83823ffe9a45d154509e9b4d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers_keywords" DROP CONSTRAINT "FK_0a4e302031d3c318915bcb847c3"`,
    );
    await queryRunner.query(`DROP TABLE "trigger_recipients"`);
    await queryRunner.query(`DROP TABLE "triggers"`);
    await queryRunner.query(`DROP TABLE "trigger_types"`);
    await queryRunner.query(`DROP TABLE "trigger_rules"`);
    await queryRunner.query(`DROP TABLE "triggers_keywords"`);
  }
}
