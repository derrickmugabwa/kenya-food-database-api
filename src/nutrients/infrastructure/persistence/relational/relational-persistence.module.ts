import { Module } from '@nestjs/common';
import { NutrientRepository } from '../nutrient.repository';
import { NutrientRelationalRepository } from './repositories/nutrient.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutrientEntity } from './entities/nutrient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NutrientEntity])],
  providers: [
    {
      provide: NutrientRepository,
      useClass: NutrientRelationalRepository,
    },
  ],
  exports: [NutrientRepository],
})
export class RelationalNutrientPersistenceModule {}
