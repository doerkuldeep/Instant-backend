import { IPdfProvider, PdfRenderOptions } from './pdf.provider';
import { pdfkitProvider } from './providers/pdfkit.provider';
import { puppeteerProvider } from './providers/puppeteer.provider';
import { pdfCache, PdfCache } from './cache';

// Active provider registry (defaults to pdfkit)
let currentProvider: IPdfProvider = pdfkitProvider;

/**
 * Configure the active PDF provider (e.g. swap to puppeteer or a custom mock for testing).
 */
export function setPdfProvider(provider: IPdfProvider): void {
  currentProvider = provider;
}

/**
 * Retrieve the current active PDF provider.
 */
export function getPdfProvider(): IPdfProvider {
  return currentProvider;
}

export interface GeneratePdfOptions extends PdfRenderOptions {
  provider?: IPdfProvider;
  useCache?: boolean;
}

/**
 * Global PDF generation service function.
 * Exports generatePdf({ template, data }) -> Promise<Buffer>
 * Reusable by any feature across the application.
 */
export async function generatePdf(options: GeneratePdfOptions): Promise<Buffer> {
  const { provider = currentProvider, useCache = false, data } = options;

  if (useCache && data.slug) {
    const slug = data.slug;
    const version = (data.version as string) || '1.0.0';
    const lang = (data.language as string) || 'en';
    const template = options.template || 'document';
    const cacheKey = pdfCache.makeKey(slug, version, lang, template);

    const cached = pdfCache.get(cacheKey);
    if (cached) {
      return cached.buffer;
    }

    const buffer = await provider.generatePdf(options);
    pdfCache.set(cacheKey, buffer);
    return buffer;
  }

  return provider.generatePdf(options);
}

// Re-export providers and caching utilities
export {
  pdfCache,
  PdfCache,
  pdfkitProvider,
  puppeteerProvider,
  IPdfProvider,
  PdfRenderOptions,
};

export default {
  generatePdf,
  setPdfProvider,
  getPdfProvider,
  pdfCache,
  pdfkitProvider,
  puppeteerProvider,
};
