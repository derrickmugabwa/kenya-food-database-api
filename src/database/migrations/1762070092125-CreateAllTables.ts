import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAllTables1762070092125 implements MigrationInterface {
  name = 'CreateAllTables1762070092125';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fb080786c16de6ace7ed0b69f7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_key" DROP CONSTRAINT "UQ_fb080786c16de6ace7ed0b69f7d"`,
    );
    await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "key"`);
    await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "isActive"`);
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD "userId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD "keyHash" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD CONSTRAINT "UQ_4aacb7c1641a74534c8a96c4dc9" UNIQUE ("keyHash")`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD "keyPrefix" character varying(20) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD "status" character varying(20) NOT NULL DEFAULT 'active'`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD "tier" character varying(20) NOT NULL DEFAULT 'free'`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD "rateLimit" integer NOT NULL DEFAULT '1000'`,
    );
    await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD "name" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_277972f4944205eb29127f9bb6" ON "api_key" ("userId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4aacb7c1641a74534c8a96c4dc" ON "api_key" ("keyHash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_76229dd996d6078a68c01e9c7b" ON "api_key" ("status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD CONSTRAINT "FK_277972f4944205eb29127f9bb6c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "api_key" DROP CONSTRAINT "FK_277972f4944205eb29127f9bb6c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_76229dd996d6078a68c01e9c7b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4aacb7c1641a74534c8a96c4dc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_277972f4944205eb29127f9bb6"`,
    );
    await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD "name" character varying(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "rateLimit"`);
    await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "tier"`);
    await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "status"`);
    await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "keyPrefix"`);
    await queryRunner.query(
      `ALTER TABLE "api_key" DROP CONSTRAINT "UQ_4aacb7c1641a74534c8a96c4dc9"`,
    );
    await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "keyHash"`);
    await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD "key" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD CONSTRAINT "UQ_fb080786c16de6ace7ed0b69f7d" UNIQUE ("key")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fb080786c16de6ace7ed0b69f7" ON "api_key" ("key") `,
    );
  }
}
