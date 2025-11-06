import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateNutrientDto } from './dto/create-nutrient.dto';
import { UpdateNutrientDto } from './dto/update-nutrient.dto';
import { NutrientRepository } from './infrastructure/persistence/nutrient.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Nutrient } from './domain/nutrient';

@Injectable()
export class NutrientsService {
  constructor(
    // Dependencies here
    private readonly nutrientRepository: NutrientRepository,
  ) {}

  create(createNutrientDto: CreateNutrientDto) {
    // Do not remove comment below.
    // <creating-property />

    return this.nutrientRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      ...createNutrientDto,
    } as Nutrient);
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.nutrientRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Nutrient['id']) {
    return this.nutrientRepository.findById(id);
  }

  findByIds(ids: Nutrient['id'][]) {
    return this.nutrientRepository.findByIds(ids);
  }

  async update(id: Nutrient['id'], updateNutrientDto: UpdateNutrientDto) {
    // Do not remove comment below.
    // <updating-property />

    return this.nutrientRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      ...updateNutrientDto,
    });
  }

  remove(id: Nutrient['id']) {
    return this.nutrientRepository.remove(id);
  }
}
