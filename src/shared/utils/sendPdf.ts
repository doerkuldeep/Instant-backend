import { Request, Response } from 'express';
import crypto from 'crypto';

export interface SendPdfOptions {
  buffer: Buffer;
  filename: string;
  download?: boolean;
  version?: string;
  etag?: string;
  maxAge?: number; // default: 86400 (24 hours)
}

/**
 * Sends a PDF response with strict compliance headers:
 * - Content-Type: application/pdf
 * - Content-Disposition: inline (or attachment when download=true)
 * - ETag: strong MD5 hash of buffer content
 * - Cache-Control: public, max-age=86400
 * - Handles If-None-Match conditional request with 304 Not Modified
 */
export function sendPdf(
  req: Request,
  res: Response,
  options: SendPdfOptions,
): Response | void {
  const { buffer, filename, download = false, maxAge = 86400 } = options;

  // Compute strong ETag if not provided
  const etag = options.etag || `"${crypto.createHash('md5').update(buffer).digest('hex')}"`;

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', buffer.length.toString());
  res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
  res.setHeader('ETag', etag);

  if (download) {
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  } else {
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  }

  // Handle conditional caching request (If-None-Match header)
  const clientEtag = req.headers['if-none-match'];
  if (clientEtag) {
    const normalizedClient = clientEtag.replace(/^W\//, '');
    const normalizedServer = etag.replace(/^W\//, '');
    if (clientEtag === etag || normalizedClient === normalizedServer) {
      return res.status(304).end();
    }
  }

  return res.status(200).send(buffer);
}

export default sendPdf;
