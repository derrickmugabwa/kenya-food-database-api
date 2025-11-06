# Admin Frontend Implementation Guide

## 🎯 Overview

This guide explains how to implement an admin frontend for managing foods, categories, and nutrients in the Kenya Food DB.

**✅ Backend is fully ready!** The authentication system now supports **flexible authentication** - admins can use their JWT session tokens for ALL operations (including GET requests), providing a seamless admin experience.

---

## ✅ Backend Status - Already Complete

### **1. Authentication System**
Your backend already has a complete JWT-based authentication system:

- ✅ **Login Endpoint**: `POST /api/v1/auth/email/login`
- ✅ **JWT Tokens**: Access token + refresh token
- ✅ **User Session Management**: Login, logout, refresh
- ✅ **Current User Endpoint**: `GET /api/v1/auth/me`
- ✅ **Role-Based Access Control**: Admin and user roles

### **2. Admin-Protected Endpoints**

All CRUD operations for foods, categories, and nutrients are already protected with:
```typescript
@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
```

#### **Foods**
- ✅ `POST /api/v1/foods` - Create food (admin only)
- ✅ `PATCH /api/v1/foods/:id` - Update food (admin only)
- ✅ `DELETE /api/v1/foods/:id` - Delete food (admin only)
- ✅ `GET /api/v1/foods` - List foods (public with OAuth/API key)
- ✅ `GET /api/v1/foods/:id` - Get food by ID (public with OAuth/API key)

#### **Categories**
- ✅ `POST /api/v1/categories` - Create category (admin only)
- ✅ `PATCH /api/v1/categories/:id` - Update category (admin only)
- ✅ `DELETE /api/v1/categories/:id` - Delete category (admin only)
- ✅ `GET /api/v1/categories` - List categories (public with OAuth/API key)
- ✅ `GET /api/v1/categories/:id` - Get category by ID (public with OAuth/API key)

#### **Nutrients**
- ✅ `POST /api/v1/nutrients` - Create nutrient (admin only)
- ✅ `PATCH /api/v1/nutrients/:id` - Update nutrient (admin only)
- ✅ `DELETE /api/v1/nutrients/:id` - Delete nutrient (admin only)
- ✅ `GET /api/v1/nutrients` - List nutrients (public with OAuth/API key)
- ✅ `GET /api/v1/nutrients/:id` - Get nutrient by ID (public with OAuth/API key)

### **3. Security Model**

| Endpoint Type | Authentication | Authorization |
|--------------|----------------|---------------|
| **Read (GET)** | JWT Session OR OAuth/API Key | Public access |
| **Write (POST/PATCH/DELETE)** | JWT Session ONLY | Admin role required |

**✨ New Feature:** GET requests now accept JWT session tokens in addition to OAuth/API keys. This means admins can use the same token for all operations!

---

## 🚀 Frontend Implementation

### **Architecture Overview**

