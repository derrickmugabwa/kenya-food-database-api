# Usage Logs Frontend Implementation Guide

## Overview

This guide covers how to implement the usage logs feature in your frontend application, with role-based filtering handled automatically by the backend.

## Authentication

All requests require a JWT Bearer token obtained from the login endpoint.

```typescript
// Store token after login
const token = response.data.token;
localStorage.setItem('authToken', token);
```

## API Endpoint

```
GET /api/v1/usage-logs
```

### Query Parameters

| Parameter | Type   | Required | Default | Description                    |
|-----------|--------|----------|---------|--------------------------------|
| page      | number | No       | 1       | Page number for pagination     |
| limit     | number | No       | 10      | Items per page (max 50)        |

### Response Format

```typescript
interface UsageLog {
  id: number;
  apiKeyId?: number | null;
  endpoint: string;
  method: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  statusCode: number;
  responseTime?: number | null;
  createdAt: string;
}

interface UsageLogsResponse {
  data: UsageLog[];
  hasNextPage: boolean;
}
```

## React/TypeScript Implementation

### 1. API Service

```typescript
// services/usageLogsService.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

interface UsageLog {
  id: number;
  apiKeyId?: number | null;
  endpoint: string;
  method: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  statusCode: number;
  responseTime?: number | null;
  createdAt: string;
}

interface UsageLogsResponse {
  data: UsageLog[];
  hasNextPage: boolean;
}

export const usageLogsService = {
  async getUsageLogs(page: number = 1, limit: number = 10): Promise<UsageLogsResponse> {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.get<UsageLogsResponse>(
      `${API_BASE_URL}/usage-logs`,
      {
        params: { page, limit },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return response.data;
  },
};
```

### 2. React Hook

```typescript
// hooks/useUsageLogs.ts
import { useState, useEffect } from 'react';
import { usageLogsService } from '../services/usageLogsService';

interface UsageLog {
  id: number;
  apiKeyId?: number | null;
  endpoint: string;
  method: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  statusCode: number;
  responseTime?: number | null;
  createdAt: string;
}

export const useUsageLogs = (page: number = 1, limit: number = 10) => {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await usageLogsService.getUsageLogs(page, limit);
        setLogs(response.data);
        setHasNextPage(response.hasNextPage);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch usage logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page, limit]);

  return { logs, loading, error, hasNextPage };
};
```

### 3. Usage Logs Component

```typescript
// components/UsageLogs.tsx
import React, { useState } from 'react';
import { useUsageLogs } from '../hooks/useUsageLogs';

export const UsageLogs: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { logs, loading, error, hasNextPage } = useUsageLogs(page, limit);

  if (loading) {
    return <div className="loading">Loading usage logs...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (logs.length === 0) {
    return (
      <div className="empty-state">
        <p>No usage logs found.</p>
        <p className="text-muted">
          Usage logs will appear here once you start making API requests.
        </p>
      </div>
    );
  }

  return (
    <div className="usage-logs">
      <h2>Usage Logs</h2>
      
      <div className="logs-table">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Method</th>
              <th>Endpoint</th>
              <th>Status</th>
              <th>Response Time</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td>
                  <span className={`method-badge ${log.method.toLowerCase()}`}>
                    {log.method}
                  </span>
                </td>
                <td className="endpoint">{log.endpoint}</td>
                <td>
                  <span className={`status-badge status-${Math.floor(log.statusCode / 100)}xx`}>
                    {log.statusCode}
                  </span>
                </td>
                <td>{log.responseTime ? `${log.responseTime}ms` : '-'}</td>
                <td>{log.ipAddress || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="btn btn-secondary"
        >
          Previous
        </button>
        <span className="page-info">Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={!hasNextPage}
          className="btn btn-secondary"
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

### 4. Styling (CSS)

```css
/* styles/UsageLogs.css */
.usage-logs {
  padding: 20px;
}

.usage-logs h2 {
  margin-bottom: 20px;
  color: #333;
}

.logs-table {
  overflow-x: auto;
  margin-bottom: 20px;
}

.logs-table table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logs-table th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

.logs-table td {
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
}

.logs-table tr:hover {
  background: #f8f9fa;
}

.method-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.method-badge.get {
  background: #d4edda;
  color: #155724;
}

.method-badge.post {
  background: #d1ecf1;
  color: #0c5460;
}

.method-badge.patch {
  background: #fff3cd;
  color: #856404;
}

.method-badge.delete {
  background: #f8d7da;
  color: #721c24;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.status-2xx {
  background: #d4edda;
  color: #155724;
}

.status-badge.status-4xx {
  background: #fff3cd;
  color: #856404;
}

.status-badge.status-5xx {
  background: #f8d7da;
  color: #721c24;
}

