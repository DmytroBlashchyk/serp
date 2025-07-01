import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLocations1705571094859 implements MigrationInterface {
  name = 'CreateLocations1705571094859';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "locations" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "location_name" text NOT NULL, "location_code" numeric NOT NULL, "location_code_parent" numeric, "country_iso_code" text NOT NULL, "location_type" text NOT NULL, CONSTRAINT "PK_7cc1c9e3853b94816c094825e74" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "locations"`);
  }
}
