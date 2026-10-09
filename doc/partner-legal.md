# Partner Legal & Help Documentation API

This document details all endpoints for Partner Legal & Help Documents, PDF streaming delivery, multilingual support, and versioned consent tracking.

---

## Base URLs & Route Aliases

All partner legal endpoints are mounted and accessible under both direct aliases and versioned routes:
* **Direct Path:** `/api/partner/legal` or `/api/partners/legal`
* **Versioned Path:** `/api/v1/partners/legal` or `/api/v1/partner/legal`

---

## Overview of Endpoints

| Method | Endpoint | Auth Required | Rate Limit | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | No (Public) | 60 req/min | Returns JSON catalog of available partner documents. |
| `GET` | `/faqs` | No (Public) | 60 req/min | Generates and streams FAQ PDF with Table of Contents and categorized sections. |
| `GET` | `/:slug` | No (Public) | 60 req/min | Generates and streams a PDF for the requested document slug. |
| `POST` | `/consent` | **Yes (Partner)** | 60 req/min | Records partner re-acceptance for an updated document version. |

---

## Rate Limiting & HTTP Headers

* **Rate Limit:** 60 requests per minute per IP address (`legalLimiter`). Exceeding returns `429 Too Many Requests`.
* **Content-Type:** `application/pdf` for all PDF endpoints.
* **Cache-Control:** `public, max-age=86400` with HTTP `ETag` (SHA-256 digest of buffer).
* **Conditional Requests:** Clients sending matching `If-None-Match: <etag>` receive a lightweight `304 Not Modified` without response body.
* **Download Header:** Setting `?download=true` changes `Content-Disposition` from `inline` to `attachment; filename="<slug>-v<version>.pdf"`.

---

## 1. GET `/api/partner/legal`

Returns a list of all active partner legal documents and policies defined in the platform catalog.

### Request
```http
GET /api/partner/legal HTTP/1.1
Host: api.equipshare.com
```

### Happy Path (200 OK)
**Response Body:**
```json
{
  "success": true,
  "data": [
    {
      "slug": "terms-and-conditions",
      "title": "Partner Terms and Conditions",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/partner/legal/terms-and-conditions"
    },
    {
      "slug": "privacy-policy",
      "title": "Partner Privacy Policy",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/partner/legal/privacy-policy"
    },
    {
      "slug": "refund-policy",
      "title": "Partner Refund & Settlement Policy",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/partner/legal/refund-policy"
    },
    {
      "slug": "cancellation-policy",
      "title": "Order Cancellation Policy for Partners",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/partner/legal/cancellation-policy"
    },
    {
      "slug": "partner-agreement",
      "title": "Equipment Partner Master Service Agreement",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/partner/legal/partner-agreement"
    },
    {
      "slug": "commission-and-payout-policy",
      "title": "Commission Structure & Payout Terms",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/partner/legal/commission-and-payout-policy"
    },
    {
      "slug": "code-of-conduct",
      "title": "Partner Code of Conduct & Fleet Quality Standards",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/partner/legal/code-of-conduct"
    },
    {
      "slug": "grievance-redressal",
      "title": "Grievance Redressal Policy",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/partner/legal/grievance-redressal"
    },
    {
      "slug": "data-deletion-policy",
      "title": "Partner Data Retention & Deletion Policy",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/partner/legal/data-deletion-policy"
    },
    {
      "slug": "faqs",
      "title": "Partner Frequently Asked Questions",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en", "hi"],
      "url": "/api/partner/legal/faqs"
    },
    {
      "slug": "contact-and-support",
      "title": "Partner Support Directory",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/partner/legal/contact-and-support"
    },
    {
      "slug": "about-us",
      "title": "About EquipShare Partner Network",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/partner/legal/about-us"
    }
  ]
}
```

---

## 2. GET `/api/partner/legal/:slug`

Renders and streams the requested legal document as a high-resolution, branded PDF.

### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `lang` | `string` | No | `en` | ISO language code (e.g. `en`, `hi`). Falls back gracefully to `en` if requested language is unavailable. |
| `download` | `boolean` / `1` | No | `false` | When `true`, triggers browser download via `Content-Disposition: attachment`. |

### Example Request (Inline View)
```http
GET /api/partner/legal/partner-agreement HTTP/1.1
Host: api.equipshare.com
```

### Response Headers (200 OK)
```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: inline; filename="partner-agreement-v1.0.0.pdf"
Cache-Control: public, max-age=86400
ETag: "8f503c21a7fa..."
Content-Length: 26310
```
*Body: Raw PDF binary stream starting with magic bytes `%PDF`.*

