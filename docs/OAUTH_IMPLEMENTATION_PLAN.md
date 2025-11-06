# OAuth 2.0 Client Credentials Implementation Plan

## 📋 Overview

This document outlines the plan to transition from API Key authentication to OAuth 2.0 Client Credentials flow for the Kenya Food Database API.

**Estimated Time:** 3-4 days  
**Difficulty:** Medium  
**Status:** Planning Phase

---

## 🎯 Goals

1. Implement OAuth 2.0 Client Credentials grant type
2. Support token-based authentication with short-lived access tokens
3. Add scope-based authorization for granular permissions
4. Maintain backward compatibility with existing API keys (optional)
5. Improve security with automatic token expiration

---

## 📊 Current vs. Target Architecture

### Current (API Keys)
```
Client → API Key (x-api-key header) → ApiKeyGuard → Hash Verification → Access Granted
```

### Target (OAuth 2.0)
```
Client → POST /oauth/token (client_id + client_secret) → Access Token (JWT)
Client → API Request (Bearer token) → OAuthGuard → Token Verification → Scope Check → Access Granted
```

---

## 🗂️ Phase 1: Database Schema Changes (Day 1 - 4 hours)

### 1.1 Create OAuth Client Entity

**File:** `src/oauth/infrastructure/persistence/relational/entities/oauth-client.entity.ts`

```typescript
@Entity('oauth_client')
export class OAuthClientEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  clientId: string; // e.g., "kfdb_client_abc123"

  @Column({ length: 255 })
  clientSecretHash: string; // bcrypt hashed secret

  @Column({ length: 100 })
  name: string; // Client application name

  @Column({ type: String, nullable: true })
  description: string | null;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: Number })
  userId: number;

  @Column({ type: 'simple-array' })
  scopes: string[]; // ['read:foods', 'read:categories', 'read:nutrients']

  @Column({ type: 'simple-array', default: ['client_credentials'] })
  grantTypes: string[]; // ['client_credentials']

  @Column({ type: String, length: 20, default: 'free' })
  tier: string; // 'free' | 'premium'

  @Column({ type: Number, default: 1000 })
  rateLimit: number; // Requests per day

  @Column({ type: String, length: 20, default: 'active' })
  status: string; // 'active' | 'revoked' | 'expired'

  @Column({ type: Date, nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
```

### 1.2 Create OAuth Token Entity

**File:** `src/oauth/infrastructure/persistence/relational/entities/oauth-token.entity.ts`

```typescript
@Entity('oauth_token')
@Index(['clientId', 'expiresAt'])
export class OAuthTokenEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 500 })
  accessToken: string; // JWT token

  @ManyToOne(() => OAuthClientEntity)
  @JoinColumn({ name: 'clientId' })
  client: OAuthClientEntity;

  @Column({ type: String, length: 100 })
  clientId: string;

  @Column({ type: 'simple-array' })
  scopes: string[];

  @Column({ type: Date })
  expiresAt: Date; // Typically 1 hour from creation

  @Column({ type: Boolean, default: false })
  revoked: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

### 1.3 Create Migration

```bash
npm run migration:generate -- src/database/migrations/CreateOAuthTables
npm run migration:run
```

---

## 🔧 Phase 2: OAuth Module Setup (Day 1 - 4 hours)

### 2.1 Create OAuth Module Structure

```
src/oauth/
├── oauth.module.ts
├── oauth.controller.ts
├── oauth.service.ts
├── domain/
│   ├── oauth-client.ts
│   └── oauth-token.ts
├── dto/
│   ├── token-request.dto.ts
│   ├── token-response.dto.ts
│   ├── create-oauth-client.dto.ts
│   └── update-oauth-client.dto.ts
├── guards/
│   └── oauth.guard.ts
├── decorators/
│   ├── require-scope.decorator.ts
│   └── current-client.decorator.ts
└── infrastructure/
    └── persistence/
        └── relational/
            ├── entities/
            ├── mappers/
            └── repositories/
```

### 2.2 Token Request DTO

**File:** `src/oauth/dto/token-request.dto.ts`

```typescript
export class TokenRequestDto {
  @ApiProperty({ example: 'client_credentials' })
  @IsNotEmpty()
  @IsString()
  grant_type: string;

  @ApiProperty({ example: 'kfdb_client_abc123' })
  @IsNotEmpty()
  @IsString()
  client_id: string;

  @ApiProperty({ example: 'secret_xyz789' })
  @IsNotEmpty()
  @IsString()
  client_secret: string;

