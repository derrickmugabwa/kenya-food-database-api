# Contact API Documentation

## Overview

The Contact API allows users to submit contact messages and admins to manage them. The submission endpoint is public, while management endpoints require admin authentication.

## Endpoints

### 1. Submit Contact Message (Public)

```
POST /api/v1/contact
```

**Authentication:** None required (public endpoint)

**Request Body:**

```typescript
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "subject": "API Question",
  "message": "I have a question about the API usage..."
}
```

**Validation Rules:**
- `name`: Required, string, max 100 characters
- `email`: Required, valid email format, max 100 characters
- `subject`: Required, string, max 200 characters
- `message`: Required, string, max 2000 characters

**Response (201 Created):**

```typescript
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

**Example Usage:**

```typescript
// JavaScript/TypeScript
const response = await fetch('http://localhost:3000/api/v1/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john.doe@example.com',
    subject: 'API Question',
    message: 'I have a question about the API usage...',
  }),
});

const data = await response.json();
console.log(data);
```

```bash
# cURL
curl -X POST http://localhost:3000/api/v1/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "subject": "API Question",
    "message": "I have a question about the API usage..."
  }'
```

---

### 2. Get All Contact Messages (Admin Only)

```
GET /api/v1/contact
```

**Authentication:** Admin JWT token required

**Query Parameters:**

| Parameter | Type   | Required | Default | Description            |
|-----------|--------|----------|---------|------------------------|
| page      | number | No       | 1       | Page number            |
| limit     | number | No       | 10      | Items per page         |

**Response (200 OK):**

```typescript
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "subject": "API Question",
    "message": "I have a question about the API usage...",
    "status": "pending",
    "createdAt": "2025-11-05T11:50:00.000Z",
    "updatedAt": "2025-11-05T11:50:00.000Z"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "subject": "Feature Request",
    "message": "Would love to see...",
    "status": "resolved",
    "createdAt": "2025-11-05T10:30:00.000Z",
    "updatedAt": "2025-11-05T11:00:00.000Z"
  }
]
```

**Example Usage:**

```typescript
const response = await fetch('http://localhost:3000/api/v1/contact?page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${adminToken}`,
  },
});

const contacts = await response.json();
```

---

### 3. Get Contact Message by ID (Admin Only)

```
GET /api/v1/contact/:id
```

**Authentication:** Admin JWT token required

**Path Parameters:**
- `id`: Contact message ID (number)

**Response (200 OK):**

```typescript
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

### 4. Update Contact Message (Admin Only)

```
PATCH /api/v1/contact/:id
```

**Authentication:** Admin JWT token required

**Path Parameters:**
- `id`: Contact message ID (number)

**Request Body:**

```typescript
{
  "status": "resolved"  // or "pending", "in-progress", "closed"
}
```

**Response (200 OK):**

```typescript
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "subject": "API Question",
  "message": "I have a question about the API usage...",
  "status": "resolved",
  "createdAt": "2025-11-05T11:50:00.000Z",
  "updatedAt": "2025-11-05T12:00:00.000Z"
}
```

**Example Usage:**

```typescript
const response = await fetch('http://localhost:3000/api/v1/contact/1', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    status: 'resolved',
  }),
});
```

---

### 5. Delete Contact Message (Admin Only)

```
DELETE /api/v1/contact/:id
```

**Authentication:** Admin JWT token required

**Path Parameters:**
- `id`: Contact message ID (number)

**Response (200 OK):**

No content returned

**Example Usage:**

```typescript
await fetch('http://localhost:3000/api/v1/contact/1', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
  },
});
```

---

## Status Values

The `status` field can have the following values:

- `pending` - Default status when message is submitted
- `in-progress` - Admin is working on the message
- `resolved` - Message has been resolved
- `closed` - Message is closed without resolution

---

## Frontend Implementation Examples

### React Contact Form

```typescript
// components/ContactForm.tsx
import React, { useState } from 'react';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/v1/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit contact form');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (success) {
    return (
      <div className="success-message">
        <h3>Thank you for contacting us!</h3>
        <p>We'll get back to you as soon as possible.</p>
        <button onClick={() => setSuccess(false)}>Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <h2>Contact Us</h2>

      {error && <div className="error">{error}</div>}

      <div className="form-group">
        <label htmlFor="name">Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label htmlFor="subject">Subject *</label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          maxLength={200}
        />
      </div>

      <div className="form-group">
        <label htmlFor="message">Message *</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          maxLength={2000}
          rows={6}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};
```

### Admin Contact Management

```typescript
// components/AdminContactList.tsx
import React, { useEffect, useState } from 'react';

interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const AdminContactList: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchContacts();
  }, [page]);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `http://localhost:3000/api/v1/contact?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`http://localhost:3000/api/v1/contact/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      fetchContacts(); // Refresh list
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-contact-list">
      <h2>Contact Messages</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Email</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>{new Date(contact.createdAt).toLocaleDateString()}</td>
              <td>{contact.name}</td>
              <td>{contact.email}</td>
              <td>{contact.subject}</td>
              <td>
                <span className={`status-badge ${contact.status}`}>
                  {contact.status}
                </span>
              </td>
              <td>
                <select
                  value={contact.status}
                  onChange={(e) => updateStatus(contact.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "email must be an email"
  ],
  "error": "Bad Request"
}
```

### 401 Unauthorized (Admin endpoints)

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden (Non-admin accessing admin endpoints)

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

---

## Database Schema

```sql
CREATE TABLE "contact" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(100) NOT NULL,
  "subject" VARCHAR(200) NOT NULL,
  "message" VARCHAR(2000) NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX "IDX_contact_status" ON "contact" ("status");
CREATE INDEX "IDX_contact_createdAt" ON "contact" ("createdAt");
```

---

## Best Practices

1. **Rate Limiting**: Consider implementing rate limiting on the public POST endpoint to prevent spam
2. **Email Notifications**: Set up email notifications for admins when new messages arrive
3. **Validation**: Always validate and sanitize user input on both frontend and backend
4. **CAPTCHA**: Consider adding CAPTCHA to prevent bot submissions
5. **Auto-response**: Send an auto-response email to users confirming receipt of their message
6. **Analytics**: Track response times and resolution rates for better customer service

---

## Security Considerations

- The POST endpoint is public but should be rate-limited
- All management endpoints require admin authentication
- Input is validated and sanitized to prevent XSS attacks
- Email addresses are validated for proper format
- Message length is limited to prevent database overflow
- Status updates are restricted to predefined values
