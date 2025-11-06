import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFoodTable1762031989195 implements MigrationInterface {
  name = 'CreateFoodTable1762031989195';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "food" ("id" SERIAL NOT NULL, "code" character varying(50) NOT NULL, "name" character varying(255) NOT NULL, "categoryId" integer NOT NULL, "description" character varying, "imageId" uuid, "servingSize" character varying(50), "servingUnit" character varying(20), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_6e7265baf8c5e8821347c01820a" UNIQUE ("code"), CONSTRAINT "PK_26d12de4b6576ff08d30c281837" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "food" ADD CONSTRAINT "FK_f08c602e9e888ed83fb8be5c3d2" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "food" ADD CONSTRAINT "FK_71899bbafc869473a896777f8a5" FOREIGN KEY ("imageId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "food" DROP CONSTRAINT "FK_71899bbafc869473a896777f8a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "food" DROP CONSTRAINT "FK_f08c602e9e888ed83fb8be5c3d2"`,
    );
    await queryRunner.query(`DROP TABLE "food"`);
  }
}
