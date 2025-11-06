import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFoodAndNutrientTables1762033417191
  implements MigrationInterface
{
  name = 'CreateFoodAndNutrientTables1762033417191';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "nutrient" ("id" SERIAL NOT NULL, "foodId" integer NOT NULL, "energyKcal" numeric(10,2), "proteinG" numeric(10,2), "fatG" numeric(10,2), "carbohydratesG" numeric(10,2), "fiberG" numeric(10,2), "sugarG" numeric(10,2), "calciumMg" numeric(10,2), "ironMg" numeric(10,2), "vitaminAMcg" numeric(10,2), "vitaminCMg" numeric(10,2), "sodiumMg" numeric(10,2), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e960436138737c9f8f3933144a6" UNIQUE ("foodId"), CONSTRAINT "REL_e960436138737c9f8f3933144a" UNIQUE ("foodId"), CONSTRAINT "PK_627939b71671bf88d1a352b490e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "nutrient" ADD CONSTRAINT "FK_e960436138737c9f8f3933144a6" FOREIGN KEY ("foodId") REFERENCES "food"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nutrient" DROP CONSTRAINT "FK_e960436138737c9f8f3933144a6"`,
    );
    await queryRunner.query(`DROP TABLE "nutrient"`);
  }
}
