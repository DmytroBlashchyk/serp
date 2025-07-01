import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeProjectEntity1688559318131 implements MigrationInterface {
  name = 'ChangeProjectEntity1688559318131';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "batches" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "start_time" TIMESTAMP WITH TIME ZONE NOT NULL, "updated" boolean, "batch_value_serp_id" text NOT NULL, CONSTRAINT "PK_55e7ff646e969b61d37eea5be7a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "project_url_types" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_dbc1573aade48a616c9642067eb" UNIQUE ("name"), CONSTRAINT "PK_86235514f49d97323c35b0e08fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "competitors_keywords_positions" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "position" numeric NOT NULL, "competitor_id" bigint, "keyword_id" bigint, CONSTRAINT "PK_f1632c4264183b1f98832787e57" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "keywords_positions" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "position" numeric NOT NULL, "keyword_id" bigint, CONSTRAINT "PK_1c67bf6f9afedd397b0f9851102" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "region"`);
    await queryRunner.query(`ALTER TABLE "projects" ADD "region_id" bigint`);
    await queryRunner.query(`ALTER TABLE "projects" ADD "url_type_id" bigint`);
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_6a4b82c259557790c217798c651" FOREIGN KEY ("region_id") REFERENCES "google_domains"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_91848b02ef488b1b755d3ce7eed" FOREIGN KEY ("url_type_id") REFERENCES "project_url_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "competitors_keywords_positions" ADD CONSTRAINT "FK_1ca5f3df553d2998819bf68149c" FOREIGN KEY ("competitor_id") REFERENCES "competitors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "competitors_keywords_positions" ADD CONSTRAINT "FK_8b3881e09ed7cb1616b679de7cd" FOREIGN KEY ("keyword_id") REFERENCES "keywords"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords_positions" ADD CONSTRAINT "FK_9c41a920d82de0d84e48e561204" FOREIGN KEY ("keyword_id") REFERENCES "keywords"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keywords_positions" DROP CONSTRAINT "FK_9c41a920d82de0d84e48e561204"`,
    );
    await queryRunner.query(
      `ALTER TABLE "competitors_keywords_positions" DROP CONSTRAINT "FK_8b3881e09ed7cb1616b679de7cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "competitors_keywords_positions" DROP CONSTRAINT "FK_1ca5f3df553d2998819bf68149c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_91848b02ef488b1b755d3ce7eed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_6a4b82c259557790c217798c651"`,
    );
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "url_type_id"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "region_id"`);
    await queryRunner.query(
      `ALTER TABLE "projects" ADD "region" text NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "keywords_positions"`);
    await queryRunner.query(`DROP TABLE "competitors_keywords_positions"`);
    await queryRunner.query(`DROP TABLE "project_url_types"`);
    await queryRunner.query(`DROP TABLE "batches"`);
  }
}
