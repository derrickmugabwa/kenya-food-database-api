import {
  // do not remove this comment
  Module,
} from '@nestjs/common';
import { FoodsService } from './foods.service';
import { FoodsController } from './foods.controller';
import { RelationalFoodPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { UsageLogsModule } from '../usage-logs/usage-logs.module';
import { OAuthModule } from '../oauth/oauth.module';
import { AuthModule } from '../auth/auth.module';
import { CategoriesModule } from '../categories/categories.module';
import { NutrientsModule } from '../nutrients/nutrients.module';

@Module({
  imports: [
    // do not remove this comment
    RelationalFoodPersistenceModule,
    ApiKeysModule,
    UsageLogsModule,
    OAuthModule,
    AuthModule,
    CategoriesModule,
    NutrientsModule,
  ],
  controllers: [FoodsController],
  providers: [FoodsService],
  exports: [FoodsService, RelationalFoodPersistenceModule],
})
export class FoodsModule {}
