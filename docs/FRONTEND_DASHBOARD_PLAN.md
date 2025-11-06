# Frontend Dashboard Implementation Plan

## 🎯 Project Overview

Build a modern, responsive developer dashboard for the Kenya Food Database API using Next.js 14, shadcn/ui, and React Query. The dashboard will allow users to manage OAuth clients, view usage analytics, and test API endpoints.

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.x | React framework with App Router |
| **TypeScript** | 5.x | Type safety |
| **shadcn/ui** | Latest | UI components (built on Radix UI) |
| **Tailwind CSS** | 3.x | Styling |
| **React Query** | 5.x | Data fetching & caching |
| **Zustand** | 4.x | Global state management |
| **Recharts** | 2.x | Charts and analytics |
| **Zod** | 3.x | Schema validation |
| **React Hook Form** | 7.x | Form management |

---

## 📁 Project Structure

```
kenya-food-dashboard/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── apps/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── usage/
│   │   │   └── page.tsx
│   │   ├── api-explorer/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (admin)/
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── all-apps/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── system-usage/
│   │   │   └── page.tsx
│   │   ├── foods/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── categories/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── nutrients/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── api-keys/
│   │   │   └── page.tsx
│   │   ├── system-settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── auth/
│   ├── dashboard/
│   ├── apps/
│   ├── usage/
│   └── shared/
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── oauth.ts
│   │   └── usage.ts
│   ├── hooks/
│   ├── utils/
│   └── validations/
├── types/
└── store/
```

---

## 🎨 Pages & Features

### **1. Authentication Pages**

#### **Login Page** (`/login`)
- Email/password login form
- "Remember me" checkbox
- "Forgot password" link
- Redirect to dashboard on success

#### **Register Page** (`/register`)
- User registration form
- Email verification
- Password strength indicator
- Terms & conditions checkbox

---

### **2. Dashboard Overview** (`/dashboard`)

**Metrics Cards:**
- Total Apps
- Total API Requests (Last 30 days)
- Active Tokens
- Rate Limit Usage

**Charts:**
- Requests over time (line chart)
- Requests by endpoint (bar chart)
- Requests by client (pie chart)

**Recent Activity:**
- Latest API requests
- Recent app creations

---

### **3. Apps Management** (`/apps`)

#### **Apps List Page**
- Table with columns:
  - App Name
  - Client ID
  - Scopes
  - Tier
  - Rate Limit
  - Status (Active/Inactive)
  - Created Date
  - Actions (View, Edit, Delete)
- Search and filter
- Pagination
- "Create New App" button

#### **Create App Page** (`/apps/new`)
- Form fields:
  - App Name (required)
  - Scopes (multi-select)
  - Tier (free/premium)
  - Description (optional)
- Show rate limit based on tier
- Display client secret once after creation
- Copy to clipboard functionality

#### **App Details Page** (`/apps/[id]`)
- App information display
- Usage statistics for this app
- Token management
- Regenerate secret button
- Delete app button

---

### **4. Usage Analytics** (`/usage`)

**Filters:**
- Date range picker
- App filter
- Endpoint filter
- Status code filter

**Analytics:**
- Total requests
- Average response time
- Success rate
- Error breakdown

**Charts:**
- Requests timeline
- Top endpoints
- Status code distribution
- Response time histogram

**Logs Table:**
- Timestamp
- App
- Endpoint
- Method
- Status
- Response Time
- IP Address

---

### **5. API Explorer** (`/api-explorer`)

**Interactive API Tester:**
- Endpoint selector
- Method selector (GET, POST, etc.)
- Headers editor
- Body editor (JSON)
- Send request button
- Response viewer with syntax highlighting
- Save requests feature

---

### **6. Settings** (`/settings`)

**Sections:**
- Profile settings
- Security (change password)
- API preferences
- Notifications
- Danger zone (delete account)

---

## 👑 Admin Dashboard

### **7. Admin Overview** (`/admin`)

**System Metrics:**
- Total Users
- Total Apps
- Total API Requests (All time)
- System Health Status
- Database Size
- Active Sessions

**Charts:**
- User registrations over time
- API usage trends
- Top consuming apps
- Error rate monitoring

**Recent Activity:**
- New user registrations
- App creations
- System alerts
- Failed login attempts

### **8. User Management** (`/admin/users`)

