# Flexible Authentication Implementation

## 🎯 Overview

This document explains the **FlexibleAuthGuard** implementation that allows GET requests to accept **multiple authentication methods** without compromising security.

---

## ✅ Problem Solved

### **Before**
- ❌ Admin users needed OAuth credentials to fetch data (GET requests)
- ❌ Poor UX: Admins had to manage both session tokens AND OAuth credentials
- ❌ Admins couldn't use their logged-in session to browse data in admin panel

### **After**
- ✅ Admins can use their JWT session token for ALL requests (GET, POST, PATCH, DELETE)
- ✅ Public API consumers still use OAuth/API keys (unchanged)
- ✅ Single authentication flow for admin frontend
- ✅ **No security compromises** - all methods are validated

---

## 🔐 How It Works

### **FlexibleAuthGuard** - Multi-Method Authentication

The `FlexibleAuthGuard` tries authentication methods in this order:

```
1. JWT Session Token (for logged-in users, especially admins)
   ↓ If fails...
2. OAuth Token (for API consumers)
   ↓ If fails...
3. API Key (for simple API access)
   ↓ If all fail...
4. Throw UnauthorizedException
```

### **Security Model**

| Method | Use Case | Validation |
|--------|----------|------------|
| **JWT Session** | Admin panel, logged-in users | JWT signature + user session |
| **OAuth Token** | Public API consumers | JWT signature + DB lookup + scope check |
| **API Key** | Simple API access | Hash comparison + expiration check |

---

## 📝 Implementation Details

### **1. FlexibleAuthGuard**

Location: `src/auth/guards/flexible-auth.guard.ts`

**Key Features:**
- ✅ Accepts Bearer tokens (JWT or OAuth)
- ✅ Accepts API keys (x-api-key header)
- ✅ Validates each method independently
- ✅ Attaches appropriate context to request
- ✅ Checks OAuth scopes when applicable

**How It Distinguishes Token Types:**

```typescript
// JWT Session Token
{
  id: 1,              // User ID
  email: "admin@example.com",
  role: { id: 1, name: "admin" }
  // No client_id field
}

// OAuth Token
{
  client_id: "kfdb_client_abc123",  // Client ID present
  user_id: 1,
  scopes: ["read:foods", "read:categories"],
  tier: "free",
  rate_limit: 1000
}
```

### **2. Updated Controllers**

All GET endpoints now use `FlexibleAuthGuard`:

**Foods Controller:**
```typescript
@Get()
@ApiBearerAuth()
@ApiSecurity('api-key')
@ApiSecurity('oauth2', [SCOPES.READ_FOODS])
@RequireScope(SCOPES.READ_FOODS)
@UseGuards(FlexibleAuthGuard)  // ← Changed from OAuthGuard
async findAll(@Query() query: FindAllFoodsDto) {
  // ...
}
```

**Categories Controller:**
```typescript
@Get()
@ApiBearerAuth()
@ApiSecurity('api-key')
@ApiSecurity('oauth2', [SCOPES.READ_CATEGORIES])
@RequireScope(SCOPES.READ_CATEGORIES)
@UseGuards(FlexibleAuthGuard)  // ← Changed from OAuthGuard
async findAll(@Query() query: FindAllCategoriesDto) {
  // ...
}
```

**Nutrients Controller:**
```typescript
@Get()
@ApiBearerAuth()
@ApiSecurity('api-key')
@ApiSecurity('oauth2', [SCOPES.READ_NUTRIENTS])
@RequireScope(SCOPES.READ_NUTRIENTS)
@UseGuards(FlexibleAuthGuard)  // ← Changed from OAuthGuard
async findAll(@Query() query: FindAllNutrientsDto) {
  // ...
}
```

### **3. Module Updates**

**AuthModule** now exports `FlexibleAuthGuard`:
```typescript
@Module({
  imports: [
    UsersModule,
    SessionModule,
    PassportModule,
    MailModule,
    JwtModule.register({}),
    ApiKeysModule,    // ← Added
    OAuthModule,      // ← Added
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    AnonymousStrategy,
    FlexibleAuthGuard,  // ← Added
  ],
  exports: [AuthService, FlexibleAuthGuard],  // ← Export guard
})
export class AuthModule {}
```

**Foods/Categories/Nutrients Modules** import `AuthModule`:
```typescript
@Module({
  imports: [
    RelationalFoodPersistenceModule,
    ApiKeysModule,
    UsageLogsModule,
    OAuthModule,
    AuthModule,  // ← Added
  ],
  // ...
})
export class FoodsModule {}
```

---

## 🚀 Usage Examples

### **1. Admin Frontend (JWT Session)**

```typescript
// Admin logs in
const { token } = await fetch('/api/v1/auth/email/login', {
  method: 'POST',
  body: JSON.stringify({ email: 'admin@example.com', password: 'secret' }),
});

// Use session token for GET requests
const foods = await fetch('/api/v1/foods', {
  headers: {
    'Authorization': `Bearer ${token}`,  // JWT session token
  },
});

// Same token works for POST/PATCH/DELETE
const newFood = await fetch('/api/v1/foods', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,  // Same token!
  },
  body: JSON.stringify({ name: 'Ugali', category: 1 }),
});
```

### **2. Public API Consumer (OAuth)**

