# Rate Limit Update FAQ

## ❓ Question 1: Will Rate Limit Updates Apply to Existing Apps?

### **Answer: YES, but with a 1-hour delay** ⏰

When you upgrade a user's rate limit, it affects all their OAuth clients, but **existing tokens** need to expire first.

### **Timeline Example:**

```
10:00 AM - User creates OAuth client
         ├─ Gets token with rate_limit: 1000
         └─ Token expires at 11:00 AM

10:30 AM - Admin upgrades user to premium
         ├─ User's apiRateLimit: 1000 → 10000
         └─ Database updated ✅

10:35 AM - Client still using old token
         ├─ Token payload: { rate_limit: 1000 }
         └─ Still limited to 1000 ⚠️

11:01 AM - Client requests new token
         ├─ Token payload: { rate_limit: 10000 }
         └─ Now has 10000 limit ✅
```

### **Key Points:**

- ✅ **New tokens** immediately reflect the updated rate limit
- ⚠️ **Existing tokens** keep the old rate limit until expiry
- ⏰ **Maximum delay:** 1 hour (default token expiration)
- 🔄 **All clients** get the update (when they refresh tokens)

### **Why This Happens:**

JWT tokens are **stateless** - the rate limit is embedded in the token payload. Once issued, the token cannot be modified until it expires.

### **Workaround for Immediate Effect:**

If you need immediate effect, you can:

1. **Revoke all user's tokens** (requires implementation)
2. **Reduce token expiry** to 5-15 minutes (trade-off: more token requests)
3. **Force token refresh** on client side

---

## ❓ Question 2: Can You Update Rate Limit Without Updating Tier?

### **Answer: YES!** ✅

Both fields are now **optional** and can be updated independently.

### **Examples:**

#### **Update Only Rate Limit**

```bash
PATCH /api/v1/users/5/api-access
Authorization: Bearer <admin-jwt>
{
  "apiRateLimit": 15000
}

# Result:
# - apiTier: 'free' (unchanged)
# - apiRateLimit: 1000 → 15000 ✅
```

#### **Update Only Tier**

```bash
PATCH /api/v1/users/5/api-access
Authorization: Bearer <admin-jwt>
{
  "apiTier": "premium"
}

# Result:
# - apiTier: 'free' → 'premium' ✅
# - apiRateLimit: 1000 (unchanged)
```

#### **Update Both**

```bash
PATCH /api/v1/users/5/api-access
Authorization: Bearer <admin-jwt>
{
  "apiTier": "premium",
  "apiRateLimit": 10000
}

# Result:
# - apiTier: 'free' → 'premium' ✅
# - apiRateLimit: 1000 → 10000 ✅
```

### **Use Cases:**

1. **Custom Rate Limits**
   - User on "free" tier but needs 2000/day
   - Update only `apiRateLimit` without changing tier

2. **Tier Upgrade**
   - User upgrades to "premium"
   - Update only `apiTier` (or both for standard limits)

3. **Temporary Boost**
   - Give user 20000/day for a special event
   - Update only `apiRateLimit`, keep tier as "free"

4. **Tier Downgrade**
   - User cancels premium subscription
   - Update only `apiTier` back to "free"

---

## 🔄 How Updates Propagate

### **Database → OAuth Client → JWT Token**

```
┌─────────────────────────────────────────────────────┐
│ Step 1: Admin Updates User                         │
│ PATCH /users/5/api-access                          │
│ { apiRateLimit: 10000 }                            │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Step 2: Database Updated                           │
│ user.apiRateLimit: 1000 → 10000 ✅                │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Step 3: User Creates New OAuth Client              │
│ POST /oauth/clients                                │
│ → Inherits user.apiRateLimit = 10000 ✅           │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Step 4: Client Requests Token                      │
│ POST /oauth/token                                  │
│ → JWT includes rate_limit: 10000 ✅               │
└─────────────────────────────────────────────────────┘
```

### **For Existing Clients:**

