import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  listDocuments,
  getDocumentPdf,
  getFaqsPdf,
  recordConsent,
} from '../controllers/user-legal.controller';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { authenticate, authorize } from '../../../shared/middlewares/authenticate';
import { legalLimiter } from '../../../shared/middlewares/rate-limit';

const router = Router();

// Apply rate limiting (60 req/min per IP) to all legal endpoints
router.use(legalLimiter);

// 1. List available documents (Public, no auth)
// GET /api/user/legal
router.get('/', asyncHandler(listDocuments));

// 2. FAQs endpoint with categorized sections and Table of Contents on page 1 (Public, no auth)
// GET /api/user/legal/faqs
router.get('/faqs', asyncHandler(getFaqsPdf));

// 3. Document PDF retrieval by slug (Public, no auth)
// GET /api/user/legal/:slug
router.get('/:slug', asyncHandler(getDocumentPdf));

// 4. Customer consent recording for document versions (Auth required)
// POST /api/user/legal/consent
router.post(
  '/consent',
  authenticate,
  authorize(Role.USER),
  asyncHandler(recordConsent),
);

export const userLegalRoutes = router;
export default userLegalRoutes;
