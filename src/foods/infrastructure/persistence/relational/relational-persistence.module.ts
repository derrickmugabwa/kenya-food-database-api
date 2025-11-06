import { Module } from '@nestjs/common';
import { FoodRepository } from '../food.repository';
import { FoodRelationalRepository } from './repositories/food.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodEntity } from './entities/food.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FoodEntity])],
  providers: [
    {
      provide: FoodRepository,
      useClass: FoodRelationalRepository,
    },
  ],
  exports: [FoodRepository],
})
export class RelationalFoodPersistenceModule {}
