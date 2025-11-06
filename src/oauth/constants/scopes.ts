export const SCOPES = {
  // Foods
  READ_FOODS: 'read:foods',
  WRITE_FOODS: 'write:foods',

  // Categories
  READ_CATEGORIES: 'read:categories',
  WRITE_CATEGORIES: 'write:categories',

  // Nutrients
  READ_NUTRIENTS: 'read:nutrients',
  WRITE_NUTRIENTS: 'write:nutrients',

  // Usage Logs
  READ_USAGE: 'read:usage',

  // Admin
  ADMIN: 'admin',
} as const;

export const DEFAULT_SCOPES = [
  SCOPES.READ_FOODS,
  SCOPES.READ_CATEGORIES,
  SCOPES.READ_NUTRIENTS,
];

export const ALL_SCOPES = Object.values(SCOPES);
