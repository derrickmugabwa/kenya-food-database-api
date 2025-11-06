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
} from '@nestjs/common';
import { NutrientsService } from './nutrients.service';
import { CreateNutrientDto } from './dto/create-nutrient.dto';
import { UpdateNutrientDto } from './dto/update-nutrient.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiSecurity,
} from '@nestjs/swagger';
import { Nutrient } from './domain/nutrient';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllNutrientsDto } from './dto/find-all-nutrients.dto';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RequireScope } from '../oauth/decorators/require-scope.decorator';
import { SCOPES } from '../oauth/constants/scopes';
import { FlexibleAuthGuard } from '../auth/guards/flexible-auth.guard';

@ApiTags('Nutrients')
@Controller({
  path: 'nutrients',
  version: '1',
})
export class NutrientsController {
  constructor(private readonly nutrientsService: NutrientsService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiCreatedResponse({
    type: Nutrient,
  })
  create(@Body() createNutrientDto: CreateNutrientDto) {
    return this.nutrientsService.create(createNutrientDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiSecurity('api-key')
  @ApiSecurity('oauth2', [SCOPES.READ_NUTRIENTS])
  @RequireScope(SCOPES.READ_NUTRIENTS)
  @UseGuards(FlexibleAuthGuard)
  @ApiOkResponse({
    type: InfinityPaginationResponse(Nutrient),
  })
  async findAll(
    @Query() query: FindAllNutrientsDto,
  ): Promise<InfinityPaginationResponseDto<Nutrient>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.nutrientsService.findAllWithPagination({
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
  @ApiSecurity('oauth2', [SCOPES.READ_NUTRIENTS])
  @RequireScope(SCOPES.READ_NUTRIENTS)
  @UseGuards(FlexibleAuthGuard)
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    type: Nutrient,
  })
  findById(@Param('id') id: number) {
    return this.nutrientsService.findById(+id);
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
    type: Nutrient,
  })
  update(
    @Param('id') id: number,
    @Body() updateNutrientDto: UpdateNutrientDto,
  ) {
    return this.nutrientsService.update(+id, updateNutrientDto);
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
    return this.nutrientsService.remove(+id);
  }
}
