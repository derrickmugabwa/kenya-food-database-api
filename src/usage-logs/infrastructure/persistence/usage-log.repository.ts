import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { UsageLog } from '../../domain/usage-log';

export abstract class UsageLogRepository {
  abstract create(
    data: Omit<UsageLog, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<UsageLog>;

  abstract findAllWithPagination({
    paginationOptions,
    apiKeyIds,
  }: {
    paginationOptions: IPaginationOptions;
    apiKeyIds?: number[];
  }): Promise<UsageLog[]>;

  abstract findById(id: UsageLog['id']): Promise<NullableType<UsageLog>>;

  abstract findByIds(ids: UsageLog['id'][]): Promise<UsageLog[]>;

  abstract update(
    id: UsageLog['id'],
    payload: DeepPartial<UsageLog>,
  ): Promise<UsageLog | null>;

  abstract remove(id: UsageLog['id']): Promise<void>;
}
