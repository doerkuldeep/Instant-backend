import { IPdfProvider, PdfRenderOptions } from '../pdf.provider';

export class PuppeteerProvider implements IPdfProvider {
  public readonly name = 'puppeteer';

  public async generatePdf(options: PdfRenderOptions): Promise<Buffer> {
    try {
      // Dynamic import to avoid runtime crashes when puppeteer is not installed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const puppeteerModule = await import('puppeteer' as any).catch(() => null);

      if (!puppeteerModule || !puppeteerModule.default) {
        throw new Error(
          "Puppeteer is not installed in the current environment. Please install 'puppeteer' or switch to the default 'pdfkit' provider.",
        );
      }

      const puppeteer = puppeteerModule.default;
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      try {
        const page = await browser.newPage();
        const html = this.buildHtml(options);
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfUint8Array = await page.pdf({
          format: 'A4',
          margin: { top: '50px', bottom: '60px', left: '50px', right: '50px' },
          printBackground: true,
          displayHeaderFooter: true,
          headerTemplate: `<div style="font-size: 8px; color: #94a3b8; width: 100%; padding: 0 50px; display: flex; justify-content: space-between;">
            <span>${options.data.title || 'Legal Document'}</span>
            <span>Version ${options.data.version || '1.0.0'}</span>
          </div>`,
          footerTemplate: `<div style="font-size: 8px; color: #94a3b8; width: 100%; padding: 0 50px; display: flex; justify-content: space-between;">
            <span>${options.data.companyName || 'EquipShare Partner Network'}</span>
            <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
          </div>`,
        });

        return Buffer.from(pdfUint8Array);
      } finally {
        await browser.close();
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Puppeteer is not installed')) {
        throw error;
      }
      throw new Error(`Puppeteer rendering error: ${(error as Error).message}`);
    }
  }

  private buildHtml(options: PdfRenderOptions): string {
    const { data } = options;
    const escapedTitle = this.escapeHtml(data.title || 'Document');
    const contentHtml = (data.content || '')
      .split('\n\n')
      .map((p) => `<p>${this.escapeHtml(p)}</p>`)
      .join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapedTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; margin: 0; padding: 20px; }
    h1 { color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
    p { margin-bottom: 12px; color: #334155; }
    .meta { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 4px; font-size: 12px; color: #64748b; margin-bottom: 24px; }
  </style>
</head>
<body>
  <h1>${escapedTitle}</h1>
  <div class="meta">
    <strong>Version:</strong> ${this.escapeHtml(data.version || '1.0.0')} &nbsp;|&nbsp;
    <strong>Effective Date:</strong> ${this.escapeHtml(data.effectiveDate || 'Immediate')}
  </div>
  ${contentHtml}
</body>
</html>`;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

export const puppeteerProvider = new PuppeteerProvider();
