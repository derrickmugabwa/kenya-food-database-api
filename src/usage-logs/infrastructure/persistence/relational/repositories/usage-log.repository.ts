import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UsageLogEntity } from '../entities/usage-log.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { UsageLog } from '../../../../domain/usage-log';
import { UsageLogRepository } from '../../usage-log.repository';
import { UsageLogMapper } from '../mappers/usage-log.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class UsageLogRelationalRepository implements UsageLogRepository {
  constructor(
    @InjectRepository(UsageLogEntity)
    private readonly usageLogRepository: Repository<UsageLogEntity>,
  ) {}

  async create(data: UsageLog): Promise<UsageLog> {
    const persistenceModel = UsageLogMapper.toPersistence(data);
    const newEntity = await this.usageLogRepository.save(
      this.usageLogRepository.create(persistenceModel),
    );
    return UsageLogMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
    apiKeyIds,
  }: {
    paginationOptions: IPaginationOptions;
    apiKeyIds?: number[];
  }): Promise<UsageLog[]> {
    const queryBuilder = this.usageLogRepository
      .createQueryBuilder('usageLog')
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit)
      .orderBy('usageLog.createdAt', 'DESC');

    // If apiKeyIds are provided, filter by them
    if (apiKeyIds && apiKeyIds.length > 0) {
      queryBuilder.where('usageLog.apiKeyId IN (:...apiKeyIds)', { apiKeyIds });
    }

    const entities = await queryBuilder.getMany();

    return entities.map((entity) => UsageLogMapper.toDomain(entity));
  }

  async findById(id: UsageLog['id']): Promise<NullableType<UsageLog>> {
    const entity = await this.usageLogRepository.findOne({
      where: { id },
    });

    return entity ? UsageLogMapper.toDomain(entity) : null;
  }

  async findByIds(ids: UsageLog['id'][]): Promise<UsageLog[]> {
    const entities = await this.usageLogRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => UsageLogMapper.toDomain(entity));
  }

  async update(
    id: UsageLog['id'],
    payload: Partial<UsageLog>,
  ): Promise<UsageLog> {
    const entity = await this.usageLogRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.usageLogRepository.save(
      this.usageLogRepository.create(
        UsageLogMapper.toPersistence({
          ...UsageLogMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return UsageLogMapper.toDomain(updatedEntity);
  }

  async remove(id: UsageLog['id']): Promise<void> {
    await this.usageLogRepository.delete(id);
  }
}
