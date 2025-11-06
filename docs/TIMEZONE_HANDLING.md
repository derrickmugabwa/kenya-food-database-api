# Timezone Handling Guide

## Understanding the Issue

Your database stores all timestamps in **UTC (Coordinated Universal Time)**. Kenya is in **East Africa Time (EAT)**, which is **UTC+3**. This means:

- Database time: `2025-11-06 07:46:37 UTC`
- Kenya time: `2025-11-06 10:46:37 EAT` (3 hours ahead)

This is **correct behavior** - databases should always store times in UTC for consistency across different timezones.

---

## Recommended Solution: Frontend Conversion

Convert timestamps to local time in your frontend application. This ensures users always see times in their local timezone.

### JavaScript/TypeScript Examples

#### 1. Automatic Local Timezone

```typescript
// Automatically converts to user's browser timezone
const timestamp = "2025-11-06T07:46:37.000Z"; // UTC from database
const localTime = new Date(timestamp).toLocaleString();
console.log(localTime); // "11/6/2025, 10:46:37 AM" (in Kenya)
```

#### 2. Specific Timezone (Kenya/EAT)

```typescript
const timestamp = "2025-11-06T07:46:37.000Z";
const kenyaTime = new Date(timestamp).toLocaleString('en-US', {
  timeZone: 'Africa/Nairobi',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false, // 24-hour format
});
console.log(kenyaTime); // "11/06/2025, 10:46:37"
```

#### 3. Custom Formatting

```typescript
const formatKenyaTime = (utcTimestamp: string): string => {
  const date = new Date(utcTimestamp);
  
  return date.toLocaleString('en-KE', {
    timeZone: 'Africa/Nairobi',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// Usage
const timestamp = "2025-11-06T07:46:37.000Z";
console.log(formatKenyaTime(timestamp));
// "Wed, Nov 6, 2025, 10:46:37"
```

#### 4. Relative Time (e.g., "3 hours ago")

```typescript
const getRelativeTime = (utcTimestamp: string): string => {
  const now = new Date();
  const past = new Date(utcTimestamp);
  const diffMs = now.getTime() - past.getTime();
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return past.toLocaleDateString('en-KE', { timeZone: 'Africa/Nairobi' });
};

// Usage
console.log(getRelativeTime("2025-11-06T07:46:37.000Z"));
// "3 hours ago" (if current time is 10:46:37 EAT)
```

---

## React Component Example

```typescript
// components/TimeDisplay.tsx
import React from 'react';

interface TimeDisplayProps {
  timestamp: string;
  format?: 'full' | 'date' | 'time' | 'relative';
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ 
  timestamp, 
  format = 'full' 
}) => {
  const formatTime = () => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Africa/Nairobi',
    };

    switch (format) {
      case 'full':
        return date.toLocaleString('en-KE', {
          ...options,
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      
      case 'date':
        return date.toLocaleDateString('en-KE', {
          ...options,
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      
      case 'time':
        return date.toLocaleTimeString('en-KE', {
          ...options,
          hour: '2-digit',
          minute: '2-digit',
        });
      
      case 'relative':
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffHours < 1) {
          const diffMinutes = Math.floor(diffMs / (1000 * 60));
          return `${diffMinutes} minutes ago`;
        }
        if (diffHours < 24) return `${diffHours} hours ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} days ago`;
      
      default:
        return date.toLocaleString('en-KE', options);
    }
  };

  return <span title={timestamp}>{formatTime()}</span>;
};

// Usage
<TimeDisplay timestamp="2025-11-06T07:46:37.000Z" format="full" />
// Displays: "Nov 6, 2025, 10:46"

<TimeDisplay timestamp="2025-11-06T07:46:37.000Z" format="relative" />
// Displays: "3 hours ago"
```

---

## Using date-fns Library (Recommended)

For more robust date handling, use the `date-fns` and `date-fns-tz` libraries:

```bash
npm install date-fns date-fns-tz
```

```typescript
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

// Convert UTC to Kenya timezone
const utcDate = new Date("2025-11-06T07:46:37.000Z");
const kenyaDate = utcToZonedTime(utcDate, 'Africa/Nairobi');

// Format the date
const formatted = format(kenyaDate, 'yyyy-MM-dd HH:mm:ss');
console.log(formatted); // "2025-11-06 10:46:37"

// Relative time
import { formatDistanceToNow } from 'date-fns';
const relative = formatDistanceToNow(utcDate, { addSuffix: true });
console.log(relative); // "3 hours ago"
```

---

## Backend Solution (Not Recommended)

If you absolutely need the database to store times in Kenya timezone, you can:

### Option 1: Set PostgreSQL Connection Timezone

Uncomment this line in `src/database/typeorm-config.service.ts`:

```typescript
extra: {
  timezone: 'Africa/Nairobi', // Uncomment this line
  // ... other config
}
```

**⚠️ Warning:** This approach has drawbacks:
- Makes it harder to support users in different timezones
- Can cause confusion when deploying to different regions
- Industry best practice is to store UTC and convert in frontend

### Option 2: Set Environment Variable

Add to your `.env` file:
```bash
TZ=Africa/Nairobi
```

Then restart your server.

---

## Best Practices

1. **Always store UTC in database** ✅
   - Consistent across all users
   - Easy to convert to any timezone
   - No daylight saving time issues

2. **Convert to local time in frontend** ✅
   - Users see times in their timezone
   - Works for international users
   - Browser handles timezone automatically

3. **Display both absolute and relative times** ✅
   ```typescript
   <span title="Nov 6, 2025, 10:46:37 EAT">3 hours ago</span>
   ```

4. **Use ISO 8601 format** ✅
   - `2025-11-06T07:46:37.000Z`
   - Universally understood
   - Includes timezone information

---

## Quick Fix for Your Current Issue

If you're seeing "3 hours ago" when it should be "just now", the timestamps are correct - they're just in UTC. Use this helper in your frontend:

```typescript
// utils/timeHelper.ts
export const formatKenyaTime = (utcTimestamp: string | Date): string => {
  const date = new Date(utcTimestamp);
  return date.toLocaleString('en-KE', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Usage in your components
import { formatKenyaTime } from './utils/timeHelper';

// Instead of:
<td>{log.createdAt}</td>

// Use:
<td>{formatKenyaTime(log.createdAt)}</td>
```

---

## Testing

```typescript
// Test the conversion
const utcTime = "2025-11-06T07:46:37.000Z";
console.log("UTC:", utcTime);
console.log("Kenya:", new Date(utcTime).toLocaleString('en-KE', {
  timeZone: 'Africa/Nairobi'
}));

// Output:
// UTC: 2025-11-06T07:46:37.000Z
// Kenya: 11/6/2025, 10:46:37 AM
```

---

## Summary

**The 3-hour difference is expected and correct.** Your database is in UTC, and Kenya is UTC+3. 

**Recommended fix:** Convert timestamps to Kenya time in your frontend using JavaScript's built-in `toLocaleString()` with `timeZone: 'Africa/Nairobi'`.

This is the industry-standard approach and will work correctly for all users regardless of their location.
