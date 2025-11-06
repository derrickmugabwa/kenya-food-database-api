import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAllTables1762064421733 implements MigrationInterface {
  name = 'CreateAllTables1762064421733';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "api_key" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "key" character varying(255) NOT NULL, "description" character varying, "isActive" boolean NOT NULL DEFAULT true, "expiresAt" TIMESTAMP, "lastUsedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_fb080786c16de6ace7ed0b69f7d" UNIQUE ("key"), CONSTRAINT "PK_b1bd840641b8acbaad89c3d8d11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fb080786c16de6ace7ed0b69f7" ON "api_key" ("key") `,
    );
    await queryRunner.query(
      `CREATE TABLE "usage_log" ("id" SERIAL NOT NULL, "apiKeyId" integer NOT NULL, "endpoint" character varying(500) NOT NULL, "method" character varying(10) NOT NULL, "ipAddress" character varying(45), "userAgent" character varying(500), "statusCode" integer NOT NULL, "responseTime" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_93ffb2969b106e7b1396c0ff098" PRIMARY KEY ("id"))`,
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
    await queryRunner.query(`DROP TABLE "usage_log"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fb080786c16de6ace7ed0b69f7"`,
    );
    await queryRunner.query(`DROP TABLE "api_key"`);
  }
}
