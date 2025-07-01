import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateAlertsView1698674338392 implements MigrationInterface {
    name = 'CreateAlertsView1698674338392'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "alerts_view" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "alert_id" bigint, "user_id" bigint, CONSTRAINT "PK_51a3ae59cda41226400f8ec33fd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "alerts_view" ADD CONSTRAINT "FK_b1d36843811e5716a0f485cb21d" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alerts_view" ADD CONSTRAINT "FK_05255c1c6132f8f7e31106da380" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alerts_view" DROP CONSTRAINT "FK_05255c1c6132f8f7e31106da380"`);
        await queryRunner.query(`ALTER TABLE "alerts_view" DROP CONSTRAINT "FK_b1d36843811e5716a0f485cb21d"`);
        await queryRunner.query(`DROP TABLE "alerts_view"`);
    }

}