```
┌─────────────────────────────────────────────────────┐
│ Existing Client with Old Token                     │
│ Token: { rate_limit: 1000, exp: 11:00 AM }        │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Admin Updates User (10:30 AM)                      │
│ user.apiRateLimit: 1000 → 10000                   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Client Still Using Old Token (10:35 AM)            │
│ Token: { rate_limit: 1000 } ← OLD VALUE ⚠️        │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Token Expires (11:00 AM)                           │
│ Client requests new token                          │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ New Token Issued (11:01 AM)                        │
│ Token: { rate_limit: 10000 } ← NEW VALUE ✅       │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Standard vs Custom Rate Limits

### **Standard Tier Limits**

| Tier | Standard Rate Limit |
|------|---------------------|
| Free | 1,000/day |
| Basic | 5,000/day |
| Premium | 10,000/day |
| Enterprise | 100,000/day |

### **Custom Rate Limits**

You can set **any rate limit** regardless of tier:

```bash
# User on "free" tier with custom 50,000/day limit
PATCH /api/v1/users/5/api-access
{
  "apiTier": "free",
  "apiRateLimit": 50000
}
```

**Use Cases:**
- Beta testers
- Special partnerships
- Temporary promotions
- Custom contracts

---

## 🎯 Best Practices

### **1. Update Both for Standard Tiers**

```bash
# When upgrading to premium, update both
PATCH /api/v1/users/5/api-access
{
  "apiTier": "premium",
  "apiRateLimit": 10000
}
```

### **2. Update Only Rate Limit for Custom Deals**

```bash
# Special customer gets 25,000/day on free tier
PATCH /api/v1/users/5/api-access
{
  "apiRateLimit": 25000
}
# apiTier remains "free"
```

### **3. Notify Users of Changes**

After updating, consider:
- Sending email notification
- Showing in-app message
- Logging the change for audit

### **4. Document Custom Limits**

Keep track of users with custom limits:
```sql
-- Find users with non-standard limits
SELECT id, email, "apiTier", "apiRateLimit"
FROM "user"
WHERE 
  ("apiTier" = 'free' AND "apiRateLimit" != 1000) OR
  ("apiTier" = 'basic' AND "apiRateLimit" != 5000) OR
  ("apiTier" = 'premium' AND "apiRateLimit" != 10000) OR
  ("apiTier" = 'enterprise' AND "apiRateLimit" != 100000);
```

---

## ⚡ Quick Reference

### **Update Rate Limit Only**
```bash
PATCH /api/v1/users/:id/api-access
{ "apiRateLimit": 15000 }
```

### **Update Tier Only**
```bash
PATCH /api/v1/users/:id/api-access
{ "apiTier": "premium" }
```

### **Update Both**
```bash
PATCH /api/v1/users/:id/api-access
{ "apiTier": "premium", "apiRateLimit": 10000 }
```

### **Check Current Values**
```bash
GET /api/v1/users/:id
# Response includes apiTier and apiRateLimit
```

---

## 🔍 Troubleshooting

### **Problem: User says rate limit didn't update**

**Solution:**
1. Check if token has expired (wait up to 1 hour)
2. Ask user to request a new token
3. Verify database was updated:
   ```sql
   SELECT "apiTier", "apiRateLimit" FROM "user" WHERE id = 5;
   ```

### **Problem: Want immediate effect**

**Solution:**
1. Reduce token expiry time (in `oauth.service.ts`):
   ```typescript
   expiresIn: '15m', // Instead of '1h'
   ```
2. Or implement token revocation

### **Problem: Accidentally updated wrong field**

**Solution:**
Update again with correct value:
```bash
PATCH /api/v1/users/5/api-access
{ "apiRateLimit": 1000 }  # Revert to original
```

---

## 📚 Related Documentation

- [Tier and Rate Limit Changes](./TIER_RATE_LIMIT_CHANGES.md)
- [Rate Limiting Strategy](./RATE_LIMITING_STRATEGY.md)
- [OAuth Implementation Summary](./OAUTH_IMPLEMENTATION_SUMMARY.md)

---

**Last Updated:** November 3, 2025  
**Version:** 2.0.0
