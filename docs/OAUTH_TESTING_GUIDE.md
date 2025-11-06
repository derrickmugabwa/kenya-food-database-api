# OAuth 2.0 Testing Guide

## 📋 Overview

This guide walks you through testing the OAuth 2.0 Client Credentials implementation for the Kenya Food Database API.

**Prerequisites:**
- Server running on `http://localhost:3000`
- Admin user account (for creating OAuth clients)
- API testing tool (Postman, Thunder Client, or curl)

---

## 🚀 Quick Start Testing Flow

### Step 1: Login as Admin (Get JWT Token)

First, you need to authenticate as an admin to create OAuth clients.

**Request:**
```bash
POST http://localhost:3000/api/v1/auth/email/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "secret"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "tokenExpires": 1234567890,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": {
      "id": 1,
      "name": "Admin"
    }
  }
}
```

**Save the `token` value** - you'll need it for the next step.

---

### Step 2: Create OAuth Client

Create an OAuth client that will be used to get access tokens.

**Request:**
```bash
POST http://localhost:3000/api/v1/oauth/clients
Authorization: Bearer <YOUR_ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "userId": 1,
  "name": "Test Mobile App",
  "description": "OAuth client for testing",
  "scopes": ["read:foods", "read:categories", "read:nutrients"],
  "tier": "free",
  "rateLimit": 1000,
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**Expected Response:**
```json
{
  "client": {
    "id": 1,
    "clientId": "kfdb_client_abc123xyz",
    "name": "Test Mobile App",
    "description": "OAuth client for testing",
    "userId": 1,
    "scopes": ["read:foods", "read:categories", "read:nutrients"],
    "grantTypes": ["client_credentials"],
    "tier": "free",
    "rateLimit": 1000,
    "status": "active",
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "createdAt": "2025-11-02T10:00:00.000Z",
    "updatedAt": "2025-11-02T10:00:00.000Z"
  },
  "clientSecret": "xyz789secretabc456"
}
```

**⚠️ IMPORTANT:** Save both `clientId` and `clientSecret` - the secret is only shown once!

---

### Step 3: Get Access Token (OAuth Token Endpoint)

Exchange your client credentials for an access token.

**Request:**
```bash
POST http://localhost:3000/api/v1/oauth/token
Content-Type: application/json

{
  "grant_type": "client_credentials",
  "client_id": "kfdb_client_abc123xyz",
  "client_secret": "xyz789secretabc456",
  "scope": "read:foods read:categories"
}
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJrZmRiX2NsaWVudF9hYmMxMjN4eXoiLCJjbGllbnRfaWQiOiJrZmRiX2NsaWVudF9hYmMxMjN4eXoiLCJzY29wZXMiOlsicmVhZDpmb29kcyIsInJlYWQ6Y2F0ZWdvcmllcyJdLCJ0aWVyIjoiZnJlZSIsInJhdGVfbGltaXQiOjEwMDAsImlhdCI6MTczMDU0NDAwMCwiZXhwIjoxNzMwNTQ3NjAwLCJpc3MiOiJrZW55YS1mb29kLWRiIiwiYXVkIjoiYXBpIn0...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read:foods read:categories"
}
```

**Save the `access_token`** - this is your OAuth token valid for 1 hour.

---

### Step 4: Access Protected Endpoints

Use the access token to access protected endpoints.

#### Test 4a: Get Foods (Should Work)

**Request:**
```bash
GET http://localhost:3000/api/v1/foods
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Ugali",
      "description": "Kenyan staple food made from maize flour",
      ...
    }
  ],
  "hasNextPage": false
}
```

✅ **Success!** You have `read:foods` scope.

---

#### Test 4b: Get Categories (Should Work)

**Request:**
```bash
GET http://localhost:3000/api/v1/categories
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Grains",
      ...
    }
  ],
  "hasNextPage": false
}
```

✅ **Success!** You have `read:categories` scope.

---

#### Test 4c: Get Nutrients (Should Work)

**Request:**
```bash
GET http://localhost:3000/api/v1/nutrients
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Protein",
      ...
    }
  ],
  "hasNextPage": false
}
```

✅ **Success!** You have `read:nutrients` scope.

---

## 🔒 Testing Authorization & Error Cases

### Test 5: Access Without Token (Should Fail)

**Request:**
```bash
GET http://localhost:3000/api/v1/foods
# No Authorization header
```

**Expected Response (401):**
```json
{
  "statusCode": 401,
  "message": "Access token is required. Please provide a Bearer token in the Authorization header.",
  "error": "Unauthorized"
}
```

✅ **Correct!** Token is required.

---

### Test 6: Access With Invalid Token (Should Fail)

**Request:**
```bash
GET http://localhost:3000/api/v1/foods
Authorization: Bearer invalid_token_here
```

**Expected Response (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid or expired access token.",
  "error": "Unauthorized"
}
```

