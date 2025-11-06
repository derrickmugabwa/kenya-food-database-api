import { Nutrient } from '../../../../domain/nutrient';
import { NutrientEntity } from '../entities/nutrient.entity';

export class NutrientMapper {
  static toDomain(raw: NutrientEntity): Nutrient {
    const domainEntity = new Nutrient();
    domainEntity.id = raw.id;
    domainEntity.foodId = raw.foodId;
    domainEntity.energyKcal = raw.energyKcal;
    domainEntity.proteinG = raw.proteinG;
    domainEntity.fatG = raw.fatG;
    domainEntity.carbohydratesG = raw.carbohydratesG;
    domainEntity.fiberG = raw.fiberG;
    domainEntity.sugarG = raw.sugarG;
    domainEntity.calciumMg = raw.calciumMg;
    domainEntity.ironMg = raw.ironMg;
    domainEntity.vitaminAMcg = raw.vitaminAMcg;
    domainEntity.vitaminCMg = raw.vitaminCMg;
    domainEntity.sodiumMg = raw.sodiumMg;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Nutrient): NutrientEntity {
    const persistenceEntity = new NutrientEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.foodId = domainEntity.foodId;
    persistenceEntity.energyKcal = domainEntity.energyKcal ?? null;
    persistenceEntity.proteinG = domainEntity.proteinG ?? null;
    persistenceEntity.fatG = domainEntity.fatG ?? null;
    persistenceEntity.carbohydratesG = domainEntity.carbohydratesG ?? null;
    persistenceEntity.fiberG = domainEntity.fiberG ?? null;
    persistenceEntity.sugarG = domainEntity.sugarG ?? null;
    persistenceEntity.calciumMg = domainEntity.calciumMg ?? null;
    persistenceEntity.ironMg = domainEntity.ironMg ?? null;
    persistenceEntity.vitaminAMcg = domainEntity.vitaminAMcg ?? null;
    persistenceEntity.vitaminCMg = domainEntity.vitaminCMg ?? null;
    persistenceEntity.sodiumMg = domainEntity.sodiumMg ?? null;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