  @ApiPropertyOptional({ example: 'read:foods read:categories' })
  @IsOptional()
  @IsString()
  scope?: string;
}
```

### 2.3 Token Response DTO

**File:** `src/oauth/dto/token-response.dto.ts`

```typescript
export class TokenResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty({ example: 'Bearer' })
  token_type: string;

  @ApiProperty({ example: 3600 })
  expires_in: number;

  @ApiProperty({ example: 'read:foods read:categories' })
  scope: string;
}
```

---

## 🎫 Phase 3: Token Endpoint Implementation (Day 2 - 6 hours)

### 3.1 OAuth Service

**File:** `src/oauth/oauth.service.ts`

```typescript
@Injectable()
export class OAuthService {
  constructor(
    private readonly oauthClientRepository: OAuthClientRepository,
    private readonly oauthTokenRepository: OAuthTokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async issueToken(dto: TokenRequestDto): Promise<TokenResponseDto> {
    // 1. Validate grant type
    if (dto.grant_type !== 'client_credentials') {
      throw new BadRequestException('Unsupported grant type');
    }

    // 2. Validate client credentials
    const client = await this.validateClient(dto.client_id, dto.client_secret);

    // 3. Validate requested scopes
    const requestedScopes = dto.scope ? dto.scope.split(' ') : client.scopes;
    this.validateScopes(requestedScopes, client.scopes);

    // 4. Generate access token (JWT)
    const payload = {
      sub: client.clientId,
      client_id: client.clientId,
      scopes: requestedScopes,
      tier: client.tier,
      rate_limit: client.rateLimit,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
      issuer: 'kenya-food-db',
      audience: 'api',
    });

    // 5. Store token in database
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour
    await this.oauthTokenRepository.create({
      accessToken,
      clientId: client.clientId,
      scopes: requestedScopes,
      expiresAt,
    });

    // 6. Return token response
    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: requestedScopes.join(' '),
    };
  }

  private async validateClient(
    clientId: string,
    clientSecret: string,
  ): Promise<OAuthClient> {
    const client = await this.oauthClientRepository.findByClientId(clientId);

    if (!client) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    if (client.status !== 'active') {
      throw new UnauthorizedException('Client is not active');
    }

    if (client.expiresAt && new Date(client.expiresAt) < new Date()) {
      throw new UnauthorizedException('Client credentials have expired');
    }

    const isValidSecret = await bcrypt.compare(
      clientSecret,
      client.clientSecretHash,
    );

    if (!isValidSecret) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    return client;
  }

  private validateScopes(requested: string[], allowed: string[]): void {
    const invalid = requested.filter((scope) => !allowed.includes(scope));
    if (invalid.length > 0) {
      throw new BadRequestException(
        `Invalid scopes: ${invalid.join(', ')}`,
      );
    }
  }

  async revokeToken(accessToken: string): Promise<void> {
    await this.oauthTokenRepository.update(
      { accessToken },
      { revoked: true },
    );
  }
}
```

### 3.2 OAuth Controller

**File:** `src/oauth/oauth.controller.ts`

```typescript
@ApiTags('OAuth')
@Controller({
  path: 'oauth',
  version: '1',
})
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Post('token')
  @ApiOperation({ summary: 'Get access token using client credentials' })
  @ApiOkResponse({ type: TokenResponseDto })
  async token(@Body() dto: TokenRequestDto): Promise<TokenResponseDto> {
    return this.oauthService.issueToken(dto);
  }

  @Post('revoke')
  @ApiBearerAuth()
  @UseGuards(OAuthGuard)
  @ApiOperation({ summary: 'Revoke an access token' })
  async revoke(@CurrentClient() client: OAuthClient): Promise<void> {
    // Revoke current token
    const token = // extract from request
    await this.oauthService.revokeToken(token);
  }
}
```

---

## 🛡️ Phase 4: OAuth Guard Implementation (Day 2 - 4 hours)

### 4.1 OAuth Guard

**File:** `src/oauth/guards/oauth.guard.ts`

```typescript
@Injectable()
export class OAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly oauthTokenRepository: OAuthTokenRepository,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Extract Bearer token
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Access token is required. Please provide a Bearer token.',
        error: 'Unauthorized',
      });
    }

    // 2. Verify JWT signature and decode
    let payload;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        issuer: 'kenya-food-db',
        audience: 'api',
      });
    } catch (error) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid or expired access token.',
        error: 'Unauthorized',
      });
    }

    // 3. Check token in database (not revoked)
    const tokenRecord = await this.oauthTokenRepository.findOne({
      where: { accessToken: token },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Token not found');
    }

    if (tokenRecord.revoked) {
      throw new UnauthorizedException('Token has been revoked');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Token has expired');
    }

    // 4. Check required scopes
    const requiredScopes = this.reflector.get<string[]>(
      'scopes',
      context.getHandler(),
    );

    if (requiredScopes && requiredScopes.length > 0) {
      const hasScope = requiredScopes.some((scope) =>
        payload.scopes.includes(scope),
      );

      if (!hasScope) {
        throw new ForbiddenException({
          statusCode: 403,
          message: `Insufficient scope. Required: ${requiredScopes.join(' or ')}`,
          error: 'Forbidden',
        });
      }
    }

    // 5. Attach client info to request
    request.oauth = {
      clientId: payload.client_id,
      scopes: payload.scopes,
      tier: payload.tier,
      rateLimit: payload.rate_limit,
    };

    return true;
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }
    return null;
  }
}
```

### 4.2 Scope Decorator

**File:** `src/oauth/decorators/require-scope.decorator.ts`

```typescript
export const RequireScope = (...scopes: string[]) =>
  SetMetadata('scopes', scopes);
