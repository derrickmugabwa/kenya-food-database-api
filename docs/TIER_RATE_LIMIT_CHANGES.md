# Tier and Rate Limit System Changes

## 🎯 Overview

The tier and rate limit system has been refactored to be **admin-controlled** instead of user-controlled. This ensures security, prevents abuse, and prepares the system for future monetization.

---

## 🔄 What Changed

### **Before (Insecure)**
- ❌ Users could set their own tier during OAuth client creation
- ❌ Users could set arbitrary rate limits (e.g., 1,000,000)
- ❌ No validation or payment required
- ❌ Security risk and business logic bypass

### **After (Secure)**
- ✅ Tier and rate limit stored at **user level**, not client level
- ✅ All users default to **free tier** (1000 requests/day) on signup
- ✅ OAuth clients **inherit** tier from user account
- ✅ Only **admins** can upgrade user tiers
- ✅ Ready for future monetization

---

## 📊 New Architecture

```
┌─────────────────────────────────────────────────────┐
│                    User Account                     │
│  - apiTier: 'free' | 'basic' | 'premium' | 'ent'  │
│  - apiRateLimit: 1000 | 5000 | 10000 | 100000     │
└──────────────────┬──────────────────────────────────┘
                   │ Inherits from
                   ▼
┌─────────────────────────────────────────────────────┐
│              OAuth Client (Multiple)                │
│  - tier: inherited from user                        │
│  - rateLimit: inherited from user                   │
└─────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Changes

### **User Table** (New Columns)

```sql
ALTER TABLE "user" 
ADD "apiTier" VARCHAR(20) NOT NULL DEFAULT 'free',
ADD "apiRateLimit" INTEGER NOT NULL DEFAULT 1000;
```

**Fields:**
- `apiTier`: User's API access tier (`'free'`, `'basic'`, `'premium'`, `'enterprise'`)
- `apiRateLimit`: Number of API requests allowed per day

**Defaults:**
- All existing users: `apiTier = 'free'`, `apiRateLimit = 1000`
- All new users: Same defaults on signup

---

## 📝 Code Changes

### **1. CreateOAuthClientDto** (Removed Fields)

**Before:**
```typescript
export class CreateOAuthClientDto {
  name: string;
  scopes?: string[];
  tier?: string;        // ❌ REMOVED
  rateLimit?: number;   // ❌ REMOVED
}
```

**After:**
```typescript
export class CreateOAuthClientDto {
  name: string;
  scopes?: string[];
  // tier and rateLimit now inherited from user
}
```

### **2. User Domain Model** (New Fields)

```typescript
export class User {
  // ... existing fields
  
  @ApiProperty({
    type: String,
    example: 'free',
    description: 'API access tier',
  })
  @Expose({ groups: ['me', 'admin'] })
  apiTier: string;

  @ApiProperty({
    type: Number,
    example: 1000,
    description: 'API rate limit (requests per day)',
  })
  @Expose({ groups: ['me', 'admin'] })
  apiRateLimit: number;
}
```

### **3. OAuthService** (Inherit from User)

```typescript
async createClient(createDto: CreateOAuthClientDto) {
  // Get user to determine tier and rate limit
  const user = await this.usersService.findById(createDto.userId);
  
  // Inherit tier and rate limit from user account
  const tier = user.apiTier || 'free';
  const rateLimit = user.apiRateLimit || 1000;
  
  const clientData = {
    ...createDto,
    tier,        // Inherited from user
    rateLimit,   // Inherited from user
  };
  
  return this.oauthClientRepository.create(clientData);
}
```

### **4. New Admin Endpoint**

```typescript
// PATCH /api/v1/users/:id/api-access
// Admin only - manage user API access

@Patch(':id/api-access')
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
async updateApiAccess(
  @Param('id') id: number,
  @Body() updateDto: UpdateUserApiAccessDto,
) {
  return this.usersService.updateApiAccess(id, updateDto);
}
```

**DTO:**
```typescript
export class UpdateUserApiAccessDto {
  @IsEnum(['free', 'basic', 'premium', 'enterprise'])
  apiTier: string;
  
  @IsNumber()
  @IsPositive()
  apiRateLimit: number;
}
```

---

## 🚀 Usage

### **User Creates OAuth Client** (Automatic Tier)

```bash
POST /api/v1/oauth/clients
Authorization: Bearer <user-jwt>
{
  "name": "My App",
  "scopes": ["read:foods"]
}

# Response - tier inherited from user
{
  "client": {
    "id": 1,
    "clientId": "kfdb_client_abc123",
    "name": "My App",
    "tier": "free",        # From user.apiTier
    "rateLimit": 1000,     # From user.apiRateLimit
    "scopes": ["read:foods"]
  },
  "clientSecret": "kfdb_secret_xyz789"
}
```

### **Admin Upgrades User Tier**

```bash
PATCH /api/v1/users/5/api-access
Authorization: Bearer <admin-jwt>
{
  "apiTier": "premium",
  "apiRateLimit": 10000
}

