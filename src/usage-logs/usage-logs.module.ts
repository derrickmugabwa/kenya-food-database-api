import {
  // do not remove this comment
  Module,
  forwardRef,
} from '@nestjs/common';
import { UsageLogsService } from './usage-logs.service';
import { UsageLogsController } from './usage-logs.controller';
import { RelationalUsageLogPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { OAuthModule } from '../oauth/oauth.module';

@Module({
  imports: [
    // do not remove this comment
    RelationalUsageLogPersistenceModule,
    forwardRef(() => OAuthModule),
  ],
  controllers: [UsageLogsController],
  providers: [UsageLogsService],
  exports: [UsageLogsService, RelationalUsageLogPersistenceModule],
})
export class UsageLogsModule {}
