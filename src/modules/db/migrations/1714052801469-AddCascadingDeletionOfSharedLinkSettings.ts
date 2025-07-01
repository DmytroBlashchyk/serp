import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadingDeletionOfSharedLinkSettings1714052801469
  implements MigrationInterface
{
  name = 'AddCascadingDeletionOfSharedLinkSettings1714052801469';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" DROP CONSTRAINT "FK_9cde37ab6bd6f40ebf673c9339c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" ADD CONSTRAINT "FK_9cde37ab6bd6f40ebf673c9339c" FOREIGN KEY ("shared_link_id") REFERENCES "shared_links"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" DROP CONSTRAINT "FK_9cde37ab6bd6f40ebf673c9339c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" ADD CONSTRAINT "FK_9cde37ab6bd6f40ebf673c9339c" FOREIGN KEY ("shared_link_id") REFERENCES "shared_links"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
