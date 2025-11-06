# Rate Limiting Strategy

## 🎯 Overview

Rate limits are applied **per user**, not per client. This means all OAuth clients created by a user share the same daily quota.

---

## 📊 How It Works

### **Per-User Rate Limiting**

```
User Account (apiRateLimit: 1000/day)
├── OAuth Client A (Mobile App)
│   └── Uses 300 requests
├── OAuth Client B (Web App)
│   └── Uses 400 requests
└── OAuth Client C (Desktop App)
    └── Uses 300 requests

Total: 1000/1000 requests used (SHARED quota)
```

### **Why Per-User?**

1. **Prevents Abuse** - Users can't bypass limits by creating multiple clients
2. **Fair Usage** - Everyone gets same quota regardless of client count
3. **Simpler Tracking** - Count requests by `userId`, not by `clientId`
4. **Business-Aligned** - When monetizing, users pay for total usage

---

## 🔧 Implementation

### **1. JWT Token Includes userId**

```typescript
// Token payload
{
  "sub": "kfdb_client_abc123",
  "client_id": "kfdb_client_abc123",
  "user_id": 5,              // ← Used for rate limiting
  "scopes": ["read:foods"],
  "tier": "free",
  "rate_limit": 1000,        // ← Per user, not per client
  "exp": 1730656350
}
```

### **2. Request Object Includes userId**

```typescript
// In OAuthGuard, after token validation
request.oauth = {
  clientId: "kfdb_client_abc123",
  userId: 5,                 // ← Track by this
  tier: "free",
  rateLimit: 1000,
  scopes: ["read:foods"],
};
```

### **3. Usage Tracking (Future)**

When rate limiting is enforced:

```typescript
// Check rate limit by userId
const requestCount = await usageLogsService.countByUserId(
  request.oauth.userId,
  '24h'
);

if (requestCount >= request.oauth.rateLimit) {
  throw new TooManyRequestsException({
    statusCode: 429,
    message: `Rate limit exceeded. Limit: ${request.oauth.rateLimit}/day`,
    error: 'Too Many Requests',
  });
}
```

---

## 📈 Rate Limit Tiers

| Tier | Requests/Day | Shared Across |
|------|--------------|---------------|
| **Free** | 1,000 | All user's clients |
| **Basic** | 5,000 | All user's clients |
| **Premium** | 10,000 | All user's clients |
| **Enterprise** | 100,000 | All user's clients |

---

## 🎯 User Experience

### **Scenario 1: Single Client**

```
User creates 1 OAuth client
├── Client A: 1000/day quota
└── Total: 1000/day
```

### **Scenario 2: Multiple Clients**

```
User creates 3 OAuth clients
├── Client A: Shares 1000/day quota
├── Client B: Shares 1000/day quota
└── Client C: Shares 1000/day quota
Total: 1000/day (SHARED, not 3000)
```

### **Scenario 3: Upgrade**

```
User upgrades to Premium
├── All clients now share 10,000/day
├── No need to recreate clients
└── Immediate effect on next token
```

---

## 🔍 Tracking Queries

### **Count User's Requests (24h)**

```sql
SELECT COUNT(*) 
FROM usage_log 
WHERE user_agent LIKE 'OAuth:%'
  AND user_agent IN (
    SELECT CONCAT('OAuth:', client_id)
    FROM oauth_client
    WHERE user_id = 5
  )
  AND created_at > NOW() - INTERVAL '1 day';
```

### **Better: Add userId to usage_log**

For efficient tracking, consider adding `userId` to `usage_log`:

```sql
ALTER TABLE usage_log ADD COLUMN user_id INTEGER;

-- Then query becomes simple:
SELECT COUNT(*) 
FROM usage_log 
WHERE user_id = 5
  AND created_at > NOW() - INTERVAL '1 day';
```

---

## ⚠️ Important Notes

### **Current Status**

- ✅ JWT includes `userId`
- ✅ Request object includes `userId`
- ✅ Usage is tracked per request
- ❌ **Rate limiting NOT enforced** (marked as future enhancement)

### **To Enforce Rate Limiting**

You'll need to:

1. Add rate limiting logic to `OAuthGuard`
2. Query usage count by `userId`
3. Return 429 when limit exceeded
4. Add rate limit headers to responses:
   ```
   X-RateLimit-Limit: 1000
   X-RateLimit-Remaining: 742
   X-RateLimit-Reset: 1730742350
   ```

---

## 🚀 Future Enhancements

### **Phase 1: Basic Enforcement** (Next)
- [ ] Implement rate limit checking in OAuthGuard
- [ ] Return 429 when limit exceeded
- [ ] Add rate limit headers

### **Phase 2: Advanced Tracking**
- [ ] Add `userId` column to `usage_log` table
- [ ] Create indexes for fast queries
- [ ] Cache rate limit counts (Redis)

### **Phase 3: Flexible Limits**
- [ ] Per-endpoint rate limits
- [ ] Burst allowances
- [ ] Time-window sliding windows
- [ ] Custom limits per client (override user limit)

---

## 🎨 Alternative: Per-Client Limits

If you want **per-client** limits instead:

### **Pros:**
- Each app has independent quota
- One app can't exhaust quota for others

### **Cons:**
- Users can bypass by creating many clients
- Need to limit number of clients per user
- More complex tracking

### **Implementation:**
```typescript
// Track by clientId instead of userId
const requestCount = await usageLogsService.countByClientId(
  request.oauth.clientId,
  '24h'
);
```

### **Recommendation:**
**Stick with per-user limits** unless you have a specific need for per-client isolation.

---

## 📚 Related Documentation

- [Tier and Rate Limit Changes](./TIER_RATE_LIMIT_CHANGES.md)
- [OAuth Implementation Summary](./OAUTH_IMPLEMENTATION_SUMMARY.md)

---

**Decision:** ✅ **Per-User Rate Limiting**  
**Status:** Infrastructure ready, enforcement pending  
**Last Updated:** November 3, 2025
