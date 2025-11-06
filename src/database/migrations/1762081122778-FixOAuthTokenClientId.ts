import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixOAuthTokenClientId1762081122778 implements MigrationInterface {
  name = 'FixOAuthTokenClientId1762081122778';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "oauth_token" DROP CONSTRAINT "FK_73807359f788686077f5fd92de4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_288e817cc88c8a843d935f0d22"`,
    );
    await queryRunner.query(`ALTER TABLE "oauth_token" DROP COLUMN "clientId"`);
    await queryRunner.query(
      `ALTER TABLE "oauth_token" ADD "clientId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_288e817cc88c8a843d935f0d22" ON "oauth_token" ("clientId", "expiresAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_288e817cc88c8a843d935f0d22"`,
    );
    await queryRunner.query(`ALTER TABLE "oauth_token" DROP COLUMN "clientId"`);
    await queryRunner.query(
      `ALTER TABLE "oauth_token" ADD "clientId" integer NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_288e817cc88c8a843d935f0d22" ON "oauth_token" ("clientId", "expiresAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth_token" ADD CONSTRAINT "FK_73807359f788686077f5fd92de4" FOREIGN KEY ("clientId") REFERENCES "oauth_client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
