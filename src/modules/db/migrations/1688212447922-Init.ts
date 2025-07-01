import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1688212447922 implements MigrationInterface {
  name = 'Init1688212447922';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_statuses" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_cd345b985cb413bab7ef2cbb3f0" UNIQUE ("name"), CONSTRAINT "PK_50cc8fb0f4810b2f3bfcef7a788" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "account_users" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "by_default" boolean NOT NULL DEFAULT false, "user_id" bigint NOT NULL, "account_id" bigint NOT NULL, "role_id" bigint, CONSTRAINT "account_user" UNIQUE ("account_id", "user_id"), CONSTRAINT "PK_0de86c382786ba5239e47025221" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "keywords" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, "project_id" bigint, CONSTRAINT "PK_4aa660a7a585ed828da68f3c28e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "countries" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, "code" text NOT NULL, "image" text NOT NULL, CONSTRAINT "UQ_fa1376321185575cf2226b1491d" UNIQUE ("name"), CONSTRAINT "UQ_b47cbb5311bad9c9ae17b8c1eda" UNIQUE ("code"), CONSTRAINT "UQ_1f748148c406b604351961c7fca" UNIQUE ("image"), CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "desktop_types" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_4961c028e26b6b7bf90c62a2727" UNIQUE ("name"), CONSTRAINT "PK_510a0212e90910731bdd4b1067e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tags" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "languages" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "code" text NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_7397752718d1c9eb873722ec9b2" UNIQUE ("code"), CONSTRAINT "UQ_9c0e155475f0aa782e4a6178969" UNIQUE ("name"), CONSTRAINT "PK_b517f827ca496b29f4d549c631d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "search_engines" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_432d37337acda8edd01742f4f4f" UNIQUE ("name"), CONSTRAINT "PK_444c85ba3794d95bdcbae072910" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "check-frequency" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_f65d23c30d9143cb7aba6229b7b" UNIQUE ("name"), CONSTRAINT "PK_2df41fb0caa4fd55313770919b0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "competitors" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "domain_name" text NOT NULL, "project_id" bigint, CONSTRAINT "PK_76a451dd0c8a51a0e0fb6284389" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notes" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "text" text NOT NULL, "project_id" bigint, CONSTRAINT "PK_af6206538ea96c4e77e9f400c3d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "projects" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "project_name" text NOT NULL, "url" text NOT NULL, "location" text, "region" text NOT NULL, "country_id" bigint, "device_type_id" bigint, "language_id" bigint, "search_engine_id" bigint, "check_frequency_id" bigint, "account_id" bigint, "creator_id" bigint, CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "username" text, "first_name" text, "last_name" text, "email" text NOT NULL, "is_email_confirmed" boolean NOT NULL DEFAULT false, "email_confirmation_token" text, "password" text, "password_reset_confirmation_token" text, "number_of_forgot_password_letter_requests" numeric(60,16) NOT NULL DEFAULT '0', "number_of_resending_mail_confirmation_letter_request" numeric(60,16) NOT NULL DEFAULT '0', "status_id" bigint NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "storage_items" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "stored_file_name" text NOT NULL, "original_file_name" text NOT NULL, "storage_path" text NOT NULL, "size_in_bytes" bigint DEFAULT '0', CONSTRAINT "PK_c6d11b74b2f352470d444a04fea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "timezones" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, CONSTRAINT "PK_589871db156cc7f92942334ab7e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "accounts" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "company_name" text, "company_url" text, "tagline" text, "twitter_link" text, "facebook_link" text, "linkedin_link" text, "email_reports" boolean NOT NULL DEFAULT true, "shared_links" boolean NOT NULL DEFAULT true, "validated_by_serpnest" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP WITH TIME ZONE, "owner_id" bigint, "country_id" bigint, "timezone_id" bigint, "company_logo_id" bigint, CONSTRAINT "REL_c6716526d4ad8be80ba7cbb7a7" UNIQUE ("company_logo_id"), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reasons_for_account_deletion" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "account_id" integer NOT NULL, "reason" text, CONSTRAINT "PK_a89b34932e1355ad2435d073f1a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "invitations" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "invitation_user" text NOT NULL, "account_id" bigint, "user_id" bigint, "role_id" bigint, CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "projects_tags" ("projects_id" bigint NOT NULL, "tags_id" bigint NOT NULL, CONSTRAINT "PK_1b08cf31acec794e9b8cb6c3d84" PRIMARY KEY ("projects_id", "tags_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c546454310a5b1cdcc1c18a781" ON "projects_tags" ("projects_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_416a9861c673428f6923a13527" ON "projects_tags" ("tags_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users_projects" ("projects_id" bigint NOT NULL, "users_id" bigint NOT NULL, CONSTRAINT "PK_6ad4d81f2fa2e2502232a6b26bb" PRIMARY KEY ("projects_id", "users_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0f4d3eb03e8a5f324bd1a0662b" ON "users_projects" ("projects_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bbbacfb30797aa9fcae20de984" ON "users_projects" ("users_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "account_users" ADD CONSTRAINT "FK_2abc621f4b881e826437646c12f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_users" ADD CONSTRAINT "FK_a8dbedf16dd542e59bbb3b510a1" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_users" ADD CONSTRAINT "FK_b1398d43e1c5c694fd1279132d0" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords" ADD CONSTRAINT "FK_8211f4ef0ef3da634297dbc419e" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "competitors" ADD CONSTRAINT "FK_d8a8ca91836590d2f4996c5cd72" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ADD CONSTRAINT "FK_64567ba716240b262710cfbfb0d" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_445fce9883e0e1e94d671360fcf" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_bb15272a8b5cf443d62e3129992" FOREIGN KEY ("device_type_id") REFERENCES "desktop_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_485fb060b27c2d3d6886762c9eb" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_9f16e7b65098de9b9c8ea572c7a" FOREIGN KEY ("search_engine_id") REFERENCES "search_engines"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_298f6d1f821430e63620af836b0" FOREIGN KEY ("check_frequency_id") REFERENCES "check-frequency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_286f70ef51cf6ecda509d85883d" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_4b86fad39217ca10aace123c7bd" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_9d295cb2f8df33c080e23acfb8f" FOREIGN KEY ("status_id") REFERENCES "user_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "FK_e6c1947a61f955558ccca3f7c46" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "FK_7a4a927a81e1e372ab4f56d0731" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "FK_03b56f487cc05959c5f76828af7" FOREIGN KEY ("timezone_id") REFERENCES "timezones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "FK_c6716526d4ad8be80ba7cbb7a72" FOREIGN KEY ("company_logo_id") REFERENCES "storage_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD CONSTRAINT "FK_84433480afca16f777aed2c445c" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD CONSTRAINT "FK_fecdffec754fa4d5cea98709776" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD CONSTRAINT "FK_e4950c4d6aa2236f5213538e01a" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" ADD CONSTRAINT "FK_c546454310a5b1cdcc1c18a7813" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" ADD CONSTRAINT "FK_416a9861c673428f6923a135276" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_projects" ADD CONSTRAINT "FK_0f4d3eb03e8a5f324bd1a0662b7" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_projects" ADD CONSTRAINT "FK_bbbacfb30797aa9fcae20de9847" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_projects" DROP CONSTRAINT "FK_bbbacfb30797aa9fcae20de9847"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_projects" DROP CONSTRAINT "FK_0f4d3eb03e8a5f324bd1a0662b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" DROP CONSTRAINT "FK_416a9861c673428f6923a135276"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_tags" DROP CONSTRAINT "FK_c546454310a5b1cdcc1c18a7813"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP CONSTRAINT "FK_e4950c4d6aa2236f5213538e01a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP CONSTRAINT "FK_fecdffec754fa4d5cea98709776"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP CONSTRAINT "FK_84433480afca16f777aed2c445c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "FK_c6716526d4ad8be80ba7cbb7a72"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "FK_03b56f487cc05959c5f76828af7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "FK_7a4a927a81e1e372ab4f56d0731"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "FK_e6c1947a61f955558ccca3f7c46"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_9d295cb2f8df33c080e23acfb8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_4b86fad39217ca10aace123c7bd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_286f70ef51cf6ecda509d85883d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_298f6d1f821430e63620af836b0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_9f16e7b65098de9b9c8ea572c7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_485fb060b27c2d3d6886762c9eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_bb15272a8b5cf443d62e3129992"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_445fce9883e0e1e94d671360fcf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notes" DROP CONSTRAINT "FK_64567ba716240b262710cfbfb0d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "competitors" DROP CONSTRAINT "FK_d8a8ca91836590d2f4996c5cd72"`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords" DROP CONSTRAINT "FK_8211f4ef0ef3da634297dbc419e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_users" DROP CONSTRAINT "FK_b1398d43e1c5c694fd1279132d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_users" DROP CONSTRAINT "FK_a8dbedf16dd542e59bbb3b510a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_users" DROP CONSTRAINT "FK_2abc621f4b881e826437646c12f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bbbacfb30797aa9fcae20de984"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0f4d3eb03e8a5f324bd1a0662b"`,
    );
    await queryRunner.query(`DROP TABLE "users_projects"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_416a9861c673428f6923a13527"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c546454310a5b1cdcc1c18a781"`,
    );
    await queryRunner.query(`DROP TABLE "projects_tags"`);
    await queryRunner.query(`DROP TABLE "invitations"`);
    await queryRunner.query(`DROP TABLE "reasons_for_account_deletion"`);
    await queryRunner.query(`DROP TABLE "accounts"`);
    await queryRunner.query(`DROP TABLE "timezones"`);
    await queryRunner.query(`DROP TABLE "storage_items"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TABLE "notes"`);
    await queryRunner.query(`DROP TABLE "competitors"`);
    await queryRunner.query(`DROP TABLE "check-frequency"`);
    await queryRunner.query(`DROP TABLE "search_engines"`);
    await queryRunner.query(`DROP TABLE "languages"`);
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(`DROP TABLE "desktop_types"`);
    await queryRunner.query(`DROP TABLE "countries"`);
    await queryRunner.query(`DROP TABLE "keywords"`);
    await queryRunner.query(`DROP TABLE "account_users"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "user_statuses"`);
  }
}