```

### 4.3 Current Client Decorator

**File:** `src/oauth/decorators/current-client.decorator.ts`

```typescript
export const CurrentClient = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.oauth;
  },
);
```

---

## 🔄 Phase 5: Update Existing Controllers (Day 3 - 4 hours)

### 5.1 Define Scopes

**File:** `src/oauth/constants/scopes.ts`

```typescript
export const SCOPES = {
  // Foods
  READ_FOODS: 'read:foods',
  WRITE_FOODS: 'write:foods',
  
  // Categories
  READ_CATEGORIES: 'read:categories',
  WRITE_CATEGORIES: 'write:categories',
  
  // Nutrients
  READ_NUTRIENTS: 'read:nutrients',
  WRITE_NUTRIENTS: 'write:nutrients',
  
  // Usage Logs
  READ_USAGE: 'read:usage',
  
  // Admin
  ADMIN: 'admin',
};
```

### 5.2 Update Foods Controller

```typescript
@ApiTags('Foods')
@Controller({
  path: 'foods',
  version: '1',
})
export class FoodsController {
  @Get()
  @ApiSecurity('oauth2')
  @RequireScope(SCOPES.READ_FOODS)
  @UseGuards(OAuthGuard)
  @ApiOkResponse({ type: InfinityPaginationResponse(Food) })
  async findAll(@Query() query: FindAllFoodsDto) {
    // ...
  }

  @Post()
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiCreatedResponse({ type: Food })
  create(@Body() createFoodDto: CreateFoodDto) {
    // Admin endpoints stay with JWT
  }
}
```

### 5.3 Update Categories & Nutrients Controllers

Apply same pattern as Foods controller.

---

## 🔀 Phase 6: Hybrid Support (Optional - Day 3 - 3 hours)

### 6.1 Combined Guard

**File:** `src/common/guards/api-auth.guard.ts`

```typescript
@Injectable()
export class ApiAuthGuard implements CanActivate {
  constructor(
    private readonly apiKeyGuard: ApiKeyGuard,
    private readonly oauthGuard: OAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Try OAuth first (Bearer token)
    if (request.headers['authorization']?.startsWith('Bearer ')) {
      try {
        return await this.oauthGuard.canActivate(context);
      } catch (error) {
        // If OAuth fails, don't try API key
        throw error;
      }
    }

    // Fall back to API key (x-api-key header)
    if (request.headers['x-api-key']) {
      return await this.apiKeyGuard.canActivate(context);
    }

    throw new UnauthorizedException(
      'Authentication required. Provide either Bearer token or API key.',
    );
  }
}
```

### 6.2 Usage

```typescript
@Get()
@UseGuards(ApiAuthGuard)  // Accepts both OAuth and API Key
async findAll() {
  // ...
}
```

---

## 📝 Phase 7: Update Swagger Documentation (Day 4 - 2 hours)

### 7.1 Update main.ts

```typescript
const options = new DocumentBuilder()
  .setTitle('Kenya Food Database API')
  .setDescription('API for accessing Kenyan food nutritional data')
  .setVersion('1.0')
  .addBearerAuth()  // For admin JWT
  .addApiKey(
    {
      type: 'apiKey',
      name: 'x-api-key',
      in: 'header',
      description: 'API Key for public endpoints (legacy)',
    },
    'api-key',
  )
  .addOAuth2(
    {
      type: 'oauth2',
      flows: {
        clientCredentials: {
          tokenUrl: '/api/v1/oauth/token',
          scopes: {
            'read:foods': 'Read food data',
            'read:categories': 'Read category data',
            'read:nutrients': 'Read nutrient data',
          },
        },
      },
    },
    'oauth2',
  )
  .build();
