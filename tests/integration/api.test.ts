import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';

describe('API Integration Tests', () => {
  it('should attach x-request-id header to responses', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('should return 404 for unknown routes in structured JSON format', async () => {
    const res = await request(app).get('/api/v1/non-existent-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should reject invalid auth registration with 422 Unprocessable Entity', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'not-valid-email',
      password: 'short',
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toBeInstanceOf(Array);
  });

  it('should reject unauthenticated request to /api/v1/users/me with 401', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should validate user domain auth endpoint (/api/v1/users/auth/register)', async () => {
    const res = await request(app).post('/api/v1/users/auth/register').send({
      email: 'invalid-email',
      password: '123',
    });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should validate partner domain auth endpoint (/api/v1/partners/auth/register)', async () => {
    const res = await request(app).post('/api/v1/partners/auth/register').send({
      email: 'invalid-partner-email',
      password: '123',
    });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should validate admin domain auth endpoint (/api/v1/admin/auth/login)', async () => {
    const res = await request(app).post('/api/v1/admin/auth/login').send({
      email: 'invalid-admin-email',
      password: '',
    });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
