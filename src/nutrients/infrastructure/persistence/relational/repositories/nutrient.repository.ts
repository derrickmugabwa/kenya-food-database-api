import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { NutrientEntity } from '../entities/nutrient.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Nutrient } from '../../../../domain/nutrient';
import { NutrientRepository } from '../../nutrient.repository';
import { NutrientMapper } from '../mappers/nutrient.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class NutrientRelationalRepository implements NutrientRepository {
  constructor(
    @InjectRepository(NutrientEntity)
    private readonly nutrientRepository: Repository<NutrientEntity>,
  ) {}

  async create(data: Nutrient): Promise<Nutrient> {
    const persistenceModel = NutrientMapper.toPersistence(data);
    const newEntity = await this.nutrientRepository.save(
      this.nutrientRepository.create(persistenceModel),
    );
    return NutrientMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Nutrient[]> {
    const entities = await this.nutrientRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => NutrientMapper.toDomain(entity));
  }

  async findById(id: Nutrient['id']): Promise<NullableType<Nutrient>> {
    const entity = await this.nutrientRepository.findOne({
      where: { id },
    });

    return entity ? NutrientMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Nutrient['id'][]): Promise<Nutrient[]> {
    const entities = await this.nutrientRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => NutrientMapper.toDomain(entity));
  }

  async update(
    id: Nutrient['id'],
    payload: Partial<Nutrient>,
  ): Promise<Nutrient> {
    const entity = await this.nutrientRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.nutrientRepository.save(
      this.nutrientRepository.create(
        NutrientMapper.toPersistence({
          ...NutrientMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return NutrientMapper.toDomain(updatedEntity);
  }

  async remove(id: Nutrient['id']): Promise<void> {
    await this.nutrientRepository.delete(id);
  }
}
