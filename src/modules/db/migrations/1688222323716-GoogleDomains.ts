import {MigrationInterface, QueryRunner} from "typeorm";

export class GoogleDomains1688222323716 implements MigrationInterface {
    name = 'GoogleDomains1688222323716'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "google_domains" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, "country_name" text NOT NULL, CONSTRAINT "UQ_0418d6494d6a092200730e35f47" UNIQUE ("name"), CONSTRAINT "PK_9ea3a529ea0257fc73e6b6671d8" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "google_domains"`);
    }

}
