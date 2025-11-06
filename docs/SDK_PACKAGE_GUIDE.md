# Kenya Food DB SDK Package Guide

## 🎯 Overview

This guide shows how to create an NPM package for the Kenya Food DB API that frontend developers can easily install and use.

---

## 📦 Package Structure

```
kenyafooddb-sdk/
├── src/
│   ├── index.ts           # Main export
│   ├── client.ts          # API client
│   ├── types.ts           # TypeScript types
│   ├── errors.ts          # Custom errors
│   └── utils.ts           # Helper functions
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

---

## 🔧 Implementation

### **1. package.json**

```json
{
  "name": "@kenyafooddb/sdk",
  "version": "1.0.0",
  "description": "Official JavaScript/TypeScript SDK for Kenya Food DB API",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "test": "vitest",
    "lint": "eslint src",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "kenya",
    "food",
    "nutrition",
    "api",
    "sdk"
  ],
  "author": "Kenya Food DB",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/kenyafooddb/sdk-js"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "peerDependencies": {
    "typescript": ">=4.5.0"
  }
}
```

---

### **2. src/types.ts**

```typescript
// API Response Types
export interface Food {
  id: number;
  name: string;
  localName?: string;
  category: string;
  description?: string;
  nutrients: Nutrient[];
  createdAt: string;
  updatedAt: string;
}

export interface Nutrient {
  id: number;
  name: string;
  amount: number;
  unit: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  foodCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasNextPage: boolean;
  page: number;
  limit: number;
  total?: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

// Client Configuration
export interface ClientConfig {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

// Request Options
export interface RequestOptions {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  filter?: Record<string, any>;
}

// Error Types
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  details?: any;
}
```

---

### **3. src/errors.ts**

```typescript
export class KenyaFoodDBError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'KenyaFoodDBError';
  }
}

export class AuthenticationError extends KenyaFoodDBError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends KenyaFoodDBError {
  constructor(
    message = 'Rate limit exceeded',
    public retryAfter?: number
  ) {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

export class NotFoundError extends KenyaFoodDBError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends KenyaFoodDBError {
  constructor(message = 'Validation failed', details?: any) {
    super(message, 422, details);
    this.name = 'ValidationError';
  }
}
```

---

### **4. src/client.ts**

```typescript
import type {
  ClientConfig,
  Food,
  Category,
  Nutrient,
  PaginatedResponse,
  TokenResponse,
  RateLimitInfo,
  RequestOptions,
} from './types';
import {
  KenyaFoodDBError,
  AuthenticationError,
  RateLimitError,
  NotFoundError,
} from './errors';

export class KenyaFoodDBClient {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private rateLimitInfo: RateLimitInfo | null = null;

  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retries: number;

  constructor(private config: ClientConfig) {
    this.baseUrl = config.baseUrl || 'https://api.kenyafooddb.com/api/v1';
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;
  }

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new AuthenticationError('Failed to obtain access token');
      }

      const data: TokenResponse = await response.json();

      // Cache token with 5-minute buffer
      this.accessToken = data.access_token;
      this.tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      throw new KenyaFoodDBError('Network error during authentication');
    }
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAccessToken();

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(this.timeout),
        });

        // Extract rate limit info
        this.rateLimitInfo = {
          limit: parseInt(response.headers.get('X-RateLimit-Limit') || '0'),
          remaining: parseInt(
            response.headers.get('X-RateLimit-Remaining') || '0'
          ),
          reset: parseInt(response.headers.get('X-RateLimit-Reset') || '0'),
        };

        // Handle errors
        if (!response.ok) {
          await this.handleErrorResponse(response);
        }

        return response.json();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors
        if (
          error instanceof AuthenticationError ||
          error instanceof RateLimitError ||
          error instanceof NotFoundError
        ) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.retries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    throw lastError || new KenyaFoodDBError('Request failed after retries');
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    const data = await response.json().catch(() => ({}));

    switch (response.status) {
      case 401:
        // Clear cached token
        this.accessToken = null;
        throw new AuthenticationError(data.message);

      case 404:
        throw new NotFoundError(data.message);

      case 429:
        const retryAfter = parseInt(
          response.headers.get('Retry-After') || '0'
        );
        throw new RateLimitError(data.message, retryAfter);

      default:
        throw new KenyaFoodDBError(
          data.message || 'API request failed',
          response.status,
          data
        );
    }
  }

  /**
   * Build query string from options
   */
  private buildQueryString(options?: RequestOptions): string {
    if (!options) return '';

    const params = new URLSearchParams();

    if (options.page) params.set('page', options.page.toString());
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.search) params.set('search', options.search);
    if (options.sort) params.set('sort', options.sort);

    if (options.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        params.set(key, String(value));
      });
    }

    const query = params.toString();
    return query ? `?${query}` : '';
  }

  // ============================================
  // Public API Methods
  // ============================================

  /**
   * Get list of foods
   */
  async getFoods(
    options?: RequestOptions
  ): Promise<PaginatedResponse<Food>> {
    const query = this.buildQueryString(options);
    return this.request<PaginatedResponse<Food>>(`/foods${query}`);
  }

  /**
   * Get food by ID
   */
  async getFoodById(id: number): Promise<Food> {
    return this.request<Food>(`/foods/${id}`);
  }

  /**
   * Search foods
   */
  async searchFoods(
    searchTerm: string,
    options?: Omit<RequestOptions, 'search'>
  ): Promise<PaginatedResponse<Food>> {
    return this.getFoods({ ...options, search: searchTerm });
  }

  /**
   * Get list of categories
   */
  async getCategories(): Promise<PaginatedResponse<Category>> {
    return this.request<PaginatedResponse<Category>>('/categories');
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: number): Promise<Category> {
    return this.request<Category>(`/categories/${id}`);
  }

  /**
   * Get list of nutrients
   */
  async getNutrients(): Promise<PaginatedResponse<Nutrient>> {
    return this.request<PaginatedResponse<Nutrient>>('/nutrients');
  }

  /**
   * Get nutrient by ID
   */
  async getNutrientById(id: number): Promise<Nutrient> {
    return this.request<Nutrient>(`/nutrients/${id}`);
  }

  /**
   * Get current rate limit info
   */
  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  /**
   * Check if approaching rate limit
   */
  isApproachingRateLimit(threshold = 0.1): boolean {
    if (!this.rateLimitInfo) return false;
    const { limit, remaining } = this.rateLimitInfo;
    return remaining / limit < threshold;
  }

  /**
   * Clear cached token (force refresh on next request)
   */
  clearToken(): void {
    this.accessToken = null;
    this.tokenExpiresAt = 0;
  }
}
```

---

### **5. src/index.ts**

```typescript
export { KenyaFoodDBClient } from './client';
export * from './types';
export * from './errors';

