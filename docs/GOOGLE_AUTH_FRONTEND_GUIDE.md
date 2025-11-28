# Google Authentication - Frontend Integration Guide

## Overview

This guide explains how to integrate Google Sign-In with the Kenya Food Database API. The backend uses a **token-based authentication flow** where the frontend obtains a Google ID token and sends it to the backend for verification.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [API Endpoint](#api-endpoint)
3. [Implementation Options](#implementation-options)
4. [Next.js Implementation](#nextjs-implementation) ⭐ **Recommended for Next.js**
5. [React Implementation](#react-implementation)
6. [Vue.js Implementation](#vuejs-implementation)
7. [Vanilla JavaScript Implementation](#vanilla-javascript-implementation)
8. [Error Handling](#error-handling)
9. [Testing](#testing)
10. [Security Best Practices](#security-best-practices)

---

## Prerequisites

### 1. Google Client ID
You'll need the Google OAuth Client ID from the backend team. This is a public identifier that can be safely used in frontend code.

**Environment Variable:**
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
# or
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
# or
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 2. Backend API URL
```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## API Endpoint

### **POST** `/api/v1/auth/google/login`

**Request Body:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjI3ZTU..."
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenExpires": 1700000000000,
  "user": {
    "id": "123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": {
      "id": 2,
      "name": "user"
    },
    "status": {
      "id": 1,
      "name": "active"
    }
  }
}
```

**Error Response (422 Unprocessable Entity):**
```json
{
  "status": 422,
  "errors": {
    "user": "wrongToken"
  }
}
```

---

## Implementation Options

There are three main ways to implement Google Sign-In:

1. **Google Identity Services (Recommended)** - Modern, official Google library
2. **@react-oauth/google** - React-specific wrapper
3. **Manual Implementation** - Using REST API directly

---

## Next.js Implementation

### Environment Setup

**`.env.local`:**
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

### Option 1: Next.js App Router (Next.js 13+) - Recommended

#### Installation
```bash
npm install @react-oauth/google
```

#### 1. Create Authentication Context

**`app/providers/auth-provider.tsx`:**
```tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: { id: number; name: string };
  status: { id: number; name: string };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage on mount
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        login, 
        logout, 
        isAuthenticated: !!token 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### 2. Setup Root Layout

**`app/layout.tsx`:**
```tsx
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './providers/auth-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
```

#### 3. Create Google Login Component

**`app/components/google-login-button.tsx`:**
```tsx
'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function GoogleLoginButton() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/google/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.user || 'Login failed');
      }

      const data = await response.json();
      
      // Update auth context
      login(data.token, data.refreshToken, data.user);

      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    setError('Google Sign-In failed. Please try again.');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme="outline"
        size="large"
        text="signin_with"
      />
      {loading && <p className="text-sm text-gray-600">Signing in...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

#### 4. Create Login Page

**`app/login/page.tsx`:**
```tsx
import GoogleLoginButton from '../components/google-login-button';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Sign in to Kenya Food DB
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use your Google account to continue
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
}
```

#### 5. Create Protected Route Middleware (Optional)

**`middleware.ts`:**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  
  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

#### 6. Create Server Action for Login (Alternative Approach)

**`app/actions/auth.ts`:**
```typescript
'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function loginWithGoogle(idToken: string) {
  try {
    const response = await fetch(`${API_URL}/auth/google/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        error: errorData.errors?.user || 'Login failed' 
      };
    }

    const data = await response.json();
    
    // Set httpOnly cookies (more secure)
    cookies().set('accessToken', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    cookies().set('refreshToken', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { 
      success: true, 
      user: data.user 
    };
    
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'An error occurred' 
    };
  }
}

export async function logout() {
  cookies().delete('accessToken');
  cookies().delete('refreshToken');
  return { success: true };
}
```

**Using Server Action in Component:**
```tsx
'use client';

import { GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle } from '../actions/auth';
import { useRouter } from 'next/navigation';

export default function GoogleLoginButton() {
  const router = useRouter();

  const handleSuccess = async (credentialResponse: any) => {
    const result = await loginWithGoogle(credentialResponse.credential);
    
    if (result.success) {
      router.push('/dashboard');
    } else {
      alert(result.error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => alert('Login failed')}
    />
  );
}
```

---

### Option 2: Next.js Pages Router (Next.js 12 and below)

#### 1. Setup `_app.tsx`

**`pages/_app.tsx`:**
```tsx
import type { AppProps } from 'next/app';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '../contexts/auth-context';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
```

#### 2. Create Auth Context

**`contexts/auth-context.tsx`:**
```tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider 
      value={{ user, token, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

#### 3. Create Login Page

**`pages/login.tsx`:**
```tsx
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/auth-context';
import { useRouter } from 'next/router';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/google/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.user || 'Login failed');
      }

      const data = await response.json();
      login(data.token, data.refreshToken, data.user);
      router.push('/dashboard');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError('Login failed')}
        />
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
      </div>
    </div>
  );
}
```

#### 4. Create Protected Route HOC

**`hocs/withAuth.tsx`:**
```tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/auth-context';

export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
      return <div>Loading...</div>;
    }

    return <Component {...props} />;
  };
}
```

**Usage:**
```tsx
// pages/dashboard.tsx
import { withAuth } from '../hocs/withAuth';

function DashboardPage() {
  return <div>Dashboard Content</div>;
}

export default withAuth(DashboardPage);
```

---

### Option 3: API Routes for Server-Side Authentication

**`pages/api/auth/google.ts`:**
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { idToken } = req.body;

  try {
    const response = await fetch(`${API_URL}/auth/google/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();

    // Set httpOnly cookies
    res.setHeader('Set-Cookie', [
      `accessToken=${data.token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 7}`,
      `refreshToken=${data.refreshToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 30}`,
    ]);

    return res.status(200).json({ user: data.user });
    
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}
```

**Client-side usage:**
```tsx
const handleSuccess = async (credentialResponse: any) => {
  const response = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: credentialResponse.credential }),
  });

  if (response.ok) {
    const data = await response.json();
    router.push('/dashboard');
  }
};
```

---

## React Implementation

### Option 1: Using `@react-oauth/google` (Recommended for React)

#### Installation
```bash
npm install @react-oauth/google
# or
yarn add @react-oauth/google
```

#### Implementation

**1. Wrap your app with GoogleOAuthProvider:**

```jsx
// App.jsx or main.jsx
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <YourApp />
    </GoogleOAuthProvider>
  );
}

export default App;
```

**2. Create a Google Login Component:**

```jsx
// components/GoogleLoginButton.jsx
import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/google/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.user || 'Login failed');
      }

      const data = await response.json();
      
      // Store tokens (consider using httpOnly cookies for production)
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect or update app state
      window.location.href = '/dashboard';
      
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    setError('Google Sign-In failed. Please try again.');
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme="outline"
        size="large"
        text="signin_with"
      />
      {loading && <p>Signing in...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

**3. Using with Custom Button:**

```jsx
import { useGoogleLogin } from '@react-oauth/google';

export default function CustomGoogleButton() {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // Note: This gives you an access token, not an ID token
      // You'll need to exchange it for an ID token
      console.log(tokenResponse);
    },
    flow: 'implicit',
  });

  return (
    <button onClick={() => login()}>
      Sign in with Google
    </button>
  );
}
```

### Option 2: Using Google Identity Services Directly

```jsx
// components/GoogleLoginButton.jsx
import { useEffect, useRef } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_URL = import.meta.env.VITE_API_URL;

export default function GoogleLoginButton() {
  const googleButtonRef = useRef(null);

  useEffect(() => {
    // Load Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
        }
      );

      // Optional: Enable One Tap
      window.google.accounts.id.prompt();
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const result = await fetch(`${API_URL}/auth/google/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: response.credential,
        }),
      });

      if (!result.ok) {
        throw new Error('Login failed');
      }

      const data = await result.json();
      
      // Store tokens
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Error:', error);
      alert('Login failed. Please try again.');
    }
  };

  return <div ref={googleButtonRef}></div>;
}
```

---

## Vue.js Implementation

### Using `vue3-google-login`

#### Installation
```bash
npm install vue3-google-login
```

#### Setup

**1. Configure in main.js:**

```javascript
// main.js
import { createApp } from 'vue';
import App from './App.vue';
import vue3GoogleLogin from 'vue3-google-login';

const app = createApp(App);

app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
});

app.mount('#app');
```

**2. Create Login Component:**

```vue
<!-- components/GoogleLogin.vue -->
<template>
  <div>
    <GoogleLogin :callback="handleLogin" />
    <p v-if="loading">Signing in...</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { GoogleLogin } from 'vue3-google-login';

const API_URL = import.meta.env.VITE_API_URL;
const loading = ref(false);
const error = ref(null);

const handleLogin = async (response) => {
  loading.value = true;
  error.value = null;

  try {
    const result = await fetch(`${API_URL}/auth/google/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken: response.credential,
      }),
    });

    if (!result.ok) {
      const errorData = await result.json();
      throw new Error(errorData.errors?.user || 'Login failed');
    }

    const data = await result.json();
    
    // Store tokens
    localStorage.setItem('accessToken', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));

    // Redirect
    window.location.href = '/dashboard';
    
  } catch (err) {
    console.error('Login error:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.error {
  color: red;
  margin-top: 10px;
}
</style>
```

---

## Vanilla JavaScript Implementation

```html
<!DOCTYPE html>
<html>
<head>
  <title>Google Sign-In</title>
  <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>
  <div id="g_id_onload"
       data-client_id="YOUR_GOOGLE_CLIENT_ID"
       data-callback="handleCredentialResponse">
  </div>
  <div class="g_id_signin" data-type="standard"></div>

  <script>
    const API_URL = 'http://localhost:3000/api/v1';

    async function handleCredentialResponse(response) {
      try {
        const result = await fetch(`${API_URL}/auth/google/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken: response.credential,
          }),
        });

        if (!result.ok) {
          const errorData = await result.json();
          throw new Error(errorData.errors?.user || 'Login failed');
        }

        const data = await result.json();
        
        // Store tokens
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to dashboard
        window.location.href = '/dashboard.html';
        
      } catch (error) {
        console.error('Error:', error);
        alert('Login failed: ' + error.message);
      }
    }
  </script>
</body>
</html>
```

---

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `wrongToken` | Invalid or expired Google ID token | Ask user to sign in again |
| `CORS error` | Backend not configured for your domain | Contact backend team to add your domain to CORS whitelist |
| `401 Unauthorized` | Token verification failed | Ensure you're sending the correct `idToken` |
| `Network error` | Backend is down or unreachable | Check API URL and backend status |

### Comprehensive Error Handling Example

```javascript
async function loginWithGoogle(idToken) {
  try {
    const response = await fetch(`${API_URL}/auth/google/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 422) {
        const errorData = await response.json();
        throw new Error('Invalid Google token. Please try signing in again.');
      } else if (response.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(`Login failed with status: ${response.status}`);
      }
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    
    // Re-throw other errors
    throw error;
  }
}
```

---

## Testing

### Manual Testing Checklist

- [ ] Google Sign-In button renders correctly
- [ ] Clicking button opens Google Sign-In popup
- [ ] Successful login stores tokens in localStorage
- [ ] User is redirected after successful login
- [ ] Error messages display for failed login
- [ ] One Tap prompt appears (if enabled)
- [ ] Works in incognito/private mode
- [ ] Works across different browsers (Chrome, Firefox, Safari)

### Testing with Different Accounts

```javascript
// Clear tokens before testing
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
localStorage.removeItem('user');
```

### Debugging Tips

```javascript
// Log the ID token (for debugging only - never in production)
console.log('ID Token:', response.credential);

// Decode JWT to see payload (client-side only, for debugging)
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

console.log('Token payload:', parseJwt(response.credential));
```

---

## Security Best Practices

### 1. **Never Store Sensitive Data in localStorage (Production)**

For production, consider using:
- **httpOnly cookies** (requires backend support)
- **Secure session storage**
- **State management libraries** with encryption

### 2. **Validate Tokens on Every Request**

```javascript
// Add token to API requests
async function fetchProtectedData() {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_URL}/protected-endpoint`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
}
```

### 3. **Handle Token Expiration**

```javascript
// Check if token is expired
function isTokenExpired() {
  const tokenExpires = localStorage.getItem('tokenExpires');
  return Date.now() > parseInt(tokenExpires);
}

// Refresh token if needed
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${refreshToken}`,
    },
  });
  
  const data = await response.json();
  localStorage.setItem('accessToken', data.token);
  localStorage.setItem('tokenExpires', data.tokenExpires);
}
```

### 4. **Use HTTPS in Production**

Ensure your frontend is served over HTTPS to prevent token interception.

### 5. **Implement CSRF Protection**

If using cookies, implement CSRF tokens for state-changing operations.

---

## Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
- [vue3-google-login Documentation](https://www.npmjs.com/package/vue3-google-login)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## Support

For backend-related issues or questions:
- Contact the backend team
- Check the API documentation
- Review backend logs for detailed error messages

For frontend implementation questions:
- Refer to this guide
- Check Google's official documentation
- Test in the browser console for debugging
