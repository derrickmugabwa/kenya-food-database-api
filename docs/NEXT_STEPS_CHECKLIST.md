# Next Steps Checklist

## 🔴 Critical - Do Immediately

### ✅ **1. Run Database Migration**
```bash
npm run migration:run
```
**What it does:** Adds `apiTier` and `apiRateLimit` columns to user table

**Expected output:**
```
Migration AddUserApiTierAndRateLimit1730656350000 has been executed successfully.
```

---

### ✅ **2. Verify Migration**
```sql
-- Check columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user' 
AND column_name IN ('apiTier', 'apiRateLimit');

-- Check existing users got defaults
SELECT id, email, "apiTier", "apiRateLimit" FROM "user" LIMIT 5;
```

**Expected:** All users have `apiTier='free'` and `apiRateLimit=1000`

---

### ✅ **3. Test OAuth Client Creation**

**A. Create client as regular user:**
```bash
POST http://localhost:3000/api/v1/oauth/clients
Authorization: Bearer <user-jwt>
Content-Type: application/json

{
  "name": "Test App",
  "scopes": ["read:foods"]
}
```

**Expected response:**
```json
{
  "client": {
    "id": 1,
    "clientId": "kfdb_client_...",
    "name": "Test App",
    "tier": "free",         // ← Should be 'free'
    "rateLimit": 1000,      // ← Should be 1000
    "scopes": ["read:foods"]
  },
  "clientSecret": "..."
}
```

---

### ✅ **4. Test Admin Upgrade**

**A. Login as admin:**
```bash
POST http://localhost:3000/api/v1/auth/email/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "secret"
}
```

**B. Upgrade user tier:**
```bash
PATCH http://localhost:3000/api/v1/users/5/api-access
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{
  "apiTier": "premium",
  "apiRateLimit": 10000
}
```

**Expected:** 200 OK with updated user object

---

### ✅ **5. Test Tier Inheritance**

**A. Create another client (same user):**
```bash
POST http://localhost:3000/api/v1/oauth/clients
Authorization: Bearer <user-jwt>
Content-Type: application/json

{
  "name": "Test App 2",
  "scopes": ["read:foods"]
}
```

**Expected:**
```json
{
  "client": {
    "tier": "premium",      // ← Should inherit 'premium'
    "rateLimit": 10000      // ← Should inherit 10000
  }
}
```

---

## 🟡 Important - Do Soon

### ✅ **6. Sync Existing OAuth Clients (Optional)**

If you have existing OAuth clients, sync them:

```sql
-- Backup first
CREATE TABLE oauth_client_backup AS SELECT * FROM oauth_client;

-- Update all clients to match user tier
UPDATE oauth_client oc
SET 
  tier = u."apiTier",
  rate_limit = u."apiRateLimit"
FROM "user" u
WHERE oc."userId" = u.id;

-- Verify
SELECT 
  oc.id,
  oc."clientId",
  oc.tier,
  oc.rate_limit,
  u."apiTier",
  u."apiRateLimit"
FROM oauth_client oc
JOIN "user" u ON oc."userId" = u.id
LIMIT 10;
```

---

### ✅ **7. Test Partial Updates**

**A. Update only rate limit:**
```bash
PATCH http://localhost:3000/api/v1/users/5/api-access
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{
  "apiRateLimit": 15000
}
```

**Expected:** Only `apiRateLimit` changes, `apiTier` stays same

**B. Update only tier:**
```bash
PATCH http://localhost:3000/api/v1/users/5/api-access
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{
  "apiTier": "basic"
}
```

**Expected:** Only `apiTier` changes, `apiRateLimit` stays same

---

### ✅ **8. Document Your Tier Structure**

Create a document defining your tiers:

```markdown
# API Tiers

| Tier | Rate Limit | Price | Features |
|------|------------|-------|----------|
| Free | 1,000/day | $0 | Basic access |
| Basic | 5,000/day | $10/mo | Priority support |
| Premium | 10,000/day | $50/mo | Advanced features |
| Enterprise | 100,000/day | Custom | Custom SLA |
```

---

## 🟢 Optional - Nice to Have

### ✅ **9. Implement Rate Limiting Enforcement**

**Priority:** High  
**Time:** 2-4 hours  
**Guide:** See [RATE_LIMITING_IMPLEMENTATION_GUIDE.md](./RATE_LIMITING_IMPLEMENTATION_GUIDE.md)

**Steps:**
1. Add `userId` to `usage_log` table
2. Update `OAuthGuard` to check rate limits
3. Return 429 when limit exceeded
4. Add rate limit headers to responses

