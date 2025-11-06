# Frontend Quick Start - Kenya Food DB API

## 🚀 5-Minute Integration

### **Step 1: Get Credentials (1 min)**

```bash
# Create OAuth client
curl -X POST https://api.kenyafooddb.com/api/v1/oauth/clients \
  -H "Authorization: Bearer YOUR_USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My App",
    "scopes": ["read:foods"]
  }'

# Save the response:
# clientId: "kfdb_client_abc123"
# clientSecret: "kfdb_secret_xyz789"  ⚠️ Save this!
```

---

### **Step 2: Install (30 sec)**

No installation needed! Use native `fetch` API.

---

### **Step 3: Copy & Paste (2 min)**

```typescript
// lib/kenyaFoodDB.ts
class KenyaFoodDB {
  private token: string | null = null;
  private tokenExpiry: number = 0;

  constructor(
    private clientId: string,
    private clientSecret: string,
    private baseUrl = 'https://api.kenyafooddb.com/api/v1'
  ) {}

  async getToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    const res = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    const data = await res.json();
    this.token = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
    return this.token;
  }

  async request(endpoint: string) {
    const token = await this.getToken();
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  }

  getFoods = (page = 1, limit = 10) => 
    this.request(`/foods?page=${page}&limit=${limit}`);
  
  getFoodById = (id: number) => 
    this.request(`/foods/${id}`);
}

export const api = new KenyaFoodDB(
  process.env.NEXT_PUBLIC_CLIENT_ID!,
  process.env.NEXT_PUBLIC_CLIENT_SECRET!
);
```

---

### **Step 4: Use It (1 min)**

```typescript
// app/page.tsx
import { api } from '@/lib/kenyaFoodDB';

export default async function Home() {
  const { data: foods } = await api.getFoods(1, 10);

  return (
    <div>
      <h1>Kenyan Foods</h1>
      <ul>
        {foods.map(food => (
          <li key={food.id}>{food.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

### **Step 5: Environment Variables (30 sec)**

```env
# .env.local
NEXT_PUBLIC_CLIENT_ID=kfdb_client_abc123
NEXT_PUBLIC_CLIENT_SECRET=kfdb_secret_xyz789
```

---

## ✅ Done!

You're now fetching data from Kenya Food DB API! 🎉

---

## 📖 Full Examples

### **React Hook**

```typescript
import { useState, useEffect } from 'react';
import { api } from '@/lib/kenyaFoodDB';

function useFoods() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFoods().then(res => {
      setFoods(res.data);
      setLoading(false);
    });
  }, []);

  return { foods, loading };
}

// Usage
function FoodList() {
  const { foods, loading } = useFoods();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <ul>
      {foods.map(food => <li key={food.id}>{food.name}</li>)}
    </ul>
  );
}
```

---

### **Vue Composable**

```typescript
import { ref, onMounted } from 'vue';
import { api } from '@/lib/kenyaFoodDB';

export function useFoods() {
  const foods = ref([]);
  const loading = ref(true);

  onMounted(async () => {
    const res = await api.getFoods();
    foods.value = res.data;
    loading.value = false;
  });

  return { foods, loading };
}

// Usage in component
<script setup>
const { foods, loading } = useFoods();
</script>

<template>
  <div v-if="loading">Loading...</div>
  <ul v-else>
    <li v-for="food in foods" :key="food.id">
      {{ food.name }}
    </li>
  </ul>
</template>
```

---

### **Vanilla JavaScript**

```html
<!DOCTYPE html>
<html>
<head>
  <title>Kenya Food DB</title>
