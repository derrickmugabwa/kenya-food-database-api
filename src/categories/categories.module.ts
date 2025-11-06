import {
  // do not remove this comment
  Module,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { RelationalCategoryPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { UsageLogsModule } from '../usage-logs/usage-logs.module';
import { OAuthModule } from '../oauth/oauth.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    // do not remove this comment
    RelationalCategoryPersistenceModule,
    ApiKeysModule,
    UsageLogsModule,
    OAuthModule,
    AuthModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService, RelationalCategoryPersistenceModule],
})
export class CategoriesModule {}
