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
  Request,
} from '@nestjs/common';
import { UsageLogsService } from './usage-logs.service';
import { CreateUsageLogDto } from './dto/create-usage-log.dto';
import { UpdateUsageLogDto } from './dto/update-usage-log.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UsageLog } from './domain/usage-log';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllUsageLogsDto } from './dto/find-all-usage-logs.dto';

@ApiTags('Usagelogs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'usage-logs',
  version: '1',
})
export class UsageLogsController {
  constructor(private readonly usageLogsService: UsageLogsService) {}

  @Post()
  @ApiCreatedResponse({
    type: UsageLog,
  })
  create(@Body() createUsageLogDto: CreateUsageLogDto) {
    return this.usageLogsService.create(createUsageLogDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(UsageLog),
  })
  async findAll(
    @Request() request,
    @Query() query: FindAllUsageLogsDto,
  ): Promise<InfinityPaginationResponseDto<UsageLog>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const user = request.user;

    return infinityPagination(
      await this.usageLogsService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
        userId: user?.id,
        userRole: user?.role?.id,
      }),
      { page, limit },
    );
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    type: UsageLog,
  })
  findById(@Param('id') id: number) {
    return this.usageLogsService.findById(+id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    type: UsageLog,
  })
  update(
    @Param('id') id: number,
    @Body() updateUsageLogDto: UpdateUsageLogDto,
  ) {
    return this.usageLogsService.update(+id, updateUsageLogDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  remove(@Param('id') id: number) {
    return this.usageLogsService.remove(+id);
  }
}