✅ **Correct!** Invalid tokens are rejected.

---

### Test 7: Access With Expired Token (Should Fail)

Wait 1 hour after getting the token, then try to use it.

**Request:**
```bash
GET http://localhost:3000/api/v1/foods
Authorization: Bearer <expired_token>
```

**Expected Response (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid or expired access token.",
  "error": "Unauthorized"
}
```

✅ **Correct!** Expired tokens are rejected.

---

### Test 8: Request Scopes Not Granted (Should Fail)

Try to get a token with scopes not granted to your client.

**Request:**
```bash
POST http://localhost:3000/api/v1/oauth/token
Content-Type: application/json

{
  "grant_type": "client_credentials",
  "client_id": "kfdb_client_abc123xyz",
  "client_secret": "xyz789secretabc456",
  "scope": "write:foods admin"
}
```

**Expected Response (400):**
```json
{
  "statusCode": 400,
  "message": "Invalid scopes: write:foods, admin",
  "error": "Bad Request"
}
```

✅ **Correct!** Cannot request scopes not granted to the client.

---

### Test 9: Invalid Client Credentials (Should Fail)

**Request:**
```bash
POST http://localhost:3000/api/v1/oauth/token
Content-Type: application/json

{
  "grant_type": "client_credentials",
  "client_id": "invalid_client",
  "client_secret": "wrong_secret"
}
```

**Expected Response (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid client credentials",
  "error": "Unauthorized"
}
```

✅ **Correct!** Invalid credentials are rejected.

---

## 🔄 Testing Client Management

### Test 10: List OAuth Clients (Admin Only)

**Request:**
```bash
GET http://localhost:3000/api/v1/oauth/clients?page=1&limit=10
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "clientId": "kfdb_client_abc123xyz",
    "name": "Test Mobile App",
    "scopes": ["read:foods", "read:categories", "read:nutrients"],
    "status": "active",
    ...
  }
]
```

---

### Test 11: Get Client by ID (Admin Only)

**Request:**
```bash
GET http://localhost:3000/api/v1/oauth/clients/1
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Expected Response:**
```json
{
  "id": 1,
  "clientId": "kfdb_client_abc123xyz",
  "name": "Test Mobile App",
  ...
}
```

---

### Test 12: Update OAuth Client (Admin Only)

**Request:**
```bash
PATCH http://localhost:3000/api/v1/oauth/clients/1
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "name": "Updated App Name",
  "rateLimit": 2000
}
```

**Expected Response:**
```json
{
  "id": 1,
  "clientId": "kfdb_client_abc123xyz",
  "name": "Updated App Name",
  "rateLimit": 2000,
  ...
}
```

---

### Test 13: Revoke OAuth Client (Admin Only)

**Request:**
```bash
DELETE http://localhost:3000/api/v1/oauth/clients/1
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Expected Response:**
```
204 No Content
```

After deletion, tokens issued for this client should no longer work.

---

## 🧪 Testing with Postman

### Setup Postman Collection

1. **Create Environment Variables:**
   - `base_url`: `http://localhost:3000`
   - `admin_token`: (Set after login)
   - `client_id`: (Set after creating client)
   - `client_secret`: (Set after creating client)
   - `access_token`: (Set after getting OAuth token)

2. **Create Requests:**

#### Request 1: Admin Login
```
POST {{base_url}}/api/v1/auth/email/login
Body: { "email": "admin@example.com", "password": "secret" }
Tests Script:
  pm.environment.set("admin_token", pm.response.json().token);
```

#### Request 2: Create OAuth Client
```
POST {{base_url}}/api/v1/oauth/clients
Authorization: Bearer {{admin_token}}
Body: { "userId": 1, "name": "Test App", "scopes": ["read:foods"] }
Tests Script:
  pm.environment.set("client_id", pm.response.json().client.clientId);
  pm.environment.set("client_secret", pm.response.json().clientSecret);
```

#### Request 3: Get Access Token
```
POST {{base_url}}/api/v1/oauth/token
Body: {
  "grant_type": "client_credentials",
  "client_id": "{{client_id}}",
  "client_secret": "{{client_secret}}"
}
Tests Script:
  pm.environment.set("access_token", pm.response.json().access_token);
```

