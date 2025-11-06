import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FoodsService } from './foods.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiSecurity,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Food } from './domain/food';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllFoodsDto } from './dto/find-all-foods.dto';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RequireScope } from '../oauth/decorators/require-scope.decorator';
import { SCOPES } from '../oauth/constants/scopes';
import { FlexibleAuthGuard } from '../auth/guards/flexible-auth.guard';
import { BulkUploadResponseDto } from './dto/bulk-upload-response.dto';

@ApiTags('Foods')
@Controller({
  path: 'foods',
  version: '1',
})
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiCreatedResponse({
    type: Food,
  })
  create(@Body() createFoodDto: CreateFoodDto) {
    return this.foodsService.create(createFoodDto);
  }

  @Post('bulk-upload')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV or Excel file containing food data',
        },
      },
    },
  })
  @ApiOkResponse({
    type: BulkUploadResponseDto,
    description: 'Bulk upload result with success/failure counts',
  })
  async bulkUpload(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<BulkUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.foodsService.bulkUpload(file);
  }

  @Get()
  @ApiBearerAuth()
  @ApiSecurity('api-key')
  @ApiSecurity('oauth2', [SCOPES.READ_FOODS])
  @RequireScope(SCOPES.READ_FOODS)
  @UseGuards(FlexibleAuthGuard)
  @ApiOkResponse({
    type: InfinityPaginationResponse(Food),
  })
  async findAll(
    @Query() query: FindAllFoodsDto,
  ): Promise<InfinityPaginationResponseDto<Food>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.foodsService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiSecurity('api-key')
  @ApiSecurity('oauth2', [SCOPES.READ_FOODS])
  @RequireScope(SCOPES.READ_FOODS)
  @UseGuards(FlexibleAuthGuard)
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    type: Food,
  })
  findById(@Param('id') id: number) {
    return this.foodsService.findById(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    type: Food,
  })
  update(@Param('id') id: number, @Body() updateFoodDto: UpdateFoodDto) {
    return this.foodsService.update(+id, updateFoodDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  remove(@Param('id') id: number) {
    return this.foodsService.remove(+id);
  }
}
