import {
  // do not remove this comment
  Module,
} from '@nestjs/common';
import { NutrientsService } from './nutrients.service';
import { NutrientsController } from './nutrients.controller';
import { RelationalNutrientPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { UsageLogsModule } from '../usage-logs/usage-logs.module';
import { OAuthModule } from '../oauth/oauth.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    // do not remove this comment
    RelationalNutrientPersistenceModule,
    ApiKeysModule,
    UsageLogsModule,
    OAuthModule,
    AuthModule,
  ],
  controllers: [NutrientsController],
  providers: [NutrientsService],
  exports: [NutrientsService, RelationalNutrientPersistenceModule],
})
export class NutrientsModule {}
