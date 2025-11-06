import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FoodEntity } from '../entities/food.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Food } from '../../../../domain/food';
import { FoodRepository } from '../../food.repository';
import { FoodMapper } from '../mappers/food.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class FoodRelationalRepository implements FoodRepository {
  constructor(
    @InjectRepository(FoodEntity)
    private readonly foodRepository: Repository<FoodEntity>,
  ) {}

  async create(data: Food): Promise<Food> {
    const persistenceModel = FoodMapper.toPersistence(data);
    const newEntity = await this.foodRepository.save(
      this.foodRepository.create(persistenceModel),
    );
    return FoodMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Food[]> {
    const entities = await this.foodRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      relations: ['nutrients'],
    });

    return entities.map((entity) => FoodMapper.toDomain(entity));
  }

  async findById(id: Food['id']): Promise<NullableType<Food>> {
    const entity = await this.foodRepository.findOne({
      where: { id },
      relations: ['nutrients'],
    });

    return entity ? FoodMapper.toDomain(entity) : null;
  }

  async findByCode(code: Food['code']): Promise<NullableType<Food>> {
    const entity = await this.foodRepository.findOne({
      where: { code },
      relations: ['nutrients'],
    });

    return entity ? FoodMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Food['id'][]): Promise<Food[]> {
    const entities = await this.foodRepository.find({
      where: { id: In(ids) },
      relations: ['nutrients'],
    });

    return entities.map((entity) => FoodMapper.toDomain(entity));
  }

  async update(id: Food['id'], payload: Partial<Food>): Promise<Food> {
    const entity = await this.foodRepository.findOne({
      where: { id },
      relations: ['nutrients'],
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.foodRepository.save(
      this.foodRepository.create(
        FoodMapper.toPersistence({
          ...FoodMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return FoodMapper.toDomain(updatedEntity);
  }

  async remove(id: Food['id']): Promise<void> {
    await this.foodRepository.softDelete(id);
  }
}
