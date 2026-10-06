import { describe, it, expect } from 'vitest';
import { UsersMapper } from './users.mapper';
import { createMockUser, createMockPartner } from '../../../tests/helpers/factories';
import { parsePaginationParams, formatPaginatedResponse } from '../../shared/utils/pagination';

describe('Users Module - Unit Tests', () => {
  describe('UsersMapper', () => {
    it('should map User model to DTO and sanitize sensitive fields', () => {
      const user = createMockUser();
      const dto = UsersMapper.toDto(user);

      expect(dto.id).toBe(user.id);
      expect(dto.email).toBe(user.email);
      expect(dto.firstName).toBe(user.firstName);
      expect(dto.lastName).toBe(user.lastName);
      expect(dto.role).toBe('USER');
      // Ensure passwordHash is omitted
      expect((dto as unknown as Record<string, unknown>).passwordHash).toBeUndefined();
      expect(dto.partnerProfile).toBeNull();
    });

    it('should correctly map partner profile details', () => {
      const partnerUser = createMockPartner();
      const dto = UsersMapper.toDto(partnerUser);

      expect(dto.role).toBe('PARTNER');
      expect(dto.partnerProfile).toBeDefined();
      expect(dto.partnerProfile?.companyName).toBe('Acme Logistics');
      expect(dto.partnerProfile?.status).toBe('APPROVED');
      expect(dto.partnerProfile?.commissionRate).toBe(8.5);
    });
  });

  describe('Pagination Utility', () => {
    it('should parse valid pagination params', () => {
      const params = parsePaginationParams({ page: '2', limit: '20' });
      expect(params.page).toBe(2);
      expect(params.limit).toBe(20);
      expect(params.skip).toBe(20);
    });

    it('should enforce default and safe boundary values', () => {
      const params = parsePaginationParams({ page: '-5', limit: '500' });
      expect(params.page).toBe(1);
      expect(params.limit).toBe(100); // capped at max 100
      expect(params.skip).toBe(0);
    });

    it('should format paginated response metadata correctly', () => {
      const items = [{ id: 1 }, { id: 2 }];
      const paginated = formatPaginatedResponse(items, 50, { page: 2, limit: 10, skip: 10 });

      expect(paginated.data).toHaveLength(2);
      expect(paginated.meta.total).toBe(50);
      expect(paginated.meta.totalPages).toBe(5);
      expect(paginated.meta.hasNextPage).toBe(true);
      expect(paginated.meta.hasPrevPage).toBe(true);
    });
  });
});
