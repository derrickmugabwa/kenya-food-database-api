import { Injectable } from '@nestjs/common';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { FoodRepository } from './infrastructure/persistence/food.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Food } from './domain/food';
import {
  BulkUploadResponseDto,
  BulkUploadError,
} from './dto/bulk-upload-response.dto';
import { CategoriesService } from '../categories/categories.service';
import { NutrientsService } from '../nutrients/nutrients.service';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';
import * as csvParser from 'csv-parser';

@Injectable()
export class FoodsService {
  constructor(
    private readonly foodRepository: FoodRepository,
    private readonly categoriesService: CategoriesService,
    private readonly nutrientsService: NutrientsService,
  ) {}

  async create(createFoodDto: CreateFoodDto) {
    // Do not remove comment below.
    // <creating-property />

    return this.foodRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      code: createFoodDto.code,
      name: createFoodDto.name,
      category: { id: createFoodDto.categoryId } as any,
      description: createFoodDto.description,
      image: createFoodDto.imageId
        ? ({ id: createFoodDto.imageId } as any)
        : null,
      servingSize: createFoodDto.servingSize,
      servingUnit: createFoodDto.servingUnit,
    } as Food);
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.foodRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Food['id']) {
    return this.foodRepository.findById(id);
  }

  findByIds(ids: Food['id'][]) {
    return this.foodRepository.findByIds(ids);
  }

  async update(id: Food['id'], updateFoodDto: UpdateFoodDto) {
    // Do not remove comment below.
    // <updating-property />

    return this.foodRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      ...updateFoodDto,
      ...(updateFoodDto.categoryId && {
        category: { id: updateFoodDto.categoryId } as any,
      }),
      ...(updateFoodDto.imageId && {
        image: { id: updateFoodDto.imageId } as any,
      }),
    });
  }

  remove(id: Food['id']) {
    return this.foodRepository.remove(id);
  }

  async bulkUpload(file: Express.Multer.File): Promise<BulkUploadResponseDto> {
    const errors: BulkUploadError[] = [];
    let successCount = 0;
    let failedCount = 0;

    try {
      const rows = await this.parseFile(file);

      // Get all categories for validation
      const categories = await this.categoriesService.findAllWithPagination({
        paginationOptions: { page: 1, limit: 1000 },
      });
      const categoryMap = new Map(
        categories.map((cat) => [cat.name.toLowerCase(), cat.id]),
      );

      for (let i = 0; i < rows.length; i++) {
        const rowNumber = i + 2; // +2 because row 1 is header and arrays are 0-indexed
        const row = rows[i];

        try {
          // Validate required fields
          if (!row.code || !row.name || !row.categoryName) {
            errors.push({
              row: rowNumber,
              error: 'Missing required fields (code, name, or categoryName)',
            });
            failedCount++;
            continue;
          }

          // Validate category
          const categoryId = categoryMap.get(row.categoryName.toLowerCase());
          if (!categoryId) {
            errors.push({
              row: rowNumber,
              error: `Invalid category: ${row.categoryName}`,
            });
            failedCount++;
            continue;
          }

          // Check if food code already exists
          const existingFood = await this.foodRepository.findByCode(row.code);
          if (existingFood) {
            errors.push({
              row: rowNumber,
              error: `Food code ${row.code} already exists`,
            });
            failedCount++;
            continue;
          }

          // Create food
          const createdFood = await this.create({
            code: row.code,
            name: row.name,
            categoryId: categoryId,
            description: row.description || null,
            imageId: row.imageId || null,
            servingSize: row.servingSize || null,
            servingUnit: row.servingUnit || null,
          });

          // Create nutrients if any nutrient data is provided
          const hasNutrientData =
            row.energyKcal ||
            row.proteinG ||
            row.fatG ||
            row.carbohydratesG ||
            row.fiberG ||
            row.sugarG ||
            row.calciumMg ||
            row.ironMg ||
            row.vitaminAMcg ||
            row.vitaminCMg ||
            row.sodiumMg;

          if (hasNutrientData) {
            await this.nutrientsService.create({
              foodId: createdFood.id,
              energyKcal: row.energyKcal
                ? parseFloat(row.energyKcal)
                : undefined,
              proteinG: row.proteinG ? parseFloat(row.proteinG) : undefined,
              fatG: row.fatG ? parseFloat(row.fatG) : undefined,
              carbohydratesG: row.carbohydratesG
                ? parseFloat(row.carbohydratesG)
                : undefined,
              fiberG: row.fiberG ? parseFloat(row.fiberG) : undefined,
              sugarG: row.sugarG ? parseFloat(row.sugarG) : undefined,
              calciumMg: row.calciumMg ? parseFloat(row.calciumMg) : undefined,
              ironMg: row.ironMg ? parseFloat(row.ironMg) : undefined,
              vitaminAMcg: row.vitaminAMcg
                ? parseFloat(row.vitaminAMcg)
                : undefined,
              vitaminCMg: row.vitaminCMg
                ? parseFloat(row.vitaminCMg)
                : undefined,
              sodiumMg: row.sodiumMg ? parseFloat(row.sodiumMg) : undefined,
            });
          }

          successCount++;
        } catch (error) {
          errors.push({
            row: rowNumber,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          failedCount++;
        }
      }
    } catch (error) {
      throw new Error(
        `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return {
      success: successCount,
      failed: failedCount,
      errors,
    };
  }

  private async parseFile(
    file: Express.Multer.File,
  ): Promise<Record<string, any>[]> {
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      return this.parseCSV(file.buffer);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      return this.parseExcel(file.buffer);
    } else {
      throw new Error(
        'Unsupported file format. Please upload CSV or Excel file.',
      );
    }
  }

  private async parseCSV(buffer: Buffer): Promise<Record<string, any>[]> {
    return new Promise((resolve, reject) => {
      const results: Record<string, any>[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csvParser.default())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  private parseExcel(buffer: Buffer): Record<string, any>[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  }
}
