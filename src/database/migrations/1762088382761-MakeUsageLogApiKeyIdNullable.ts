import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeUsageLogApiKeyIdNullable1762088382761
  implements MigrationInterface
{
  name = 'MakeUsageLogApiKeyIdNullable1762088382761';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usage_log" DROP CONSTRAINT "FK_f465e6a6104e8c8ef097bc9e239"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8f2d2e47ce9915e08c153e0218"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_log" ALTER COLUMN "apiKeyId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8f2d2e47ce9915e08c153e0218" ON "usage_log" ("apiKeyId", "createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_log" ADD CONSTRAINT "FK_f465e6a6104e8c8ef097bc9e239" FOREIGN KEY ("apiKeyId") REFERENCES "api_key"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usage_log" DROP CONSTRAINT "FK_f465e6a6104e8c8ef097bc9e239"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8f2d2e47ce9915e08c153e0218"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_log" ALTER COLUMN "apiKeyId" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8f2d2e47ce9915e08c153e0218" ON "usage_log" ("apiKeyId", "createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_log" ADD CONSTRAINT "FK_f465e6a6104e8c8ef097bc9e239" FOREIGN KEY ("apiKeyId") REFERENCES "api_key"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
