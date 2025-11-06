# Admin Frontend - Quick Start Guide

## 🚀 TL;DR

**You can now use a single JWT token for ALL admin operations!**

```typescript
// 1. Login
const { token } = await login('admin@example.com', 'password');

// 2. Use the same token for everything
const foods = await fetch('/api/v1/foods', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const newFood = await fetch('/api/v1/foods', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ name: 'Ugali', category: 1 })
});
```

---

## 📝 Authentication Flow

### **Step 1: Login**
```typescript
POST /api/v1/auth/email/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenExpires": 1234567890,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": { "id": 1, "name": "admin" }
  }
}
```

### **Step 2: Use Token**
```typescript
// All requests use the same token
headers: {
  'Authorization': 'Bearer YOUR_TOKEN_HERE',
  'Content-Type': 'application/json'
}
```

---

## 🎯 API Endpoints

### **Foods**

#### **List Foods**
```http
GET /api/v1/foods?page=1&limit=20
Authorization: Bearer {token}
```

#### **Get Food by ID**
```http
GET /api/v1/foods/1
Authorization: Bearer {token}
```

#### **Create Food** (Admin Only)
```http
POST /api/v1/foods
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Ugali",
  "localName": "Ugali",
  "description": "Staple food made from maize flour",
  "category": 1
}
```

#### **Update Food** (Admin Only)
```http
PATCH /api/v1/foods/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### **Delete Food** (Admin Only)
```http
DELETE /api/v1/foods/1
Authorization: Bearer {token}
```

---

### **Categories**

#### **List Categories**
```http
GET /api/v1/categories?page=1&limit=20
Authorization: Bearer {token}
```

#### **Create Category** (Admin Only)
```http
POST /api/v1/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Grains",
  "description": "Grain-based foods"
}
```

#### **Update Category** (Admin Only)
```http
PATCH /api/v1/categories/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name"
}
```

#### **Delete Category** (Admin Only)
```http
DELETE /api/v1/categories/1
Authorization: Bearer {token}
```

---

### **Nutrients**

#### **List Nutrients**
```http
GET /api/v1/nutrients?page=1&limit=20
Authorization: Bearer {token}
```

#### **Create Nutrient** (Admin Only)
```http
POST /api/v1/nutrients
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Calories",
  "unit": "kcal"
}
```

#### **Update Nutrient** (Admin Only)
```http
PATCH /api/v1/nutrients/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name"
}
```

#### **Delete Nutrient** (Admin Only)
```http
DELETE /api/v1/nutrients/1
Authorization: Bearer {token}
```

---

## 💻 Code Examples

### **React API Client**

```typescript
class AdminAPI {
  private baseUrl = 'http://localhost:3000/api/v1';
  
  private getToken(): string {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('Not authenticated');
    return token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/email/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) throw new Error('Login failed');
    
    const data = await response.json();
    localStorage.setItem('accessToken', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    return data;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Foods
  async getFoods(page = 1, limit = 20) {
    return this.request(`/foods?page=${page}&limit=${limit}`);
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
    return this.request(`/foods/${id}`, { method: 'DELETE' });
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(data: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Nutrients
  async getNutrients() {
    return this.request('/nutrients');
  }

  async createNutrient(data: any) {
    return this.request('/nutrients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new AdminAPI();
```

### **Usage in Components**

```typescript
// Login Component
const handleLogin = async (email: string, password: string) => {
  try {
    const { user } = await api.login(email, password);
    console.log('Logged in as:', user.email);
    navigate('/admin/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Foods List Component
const FoodsList = () => {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    api.getFoods().then(data => setFoods(data.data));
  }, []);

  const handleDelete = async (id: number) => {
    await api.deleteFood(id);
    // Refresh list
    const data = await api.getFoods();
    setFoods(data.data);
  };

  return (
    <div>
      {foods.map(food => (
        <div key={food.id}>
          <h3>{food.name}</h3>
          <button onClick={() => handleDelete(food.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

---

## 🔒 Security Notes

### **Token Storage**
```typescript
// Store tokens securely
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', refreshToken);

// Never expose tokens in URLs or logs
// ❌ Bad: /admin?token=abc123
// ✅ Good: Authorization header
```

### **Token Refresh**
```typescript
// Implement automatic token refresh
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${refreshToken}` },
  });

  const data = await response.json();
  localStorage.setItem('accessToken', data.token);
  localStorage.setItem('refreshToken', data.refreshToken);
};
```

### **Error Handling**
```typescript
// Handle 401 errors (unauthorized)
if (response.status === 401) {
  // Try to refresh token
  await refreshToken();
  // Retry request
  return fetch(url, options);
}

// Handle 403 errors (forbidden - not admin)
if (response.status === 403) {
  alert('Admin access required');
  navigate('/login');
}
```

---

## 📋 Checklist

### **Before You Start**
- [ ] Backend is running on `http://localhost:3000`
- [ ] You have admin credentials (email + password)
- [ ] CORS is configured for your frontend URL

### **Implementation Steps**
- [ ] Create login page
- [ ] Implement authentication (login, logout, token storage)
- [ ] Create API client with automatic token injection
- [ ] Build CRUD interfaces for foods, categories, nutrients
- [ ] Add error handling and loading states
- [ ] Implement token refresh logic
- [ ] Add protected routes (admin only)

---

## 🎯 Key Takeaways

1. **One Token for Everything** - Use JWT session token for all operations
2. **No OAuth Needed** - Admin panel doesn't need OAuth credentials
3. **Simple Flow** - Login → Get token → Use token everywhere
4. **Secure** - All endpoints validate tokens and check admin role
5. **Backward Compatible** - Public API consumers still use OAuth/API keys

---

## 📚 Full Documentation

- [Admin Frontend Guide](./ADMIN_FRONTEND_GUIDE.md) - Complete implementation guide
- [Flexible Auth Implementation](./FLEXIBLE_AUTH_IMPLEMENTATION.md) - Technical details
- [Backend Changes Summary](./BACKEND_CHANGES_SUMMARY.md) - What changed in backend

---

**Ready to build? Start with the login page and you're good to go!** 🚀
