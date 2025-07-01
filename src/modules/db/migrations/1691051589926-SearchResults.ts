import { MigrationInterface, QueryRunner } from 'typeorm';

export class SearchResults1691051589926 implements MigrationInterface {
  name = 'SearchResults1691051589926';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "search_results" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "result" jsonb, "keyword_id" bigint, CONSTRAINT "PK_6557776eaad0d49fad340bdb49c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_results" ADD CONSTRAINT "FK_72e77cdb302815548bfd30ff0a3" FOREIGN KEY ("keyword_id") REFERENCES "keywords"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "search_results" DROP CONSTRAINT "FK_72e77cdb302815548bfd30ff0a3"`,
    );
    await queryRunner.query(`DROP TABLE "search_results"`);
  }
}