.endpoint {
  font-family: monospace;
  font-size: 13px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.pagination .btn {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination .btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.pagination .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #495057;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-state p {
  margin: 8px 0;
}

.text-muted {
  font-size: 14px;
  color: #adb5bd;
}

.loading,
.error {
  text-align: center;
  padding: 40px 20px;
}

.error {
  color: #dc3545;
}
```

## Vue.js Implementation

### 1. Composable

```typescript
// composables/useUsageLogs.ts
import { ref, watch } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

interface UsageLog {
  id: number;
  apiKeyId?: number | null;
  endpoint: string;
  method: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  statusCode: number;
  responseTime?: number | null;
  createdAt: string;
}

export function useUsageLogs(page: number = 1, limit: number = 10) {
  const logs = ref<UsageLog[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const hasNextPage = ref(false);

  const fetchLogs = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/usage-logs`, {
        params: { page, limit },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      logs.value = response.data.data;
      hasNextPage.value = response.data.hasNextPage;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch usage logs';
    } finally {
      loading.value = false;
    }
  };

  watch([() => page, () => limit], fetchLogs, { immediate: true });

  return { logs, loading, error, hasNextPage, refetch: fetchLogs };
}
```

### 2. Vue Component

```vue
<!-- components/UsageLogs.vue -->
<template>
  <div class="usage-logs">
    <h2>Usage Logs</h2>

    <div v-if="loading" class="loading">
      Loading usage logs...
    </div>

    <div v-else-if="error" class="error">
      Error: {{ error }}
    </div>

    <div v-else-if="logs.length === 0" class="empty-state">
      <p>No usage logs found.</p>
      <p class="text-muted">
        Usage logs will appear here once you start making API requests.
      </p>
    </div>

    <div v-else>
      <div class="logs-table">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Method</th>
              <th>Endpoint</th>
              <th>Status</th>
              <th>Response Time</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td>{{ formatDate(log.createdAt) }}</td>
              <td>
                <span :class="['method-badge', log.method.toLowerCase()]">
                  {{ log.method }}
                </span>
              </td>
              <td class="endpoint">{{ log.endpoint }}</td>
              <td>
                <span :class="['status-badge', `status-${getStatusClass(log.statusCode)}`]">
                  {{ log.statusCode }}
                </span>
              </td>
              <td>{{ log.responseTime ? `${log.responseTime}ms` : '-' }}</td>
              <td>{{ log.ipAddress || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button
          @click="page--"
          :disabled="page === 1"
          class="btn btn-secondary"
        >
          Previous
        </button>
        <span class="page-info">Page {{ page }}</span>
        <button
          @click="page++"
          :disabled="!hasNextPage"
          class="btn btn-secondary"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUsageLogs } from '../composables/useUsageLogs';

const page = ref(1);
const limit = ref(10);

const { logs, loading, error, hasNextPage } = useUsageLogs(page.value, limit.value);

const formatDate = (date: string) => {
  return new Date(date).toLocaleString();
};

const getStatusClass = (statusCode: number) => {
  return `${Math.floor(statusCode / 100)}xx`;
};
</script>

<style scoped>
/* Same CSS as React implementation */
</style>
```

## Angular Implementation

### 1. Service

```typescript
// services/usage-logs.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsageLog {
  id: number;
  apiKeyId?: number | null;
  endpoint: string;
  method: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  statusCode: number;
  responseTime?: number | null;
  createdAt: string;
}

export interface UsageLogsResponse {
  data: UsageLog[];
  hasNextPage: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsageLogsService {
  private apiUrl = 'http://localhost:3000/api/v1/usage-logs';

  constructor(private http: HttpClient) {}

  getUsageLogs(page: number = 1, limit: number = 10): Observable<UsageLogsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<UsageLogsResponse>(this.apiUrl, { params });
  }
}
```

### 2. Component

```typescript
// components/usage-logs/usage-logs.component.ts
import { Component, OnInit } from '@angular/core';
import { UsageLogsService, UsageLog } from '../../services/usage-logs.service';

@Component({
  selector: 'app-usage-logs',
  templateUrl: './usage-logs.component.html',
  styleUrls: ['./usage-logs.component.css']
})
export class UsageLogsComponent implements OnInit {
  logs: UsageLog[] = [];
  loading = true;
  error: string | null = null;
  page = 1;
  limit = 10;
  hasNextPage = false;

  constructor(private usageLogsService: UsageLogsService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading = true;
    this.error = null;

    this.usageLogsService.getUsageLogs(this.page, this.limit).subscribe({
      next: (response) => {
        this.logs = response.data;
        this.hasNextPage = response.hasNextPage;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to fetch usage logs';
        this.loading = false;
      }
    });
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.page++;
      this.loadLogs();
    }
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadLogs();
    }
  }

  getStatusClass(statusCode: number): string {
    return `status-${Math.floor(statusCode / 100)}xx`;
  }
}
```

## OAuth Clients Endpoint (Admin Only)

For admin users who need to fetch all OAuth clients to display in usage logs:

```
GET /api/v1/oauth/clients/all
```

### Query Parameters

| Parameter | Type   | Required | Default | Description                    |
|-----------|--------|----------|---------|--------------------------------|
| page      | number | No       | 1       | Page number for pagination     |
| limit     | number | No       | 10      | Items per page                 |

### Response Format

```typescript
interface OAuthClient {
  id: number;
  clientId: string;
  name: string;
  description?: string;
  userId: number;
  scopes: string[];
  tier: string;
  rateLimit: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Response is an array of OAuthClient
type OAuthClientsResponse = OAuthClient[];
```

### Example Usage

```typescript
// services/oauthService.ts
export const oauthService = {
  async getAllClients(page: number = 1, limit: number = 10): Promise<OAuthClient[]> {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.get<OAuthClient[]>(
      `${API_BASE_URL}/oauth/clients/all`,
      {
        params: { page, limit },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return response.data;
  },
};
```

## Role-Based UI Considerations

### Admin View
- Show all logs from all users
- Use `GET /oauth/clients/all` to fetch OAuth client names for display
- Consider adding filters for:
  - User/OAuth Client
  - Date range
  - HTTP method
  - Status code
  - Endpoint

### Non-Admin View
- Automatically filtered to user's OAuth clients
- Show message if no OAuth clients exist
- Provide link to create OAuth clients

### Example Admin Filter Component

```typescript
// components/UsageLogsFilters.tsx (React)
import React from 'react';

interface FiltersProps {
  onFilterChange: (filters: any) => void;
  isAdmin: boolean;
}

export const UsageLogsFilters: React.FC<FiltersProps> = ({ onFilterChange, isAdmin }) => {
  if (!isAdmin) {
    return null; // Non-admins don't need filters
  }

  return (
    <div className="filters">
      <select onChange={(e) => onFilterChange({ method: e.target.value })}>
        <option value="">All Methods</option>
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PATCH">PATCH</option>
        <option value="DELETE">DELETE</option>
      </select>
      
      <select onChange={(e) => onFilterChange({ status: e.target.value })}>
        <option value="">All Status Codes</option>
        <option value="2xx">2xx Success</option>
        <option value="4xx">4xx Client Error</option>
        <option value="5xx">5xx Server Error</option>
      </select>
    </div>
  );
};
```

## Error Handling

### Common Errors

| Status Code | Error | Handling |
|-------------|-------|----------|
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show access denied message |
| 500 | Server Error | Show retry button |

### Example Error Handler

```typescript
const handleError = (error: any) => {
  if (error.response?.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    setError('You do not have permission to view usage logs');
  } else {
    setError('An error occurred. Please try again.');
  }
};
```

## Best Practices

1. **Caching**: Consider caching logs for a short period to reduce API calls
2. **Real-time Updates**: Use WebSockets or polling for real-time log updates
3. **Export**: Add functionality to export logs as CSV/JSON
4. **Search**: Implement client-side or server-side search
5. **Date Formatting**: Use a library like `date-fns` or `moment.js` for consistent date formatting
6. **Loading States**: Show skeleton loaders for better UX
7. **Empty States**: Provide helpful messages when no logs exist
8. **Responsive Design**: Ensure table works well on mobile devices

## Testing

### Unit Tests (Jest/React Testing Library)

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { UsageLogs } from './UsageLogs';
import { usageLogsService } from '../services/usageLogsService';

jest.mock('../services/usageLogsService');

describe('UsageLogs', () => {
  it('displays loading state initially', () => {
    render(<UsageLogs />);
    expect(screen.getByText('Loading usage logs...')).toBeInTheDocument();
  });

  it('displays logs after successful fetch', async () => {
    const mockLogs = [
      {
        id: 1,
        endpoint: '/api/v1/foods',
        method: 'GET',
        statusCode: 200,
        createdAt: '2025-01-01T00:00:00Z',
      },
    ];

    (usageLogsService.getUsageLogs as jest.Mock).mockResolvedValue({
      data: mockLogs,
      hasNextPage: false,
    });

    render(<UsageLogs />);

    await waitFor(() => {
      expect(screen.getByText('/api/v1/foods')).toBeInTheDocument();
    });
  });

  it('displays empty state when no logs exist', async () => {
    (usageLogsService.getUsageLogs as jest.Mock).mockResolvedValue({
      data: [],
      hasNextPage: false,
    });

    render(<UsageLogs />);

    await waitFor(() => {
      expect(screen.getByText('No usage logs found.')).toBeInTheDocument();
    });
  });
});
```

## Summary

The backend automatically handles role-based filtering, so your frontend implementation only needs to:

1. **Authenticate**: Include JWT token in requests
2. **Fetch**: Call the endpoint with pagination parameters
3. **Display**: Show logs in a user-friendly format
4. **Handle**: Manage loading, error, and empty states

The filtering logic is transparent to the frontend - admins see all logs, non-admins see only their logs.