</head>
<body>
  <div id="app">
    <h1>Kenyan Foods</h1>
    <div id="loading">Loading...</div>
    <ul id="foods"></ul>
  </div>

  <script>
    class KenyaFoodDB {
      constructor(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.baseUrl = 'https://api.kenyafooddb.com/api/v1';
        this.token = null;
        this.tokenExpiry = 0;
      }

      async getToken() {
        if (this.token && Date.now() < this.tokenExpiry) {
          return this.token;
        }

        const res = await fetch(`${this.baseUrl}/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: this.clientId,
            client_secret: this.clientSecret,
          }),
        });

        const data = await res.json();
        this.token = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
        return this.token;
      }

      async getFoods() {
        const token = await this.getToken();
        const res = await fetch(`${this.baseUrl}/foods?page=1&limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
      }
    }

    // Initialize
    const api = new KenyaFoodDB(
      'kfdb_client_abc123',
      'kfdb_secret_xyz789'
    );

    // Load foods
    api.getFoods().then(response => {
      document.getElementById('loading').style.display = 'none';
      
      const ul = document.getElementById('foods');
      response.data.forEach(food => {
        const li = document.createElement('li');
        li.textContent = food.name;
        ul.appendChild(li);
      });
    });
  </script>
</body>
</html>
```

---

## 🔐 Security Warning

⚠️ **IMPORTANT:** Never expose `client_secret` in browser code!

### **Wrong (Insecure):**
```typescript
// ❌ Client-side - Secret exposed to users
const api = new KenyaFoodDB(
  'kfdb_client_abc123',
  'kfdb_secret_xyz789' // ❌ Anyone can steal this!
);
```

### **Right (Secure):**
```typescript
// ✅ Server-side API route
// app/api/foods/route.ts
import { KenyaFoodDB } from '@/lib/kenyaFoodDB';

export async function GET() {
  const api = new KenyaFoodDB(
    process.env.CLIENT_ID!,
    process.env.CLIENT_SECRET! // ✅ Secure on server
  );
  
  const foods = await api.getFoods();
  return Response.json(foods);
}

// ✅ Client calls your API
const res = await fetch('/api/foods');
const foods = await res.json();
```

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/foods` | GET | List all foods |
| `/foods/:id` | GET | Get food by ID |
| `/categories` | GET | List categories |
| `/nutrients` | GET | List nutrients |
| `/foods?search=ugali` | GET | Search foods |
| `/foods?page=2&limit=20` | GET | Pagination |

---

## ⚠️ Error Handling

```typescript
try {
  const foods = await api.getFoods();
} catch (error) {
  if (error.status === 401) {
    console.error('Invalid credentials');
  } else if (error.status === 429) {
    console.error('Rate limit exceeded');
  } else {
    console.error('API error:', error);
  }
}
```

---

## 📈 Rate Limits

| Tier | Limit | Cost |
|------|-------|------|
| Free | 1,000/day | $0 |
| Basic | 5,000/day | $10/mo |
| Premium | 10,000/day | $50/mo |

Check rate limit in response headers:
```typescript
const res = await fetch(url, { headers: { Authorization: token } });
console.log('Remaining:', res.headers.get('X-RateLimit-Remaining'));
console.log('Limit:', res.headers.get('X-RateLimit-Limit'));
```

---

## 🆘 Troubleshooting

### **401 Unauthorized**
- Check client_id and client_secret are correct
- Verify credentials haven't expired

### **403 Forbidden**
- Check you have the required scope
- Example: `read:foods` scope needed for `/foods` endpoint

### **429 Too Many Requests**
- You've exceeded your rate limit
- Wait for reset time (check `X-RateLimit-Reset` header)
- Consider upgrading tier

### **Network Error**
- Check internet connection
- Verify API URL is correct
- Check CORS settings (if browser)

---

## 📚 Next Steps

1. ✅ Read [Full Integration Guide](./FRONTEND_INTEGRATION_GUIDE.md)
2. ✅ Check [API Documentation](https://api.kenyafooddb.com/docs)
3. ✅ Review [Rate Limiting Strategy](./RATE_LIMITING_STRATEGY.md)
4. ✅ Join [Discord Community](https://discord.gg/kenyafooddb)

---

## 💡 Pro Tips

1. **Cache tokens** - Don't request new token for every API call
2. **Batch requests** - Use `Promise.all()` for multiple calls
3. **Handle errors** - Always implement proper error handling
4. **Monitor usage** - Check rate limit headers
5. **Use TypeScript** - Better type safety and autocomplete

---

**Happy Coding!** 🚀

For questions: support@kenyafooddb.com
