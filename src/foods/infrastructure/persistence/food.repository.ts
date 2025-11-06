import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Food } from '../../domain/food';

export abstract class FoodRepository {
  abstract create(
    data: Omit<Food, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Food>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Food[]>;

  abstract findById(id: Food['id']): Promise<NullableType<Food>>;

  abstract findByCode(code: Food['code']): Promise<NullableType<Food>>;

  abstract findByIds(ids: Food['id'][]): Promise<Food[]>;

  abstract update(
    id: Food['id'],
    payload: DeepPartial<Food>,
  ): Promise<Food | null>;

  abstract remove(id: Food['id']): Promise<void>;
}