**Users Table:**
- User ID
- Name & Email
- Role (Admin/User)
- Registration Date
- Last Login
- Status (Active/Suspended)
- Apps Count
- Actions (View, Edit, Suspend, Delete)

**User Details Page** (`/admin/users/[id]`)
- User profile information
- Apps owned by user
- Usage statistics
- Login history
- Account actions (suspend, delete, reset password)

### **9. All Apps** (`/admin/all-apps`)

**Global Apps View:**
- All apps across all users
- Owner information
- Usage statistics
- Ability to suspend/delete any app
- Bulk actions

**App Details** (`/admin/all-apps/[id]`)
- Full app information
- Owner details
- Usage analytics
- Token management
- Admin actions (suspend, delete, modify)

### **10. System Usage Analytics** (`/admin/system-usage`)

**Advanced Analytics:**
- System-wide usage patterns
- Peak usage times
- Geographic distribution (if available)
- Endpoint popularity
- Error analysis
- Performance metrics

**Export Features:**
- CSV/Excel export
- Custom date ranges
- Filtered reports

### **11. Content Management**

#### **Foods Management** (`/admin/foods`)
- CRUD operations for food items
- Bulk import/export
- Data validation
- Image management
- Nutritional data editing

#### **Categories Management** (`/admin/categories`)
- Category hierarchy management
- Bulk operations
- Category analytics

#### **Nutrients Management** (`/admin/nutrients`)
- Nutrient definitions
- Units management
- Reference values

### **12. API Keys Management** (`/admin/api-keys`)

**Legacy API Keys:**
- View all API keys
- Usage statistics
- Expiry management
- Migration to OAuth tools

### **13. System Settings** (`/admin/system-settings`)

**Configuration:**
- Rate limiting settings
- Token expiry settings
- Email templates
- System maintenance mode
- Feature flags
- Security settings

---

## 🔧 Core Components

### **1. UI Components (shadcn/ui)**

Install these shadcn components:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add form
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add switch
```

### **2. Custom Components**

#### **Sidebar Navigation**
```typescript
// components/dashboard/sidebar.tsx
- Logo
- Navigation links
- User profile dropdown
- Collapse/expand functionality
```

#### **Stats Card**
```typescript
// components/dashboard/stats-card.tsx
- Icon
- Title
- Value
- Change percentage
- Trend indicator
```

#### **App Card**
```typescript
// components/apps/app-card.tsx
- App name & ID
- Scopes badges
- Status indicator
- Quick actions menu
```

#### **Usage Chart**
```typescript
// components/usage/usage-chart.tsx
- Recharts integration
- Multiple chart types
- Responsive design
```

---

## 🔌 API Integration

### **API Client Setup**

```typescript
// lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth token)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### **React Query Hooks**

```typescript
// lib/hooks/use-oauth-clients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { oauthApi } from '@/lib/api/oauth';

export function useOAuthClients() {
  return useQuery({
    queryKey: ['oauth-clients'],
    queryFn: oauthApi.getClients,
  });
}

export function useCreateOAuthClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: oauthApi.createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oauth-clients'] });
    },
  });
}

export function useDeleteOAuthClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: oauthApi.deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oauth-clients'] });
    },
  });
}
```

---

## 📊 State Management

### **Zustand Store**