---

### ✅ **10. Add Rate Limit Dashboard**

Create admin dashboard showing:
- Users approaching limits
- Top API consumers
- Rate limit violations
- Usage trends

---

### ✅ **11. Implement Token Revocation**

Allow admins to revoke tokens immediately:

```bash
POST /api/v1/oauth/tokens/:tokenId/revoke
```

Useful for:
- Security incidents
- Immediate tier downgrades
- User account suspension

---

### ✅ **12. Add Webhooks for Tier Changes**

Notify external systems when tier changes:

```typescript
// After tier update
await this.webhookService.trigger('user.tier.updated', {
  userId: user.id,
  oldTier: 'free',
  newTier: 'premium',
  timestamp: new Date(),
});
```

---

### ✅ **13. Create User-Facing API Dashboard**

Allow users to:
- View their current tier and rate limit
- See usage statistics
- Request tier upgrades
- Manage OAuth clients

---

### ✅ **14. Add Usage Analytics**

Track and visualize:
- Requests per day/week/month
- Most used endpoints
- Peak usage times
- Quota utilization

---

### ✅ **15. Implement Billing Integration**

When ready to monetize:
- Stripe/PayPal integration
- Subscription management
- Automatic tier upgrades on payment
- Usage-based billing

---

## 📋 Testing Checklist

### **Functional Tests**

- [ ] User creates OAuth client → Gets free tier
- [ ] Admin upgrades user → Database updated
- [ ] User creates new client → Gets upgraded tier
- [ ] Admin updates only rate limit → Tier unchanged
- [ ] Admin updates only tier → Rate limit unchanged
- [ ] Non-admin tries to update tier → 403 Forbidden
- [ ] Token includes userId in payload
- [ ] Token includes correct tier and rate limit

### **Edge Cases**

- [ ] User with no tier set → Defaults to free
- [ ] Invalid tier value → Validation error
- [ ] Negative rate limit → Validation error
- [ ] Update non-existent user → 404 Not Found
- [ ] Multiple clients share user quota
- [ ] Token refresh after tier upgrade → New limit applied

### **Security Tests**

- [ ] Regular user cannot upgrade themselves
- [ ] Regular user cannot view other users' tiers
- [ ] OAuth client cannot be created without authentication
- [ ] Rate limit cannot be bypassed by creating multiple clients

---

## 🎯 Success Criteria

✅ **Phase 1: Basic Implementation (Current)**
- [x] Tier and rate limit stored at user level
- [x] OAuth clients inherit from user
- [x] Admin endpoint for tier management
- [x] Database migration created
- [ ] All tests passing

✅ **Phase 2: Enforcement (Next)**
- [ ] Rate limits actually enforced
- [ ] 429 responses when limit exceeded
- [ ] Rate limit headers in responses
- [ ] Usage tracking by userId

✅ **Phase 3: Production Ready (Future)**
- [ ] Monitoring and alerts
- [ ] User-facing dashboard
- [ ] Billing integration
- [ ] Documentation complete

---

## 📞 Need Help?

### **Common Issues**

**Issue:** Migration fails
- **Solution:** Check database connection, ensure no duplicate migrations

**Issue:** OAuth client still shows old tier
- **Solution:** Check if user was actually updated in database

**Issue:** Admin endpoint returns 403
- **Solution:** Verify user has admin role

**Issue:** TypeScript errors
- **Solution:** Run `npm run build` to recompile

---

## 📚 Documentation

- ✅ [Tier and Rate Limit Changes](./TIER_RATE_LIMIT_CHANGES.md)
- ✅ [Rate Limiting Strategy](./RATE_LIMITING_STRATEGY.md)
- ✅ [Rate Limit Update FAQ](./RATE_LIMIT_UPDATE_FAQ.md)
- ✅ [Rate Limiting Implementation Guide](./RATE_LIMITING_IMPLEMENTATION_GUIDE.md)
- ✅ [OAuth Implementation Summary](./OAUTH_IMPLEMENTATION_SUMMARY.md)

---

## 🚀 Quick Start Commands

```bash
# 1. Run migration
npm run migration:run

# 2. Start server
npm run start:dev

# 3. Test in Swagger
# Open http://localhost:3000/docs

# 4. Create OAuth client
# Use POST /oauth/clients endpoint

# 5. Upgrade user (as admin)
# Use PATCH /users/:id/api-access endpoint
```

---

**Last Updated:** November 3, 2025  
**Status:** Ready for Testing  
**Next Milestone:** Rate Limiting Enforcement
