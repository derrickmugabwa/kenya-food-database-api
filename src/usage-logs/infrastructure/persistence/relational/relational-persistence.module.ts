import { Module } from '@nestjs/common';
import { UsageLogRepository } from '../usage-log.repository';
import { UsageLogRelationalRepository } from './repositories/usage-log.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageLogEntity } from './entities/usage-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsageLogEntity])],
  providers: [
    {
      provide: UsageLogRepository,
      useClass: UsageLogRelationalRepository,
    },
  ],
  exports: [UsageLogRepository],
})
export class RelationalUsageLogPersistenceModule {}
