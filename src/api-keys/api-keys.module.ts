import {
  // do not remove this comment
  Module,
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ApiKeysController } from './api-keys.controller';
import { RelationalApiKeyPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { ApiKeyGuard } from './guards/api-key.guard';
import { UsageLogsModule } from '../usage-logs/usage-logs.module';

@Module({
  imports: [
    // do not remove this comment
    RelationalApiKeyPersistenceModule,
    UsageLogsModule,
  ],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, ApiKeyGuard],
  exports: [ApiKeysService, ApiKeyGuard, RelationalApiKeyPersistenceModule],
})
export class ApiKeysModule {}