```typescript
// Get OAuth token
const { access_token } = await fetch('/api/v1/oauth/token', {
  method: 'POST',
  body: JSON.stringify({
    grant_type: 'client_credentials',
    client_id: 'kfdb_client_abc123',
    client_secret: 'secret',
  }),
});

// Use OAuth token for GET requests
const foods = await fetch('/api/v1/foods', {
  headers: {
    'Authorization': `Bearer ${access_token}`,  // OAuth token
  },
});

// OAuth tokens CANNOT be used for POST/PATCH/DELETE (admin only)
```

### **3. Simple API Access (API Key)**

```typescript
// Use API key for GET requests
const foods = await fetch('/api/v1/foods', {
  headers: {
    'x-api-key': 'kfdb_live_abc123xyz',  // API key
  },
});

// API keys CANNOT be used for POST/PATCH/DELETE (admin only)
```

---

## 🔒 Security Guarantees

### **What's Protected**

| Endpoint Type | Authentication Required | Authorization Required |
|--------------|------------------------|------------------------|
| **GET (Read)** | JWT OR OAuth OR API Key | None (public read) |
| **POST (Create)** | JWT Session ONLY | Admin role required |
| **PATCH (Update)** | JWT Session ONLY | Admin role required |
| **DELETE (Delete)** | JWT Session ONLY | Admin role required |

### **Security Validations**

**JWT Session Token:**
1. ✅ Valid JWT signature
2. ✅ Token not expired
3. ✅ User exists in session
4. ✅ For write operations: Admin role check

**OAuth Token:**
1. ✅ Valid JWT signature
2. ✅ Correct issuer and audience
3. ✅ Token exists in database
4. ✅ Token not revoked
5. ✅ Token not expired
6. ✅ Required scopes present

**API Key:**
1. ✅ Valid format (kfdb_live_xxx)
2. ✅ Hash matches database
3. ✅ Key status is 'active'
4. ✅ Key not expired

---

## 📊 Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Incoming Request                          │
│              GET /api/v1/foods                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              FlexibleAuthGuard                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Try JWT      │  │ Try OAuth    │  │ Try API Key  │
│ Session      │  │ Token        │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
        ↓                  ↓                  ↓
    Success?          Success?          Success?
        ↓                  ↓                  ↓
        └──────────────────┼──────────────────┘
                           ↓
                    ┌─────────────┐
                    │  Authorized │
                    └─────────────┘
                           ↓
                    ┌─────────────┐
                    │   Return    │
                    │    Data     │
                    └─────────────┘
```

---

## 🎯 Benefits

### **For Admins**
- ✅ Single authentication flow (login once, use everywhere)
- ✅ No need to manage OAuth credentials
- ✅ Better UX in admin panel
- ✅ Consistent token usage across all operations

### **For Public API Consumers**
- ✅ No changes required (OAuth/API keys still work)
- ✅ Same endpoints, same authentication
- ✅ No breaking changes

### **For Security**
- ✅ All authentication methods fully validated
- ✅ Write operations still require admin role
- ✅ No security compromises
- ✅ Proper audit trails (different auth methods tracked)

---

## 🧪 Testing

### **Test JWT Session Token**
```bash
# Login as admin
curl -X POST http://localhost:3000/api/v1/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secret"}'

# Use returned token for GET
curl http://localhost:3000/api/v1/foods \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Use same token for POST
curl -X POST http://localhost:3000/api/v1/foods \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Ugali","category":1}'
```

### **Test OAuth Token**
```bash
# Get OAuth token
curl -X POST http://localhost:3000/api/v1/oauth/token \
  -H "Content-Type: application/json" \
  -d '{"grant_type":"client_credentials","client_id":"xxx","client_secret":"yyy"}'

# Use OAuth token for GET
curl http://localhost:3000/api/v1/foods \
  -H "Authorization: Bearer <OAUTH_TOKEN>"

# OAuth token should FAIL for POST (admin only)
curl -X POST http://localhost:3000/api/v1/foods \
  -H "Authorization: Bearer <OAUTH_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Ugali","category":1}'
# Expected: 401 or 403 error
```

### **Test API Key**
```bash
# Use API key for GET
curl http://localhost:3000/api/v1/foods \
  -H "x-api-key: kfdb_live_abc123xyz"

# API key should FAIL for POST (admin only)
curl -X POST http://localhost:3000/api/v1/foods \
  -H "x-api-key: kfdb_live_abc123xyz" \
  -H "Content-Type: application/json" \
  -d '{"name":"Ugali","category":1}'
# Expected: 401 or 403 error
```

---

## 📋 Summary

### **What Changed**
- ✅ Created `FlexibleAuthGuard` that accepts multiple auth methods
- ✅ Updated GET endpoints to use `FlexibleAuthGuard`
- ✅ Added `@ApiBearerAuth()` decorator to GET endpoints
- ✅ Updated module imports to include `AuthModule`

### **What Stayed the Same**
- ✅ Write operations (POST/PATCH/DELETE) still require admin JWT
- ✅ OAuth/API key authentication still works
- ✅ All security validations intact
- ✅ No breaking changes for API consumers

### **Result**
**Admins can now use their session tokens for ALL operations, while public API consumers continue using OAuth/API keys for read-only access. Security is maintained, UX is improved!** 🎉
