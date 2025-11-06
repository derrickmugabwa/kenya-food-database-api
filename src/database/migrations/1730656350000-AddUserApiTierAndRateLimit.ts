import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserApiTierAndRateLimit1730656350000
  implements MigrationInterface
{
  name = 'AddUserApiTierAndRateLimit1730656350000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add apiTier column with default 'free'
    await queryRunner.query(
      `ALTER TABLE "user" ADD "apiTier" character varying(20) NOT NULL DEFAULT 'free'`,
    );

    // Add apiRateLimit column with default 1000
    await queryRunner.query(
      `ALTER TABLE "user" ADD "apiRateLimit" integer NOT NULL DEFAULT '1000'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove apiRateLimit column
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "apiRateLimit"`);

    // Remove apiTier column
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "apiTier"`);
  }
}
