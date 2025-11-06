import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Nutrient } from '../../domain/nutrient';

export abstract class NutrientRepository {
  abstract create(
    data: Omit<Nutrient, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Nutrient>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Nutrient[]>;

  abstract findById(id: Nutrient['id']): Promise<NullableType<Nutrient>>;

  abstract findByIds(ids: Nutrient['id'][]): Promise<Nutrient[]>;

  abstract update(
    id: Nutrient['id'],
    payload: DeepPartial<Nutrient>,
  ): Promise<Nutrient | null>;

  abstract remove(id: Nutrient['id']): Promise<void>;
}
