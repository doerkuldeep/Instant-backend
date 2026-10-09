import PDFDocument from 'pdfkit';
import { IPdfProvider, PdfRenderOptions, PdfDocumentData, FaqItem } from '../pdf.provider';

export class PdfKitProvider implements IPdfProvider {
  public readonly name = 'pdfkit';

  public async generatePdf(options: PdfRenderOptions): Promise<Buffer> {
    const { template = 'document', data } = options;

    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 55,
            left: 50,
            right: 50,
          },
          bufferPages: true,
          autoFirstPage: true,
          info: {
            Title: data.title,
            Author: data.companyName || 'EquipShare Partner Network',
            Subject: `${data.title} - Version ${data.version || '1.0.0'}`,
            CreationDate: new Date(),
          },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        if (template === 'faqs' || data.faqsByCategory) {
          this.renderFaqsDocument(doc, data);
        } else {
          this.renderStandardDocument(doc, data);
        }

        // Apply running header and footer across all buffered pages
        this.applyHeadersAndFooters(doc, data);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Render standard legal / policy markdown document.
   */
  private renderStandardDocument(doc: PDFKit.PDFDocument, data: PdfDocumentData): void {
    const primaryColor = '#0F172A'; // Slate 900
    const accentColor = '#2563EB'; // Royal Blue
    const mutedColor = '#64748B'; // Slate 500

    // Top Brand Accent Bar
    doc.rect(50, 45, doc.page.width - 100, 3).fill(accentColor);
    doc.moveDown(0.6);

    // Document Title
    doc
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .fontSize(22)
      .text(data.title, { align: 'left' });

    doc.moveDown(0.4);

    // Metadata Header Box
    const metaY = doc.y;
    doc
      .roundedRect(50, metaY, doc.page.width - 100, 36, 4)
      .fillAndStroke('#F8FAFC', '#E2E8F0');

    const vText = `Document Version: ${data.version || '1.0.0'}`;
    const dText = `Effective Date: ${data.effectiveDate || 'Immediate'}`;
    const lText = `Language: ${(data.language || 'en').toUpperCase()}`;

    doc
      .fillColor(mutedColor)
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(vText, 62, metaY + 12, { continued: true })
      .font('Helvetica')
      .text(`   •   ${dText}   •   ${lText}`);

    doc.y = metaY + 46;
    doc.moveDown(0.5);

    // Render Content (Markdown parsed)
    if (data.content) {
      this.renderMarkdown(doc, data.content);
    }
  }

