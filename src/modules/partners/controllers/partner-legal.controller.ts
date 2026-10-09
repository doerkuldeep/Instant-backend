import { Request, Response } from 'express';
import { partnerLegalService } from '../services/partner-legal.service';
import { sendPdf } from '../../../shared/utils/sendPdf';
import { BadRequestError } from '../../../shared/errors/http-errors';

/**
 * GET /api/partner/legal
 * Returns JSON list of available documents:
 * [{ slug, title, version, effectiveDate, languages, url }]
 */
export async function listDocuments(_req: Request, res: Response): Promise<void> {
  const documents = partnerLegalService.listDocuments();
  res.status(200).json({
    success: true,
    data: documents,
  });
}

/**
 * GET /api/partner/legal/faqs
 * Generates and streams PDF for FAQs with Table of Contents on page 1
 * and grouped categories (Account, Orders, Payouts, Referral, Support).
 */
export async function getFaqsPdf(req: Request, res: Response): Promise<void> {
  const lang = typeof req.query.lang === 'string' ? req.query.lang : 'en';
  const download = req.query.download === 'true' || req.query.download === '1';

  try {
    const { buffer, etag, meta } = await partnerLegalService.generateFaqsPdf(lang);
    const filename = `faqs-v${meta.version}.pdf`;

    sendPdf(req, res, {
      buffer,
      filename,
      download,
      version: meta.version,
      etag,
    });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err && (err as any).statusCode === 404) {
      res.status(404).json({
        success: false,
        message: "Document with slug 'faqs' not found",
        data: null,
      });
      return;
    }
    throw err;
  }
}

/**
 * GET /api/partner/legal/:slug
 * Responds with PDF for specified document slug:
 * Content-Type: application/pdf
 * Content-Disposition: inline (or attachment; filename="<slug>-v<version>.pdf" when download=true)
 * ETag + Cache-Control: public, max-age=86400
 * Unknown slug returns 404 JSON { success:false, message, data:null }
 */
export async function getDocumentPdf(req: Request, res: Response): Promise<void> {
  const slug = req.params.slug ? String(req.params.slug).trim() : '';
  const lang = typeof req.query.lang === 'string' ? req.query.lang : 'en';
  const download = req.query.download === 'true' || req.query.download === '1';

  // If slug is faqs, route to FAQs renderer
  if (slug.toLowerCase() === 'faqs') {
    return getFaqsPdf(req, res);
  }

  // Check if document exists first to return consistent 404 JSON
  const doc = partnerLegalService.getDocument(slug, lang);
  if (!doc) {
    res.status(404).json({
      success: false,
      message: `Document with slug '${slug}' not found`,
      data: null,
    });
    return;
  }

  const { buffer, etag, meta } = await partnerLegalService.generateDocumentPdf(slug, lang);
  const filename = `${meta.slug}-v${meta.version}.pdf`;

  sendPdf(req, res, {
    buffer,
    filename,
    download,
    version: meta.version,
    etag,
  });
}

/**
 * POST /api/partner/legal/consent
 * (Auth required) Records partner re-acceptance for an updated document version.
 */
export async function recordConsent(req: Request, res: Response): Promise<void> {
  const { slug, version } = req.body || {};

  if (!slug || typeof slug !== 'string') {
    throw new BadRequestError('Document slug is required');
  }

  if (!version || typeof version !== 'string') {
    throw new BadRequestError('Document version is required');
  }

  // Obtain partnerProfileId from authenticated session
  const partnerProfileId = req.user?.partnerProfileId || req.user?.id;
  if (!partnerProfileId) {
    throw new BadRequestError('Partner profile ID not found for authenticated user');
  }

  const clientIp = req.ip || (req.headers['x-forwarded-for'] as string);
  const userAgent = req.headers['user-agent'];

  const consentRecord = await partnerLegalService.recordConsent(
    partnerProfileId,
    slug,
    version,
    clientIp,
    userAgent,
  );

  res.status(200).json({
    success: true,
    message: 'Consent recorded successfully',
    data: consentRecord,
  });
}

export const partnerLegalController = {
  listDocuments,
  getDocumentPdf,
  getFaqsPdf,
  recordConsent,
};

export default partnerLegalController;
