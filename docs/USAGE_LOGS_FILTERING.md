# Usage Logs Role-Based Filtering

## Overview

Implemented role-based access control for the `GET /api/v1/usage-logs` endpoint to ensure users can only view logs relevant to their access level.

## Behavior

### Admin Users
- **Access**: All usage logs from all users
- **Use Case**: System monitoring, analytics, and administration

### Non-Admin Users
- **Access**: Only logs where `apiKeyId` belongs to their own API keys
- **Use Case**: Personal usage tracking and monitoring
- **Edge Case**: Users with no API keys receive an empty array

## Implementation Details

### Architecture Changes

#### 1. Repository Layer
- **Modified**: `UsageLogRepository.findAllWithPagination()`
  - Added optional `apiKeyIds` parameter
  - Uses TypeORM QueryBuilder with `WHERE IN` clause for filtering
  - Orders results by `createdAt DESC`

#### 2. API Keys Integration
- **Added**: `ApiKeyRepository.findByUserId(userId)`
  - Retrieves all API keys belonging to a specific user
  - Implemented in both abstract and relational repositories
- **Added**: `ApiKeysService.findByUserId(userId)`
  - Service layer method to fetch user's API keys

#### 3. Service Logic
**`UsageLogsService.findAllWithPagination()`**:
```typescript
async findAllWithPagination({
  paginationOptions,
  userId,
  userRole,
})
```
- Accepts `userId` and `userRole` parameters
- **If admin**: Returns all logs (no filtering)
- **If non-admin**: 
  - Fetches user's API keys via `apiKeysService.findByUserId()`
  - Filters logs by those API key IDs
  - Returns empty array if user has no API keys

#### 4. Controller Updates
- Extracts user from `request.user` (JWT payload)
- Passes `userId` and `userRole` to service
- Maintains existing pagination logic

### Circular Dependency Resolution

**Problem**: 
- `ApiKeysModule` imports `UsageLogsModule` (for logging)
- `UsageLogsModule` imports `ApiKeysModule` (for filtering)

**Solution**: Used NestJS `forwardRef()` to break the cycle:

```typescript
// In UsageLogsModule
imports: [
  RelationalUsageLogPersistenceModule,
  forwardRef(() => ApiKeysModule),
]

// In UsageLogsService
constructor(
  private readonly usageLogRepository: UsageLogRepository,
  @Inject(forwardRef(() => ApiKeysService))
  private readonly apiKeysService: ApiKeysService,
) {}
```

## Security Benefits

✅ **Data Isolation**: Non-admin users cannot access other users' usage logs  
✅ **Admin Visibility**: Admins maintain full system oversight  
✅ **Graceful Degradation**: Users without API keys get empty results (not errors)  
✅ **Backward Compatible**: No breaking changes for existing admin workflows  

## API Examples

### Admin Request
```bash
GET /api/v1/usage-logs?page=1&limit=10
Authorization: Bearer <admin-jwt-token>

# Response: All logs from all users
```

### Non-Admin Request
```bash
GET /api/v1/usage-logs?page=1&limit=10
Authorization: Bearer <user-jwt-token>

# Response: Only logs where apiKeyId belongs to this user's API keys
```

### User Without API Keys
```bash
GET /api/v1/usage-logs?page=1&limit=10
Authorization: Bearer <user-jwt-token>

# Response: Empty array []
```

## Files Modified

### Repository Layer
- `src/usage-logs/infrastructure/persistence/usage-log.repository.ts`
- `src/usage-logs/infrastructure/persistence/relational/repositories/usage-log.repository.ts`
- `src/api-keys/infrastructure/persistence/api-key.repository.ts`
- `src/api-keys/infrastructure/persistence/relational/repositories/api-key.repository.ts`

### Service Layer
- `src/usage-logs/usage-logs.service.ts`
- `src/api-keys/api-keys.service.ts`

### Controller & Module
- `src/usage-logs/usage-logs.controller.ts`
- `src/usage-logs/usage-logs.module.ts`

## Testing Recommendations

1. **Admin Access**: Verify admins see all logs regardless of ownership
2. **User Access**: Verify non-admin users only see their own API key logs
3. **No API Keys**: Verify users without API keys get empty results
4. **Pagination**: Verify filtering works correctly with pagination
5. **Performance**: Test with large datasets to ensure query performance

## Notes

- Role checking uses `RoleEnum.admin` from the roles system
- User information extracted from JWT token in request
- Filtering happens at the database level for optimal performance
- No changes required to existing API consumers
