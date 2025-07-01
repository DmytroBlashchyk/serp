import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrReplaceFunctionUpdateLimit1712309073491
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE OR REPLACE FUNCTION update_limit(
    IN account_id_param INTEGER,
    IN limit_type_name_param VARCHAR(255),
    IN changes_amount_param INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    current_limit INTEGER;
    new_limit INTEGER;
BEGIN
    SELECT account_limits.limit
    INTO current_limit
    FROM account_limits
    INNER JOIN limit_types ON account_limits.account_limit_type_id = limit_types.id
    WHERE account_limits.account_id = account_id_param
    AND limit_types.name = limit_type_name_param;
    new_limit := current_limit - changes_amount_param;
    IF new_limit >= 0 THEN
        UPDATE account_limits
        SET "limit" = new_limit
        WHERE account_id = account_id_param
        AND account_limits.account_limit_type_id = (
            SELECT id FROM limit_types WHERE name = limit_type_name_param
        );
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END $$ LANGUAGE plpgsql;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_limit(INTEGER, VARCHAR(255), INTEGER);`,
    );
  }
}
