# Rate Limiting Enforcement Implementation Guide

## 🎯 Current Status

- ✅ Rate limits stored in database
- ✅ Rate limits embedded in JWT tokens
- ✅ Usage tracked in logs
- ❌ **Rate limits NOT enforced** (users can exceed limits)

---

## 🚀 Implementation Steps

### **Step 1: Add userId to usage_log Table**

For efficient rate limit checking:

```typescript
// Create migration: AddUserIdToUsageLog
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIdToUsageLog1730660000000 implements MigrationInterface {
  name = 'AddUserIdToUsageLog1730660000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add userId column
    await queryRunner.query(
      `ALTER TABLE "usage_log" ADD "userId" integer`,
    );

    // Add index for fast queries
    await queryRunner.query(
      `CREATE INDEX "IDX_usage_log_user_created" ON "usage_log" ("userId", "createdAt")`,
    );

    // Add foreign key
    await queryRunner.query(
      `ALTER TABLE "usage_log" ADD CONSTRAINT "FK_usage_log_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usage_log" DROP CONSTRAINT "FK_usage_log_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_usage_log_user_created"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_log" DROP COLUMN "userId"`,
    );
  }
}
```

### **Step 2: Update UsageLog Entity**

```typescript
// src/usage-logs/infrastructure/persistence/relational/entities/usage-log.entity.ts

@Entity({ name: 'usage_log' })
@Index(['userId', 'createdAt'])
export class UsageLogEntity extends EntityRelationalHelper {
  // ... existing fields

  @Column({ type: Number, nullable: true })
  userId: number | null;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user?: UserEntity | null;
}
```

### **Step 3: Update OAuthGuard to Track userId**

```typescript
// src/oauth/guards/oauth.guard.ts

private trackUsage(request: any, clientId: string, userId: number): void {
  setImmediate(() => {
    this.usageLogsService
      .create({
        apiKeyId: undefined,
        userId: userId, // ← Add this
        endpoint: request.url,
        method: request.method,
        ipAddress: request.ip || request.connection?.remoteAddress,
        userAgent: `OAuth:${clientId}`,
        responseTime: 0,
        statusCode: 200,
      })
      .catch((error) => {
        console.error('Failed to log OAuth usage:', error);
      });
  });
}

// Update the call
this.trackUsage(request, tokenRecord.clientId, payload.user_id);
```

### **Step 4: Add Rate Limit Checking Method**

```typescript
// src/usage-logs/usage-logs.service.ts

async countUserRequestsInWindow(
  userId: number,
  windowHours: number = 24,
): Promise<number> {
  const startTime = new Date();
  startTime.setHours(startTime.getHours() - windowHours);

  const count = await this.usageLogRepository.count({
    where: {
      userId,
      createdAt: MoreThan(startTime),
    },
  });

  return count;
}
```

### **Step 5: Enforce Rate Limits in OAuthGuard**

```typescript
// src/oauth/guards/oauth.guard.ts

async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest();

  // ... existing token validation ...

  // 5. Check rate limit (NEW)
  const userId = payload.user_id;
  const rateLimit = payload.rate_limit;
  
  const requestCount = await this.usageLogsService.countUserRequestsInWindow(
    userId,
    24, // 24-hour window
  );

  if (requestCount >= rateLimit) {
    const resetTime = new Date();
    resetTime.setHours(resetTime.getHours() + 24);

    throw new HttpException(
      {
        statusCode: 429,
        message: `Rate limit exceeded. Limit: ${rateLimit} requests per day.`,
        error: 'Too Many Requests',
        retryAfter: Math.ceil((resetTime.getTime() - Date.now()) / 1000),
      },
      429,
    );
  }

  // 6. Attach client info to request
  request.oauth = {
    clientId: payload.client_id,
    userId: payload.user_id,
    scopes: payload.scopes,
    tier: payload.tier,
    rateLimit: payload.rate_limit,
    remainingRequests: rateLimit - requestCount,
    tokenId: tokenRecord.id,
  };

  // 7. Log usage
  this.trackUsage(request, tokenRecord.clientId, userId);

  return true;
}
```

### **Step 6: Add Rate Limit Headers to Responses**

```typescript
// src/oauth/interceptors/rate-limit-headers.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RateLimitHeadersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap(() => {
        if (request.oauth) {
          const resetTime = new Date();
          resetTime.setHours(resetTime.getHours() + 24);

          response.setHeader('X-RateLimit-Limit', request.oauth.rateLimit);
          response.setHeader(
            'X-RateLimit-Remaining',
            request.oauth.remainingRequests,
          );
          response.setHeader(
            'X-RateLimit-Reset',
            Math.ceil(resetTime.getTime() / 1000),
          );
        }
      }),
    );
  }
}
```

### **Step 7: Apply Interceptor Globally**

```typescript
// src/app.module.ts or main.ts

import { APP_INTERCEPTOR } from '@nestjs/core';
import { RateLimitHeadersInterceptor } from './oauth/interceptors/rate-limit-headers.interceptor';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimitHeadersInterceptor,
    },
  ],
})
export class AppModule {}
```

---

## 📊 Response Examples

### **Within Limit**
```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 742
X-RateLimit-Reset: 1730742350

{
  "data": [...]
}
```

### **Limit Exceeded**
```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1730742350
Retry-After: 43200

{
  "statusCode": 429,
  "message": "Rate limit exceeded. Limit: 1000 requests per day.",
  "error": "Too Many Requests",
  "retryAfter": 43200
}
```

---

## 🎯 Testing Rate Limits

### **Test 1: Check Headers**
```bash
curl -i -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/v1/foods

# Check for X-RateLimit-* headers
```

### **Test 2: Exceed Limit**
```bash
# Make 1001 requests quickly
for i in {1..1001}; do
  curl -H "Authorization: Bearer <token>" \
    http://localhost:3000/api/v1/foods
done

# Request 1001 should return 429
```

### **Test 3: Different Users**
```bash
# User A makes 1000 requests (limit reached)
# User B should still have full quota
```

---

## ⚡ Performance Optimization

### **Option 1: Redis Caching**

Cache request counts in Redis for faster lookups:

```typescript
async countUserRequestsInWindow(userId: number): Promise<number> {
  const cacheKey = `rate_limit:${userId}:${new Date().toDateString()}`;
  
  // Check cache first
  const cached = await this.redis.get(cacheKey);
  if (cached) return parseInt(cached);
  
  // Query database
  const count = await this.usageLogRepository.count({...});
  
  // Cache for 5 minutes
  await this.redis.setex(cacheKey, 300, count.toString());
  
  return count;
}
```

### **Option 2: In-Memory Counter**

Use in-memory counter with periodic database sync:

```typescript
// Increment counter on each request
// Sync to database every 100 requests or 1 minute
```

---

## 🔒 Security Considerations

1. **Distributed Systems**: Use Redis for shared rate limit state
2. **Clock Skew**: Use UTC timestamps consistently
3. **Bypass Prevention**: Don't expose rate limit logic to clients
4. **Graceful Degradation**: If rate limit check fails, allow request but log error

---

## 📚 Standards

Following industry standards:
- **HTTP 429** - Too Many Requests
- **X-RateLimit-*** headers (GitHub, Twitter, Stripe standard)
- **Retry-After** header for client guidance

---

**Priority:** High  
**Estimated Time:** 2-4 hours  
**Complexity:** Medium