  /**
   * Render FAQs document with dedicated Table of Contents on page 1.
   */
  private renderFaqsDocument(doc: PDFKit.PDFDocument, data: PdfDocumentData): void {
    const primaryColor = '#0F172A';
    const accentColor = '#1D4ED8';
    const mutedColor = '#64748B';

    // Page 1: Cover Header & Table of Contents
    doc.rect(50, 45, doc.page.width - 100, 3).fill(accentColor);
    doc.moveDown(0.6);

    doc
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .fontSize(22)
      .text(data.title || 'Partner Frequently Asked Questions', { align: 'left' });

    doc.moveDown(0.4);

    // Metadata banner
    const metaY = doc.y;
    doc
      .roundedRect(50, metaY, doc.page.width - 100, 36, 4)
      .fillAndStroke('#F1F5F9', '#CBD5E1');

    doc
      .fillColor(mutedColor)
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(
        `Version: ${data.version || '1.0.0'}   •   Effective: ${data.effectiveDate || 'Immediate'}   •   Platform: ${data.companyName || 'EquipShare'}`,
        62,
        metaY + 12,
      );

    doc.y = metaY + 48;
    doc.moveDown(0.8);

    // Table of Contents Section
    doc
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('Table of Contents', { align: 'left' });

    doc.moveDown(0.3);
    doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
    doc.moveDown(0.6);

    // Categories
    const categories: Record<string, FaqItem[]> = data.faqsByCategory || this.extractFaqsByCategory(data.content || '');
    const orderedCategories = data.categoryOrder || ['Account', 'Orders', 'Payouts', 'Referral', 'Support'];

    const sortedCategoryKeys = Object.keys(categories).sort((a, b) => {
      const idxA = orderedCategories.indexOf(a);
      const idxB = orderedCategories.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    // Render TOC Box
    sortedCategoryKeys.forEach((catName, index) => {
      const items = categories[catName] || [];
      const itemBoxY = doc.y;

      doc
        .roundedRect(50, itemBoxY, doc.page.width - 100, 32, 4)
        .fillAndStroke('#F8FAFC', '#E2E8F0');

      // Category numbering & title
      doc
        .fillColor('#1E293B')
        .font('Helvetica-Bold')
        .fontSize(10.5)
        .text(`${index + 1}. ${catName} FAQs`, 65, itemBoxY + 9, { continued: true })
        .fillColor(mutedColor)
        .font('Helvetica')
        .fontSize(9)
        .text(`   (${items.length} questions included)`);

      doc.y = itemBoxY + 38;
    });

    doc.moveDown(1.0);

    // Informational notice on Page 1
    const noticeY = doc.y;
    doc
      .roundedRect(50, noticeY, doc.page.width - 100, 48, 4)
      .fillAndStroke('#EFF6FF', '#BFDBFE');

    doc
      .fillColor('#1E40AF')
      .font('Helvetica-Bold')
      .fontSize(9.5)
      .text('Quick Guidance:', 65, noticeY + 10);

    doc
      .fillColor('#1E3A8A')
      .font('Helvetica')
      .fontSize(8.5)
      .text(
        'Browse through the categorized sections starting on the next page for answers regarding your account verification, machine bookings, payments, and partner support.',
        65,
        noticeY + 24,
        { width: doc.page.width - 130 },
      );

    // Add Page 2 for Question details
    doc.addPage();

    // Render Categorized FAQs
    sortedCategoryKeys.forEach((catName, catIndex) => {
      const items = categories[catName] || [];
      if (items.length === 0) return;

      // Category Header Block
      if (catIndex > 0) {
        doc.moveDown(0.8);
      }

      // Check remaining space, add page if too close to bottom
      if (doc.y > doc.page.height - 180) {
        doc.addPage();
      }

      const catHeaderY = doc.y;
      doc
        .roundedRect(50, catHeaderY, doc.page.width - 100, 26, 3)
        .fill('#1E293B');

      doc
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .fontSize(11)
        .text(`SECTION ${catIndex + 1}: ${catName.toUpperCase()} FAQS`, 62, catHeaderY + 7);

      doc.y = catHeaderY + 34;

      items.forEach((item, itemIdx) => {
        // Prevent orphaned questions at the bottom of the page
        if (doc.y > doc.page.height - 120) {
          doc.addPage();
        }

        doc.moveDown(0.3);

        // Question
        doc
          .fillColor('#0F172A')
          .font('Helvetica-Bold')
          .fontSize(10)
          .text(`Q${itemIdx + 1}: ${item.question}`, { indent: 10 });

        doc.moveDown(0.2);

        // Answer
        doc
          .fillColor('#334155')
          .font('Helvetica')
          .fontSize(9)
          .text(item.answer, {
            indent: 18,
            lineGap: 3,
            align: 'justify',
          });

        doc.moveDown(0.4);
      });
    });
  }

  /**
   * Helper to parse and render Markdown lines.
   */
  private renderMarkdown(doc: PDFKit.PDFDocument, content: string): void {
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip document title if already printed or empty metadata lines
      if (line.startsWith('# ') && i < 3) continue;
      if (line.startsWith('**Document Version:**') || line.startsWith('**Effective Date:**')) continue;
      if (line.startsWith('**Published by:**') || line.startsWith('**Entity:**') || line.startsWith('**Issued by:**')) continue;
      if (line === '---') {
        doc.moveDown(0.4);
        doc.strokeColor('#E2E8F0').lineWidth(0.8).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.moveDown(0.5);
        continue;
      }

      if (line.length === 0) {
        doc.moveDown(0.3);
        continue;
      }

      // Check page height safety
      if (doc.y > doc.page.height - 85) {
        doc.addPage();
      }

      // Headings
      if (line.startsWith('# ')) {
        const text = line.replace(/^#\s+/, '').replace(/\*\*/g, '');
        doc.moveDown(0.6);
        doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(16).text(text);
        doc.moveDown(0.2);
      } else if (line.startsWith('## ')) {
        const text = line.replace(/^##\s+/, '').replace(/\*\*/g, '');
        doc.moveDown(0.6);
        doc.fillColor('#1E293B').font('Helvetica-Bold').fontSize(12.5).text(text);
        doc.moveDown(0.2);
      } else if (line.startsWith('### ')) {
        const text = line.replace(/^###\s+/, '').replace(/\*\*/g, '');
        doc.moveDown(0.4);
        doc.fillColor('#334155').font('Helvetica-Bold').fontSize(10.5).text(text);
        doc.moveDown(0.15);
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        const text = line.replace(/^[-*]\s+/, '').replace(/\*\*/g, '');
        doc.fillColor('#334155').font('Helvetica').fontSize(9).text(`•  ${text}`, {
          indent: 12,
          lineGap: 2.5,
        });
      } else if (/^\d+\.\s+/.test(line)) {
        const text = line.replace(/^\d+\.\s+/, '').replace(/\*\*/g, '');
        const match = line.match(/^(\d+)\.\s+/);
        const num = match ? match[1] : '1';
        doc.fillColor('#334155').font('Helvetica').fontSize(9).text(`${num}.  ${text}`, {
          indent: 12,
          lineGap: 2.5,
        });
      } else {
        // Normal paragraph
        const text = line.replace(/\*\*/g, '');
        doc.fillColor('#334155').font('Helvetica').fontSize(9).text(text, {
          lineGap: 2.5,
          align: 'justify',
        });
      }
    }
  }

  /**
   * Parse FAQs markdown text into grouped categories.
   */
  private extractFaqsByCategory(content: string): Record<string, FaqItem[]> {
    const result: Record<string, FaqItem[]> = {};
    const lines = content.split('\n');

    let currentCategory = 'General';
    let currentQuestion = '';
    let currentAnswer = '';

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (line.startsWith('## Category:')) {
        if (currentQuestion && currentAnswer) {
          if (!result[currentCategory]) result[currentCategory] = [];
          result[currentCategory].push({ question: currentQuestion, answer: currentAnswer.trim() });
          currentQuestion = '';
          currentAnswer = '';
        }
        currentCategory = line.replace(/^## Category:\s*/, '').trim();
        if (!result[currentCategory]) result[currentCategory] = [];
      } else if (line.startsWith('### Q:')) {
        if (currentQuestion && currentAnswer) {
          if (!result[currentCategory]) result[currentCategory] = [];
          result[currentCategory].push({ question: currentQuestion, answer: currentAnswer.trim() });
          currentQuestion = '';
          currentAnswer = '';
        }
        currentQuestion = line.replace(/^### Q:\s*/, '').replace(/\*\*/g, '').trim();
      } else if (line.startsWith('**A:**') || line.startsWith('A:')) {
        currentAnswer = line.replace(/^\*\*A:\*\*\s*/, '').replace(/^A:\s*/, '').replace(/\*\*/g, '').trim();
      } else if (currentQuestion && currentAnswer && line.length > 0) {
        currentAnswer += ' ' + line.replace(/\*\*/g, '');
      }
    }

    if (currentQuestion && currentAnswer) {
      if (!result[currentCategory]) result[currentCategory] = [];
      result[currentCategory].push({ question: currentQuestion, answer: currentAnswer.trim() });
    }

    return result;
  }

  /**
   * Two-pass rendering of running header and running footer with exact "Page X of Y".
   */
  private applyHeadersAndFooters(doc: PDFKit.PDFDocument, data: PdfDocumentData): void {
    const pages = doc.bufferedPageRange();
    const totalPages = pages.count;
    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);

      // Running Header on pages > 0
      if (i > 0) {
        doc.save();
        doc
          .fillColor('#94A3B8')
          .font('Helvetica')
          .fontSize(8)
          .text(data.title, 50, 25, { width: 300, align: 'left', lineBreak: false })
          .text(
            `v${data.version || '1.0.0'} • ${data.effectiveDate || '2025-01-01'}`,
            doc.page.width - 200,
            25,
            { width: 150, align: 'right', lineBreak: false },
          );

        doc.strokeColor('#E2E8F0').lineWidth(0.5).moveTo(50, 36).lineTo(doc.page.width - 50, 36).stroke();
        doc.restore();
      }

      // Running Footer on ALL pages
      doc.save();
      const footerY = doc.page.height - 35;

      // Divider line
      doc.strokeColor('#E2E8F0').lineWidth(0.5).moveTo(50, footerY - 5).lineTo(doc.page.width - 50, footerY - 5).stroke();

      // Left: Company Branding
      doc
        .fillColor('#64748B')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(data.companyName || 'EquipShare Partner Services', 50, footerY, {
          width: 180,
          align: 'left',
          lineBreak: false,
        });

      // Center: Timestamp
      doc
        .font('Helvetica')
        .fontSize(7.5)
        .fillColor('#94A3B8')
        .text(`Generated on: ${nowIso}`, doc.page.width / 2 - 80, footerY, {
          width: 160,
          align: 'center',
          lineBreak: false,
        });

      // Right: Page X of Y
      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#64748B')
        .text(`Page ${i + 1} of ${totalPages}`, doc.page.width - 150, footerY, {
          width: 100,
          align: 'right',
          lineBreak: false,
        });

      doc.restore();
    }
  }
}

export const pdfkitProvider = new PdfKitProvider();
