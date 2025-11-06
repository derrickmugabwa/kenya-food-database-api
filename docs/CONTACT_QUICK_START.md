# Contact API - Quick Start

## Public Endpoint (No Authentication)

### Submit a Contact Message

```bash
POST http://localhost:3000/api/v1/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "subject": "API Question",
  "message": "I have a question about the API usage..."
}
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "subject": "API Question",
  "message": "I have a question about the API usage...",
  "status": "pending",
  "createdAt": "2025-11-05T11:50:00.000Z",
  "updatedAt": "2025-11-05T11:50:00.000Z"
}
```

---

## Admin Endpoints (Require Admin JWT Token)

### Get All Contact Messages

```bash
GET http://localhost:3000/api/v1/contact?page=1&limit=10
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

### Get Single Contact Message

```bash
GET http://localhost:3000/api/v1/contact/1
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

### Update Contact Status

```bash
PATCH http://localhost:3000/api/v1/contact/1
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "status": "resolved"
}
```

### Delete Contact Message

```bash
DELETE http://localhost:3000/api/v1/contact/1
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

---

## Field Validation

| Field   | Type   | Required | Max Length | Notes                    |
|---------|--------|----------|------------|--------------------------|
| name    | string | Yes      | 100        | Person's name            |
| email   | string | Yes      | 100        | Valid email format       |
| subject | string | Yes      | 200        | Message subject          |
| message | string | Yes      | 2000       | Message content          |

---

## Status Values

- `pending` - Default when submitted
- `in-progress` - Admin is working on it
- `resolved` - Issue resolved
- `closed` - Closed without resolution

---

## Testing with cURL

### Submit Contact Form
```bash
curl -X POST http://localhost:3000/api/v1/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "subject": "API Question",
    "message": "I have a question about the API usage..."
  }'
```

### Get All Messages (Admin)
```bash
curl http://localhost:3000/api/v1/contact?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### Update Status (Admin)
```bash
curl -X PATCH http://localhost:3000/api/v1/contact/1 \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "resolved"}'
```

---

For complete documentation, see [CONTACT_API.md](./CONTACT_API.md)
