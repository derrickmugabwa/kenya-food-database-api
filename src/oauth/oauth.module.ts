import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OAuthService } from './oauth.service';
import { OAuthController } from './oauth.controller';
import { OAuthGuard } from './guards/oauth.guard';
import { RelationalOAuthPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { AllConfigType } from '../config/config.type';
import { UsageLogsModule } from '../usage-logs/usage-logs.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    RelationalOAuthPersistenceModule,
    forwardRef(() => UsageLogsModule),
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        secret: configService.getOrThrow('auth.secret', { infer: true }),
        signOptions: {
          expiresIn: configService.getOrThrow('auth.expires', { infer: true }),
        },
      }),
    }),
  ],
  controllers: [OAuthController],
  providers: [OAuthService, OAuthGuard],
  exports: [
    OAuthService,
    OAuthGuard,
    RelationalOAuthPersistenceModule,
    JwtModule,
  ],
})
export class OAuthModule {}