```typescript
// store/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

---

## 🎨 Design System

### **Color Palette**

```css
/* globals.css */
:root {
  --primary: 142 76% 36%;      /* Green */
  --secondary: 38 92% 50%;     /* Orange */
  --accent: 217 91% 60%;       /* Blue */
  --destructive: 0 84% 60%;    /* Red */
  --muted: 210 40% 96%;        /* Light gray */
  --background: 0 0% 100%;     /* White */
  --foreground: 222 47% 11%;   /* Dark */
}
```

### **Typography**

- **Headings:** Inter (font-weight: 600-700)
- **Body:** Inter (font-weight: 400-500)
- **Code:** JetBrains Mono

---

## 🚀 Implementation Phases

### **Phase 1: Setup & Authentication** (Week 1)

- [ ] Initialize Next.js project
- [ ] Install dependencies
- [ ] Setup Tailwind & shadcn/ui
- [ ] Configure TypeScript
- [ ] Setup React Query
- [ ] Implement login page
- [ ] Implement register page
- [ ] Setup authentication flow
- [ ] Create protected route wrapper
- [ ] Add role-based access control

### **Phase 2: User Dashboard Layout** (Week 1-2)

- [ ] Create user dashboard layout
- [ ] Build sidebar navigation
- [ ] Build top navigation bar
- [ ] Create stats cards
- [ ] Implement dashboard overview
- [ ] Add loading states
- [ ] Add error boundaries

### **Phase 3: Apps Management (User)** (Week 2-3)

- [ ] Create apps list page
- [ ] Implement app creation form
- [ ] Build app details page
- [ ] Add edit functionality
- [ ] Implement delete with confirmation
- [ ] Add search and filters
- [ ] Show client secret modal

### **Phase 4: Usage Analytics (User)** (Week 3-4)

- [ ] Create usage logs table
- [ ] Implement date range filter
- [ ] Add charts (Recharts)
- [ ] Build analytics dashboard
- [ ] Add export functionality
- [ ] Implement real-time updates

### **Phase 5: API Explorer** (Week 4)

- [ ] Build request builder
- [ ] Add syntax highlighting
- [ ] Implement request history
- [ ] Add response viewer
- [ ] Save favorite requests

### **Phase 6: Admin Dashboard** (Week 5-6)

- [ ] Create admin layout with separate navigation
- [ ] Build admin overview with system metrics
- [ ] Implement user management (CRUD)
- [ ] Build global apps management
- [ ] Create system-wide usage analytics
- [ ] Add user suspension/activation
- [ ] Implement bulk operations

### **Phase 7: Content Management (Admin)** (Week 6-7)

- [ ] Build foods management (CRUD)
- [ ] Implement categories management
- [ ] Create nutrients management
- [ ] Add bulk import/export features
- [ ] Build data validation
- [ ] Add image upload for foods

### **Phase 8: System Administration** (Week 7-8)

- [ ] Create API keys management
- [ ] Build system settings page
- [ ] Add rate limiting configuration
- [ ] Implement feature flags
- [ ] Add system health monitoring
- [ ] Create maintenance mode

### **Phase 9: Polish & Testing** (Week 8-9)

- [ ] Add animations and micro-interactions
- [ ] Optimize performance
- [ ] Write unit tests
- [ ] Write E2E tests
- [ ] Accessibility audit
- [ ] Mobile responsiveness
- [ ] Documentation
- [ ] Security audit

---

## 📦 Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "recharts": "^2.10.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.292.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

## 🔐 Security & Environment Management

### **Environment Variables Setup**

#### **1. Environment Files Structure**

```bash
# Root directory
.env.local          # Local development (gitignored)
.env.example        # Template (committed to git)
.env.production     # Production secrets (never committed)
.env.staging        # Staging secrets (never committed)
```

#### **2. Environment Variables**

```bash
# .env.example (template file)
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Authentication
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret-here

# OAuth App Credentials (for the dashboard itself)
DASHBOARD_CLIENT_ID=your-dashboard-client-id
DASHBOARD_CLIENT_SECRET=your-dashboard-client-secret

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=
```

```bash
# .env.local (local development)
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=super-secret-development-key-min-32-chars
DASHBOARD_CLIENT_ID=kfdb_client_dev_123
DASHBOARD_CLIENT_SECRET=kfdb_secret_dev_456
```

```bash
# .env.production (production)
NEXT_PUBLIC_API_URL=https://api.kenyafooddb.com/api/v1
NEXT_PUBLIC_APP_URL=https://dashboard.kenyafooddb.com
NEXTAUTH_URL=https://dashboard.kenyafooddb.com
NEXTAUTH_SECRET=super-secure-production-secret-key-64-chars-minimum
DASHBOARD_CLIENT_ID=kfdb_client_prod_xyz789
DASHBOARD_CLIENT_SECRET=kfdb_secret_prod_abc123
```

#### **3. API Client Configuration**

```typescript
// lib/config/env.ts
export const env = {
  // Public variables (exposed to browser)
  API_URL: process.env.NEXT_PUBLIC_API_URL!,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
  
  // Server-only variables (never exposed to browser)
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  DASHBOARD_CLIENT_ID: process.env.DASHBOARD_CLIENT_ID!,
  DASHBOARD_CLIENT_SECRET: process.env.DASHBOARD_CLIENT_SECRET!,
} as const;

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_APP_URL',
  'NEXTAUTH_SECRET',
  'DASHBOARD_CLIENT_ID',
  'DASHBOARD_CLIENT_SECRET',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

