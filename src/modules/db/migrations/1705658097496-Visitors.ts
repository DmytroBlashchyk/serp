import {MigrationInterface, QueryRunner} from "typeorm";

export class Visitors1705658097496 implements MigrationInterface {
    name = 'Visitors1705658097496'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "visitors" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "ip_address" inet NOT NULL, "number_of_daily_requests" numeric NOT NULL DEFAULT '1', CONSTRAINT "PK_d0fd6e34a516c2bb3bbec71abde" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "visitors"`);
    }

}
