import {MigrationInterface, QueryRunner} from "typeorm";

export class AddFavicoColumnToProjectsTable1716986190379 implements MigrationInterface {
    name = 'AddFavicoColumnToProjectsTable1716986190379'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" ADD "favicon" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "favicon"`);
    }

}
