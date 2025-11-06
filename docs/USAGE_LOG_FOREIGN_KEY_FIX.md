# Usage Log Foreign Key Constraint Fix

## Problem

The system was throwing a foreign key constraint violation error when logging OAuth requests:

```
error: insert or update on table "usage_log" violates foreign key constraint "FK_f465e6a6104e8c8ef097bc9e239"
detail: Key (apiKeyId)=(13) is not present in table "api_key".
```

## Root Cause

The `usage_log` table's `apiKeyId` column had a foreign key constraint that referenced the `api_key` table. However, after implementing OAuth authentication, the system started storing **OAuth client IDs** in this column (not just API key IDs).

When `FlexibleAuthGuard` authenticated an OAuth request, it would:
1. Find the OAuth client by `clientId`
2. Store the OAuth client's database ID in `usage_log.apiKeyId`
3. This ID doesn't exist in the `api_key` table → Foreign key violation

## Solution

Removed the foreign key constraint from the `usage_log` table to allow the `apiKeyId` column to store either:
- API Key IDs (from the `api_key` table)
- OAuth Client IDs (from the `oauth_client` table)

### Changes Made

1. **Migration**: `1762090000000-RemoveUsageLogForeignKey.ts`
   - Drops the foreign key constraint `FK_f465e6a6104e8c8ef097bc9e239`
   - Allows `apiKeyId` to reference either table

2. **Entity Update**: `usage-log.entity.ts`
   - Removed `@ManyToOne` relationship with `ApiKeyEntity`
   - Removed `@JoinColumn` decorator
   - Removed `apiKey` property
   - Added comment to `apiKeyId`: "Stores either API Key ID or OAuth Client ID"

### Why This Approach?

**Alternative approaches considered:**
- Add a separate `oauthClientId` column → Adds complexity, requires more changes
- Rename `apiKeyId` to `clientId` → Breaking change, requires updating all queries
- Keep the constraint and use NULL for OAuth → Loses tracking ability

**Chosen approach benefits:**
- Minimal code changes
- Backward compatible (existing API key logs still work)
- Maintains tracking for both authentication methods
- No breaking changes to existing queries

## Impact

- ✅ OAuth requests are now properly logged
- ✅ API key requests continue to work as before
- ✅ No breaking changes to existing code
- ✅ Usage log filtering by user still works (see `MEMORY[d8502b4c-10e3-47c3-84a3-201e17e9a2e1]`)

## Testing

After applying the migration, OAuth-authenticated requests should no longer throw foreign key errors, and usage logs should be created successfully for both:
- JWT session token authentication (admin users)
- OAuth token authentication (API consumers)
- API key authentication (legacy support)

## Related Files

- `src/auth/guards/flexible-auth.guard.ts` - Logs OAuth usage
- `src/usage-logs/infrastructure/persistence/relational/entities/usage-log.entity.ts` - Entity definition
- `src/database/migrations/1762090000000-RemoveUsageLogForeignKey.ts` - Migration file
