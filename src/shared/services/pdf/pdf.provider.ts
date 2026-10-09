/**
 * PDF Provider Contract and Type Definitions
 * Allows swapping between PDFKit, Puppeteer, or any future rendering engines.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PdfDocumentData {
  title: string;
  slug?: string;
  version?: string;
  effectiveDate?: string;
  language?: string;
  companyName?: string;
  companyAddress?: string;
  supportEmail?: string;
  supportPhone?: string;
  content?: string; // Markdown or plain text
  faqsByCategory?: Record<string, FaqItem[]>;
  categoryOrder?: string[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PdfRenderOptions {
  template?: 'document' | 'faqs' | string;
  data: PdfDocumentData;
}

export interface IPdfProvider {
  readonly name: string;
  generatePdf(options: PdfRenderOptions): Promise<Buffer>;
}
