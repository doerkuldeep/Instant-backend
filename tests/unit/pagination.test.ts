import { describe, it, expect } from 'vitest';
import { parsePaginationParams, formatPaginatedResponse } from '../../src/shared/utils/pagination';

describe('Shared Utilities - Pagination', () => {
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