#### **4. API Client with Environment Variables**

```typescript
// lib/api/client.ts
import axios from 'axios';
import { env } from '@/lib/config/env';

const apiClient = axios.create({
  baseURL: env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  // Add auth token from session/localStorage
  const token = getAuthToken(); // Your token retrieval logic
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

#### **5. OAuth Token Management**

```typescript
// lib/auth/oauth-client.ts
import { env } from '@/lib/config/env';

class OAuthTokenManager {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  async getDashboardToken(): Promise<string> {
    // Check if cached token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    // Get new token using dashboard credentials
    const response = await fetch(`${env.API_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: env.DASHBOARD_CLIENT_ID,
        client_secret: env.DASHBOARD_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get dashboard OAuth token');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000; // 5min buffer
    
    return this.accessToken;
  }
}

export const oauthTokenManager = new OAuthTokenManager();
```

#### **6. NextAuth Configuration**

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { env } from '@/lib/config/env';

const handler = NextAuth({
  secret: env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Authenticate with your API
        const response = await fetch(`${env.API_URL}/auth/email/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!response.ok) {
          return null;
        }

        const user = await response.json();
        return {
          id: user.user.id,
          email: user.user.email,
          name: `${user.user.firstName} ${user.user.lastName}`,
          role: user.user.role?.name || 'user',
          accessToken: user.token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role as string;
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
```

### **Security Best Practices**

1. **Never commit secrets:** Add `.env.local`, `.env.production` to `.gitignore`
2. **Use NEXT_PUBLIC_ prefix:** Only for variables that should be exposed to browser
3. **Validate environment variables:** Check required vars at startup
4. **Rotate secrets regularly:** Especially in production
5. **Use different credentials per environment:** Dev, staging, production
6. **Store production secrets securely:** Use services like Vercel Env Vars, AWS Secrets Manager

### **Deployment Environment Variables**

#### **Vercel Deployment**
```bash
# Add via Vercel Dashboard or CLI
vercel env add NEXTAUTH_SECRET production
vercel env add DASHBOARD_CLIENT_ID production
vercel env add DASHBOARD_CLIENT_SECRET production
```

#### **Docker Deployment**
```dockerfile
# Dockerfile
FROM node:18-alpine
# ... other setup
ENV NODE_ENV=production
# Environment variables will be passed at runtime
```

```bash
# docker-compose.yml
services:
  dashboard:
    build: .
    environment:
      - NEXT_PUBLIC_API_URL=https://api.kenyafooddb.com/api/v1
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - DASHBOARD_CLIENT_ID=${DASHBOARD_CLIENT_ID}
      - DASHBOARD_CLIENT_SECRET=${DASHBOARD_CLIENT_SECRET}
    env_file:
      - .env.production
```

### **Development Workflow**

1. **Copy template:** `cp .env.example .env.local`
2. **Fill in values:** Add your local development credentials
3. **Create dashboard OAuth app:** Use backend API to create app for dashboard
4. **Test locally:** Ensure all API calls work
5. **Deploy:** Set production environment variables in hosting platform

---

## 📱 Responsive Design

- **Mobile:** < 768px (Stack layout, hamburger menu)
- **Tablet:** 768px - 1024px (Collapsible sidebar)
- **Desktop:** > 1024px (Full sidebar, multi-column)

---

## ✅ Success Criteria

- [ ] All pages load in < 2 seconds
- [ ] 100% TypeScript coverage
- [ ] Lighthouse score > 90
- [ ] Mobile-friendly (responsive)
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Zero console errors
- [ ] Comprehensive error handling

---

**Estimated Timeline:** 9 weeks  
**Team Size:** 1-2 developers  
**Status:** 📋 Ready to start

---

## 🎯 Dashboard Types Summary

### **User Dashboard** (Weeks 1-5)
- App management
- Personal usage analytics  
- API explorer
- Account settings

### **Admin Dashboard** (Weeks 5-8)
- System overview & metrics
- User management
- Global apps management
- Content management (Foods, Categories, Nutrients)
- System settings & configuration
- API keys management

Both dashboards share the same codebase with role-based access control determining which features are available to each user type.