### Example Request with Download
```http
GET /api/partner/legal/privacy-policy?download=true HTTP/1.1
Host: api.equipshare.com
```

### Response Headers (200 OK)
```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="privacy-policy-v1.0.0.pdf"
Cache-Control: public, max-age=86400
ETag: "ad44f12e9203..."
```

### Example Conditional Request (Cached ETag)
```http
GET /api/partner/legal/partner-agreement HTTP/1.1
Host: api.equipshare.com
If-None-Match: "8f503c21a7fa..."
```

### Response (304 Not Modified)
```http
HTTP/1.1 304 Not Modified
ETag: "8f503c21a7fa..."
```

### Worst Case: Unknown Document Slug (404 Not Found)
* **Trigger:** Client requests non-existent slug.
```json
{
  "success": false,
  "message": "Document with slug 'unknown-slug' not found",
  "data": null
}
```

---

## 3. GET `/api/partner/legal/faqs`

Generates a multi-page, categorized FAQs PDF with a dedicated **Table of Contents** on Page 1 linking directly to each category:
1. **Account**
2. **Orders**
3. **Payouts**
4. **Referral**
5. **Support**

### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `lang` | `string` | No | `en` | Supports English (`en`) and Hindi (`hi`). |
| `download` | `boolean` / `1` | No | `false` | Sets attachment header for download. |

### Request
```http
GET /api/partner/legal/faqs?lang=en HTTP/1.1
Host: api.equipshare.com
```

### Response Headers (200 OK)
```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: inline; filename="faqs-v1.0.0.pdf"
Cache-Control: public, max-age=86400
ETag: "ca19a043e7bb..."
```

---

## 4. POST `/api/partner/legal/consent`

Records a partner's explicit re-acceptance of an updated document version.

### Authentication
* **Required:** Bearer JWT in `Authorization` header (`Role.PARTNER`).

### Request Headers
```http
POST /api/partner/legal/consent HTTP/1.1
Host: api.equipshare.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Request Body
```json
{
  "slug": "terms-and-conditions",
  "version": "1.0.0"
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `slug` | `string` | **Yes** | Valid document slug (e.g., `"terms-and-conditions"`). |
| `version` | `string` | **Yes** | Accepted semantic version (e.g., `"1.0.0"`). |

### Happy Path (200 OK)
**Response Body:**
```json
{
  "success": true,
  "message": "Consent recorded successfully",
  "data": {
    "id": "partner-consent-1760081234-xyz987",
    "partnerId": "prof_12bc44a0-71cd-4389-c25e",
    "documentSlug": "terms-and-conditions",
    "version": "1.0.0",
    "acceptedAt": "2026-10-09T10:15:30.000Z",
    "ip": "203.0.113.195",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7 ...)",
    "createdAt": "2026-10-09T10:15:30.000Z"
  }
}
```

---

### Worst Cases & Errors

#### Case 1: Missing Authentication (401 Unauthorized)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "details": null
  }
}
```

#### Case 2: Invalid Document Slug (400 Bad Request)
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid document slug: 'invalid-doc'",
    "details": null
  }
}
```

---

## 5. Automated Consent Lifecycle

1. **Signup Flow:**
   - On initial registration via `POST /api/partner/auth/verify-otp`, `acceptedTerms: true` is strictly mandatory.
   - The auth service automatically records initial consent entries in `PartnerConsent` for mandatory documents (`terms-and-conditions` and `privacy-policy`).
2. **Re-Consent Notification:**
   - When returning partners authenticate via `POST /api/partner/auth/verify-otp`, the response contains `requiresReconsent: Array<{ slug, version }>`.
   - If the active mandatory document version in `meta.json` exceeds the partner's latest recorded consent, the slug is included in `requiresReconsent`.
3. **Re-Acceptance:**
   - The partner dashboard displays the updated terms dialog and sends `POST /api/partner/legal/consent` with the updated version.

---

## 6. Document File Structure & Security

All document sources reside in standard project location:
```
src/shared/constants/content/legal/
├── meta.json                # Company configuration & version catalog
└── partner/                 # Partner markdown sources
    ├── terms-and-conditions.en.md
    ├── privacy-policy.en.md
    ├── refund-policy.en.md
    ├── cancellation-policy.en.md
    ├── partner-agreement.en.md
    ├── commission-and-payout-policy.en.md
    ├── code-of-conduct.en.md
    ├── grievance-redressal.en.md
    ├── data-deletion-policy.en.md
    ├── faqs.en.md
    ├── faqs.hi.md
    ├── contact-and-support.en.md
    └── about-us.en.md
```
