import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOAuthTables1762077688944 implements MigrationInterface {
  name = 'CreateOAuthTables1762077688944';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "oauth_client" ("id" SERIAL NOT NULL, "clientId" character varying(100) NOT NULL, "clientSecretHash" character varying(255) NOT NULL, "name" character varying(100) NOT NULL, "description" character varying, "userId" integer NOT NULL, "scopes" text NOT NULL, "grantTypes" text NOT NULL DEFAULT 'client_credentials', "tier" character varying(20) NOT NULL DEFAULT 'free', "rateLimit" integer NOT NULL DEFAULT '1000', "status" character varying(20) NOT NULL DEFAULT 'active', "expiresAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_0c623b6d56742bcfaedc40302fb" UNIQUE ("clientId"), CONSTRAINT "PK_d6e58a7e0ec3ac17a67ba7f97cd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_62f93c521449c8564d93fedf88" ON "oauth_client" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6e08192ba84029ad1432399ca1" ON "oauth_client" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "oauth_token" ("id" SERIAL NOT NULL, "accessToken" character varying(1000) NOT NULL, "clientId" integer NOT NULL, "scopes" text NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "revoked" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4555ec0b13aa755eb9481b68113" UNIQUE ("accessToken"), CONSTRAINT "PK_7e6a25a3cc4395d1658f5b89c73" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4555ec0b13aa755eb9481b6811" ON "oauth_token" ("accessToken") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_288e817cc88c8a843d935f0d22" ON "oauth_token" ("clientId", "expiresAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth_client" ADD CONSTRAINT "FK_6e08192ba84029ad1432399ca1a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth_token" ADD CONSTRAINT "FK_73807359f788686077f5fd92de4" FOREIGN KEY ("clientId") REFERENCES "oauth_client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "oauth_token" DROP CONSTRAINT "FK_73807359f788686077f5fd92de4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth_client" DROP CONSTRAINT "FK_6e08192ba84029ad1432399ca1a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_288e817cc88c8a843d935f0d22"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4555ec0b13aa755eb9481b6811"`,
    );
    await queryRunner.query(`DROP TABLE "oauth_token"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6e08192ba84029ad1432399ca1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_62f93c521449c8564d93fedf88"`,
    );
    await queryRunner.query(`DROP TABLE "oauth_client"`);
  }
}