```
┌─────────────────────────────────────────────────────────┐
│              Admin Frontend (React/Next.js)              │
│                                                          │
│  1. Admin logs in with email/password                   │
│  2. Backend validates credentials                       │
│  3. Returns JWT access + refresh tokens                 │
│  4. Frontend stores tokens securely                     │
│  5. All admin requests include JWT Bearer token         │
│  6. Backend validates token + checks admin role         │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Implementation Steps

### **Step 1: Authentication Flow**

#### **Login Request**
```typescript
// POST /api/v1/auth/email/login
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:3000/api/v1/auth/email/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  
  // Response structure:
  // {
  //   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  //   refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  //   tokenExpires: 1234567890,
  //   user: {
  //     id: 1,
  //     email: "admin@example.com",
  //     role: { id: 1, name: "admin" },
  //     ...
  //   }
  // }
  
  return data;
};
```

#### **Store Tokens**
```typescript
// Store tokens securely
localStorage.setItem('accessToken', data.token);
localStorage.setItem('refreshToken', data.refreshToken);
localStorage.setItem('user', JSON.stringify(data.user));
```

#### **Get Current User**
```typescript
// GET /api/v1/auth/me
const getCurrentUser = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:3000/api/v1/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user');
  }

  return response.json();
};
```

#### **Refresh Token**
```typescript
// POST /api/v1/auth/refresh
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('http://localhost:3000/api/v1/auth/refresh', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${refreshToken}`,
    },
  });

  if (!response.ok) {
    // Refresh token expired, redirect to login
    throw new Error('Session expired');
  }

  const data = await response.json();
  
  // Update tokens
  localStorage.setItem('accessToken', data.token);
  localStorage.setItem('refreshToken', data.refreshToken);
  
  return data;
};
```

#### **Logout**
```typescript
// POST /api/v1/auth/logout
const logout = async () => {
  const token = localStorage.getItem('accessToken');
  
  await fetch('http://localhost:3000/api/v1/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  // Clear local storage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};
```

---

### **Step 2: API Client with Auto-Refresh**

```typescript
// api-client.ts
class ApiClient {
  private baseUrl = 'http://localhost:3000/api/v1';
  
  private async getAccessToken(): Promise<string> {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token');
    }
    return token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle 401 - try to refresh token
    if (response.status === 401) {
      try {
        await refreshAccessToken();
        // Retry request with new token
        return this.request<T>(endpoint, options);
      } catch {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Foods API
  async getFoods(params?: { page?: number; limit?: number; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    // ✅ Now works with JWT session token (no OAuth needed!)
    return this.request(`/foods?${query}`);
  }

  async createFood(data: any) {
    return this.request('/foods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFood(id: number, data: any) {
    return this.request(`/foods/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteFood(id: number) {
    return this.request(`/foods/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories API
  async getCategories(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/categories?${query}`);
  }

  async createCategory(data: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: number, data: any) {
    return this.request(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Nutrients API
  async getNutrients(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/nutrients?${query}`);
  }

  async createNutrient(data: any) {
    return this.request('/nutrients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNutrient(id: number, data: any) {
    return this.request(`/nutrients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteNutrient(id: number) {
    return this.request(`/nutrients/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
```

---

### **Step 3: React Authentication Context**

```typescript
// AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  role: { id: number; name: string };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:3000/api/v1/auth/email/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    
    localStorage.setItem('accessToken', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    setUser(data.user);
  };

  const logout = async () => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      await fetch('http://localhost:3000/api/v1/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role?.name === 'admin';

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

### **Step 4: Protected Routes**

```typescript
// ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <div>Access Denied. Admin role required.</div>;
  }

  return <>{children}</>;
}
```

---

### **Step 5: Example Components**

#### **Login Page**
```typescript
// LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-page">
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
```

#### **Foods Management**
```typescript
// FoodsPage.tsx
import { useState, useEffect } from 'react';
import { apiClient } from './api-client';

export function FoodsPage() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    try {
      const data = await apiClient.getFoods({ page: 1, limit: 50 });
      setFoods(data.data);
    } catch (error) {
      console.error('Failed to load foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this food?')) return;

    try {
      await apiClient.deleteFood(id);
      await loadFoods(); // Reload list
    } catch (error) {
      alert('Failed to delete food');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Foods Management</h1>
      <button onClick={() => navigate('/admin/foods/new')}>Add New Food</button>
      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((food: any) => (
            <tr key={food.id}>
              <td>{food.id}</td>
              <td>{food.name}</td>
              <td>{food.category?.name}</td>
              <td>
                <button onClick={() => navigate(`/admin/foods/${food.id}/edit`)}>
                  Edit
                </button>
                <button onClick={() => handleDelete(food.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🔒 Security Best Practices

### **1. Token Storage**
- ✅ Use `localStorage` for tokens (acceptable for admin panel)
- ✅ Consider `httpOnly` cookies for production (requires backend CORS config)
- ❌ Never expose tokens in URL or logs

### **2. Token Refresh**
- ✅ Implement automatic token refresh on 401 errors
- ✅ Redirect to login when refresh token expires
- ✅ Clear all tokens on logout

### **3. Role Validation**
- ✅ Backend validates admin role on every request
- ✅ Frontend checks role for UI rendering only
- ❌ Never trust frontend role checks for security

### **4. CORS Configuration**
Ensure your backend allows requests from your frontend domain:
```typescript
// Backend should have CORS configured for your frontend URL
// e.g., http://localhost:5173 for Vite dev server
```

---

## 📊 API Response Formats

### **Login Response**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenExpires": 1234567890,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": {
      "id": 1,
      "name": "admin"
    },
    "status": {
      "id": 1,
      "name": "active"
    }
  }
}
```

### **Foods List Response**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Ugali",
      "localName": "Ugali",
      "description": "Staple food made from maize flour",
      "category": {
        "id": 1,
        "name": "Grains"
      },
      "nutrients": [
        {
          "id": 1,
          "name": "Calories",
          "amount": 120,
          "unit": "kcal"
        }
      ]
    }
  ],
  "hasNextPage": false
}
```

### **Error Response**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"

### **What You Need to Build**
- ❌ Admin frontend application (React/Next.js/Vue)
- ❌ Login page
- ❌ Dashboard with CRUD interfaces
- ❌ API client with token management

---

## 🚀 Next Steps

1. **Choose a frontend framework** (React, Next.js, Vue, etc.)
2. **Set up the project** with routing and state management
3. **Implement authentication** using the examples above
4. **Build CRUD interfaces** for foods, categories, and nutrients
5. **Add form validation** and error handling
6. **Style the UI** with your preferred CSS framework

**Your backend is production-ready!** You can start building the frontend immediately using the existing API endpoints.

---

## 🆕 Recent Enhancement: Flexible Authentication

The backend now supports **flexible authentication** for GET requests. This means:

- ✅ **Admins can use JWT session tokens for ALL operations** (GET, POST, PATCH, DELETE)
- ✅ **No need for OAuth credentials in admin panel** - one token does everything
- ✅ **Public API consumers** can still use OAuth/API keys (unchanged)
- ✅ **Better admin UX** - login once, use everywhere

**Example:**
```typescript
// Admin logs in once
const { token } = await login('admin@example.com', 'password');

// Same token works for EVERYTHING:
await getFoods();        // ✅ GET with JWT token
await createFood(data);  // ✅ POST with JWT token
await updateFood(id, data); // ✅ PATCH with JWT token
await deleteFood(id);    // ✅ DELETE with JWT token
```

For technical details, see: [`FLEXIBLE_AUTH_IMPLEMENTATION.md`](./FLEXIBLE_AUTH_IMPLEMENTATION.md)
