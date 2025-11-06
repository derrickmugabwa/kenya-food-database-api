import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AnonymousStrategy } from './strategies/anonymous.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { MailModule } from '../mail/mail.module';
import { SessionModule } from '../session/session.module';
import { UsersModule } from '../users/users.module';
import { FlexibleAuthGuard } from './guards/flexible-auth.guard';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { OAuthModule } from '../oauth/oauth.module';
import { UsageLogsModule } from '../usage-logs/usage-logs.module';

@Module({
  imports: [
    UsersModule,
    SessionModule,
    PassportModule,
    MailModule,
    JwtModule.register({}),
    ApiKeysModule,
    OAuthModule,
    forwardRef(() => UsageLogsModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    AnonymousStrategy,
    FlexibleAuthGuard,
  ],
  exports: [AuthService, FlexibleAuthGuard],
})
export class AuthModule {}
