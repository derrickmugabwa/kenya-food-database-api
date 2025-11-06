import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUsageLogForeignKey1762090000000
  implements MigrationInterface
{
  name = 'RemoveUsageLogForeignKey1762090000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign key constraint that references api_key table
    // This allows apiKeyId to store either API key IDs or OAuth client IDs
    await queryRunner.query(
      `ALTER TABLE "usage_log" DROP CONSTRAINT IF EXISTS "FK_f465e6a6104e8c8ef097bc9e239"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add the foreign key constraint
    // Note: This will fail if there are OAuth client IDs in the table
    await queryRunner.query(
      `ALTER TABLE "usage_log" ADD CONSTRAINT "FK_f465e6a6104e8c8ef097bc9e239" FOREIGN KEY ("apiKeyId") REFERENCES "api_key"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
