import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';

describe('Role-Based Routes E2E Test Suite', () => {
  it('should reject partner route without partner authentication', async () => {
    const res = await request(app)
      .patch('/api/v1/partners/profile')
      .send({ companyName: 'New Company' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject admin route without admin authentication', async () => {
    const res = await request(app).get('/api/v1/admin/users');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject user me route without user authentication', async () => {
    const res = await request(app).get('/api/v1/users/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
