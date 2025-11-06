import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthClientEntity } from './entities/oauth-client.entity';
import { OAuthTokenEntity } from './entities/oauth-token.entity';
import { OAuthClientRelationalRepository } from './repositories/oauth-client.repository';
import { OAuthTokenRelationalRepository } from './repositories/oauth-token.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OAuthClientEntity, OAuthTokenEntity])],
  providers: [OAuthClientRelationalRepository, OAuthTokenRelationalRepository],
  exports: [OAuthClientRelationalRepository, OAuthTokenRelationalRepository],
})
export class RelationalOAuthPersistenceModule {}
