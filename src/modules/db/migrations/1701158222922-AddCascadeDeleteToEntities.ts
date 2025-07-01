import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeDeleteToEntities1701158222922
  implements MigrationInterface
{
  name = 'AddCascadeDeleteToEntities1701158222922';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keywords_positions" DROP CONSTRAINT "FK_9c41a920d82de0d84e48e561204"`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords" DROP CONSTRAINT "FK_8211f4ef0ef3da634297dbc419e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "competitors_keywords_positions" DROP CONSTRAINT "FK_8b3881e09ed7cb1616b679de7cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "competitors_keywords_positions" DROP CONSTRAINT "FK_1ca5f3df553d2998819bf68149c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "competitors" DROP CONSTRAINT "FK_d8a8ca91836590d2f4996c5cd72"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_results" DROP CONSTRAINT "FK_72e77cdb302815548bfd30ff0a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords_positions" ADD CONSTRAINT "FK_9c41a920d82de0d84e48e561204" FOREIGN KEY ("keyword_id") REFERENCES "keywords"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords" ADD CONSTRAINT "FK_8211f4ef0ef3da634297dbc419e" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "competitors_keywords_positions" ADD CONSTRAINT "FK_1ca5f3df553d2998819bf68149c" FOREIGN KEY ("competitor_id") REFERENCES "competitors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "competitors_keywords_positions" ADD CONSTRAINT "FK_8b3881e09ed7cb1616b679de7cd" FOREIGN KEY ("keyword_id") REFERENCES "keywords"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "competitors" ADD CONSTRAINT "FK_d8a8ca91836590d2f4996c5cd72" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_results" ADD CONSTRAINT "FK_72e77cdb302815548bfd30ff0a3" FOREIGN KEY ("keyword_id") REFERENCES "keywords"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "search_results" DROP CONSTRAINT "FK_72e77cdb302815548bfd30ff0a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "competitors" DROP CONSTRAINT "FK_d8a8ca91836590d2f4996c5cd72"`,
    );
    await queryRunner.query(
      `ALTER TABLE "competitors_keywords_positions" DROP CONSTRAINT "FK_8b3881e09ed7cb1616b679de7cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "competitors_keywords_positions" DROP CONSTRAINT "FK_1ca5f3df553d2998819bf68149c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords" DROP CONSTRAINT "FK_8211f4ef0ef3da634297dbc419e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords_positions" DROP CONSTRAINT "FK_9c41a920d82de0d84e48e561204"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_results" ADD CONSTRAINT "FK_72e77cdb302815548bfd30ff0a3" FOREIGN KEY ("keyword_id") REFERENCES "keywords"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "competitors" ADD CONSTRAINT "FK_d8a8ca91836590d2f4996c5cd72" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "competitors_keywords_positions" ADD CONSTRAINT "FK_1ca5f3df553d2998819bf68149c" FOREIGN KEY ("competitor_id") REFERENCES "competitors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "competitors_keywords_positions" ADD CONSTRAINT "FK_8b3881e09ed7cb1616b679de7cd" FOREIGN KEY ("keyword_id") REFERENCES "keywords"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords" ADD CONSTRAINT "FK_8211f4ef0ef3da634297dbc419e" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords_positions" ADD CONSTRAINT "FK_9c41a920d82de0d84e48e561204" FOREIGN KEY ("keyword_id") REFERENCES "keywords"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