```

---

## 🧪 Phase 8: Testing (Day 4 - 4 hours)

### 8.1 Unit Tests

- Test OAuth service token generation
- Test OAuth guard token verification
- Test scope validation

### 8.2 Integration Tests

```typescript
describe('OAuth Flow', () => {
  it('should issue access token with valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/oauth/token')
      .send({
        grant_type: 'client_credentials',
        client_id: 'test_client',
        client_secret: 'test_secret',
      })
      .expect(200);

    expect(response.body).toHaveProperty('access_token');
    expect(response.body.token_type).toBe('Bearer');
  });

  it('should access protected endpoint with token', async () => {
    const token = // get token from previous test
    
    await request(app.getHttpServer())
      .get('/api/v1/foods')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('should reject request without required scope', async () => {
    const token = // token without write:foods scope
    
    await request(app.getHttpServer())
      .post('/api/v1/foods')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Food' })
      .expect(403);
  });
});
```

### 8.3 Manual Testing Checklist

- [ ] Create OAuth client
- [ ] Get access token
- [ ] Access foods endpoint with token
- [ ] Access categories endpoint with token
- [ ] Access nutrients endpoint with token
- [ ] Test token expiration (wait 1 hour)
- [ ] Test revoked token
- [ ] Test insufficient scope
- [ ] Test invalid client credentials
- [ ] Test backward compatibility with API keys (if hybrid)

---

## 📚 Phase 9: Documentation (Day 4 - 2 hours)

### 9.1 Create OAuth Guide

**File:** `docs/OAUTH_GUIDE.md`

Include:
- How to create OAuth client
- How to get access token
- How to use access token
- Available scopes
- Token expiration and renewal
- Error handling
- Code examples in multiple languages

### 9.2 Update API Documentation

- Add OAuth section to README
- Update Postman collection
- Create example requests

---

## 🚀 Phase 10: Deployment (Day 4 - 2 hours)

### 10.1 Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h

# OAuth Configuration
OAUTH_TOKEN_EXPIRY=3600
OAUTH_ISSUER=kenya-food-db
OAUTH_AUDIENCE=api
```

### 10.2 Migration Strategy

**Option A: Big Bang (Recommended for new APIs)**
- Deploy OAuth
- Deprecate API keys immediately
- Provide migration guide

**Option B: Gradual Migration**
- Deploy OAuth alongside API keys
- Mark API keys as deprecated
- Set sunset date (e.g., 3 months)
- Send notifications to API key users
- Remove API key support after sunset

---

## 📊 Success Metrics

- [ ] All public endpoints support OAuth 2.0
- [ ] Token generation < 200ms
- [ ] Token verification < 50ms
- [ ] 100% test coverage for OAuth module
- [ ] Zero downtime during deployment
- [ ] Documentation complete
- [ ] Developer feedback positive

---

## 🔄 Rollback Plan

If issues arise:

1. **Immediate:** Re-enable API key guard on all endpoints
2. **Database:** Keep OAuth tables (no data loss)
3. **Code:** Revert controller changes via Git
4. **Communication:** Notify developers of rollback

---

## 📖 Resources

- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [OAuth 2.0 Client Credentials Grant](https://oauth.net/2/grant-types/client-credentials/)
- [NestJS JWT Documentation](https://docs.nestjs.com/security/authentication#jwt-functionality)
- [NestJS Guards](https://docs.nestjs.com/guards)

---

## 👥 Team & Responsibilities

- **Backend Developer:** Implement OAuth service, guards, and controllers
- **Database Admin:** Create and run migrations
- **QA Engineer:** Write and execute tests
- **Technical Writer:** Create documentation
- **DevOps:** Deploy and monitor

---

## ⏱️ Timeline Summary

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| 1. Database Schema | 4 hours | None |
| 2. OAuth Module Setup | 4 hours | Phase 1 |
| 3. Token Endpoint | 6 hours | Phase 2 |
| 4. OAuth Guard | 4 hours | Phase 3 |
| 5. Update Controllers | 4 hours | Phase 4 |
| 6. Hybrid Support (Optional) | 3 hours | Phase 5 |
| 7. Swagger Docs | 2 hours | Phase 5 |
| 8. Testing | 4 hours | Phase 7 |
| 9. Documentation | 2 hours | Phase 8 |
| 10. Deployment | 2 hours | Phase 9 |

**Total:** 35 hours (~4-5 days)

---

## ✅ Next Steps

1. Review and approve this plan
2. Set up project tracking (Jira/GitHub Issues)
3. Schedule kickoff meeting
4. Begin Phase 1: Database Schema Changes

---

**Document Version:** 1.0  
**Last Updated:** November 2, 2025  
**Author:** Development Team  
**Status:** Draft - Pending Approval
