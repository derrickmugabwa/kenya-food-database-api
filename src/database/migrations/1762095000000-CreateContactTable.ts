import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContactTable1762095000000 implements MigrationInterface {
  name = 'CreateContactTable1762095000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "contact" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "email" character varying(100) NOT NULL,
        "subject" character varying(200) NOT NULL,
        "message" character varying(2000) NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_contact" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_contact_status" ON "contact" ("status")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_contact_createdAt" ON "contact" ("createdAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_contact_createdAt"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_contact_status"`);
    await queryRunner.query(`DROP TABLE "contact"`);
  }
}
