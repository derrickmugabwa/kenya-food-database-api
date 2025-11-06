# OAuth Migration Summary - Usage Logs Filtering

## ✅ Implementation Complete

The usage logs filtering has been **updated to use OAuth clients** instead of API keys, as the system has migrated from API key authentication to OAuth 2.0.

## Changes Made

### 1. Service Layer Update
**File**: `src/usage-logs/usage-logs.service.ts`

**Before** (API Keys):
```typescript
import { ApiKeysService } from '../api-keys/api-keys.service';

constructor(
  private readonly usageLogRepository: UsageLogRepository,
  @Inject(forwardRef(() => ApiKeysService))
  private readonly apiKeysService: ApiKeysService,
) {}

// Fetched API keys
const userApiKeys = await this.apiKeysService.findByUserId(userId);
apiKeyIds = userApiKeys.map((key) => key.id);
```

**After** (OAuth):
```typescript
import { OAuthService } from '../oauth/oauth.service';

constructor(
  private readonly usageLogRepository: UsageLogRepository,
  @Inject(forwardRef(() => OAuthService))
  private readonly oauthService: OAuthService,
) {}

// Fetches OAuth clients
const userOAuthClients = await this.oauthService.findClientsByUserId(
  userId,
  {
    paginationOptions: {
      page: 1,
      limit: 1000, // Get all clients for filtering
    },
  },
);
oauthClientIds = userOAuthClients.map((client) => client.id);
```

### 2. Module Update
**File**: `src/usage-logs/usage-logs.module.ts`

**Before**:
```typescript
import { ApiKeysModule } from '../api-keys/api-keys.module';

imports: [
  RelationalUsageLogPersistenceModule,
  forwardRef(() => ApiKeysModule),
],
```

**After**:
```typescript
import { OAuthModule } from '../oauth/oauth.module';

imports: [
  RelationalUsageLogPersistenceModule,
  forwardRef(() => OAuthModule),
],
```

## How It Works

### Admin Users
- **Access**: All usage logs from all users
- **Filter**: None applied
- **Use Case**: System monitoring and analytics

### Non-Admin Users
- **Access**: Only logs where `apiKeyId` matches their OAuth client IDs
- **Filter**: Automatically applied based on user's OAuth clients
- **Use Case**: Personal usage tracking

### Edge Cases
- **No OAuth Clients**: Returns empty array `[]`
- **Multiple Clients**: Filters by all client IDs owned by the user
- **Pagination**: Works correctly with filtering applied

## Database Structure

The `usage_logs` table still uses `apiKeyId` column, but this now refers to OAuth client IDs:

```sql
CREATE TABLE usage_logs (
  id SERIAL PRIMARY KEY,
  api_key_id INTEGER, -- Now contains OAuth client IDs
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Behavior

### Request
```bash
GET /api/v1/usage-logs?page=1&limit=10
Authorization: Bearer <jwt-token>
```

### Response (Admin)
```json
{
  "data": [
    {
      "id": 1,
      "apiKeyId": 123,  // OAuth client ID
      "endpoint": "/api/v1/foods",
      "method": "GET",
      "statusCode": 200,
      "createdAt": "2025-11-04T19:00:00.000Z"
    }
    // ... all logs from all users
  ],
  "hasNextPage": true
}
```

### Response (Non-Admin)
```json
{
  "data": [
    {
      "id": 5,
      "apiKeyId": 456,  // Only this user's OAuth client IDs
      "endpoint": "/api/v1/foods",
      "method": "GET",
      "statusCode": 200,
      "createdAt": "2025-11-04T19:00:00.000Z"
    }
    // ... only logs from user's OAuth clients
  ],
  "hasNextPage": false
}
```

## Circular Dependency Resolution

The system has a circular dependency:
- **OAuthModule** imports **UsageLogsModule** (to log OAuth requests)
- **UsageLogsModule** imports **OAuthModule** (to filter by OAuth clients)

**Solution**: Using NestJS `forwardRef()`:
```typescript
// In UsageLogsModule
imports: [forwardRef(() => OAuthModule)]

// In UsageLogsService
@Inject(forwardRef(() => OAuthService))
private readonly oauthService: OAuthService
```

## Security Benefits

✅ **Data Isolation**: Non-admin users cannot access other users' usage logs  
✅ **OAuth-Based**: Filtering aligned with OAuth 2.0 authentication system  
✅ **Admin Oversight**: Admins maintain full system visibility  
✅ **Graceful Handling**: Empty results for users without OAuth clients  
✅ **Backward Compatible**: No breaking changes to API response format  

## Testing Checklist

- [x] Admin users see all logs
- [x] Non-admin users see only their OAuth client logs
- [x] Users without OAuth clients get empty array
- [x] Pagination works correctly
- [x] Circular dependency resolved
- [ ] Performance tested with large datasets
- [ ] Frontend integration verified

## Frontend Impact

**No frontend changes required!** The filtering happens transparently on the backend:
- Frontend continues to call `GET /api/v1/usage-logs`
- Backend automatically filters based on user role and OAuth clients
- Response format remains unchanged

## Files Modified

1. `src/usage-logs/usage-logs.service.ts` - Uses OAuthService instead of ApiKeysService
2. `src/usage-logs/usage-logs.module.ts` - Imports OAuthModule instead of ApiKeysModule

## Files NOT Modified (Still Work)

- `src/usage-logs/infrastructure/persistence/usage-log.repository.ts` - Repository interface unchanged
- `src/usage-logs/infrastructure/persistence/relational/repositories/usage-log.repository.ts` - Implementation unchanged
- `src/usage-logs/usage-logs.controller.ts` - Controller unchanged

## Migration Notes

### Why "apiKeyId" Still Used?
The database column and parameter names still reference "apiKeyId" for backward compatibility, but the values now represent OAuth client IDs. This avoids:
- Database migrations
- Breaking changes to existing code
- Frontend updates

### Future Improvements
Consider renaming for clarity:
- `apiKeyId` → `oauthClientId` (database column)
- `apiKeyIds` → `oauthClientIds` (repository parameter)

This would require:
1. Database migration
2. Update all references
3. Update frontend if it uses this field

## Conclusion

The usage logs filtering has been successfully migrated from API keys to OAuth clients. The system now correctly filters logs based on OAuth 2.0 authentication, maintaining security and privacy while providing admins with full system visibility.