# Response
{
  "id": 5,
  "email": "user@example.com",
  "apiTier": "premium",
  "apiRateLimit": 10000,
  ...
}
```

### **User Creates New Client** (Inherits Upgraded Tier)

```bash
POST /api/v1/oauth/clients
Authorization: Bearer <user-jwt>
{
  "name": "My Second App",
  "scopes": ["read:foods"]
}

# Response - now has premium tier
{
  "client": {
    "tier": "premium",     # Inherited from upgraded user
    "rateLimit": 10000,    # Inherited from upgraded user
    ...
  }
}
```

---

## 📋 Tier Definitions

| Tier | Rate Limit | Use Case | Price (Future) |
|------|------------|----------|----------------|
| **Free** | 1,000/day | Personal projects, testing | Free |
| **Basic** | 5,000/day | Small apps, startups | $10/month |
| **Premium** | 10,000/day | Production apps | $50/month |
| **Enterprise** | 100,000/day | Large-scale applications | Custom |

---

## 🔐 Security Benefits

1. **No Self-Service Upgrades** - Users cannot bypass payment
2. **Centralized Control** - Admins manage all tier changes
3. **Audit Trail** - All tier changes logged in database
4. **Consistent Limits** - All user's clients share same tier
5. **Future-Proof** - Ready for payment integration

---

## 🎯 Admin Workflow

### **Scenario: User Requests Upgrade**

1. User contacts support requesting premium tier
2. Admin verifies payment/subscription
3. Admin calls upgrade endpoint:
   ```bash
   PATCH /api/v1/users/{userId}/api-access
   {
     "apiTier": "premium",
     "apiRateLimit": 10000
   }
   ```
4. All user's OAuth clients automatically inherit new tier
5. User gets increased rate limits immediately

---

## 🔄 Migration Steps

### **1. Run Database Migration**

```bash
npm run migration:run
```

This adds `apiTier` and `apiRateLimit` columns to user table with defaults.

### **2. Existing Users**

All existing users automatically get:
- `apiTier = 'free'`
- `apiRateLimit = 1000`

### **3. Existing OAuth Clients**

Existing OAuth clients keep their current tier/rateLimit values. New clients will inherit from user.

### **4. Optional: Sync Existing Clients**

If you want to sync existing clients to user tier:

```sql
-- Update all OAuth clients to match their user's tier
UPDATE oauth_client oc
SET 
  tier = u.apiTier,
  rate_limit = u.apiRateLimit
FROM "user" u
WHERE oc.userId = u.id;
```

---

## 🧪 Testing

### **Test 1: User Creates Client (Free Tier)**

```bash
# User with free tier creates client
POST /api/v1/oauth/clients
# Expect: tier='free', rateLimit=1000
```

### **Test 2: Admin Upgrades User**

```bash
# Admin upgrades user to premium
PATCH /api/v1/users/5/api-access
{ "apiTier": "premium", "apiRateLimit": 10000 }
# Expect: 200 OK, user.apiTier='premium'
```

### **Test 3: New Client Inherits Upgrade**

```bash
# Same user creates another client
POST /api/v1/oauth/clients
# Expect: tier='premium', rateLimit=10000
```

### **Test 4: Non-Admin Cannot Upgrade**

```bash
# Regular user tries to upgrade themselves
PATCH /api/v1/users/5/api-access
# Expect: 403 Forbidden
```

---

## 🚀 Future Enhancements

### **Phase 1: Current (Completed)**
- ✅ User-level tier management
- ✅ Admin-controlled upgrades
- ✅ OAuth clients inherit from user

### **Phase 2: Payment Integration (Future)**
- [ ] Stripe/payment gateway integration
- [ ] Self-service tier upgrades with payment
- [ ] Automatic tier changes on subscription events
- [ ] Billing dashboard

### **Phase 3: Advanced Features (Future)**
- [ ] Usage-based billing
- [ ] Custom rate limits per client
- [ ] Temporary tier boosts
- [ ] Team/organization tiers

---

## 📚 Related Files

### **Modified Files**
- `src/oauth/dto/create-oauth-client.dto.ts` - Removed tier/rateLimit
- `src/oauth/oauth.service.ts` - Inherit tier from user
- `src/oauth/oauth.module.ts` - Added UsersModule import
- `src/users/domain/user.ts` - Added apiTier/apiRateLimit
- `src/users/infrastructure/persistence/relational/entities/user.entity.ts` - Added columns
- `src/users/users.controller.ts` - Added admin endpoint
- `src/users/users.service.ts` - Added updateApiAccess method

### **New Files**
- `src/users/dto/update-user-api-access.dto.ts` - Admin DTO
- `src/database/migrations/1730656350000-AddUserApiTierAndRateLimit.ts` - Migration

---

## 📞 Support

For questions about tier management:
- **Admins**: Use `PATCH /api/v1/users/:id/api-access` endpoint
- **Users**: Contact support for tier upgrades
- **Developers**: Check Swagger docs at `/docs`

---

**Last Updated:** November 3, 2025  
**Version:** 2.0.0  
**Status:** ✅ Production Ready
