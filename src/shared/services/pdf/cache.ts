import crypto from 'crypto';

export interface CachedPdfEntry {
  buffer: Buffer;
  etag: string;
  createdAt: number;
}

export class PdfCache {
  private cache = new Map<string, CachedPdfEntry>();
  private defaultTtlMs: number;

  constructor(defaultTtlMs: number = 24 * 60 * 60 * 1000) { // 24 hours default
    this.defaultTtlMs = defaultTtlMs;
  }

  /**
   * Generates a deterministic cache key based on slug, version, language, and optional template.
   */
  public makeKey(slug: string, version: string = '1.0.0', lang: string = 'en', template = 'default'): string {
    return `${slug.trim().toLowerCase()}:v${version.trim()}:${lang.trim().toLowerCase()}:${template}`;
  }

  /**
   * Generates a strong ETag from buffer content and metadata.
   */
  public generateEtag(buffer: Buffer, keyHint?: string): string {
    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    return keyHint ? `"${hash}-${keyHint}"` : `"${hash}"`;
  }

  public get(key: string): CachedPdfEntry | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (this.defaultTtlMs > 0 && Date.now() - entry.createdAt > this.defaultTtlMs) {
      this.cache.delete(key);
      return undefined;
    }

    return entry;
  }

  public set(key: string, buffer: Buffer, etag?: string): CachedPdfEntry {
    const finalEtag = etag || this.generateEtag(buffer);
    const entry: CachedPdfEntry = {
      buffer,
      etag: finalEtag,
      createdAt: Date.now(),
    };
    this.cache.set(key, entry);
    return entry;
  }

  public has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  public invalidate(key: string): boolean {
    return this.cache.delete(key);
  }

  public invalidatePrefix(prefix: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

export const pdfCache = new PdfCache();
