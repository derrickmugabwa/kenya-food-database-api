import { Food } from '../../../../domain/food';
import { FoodEntity } from '../entities/food.entity';
import { CategoryMapper } from '../../../../../categories/infrastructure/persistence/relational/mappers/category.mapper';
import { FileMapper } from '../../../../../files/infrastructure/persistence/relational/mappers/file.mapper';
import { NutrientMapper } from '../../../../../nutrients/infrastructure/persistence/relational/mappers/nutrient.mapper';

export class FoodMapper {
  static toDomain(raw: FoodEntity): Food {
    const domainEntity = new Food();
    domainEntity.id = raw.id;
    domainEntity.code = raw.code;
    domainEntity.name = raw.name;
    if (raw.category) {
      domainEntity.category = CategoryMapper.toDomain(raw.category);
    }
    domainEntity.description = raw.description;
    if (raw.image) {
      domainEntity.image = FileMapper.toDomain(raw.image);
    }
    domainEntity.servingSize = raw.servingSize;
    domainEntity.servingUnit = raw.servingUnit;
    if (raw.nutrients) {
      domainEntity.nutrients = NutrientMapper.toDomain(raw.nutrients);
    }
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Food): FoodEntity {
    const persistenceEntity = new FoodEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.code = domainEntity.code;
    persistenceEntity.name = domainEntity.name;
    if (domainEntity.category) {
      persistenceEntity.categoryId = domainEntity.category.id;
    }
    persistenceEntity.description = domainEntity.description ?? null;
    if (domainEntity.image) {
      persistenceEntity.imageId = domainEntity.image.id;
    }
    persistenceEntity.servingSize = domainEntity.servingSize ?? null;
    persistenceEntity.servingUnit = domainEntity.servingUnit ?? null;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt ?? null;

    return persistenceEntity;
  }
}