// Re-export for convenience
export { KenyaFoodDBClient as default } from './client';
```

---

## 📚 Usage Examples

### **Installation**

```bash
npm install @kenyafooddb/sdk
# or
yarn add @kenyafooddb/sdk
# or
pnpm add @kenyafooddb/sdk
```

---

### **Basic Usage**

```typescript
import KenyaFoodDB from '@kenyafooddb/sdk';

const client = new KenyaFoodDB({
  clientId: process.env.KFDB_CLIENT_ID!,
  clientSecret: process.env.KFDB_CLIENT_SECRET!,
});

// Get foods
const { data: foods } = await client.getFoods({ page: 1, limit: 20 });

// Search foods
const results = await client.searchFoods('ugali');

// Get specific food
const food = await client.getFoodById(1);

// Get categories
const { data: categories } = await client.getCategories();
```

---

### **With Error Handling**

```typescript
import KenyaFoodDB, { RateLimitError, NotFoundError } from '@kenyafooddb/sdk';

try {
  const foods = await client.getFoods();
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error(`Rate limit exceeded. Retry after ${error.retryAfter}s`);
  } else if (error instanceof NotFoundError) {
    console.error('Resource not found');
  } else {
    console.error('API error:', error);
  }
}
```

---

### **Rate Limit Monitoring**

```typescript
const foods = await client.getFoods();

// Check rate limit info
const rateLimit = client.getRateLimitInfo();
console.log(`${rateLimit.remaining}/${rateLimit.limit} requests remaining`);

// Check if approaching limit
if (client.isApproachingRateLimit(0.1)) {
  console.warn('Approaching rate limit!');
}
```

---

### **React Hook**

```typescript
import { useState, useEffect } from 'react';
import KenyaFoodDB from '@kenyafooddb/sdk';

const client = new KenyaFoodDB({
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
  clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET!,
});

export function useFoods(page = 1, limit = 20) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    client
      .getFoods({ page, limit })
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [page, limit]);

  return { data, loading, error };
}
```

---

## 📖 README.md

```markdown
# Kenya Food DB SDK

Official JavaScript/TypeScript SDK for the Kenya Food Database API.

## Installation

```bash
npm install @kenyafooddb/sdk
```

## Quick Start

```typescript
import KenyaFoodDB from '@kenyafooddb/sdk';

const client = new KenyaFoodDB({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
});

const foods = await client.getFoods();
```

## Features

- ✅ Full TypeScript support
- ✅ Automatic token management
- ✅ Built-in retry logic
- ✅ Rate limit monitoring
- ✅ Comprehensive error handling
- ✅ Zero dependencies

## Documentation

Full documentation: https://docs.kenyafooddb.com

## License

MIT
```

---

## 🚀 Publishing

### **1. Build the package**

```bash
npm run build
```

### **2. Test locally**

```bash
npm link
cd ../test-project
npm link @kenyafooddb/sdk
```

### **3. Publish to NPM**

```bash
npm login
npm publish --access public
```

---

## 📦 Distribution

Once published, users can install with:

```bash
npm install @kenyafooddb/sdk
```

And use immediately:

```typescript
import KenyaFoodDB from '@kenyafooddb/sdk';

const client = new KenyaFoodDB({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

const foods = await client.getFoods();
```

---

## 🎯 Benefits

1. **Easy to use** - Simple, intuitive API
2. **Type-safe** - Full TypeScript support
3. **Reliable** - Built-in retry and error handling
4. **Efficient** - Automatic token caching
5. **Monitored** - Rate limit tracking
6. **Zero deps** - No external dependencies

---

**Ready to publish!** 🚀

Users can now integrate Kenya Food DB API with just:
```bash
npm install @kenyafooddb/sdk
```
