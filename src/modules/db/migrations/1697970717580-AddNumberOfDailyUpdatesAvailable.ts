import {MigrationInterface, QueryRunner} from "typeorm";

export class AddNumberOfDailyUpdatesAvailable1697970717580 implements MigrationInterface {
    name = 'AddNumberOfDailyUpdatesAvailable1697970717580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "number_of_daily_updates_available" numeric NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "number_of_daily_updates_available"`);
    }

}
