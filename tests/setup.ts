import { beforeAll, afterAll, vi } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/myapp_test?schema=public';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_super_secure_32_characters_long';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_super_secure_32_characters_long';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.LOG_LEVEL = 'silent';

beforeAll(() => {
  // Global test setup
});

afterAll(() => {
  vi.clearAllMocks();
});
