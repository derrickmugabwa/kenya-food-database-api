// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateUsageLogDto } from './create-usage-log.dto';

export class UpdateUsageLogDto extends PartialType(CreateUsageLogDto) {}