#### Request 4: Get Foods
```
GET {{base_url}}/api/v1/foods
Authorization: Bearer {{access_token}}
```

---

## 🧪 Testing with cURL

### Complete Test Flow

```bash
# 1. Login as admin
curl -X POST http://localhost:3000/api/v1/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secret"}'

# Save the token from response
ADMIN_TOKEN="eyJhbGc..."

# 2. Create OAuth client
curl -X POST http://localhost:3000/api/v1/oauth/clients \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "name": "Test App",
    "scopes": ["read:foods", "read:categories"],
    "tier": "free"
  }'

# Save clientId and clientSecret from response
CLIENT_ID="kfdb_client_abc123"
CLIENT_SECRET="xyz789secret"

# 3. Get access token
curl -X POST http://localhost:3000/api/v1/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "client_credentials",
    "client_id": "'$CLIENT_ID'",
    "client_secret": "'$CLIENT_SECRET'"
  }'

# Save access_token from response
ACCESS_TOKEN="eyJhbGc..."

# 4. Access protected endpoint
curl -X GET http://localhost:3000/api/v1/foods \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 5. Test without token (should fail)
curl -X GET http://localhost:3000/api/v1/foods

# 6. Test with invalid token (should fail)
curl -X GET http://localhost:3000/api/v1/foods \
  -H "Authorization: Bearer invalid_token"
```

---

## 📊 Testing Checklist

### ✅ Basic OAuth Flow
- [ ] Admin can create OAuth client
- [ ] Client receives clientId and clientSecret
- [ ] Can exchange credentials for access token
- [ ] Access token works for authorized scopes
- [ ] Token expires after 1 hour

### ✅ Authorization & Scopes
- [ ] Cannot access without token
- [ ] Cannot access with invalid token
- [ ] Cannot access with expired token
- [ ] Cannot request scopes not granted
- [ ] Can only access endpoints matching scopes

### ✅ Client Management
- [ ] Admin can list all clients
- [ ] Admin can get client by ID
- [ ] Admin can update client
- [ ] Admin can delete client
- [ ] Deleted client's tokens stop working

### ✅ Error Handling
- [ ] Helpful error messages for missing token
- [ ] Helpful error messages for invalid token
- [ ] Helpful error messages for expired token
- [ ] Helpful error messages for insufficient scope
- [ ] Helpful error messages for invalid credentials

### ✅ Security
- [ ] Client secret is hashed in database
- [ ] Client secret only shown once on creation
- [ ] Tokens are JWT signed
- [ ] Tokens stored in database for revocation
- [ ] Expired tokens rejected

---

## 🔍 Debugging Tips

### Check Database

```sql
-- View OAuth clients
SELECT * FROM oauth_client;

-- View OAuth tokens
SELECT * FROM oauth_token;

-- Check token expiration
SELECT id, client_id, expires_at, revoked 
FROM oauth_token 
WHERE expires_at > NOW();
```

### Check Logs

Look for these log messages:
- Token generation
- Token verification
- Scope validation
- Client authentication

### Common Issues

**Issue:** "Invalid client credentials"
- **Solution:** Check clientId and clientSecret are correct
- **Solution:** Verify client status is 'active'

**Issue:** "Invalid scopes"
- **Solution:** Check requested scopes match client's allowed scopes
- **Solution:** Verify scope names are correct (e.g., 'read:foods' not 'foods:read')

**Issue:** "Token has expired"
- **Solution:** Get a new token (tokens expire after 1 hour)
- **Solution:** Implement token refresh logic in your app

**Issue:** "Insufficient scope"
- **Solution:** Request token with correct scopes
- **Solution:** Update client to have required scopes

---

## 🎯 Next Steps

After successful testing:

1. **Update API Documentation** - Document OAuth flow for developers
2. **Create Client SDKs** - Build helper libraries for common languages
3. **Set Up Monitoring** - Track token usage and errors
4. **Implement Rate Limiting** - Use tier-based rate limits
5. **Add Token Refresh** - Implement refresh token grant (optional)

---

## 📚 Additional Resources

- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [OAuth 2.0 Client Credentials](https://oauth.net/2/grant-types/client-credentials/)
- [JWT.io](https://jwt.io/) - Decode and verify JWT tokens
- [Postman OAuth 2.0](https://learning.postman.com/docs/sending-requests/authorization/#oauth-20)

---

**Document Version:** 1.0  
**Last Updated:** November 2, 2025  
**Status:** Ready for Testing
