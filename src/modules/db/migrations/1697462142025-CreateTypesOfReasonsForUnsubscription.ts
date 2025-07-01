import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTypesOfReasonsForUnsubscription1697462142025
  implements MigrationInterface
{
  name = 'CreateTypesOfReasonsForUnsubscription1697462142025';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "types_of_reasons_for_unsubscription" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_39ac6d01afba24dd371e23f049b" UNIQUE ("name"), CONSTRAINT "PK_8b0a624870fb1c100944c1f1297" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reasons_for_unsubscription" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "account_id" integer NOT NULL, "reason" text, "type_id" bigint, CONSTRAINT "PK_c8f2800cb2dcc3671df0cb6c114" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "reasons_for_unsubscription" ADD CONSTRAINT "FK_6bd7e59b72f5b4e930dcbacb8fd" FOREIGN KEY ("type_id") REFERENCES "types_of_reasons_for_unsubscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reasons_for_unsubscription" DROP CONSTRAINT "FK_6bd7e59b72f5b4e930dcbacb8fd"`,
    );
    await queryRunner.query(`DROP TABLE "reasons_for_unsubscription"`);
    await queryRunner.query(`DROP TABLE "types_of_reasons_for_unsubscription"`);
  }
}
