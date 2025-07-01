import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubscriptions1697099350994 implements MigrationInterface {
  name = 'CreateSubscriptions1697099350994';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "subscription_statuses" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_8d7cf967772a9fdb373a2d69d6f" UNIQUE ("name"), CONSTRAINT "PK_35a4a5f2aff80a083b5d1e84905" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transaction_statuses" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_5a267d699e9ca7b5fd56d9f3ca8" UNIQUE ("name"), CONSTRAINT "PK_2c2c320c9e06703c895ce0116c5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cards" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type" text NOT NULL, "last4" text NOT NULL, "expiry_year" numeric NOT NULL, "expiry_month" numeric NOT NULL, CONSTRAINT "PK_5f3269634705fdff4a9935860fc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "transaction_id" text NOT NULL, "subscription_id" text, "status_id" bigint, "card_id" bigint, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscriptions" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "available_number_of_updates" numeric NOT NULL DEFAULT '0', "activation_date" TIMESTAMP WITH TIME ZONE, "status_update_date" TIMESTAMP WITH TIME ZONE, "subscription_id" text, "customer_id" text, "account_id" bigint, "tariff_plan_id" bigint, "status_id" bigint, CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_819b9b741319d533ea9e5617eb0" FOREIGN KEY ("status_id") REFERENCES "transaction_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_80ad48141be648db2d84ff32f79" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_7c7bc85becc85aec89c103784e6" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_fbf3c6f0623d668957812341259" FOREIGN KEY ("tariff_plan_id") REFERENCES "tariff_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_481cc25c5c275ff2089ed07b8f0" FOREIGN KEY ("status_id") REFERENCES "subscription_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_481cc25c5c275ff2089ed07b8f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fbf3c6f0623d668957812341259"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_7c7bc85becc85aec89c103784e6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_80ad48141be648db2d84ff32f79"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_819b9b741319d533ea9e5617eb0"`,
    );
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TABLE "cards"`);
    await queryRunner.query(`DROP TABLE "transaction_statuses"`);
    await queryRunner.query(`DROP TABLE "subscription_statuses"`);
  }
}
