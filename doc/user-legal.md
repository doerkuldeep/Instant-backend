# Customer Legal & Help Documentation API

This document details all endpoints for Customer Legal & Help Documents, PDF streaming delivery, multilingual support, and versioned consent tracking.

---

## Base URLs & Route Aliases

All customer legal endpoints are mounted and accessible under both direct aliases and versioned routes:
* **Direct Path:** `/api/user/legal` or `/api/users/legal`
* **Versioned Path:** `/api/v1/user/legal` or `/api/v1/users/legal`

---

## Overview of Endpoints

| Method | Endpoint | Auth Required | Rate Limit | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | No (Public) | 60 req/min | Returns JSON catalog of available customer documents. |
| `GET` | `/faqs` | No (Public) | 60 req/min | Generates and streams FAQ PDF with Table of Contents and categorized sections. |
| `GET` | `/:slug` | No (Public) | 60 req/min | Generates and streams a PDF for the requested document slug. |
| `POST` | `/consent` | **Yes (User)** | 60 req/min | Records customer re-acceptance for an updated document version. |

---

## Rate Limiting & HTTP Headers

* **Rate Limit:** 60 requests per minute per IP address (`legalLimiter`). Exceeding returns `429 Too Many Requests`.
* **Content-Type:** `application/pdf` for all PDF endpoints.
* **Cache-Control:** `public, max-age=86400` with HTTP `ETag` (SHA-256 digest of buffer).
* **Conditional Requests:** Clients sending matching `If-None-Match: <etag>` receive a lightweight `304 Not Modified` without response body.
* **Download Header:** Setting `?download=true` changes `Content-Disposition` from `inline` to `attachment; filename="<slug>-v<version>.pdf"`.

---

## 1. GET `/api/user/legal`

Returns a list of all active customer legal documents and help policies defined in the platform catalog.

### Request
```http
GET /api/user/legal HTTP/1.1
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
      "title": "Customer Terms of Service",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/user/legal/terms-and-conditions"
    },
    {
      "slug": "privacy-policy",
      "title": "Customer Privacy Policy",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/user/legal/privacy-policy"
    },
    {
      "slug": "refund-policy",
      "title": "Refund Policy",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/user/legal/refund-policy"
    },
    {
      "slug": "cancellation-policy",
      "title": "Booking Cancellation Policy",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/user/legal/cancellation-policy"
    },
    {
      "slug": "user-agreement",
      "title": "Machinery Hire Master Agreement",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/user/legal/user-agreement"
    },
    {
      "slug": "rental-and-deposit-policy",
      "title": "Equipment Rental & Security Deposit Policy",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/user/legal/rental-and-deposit-policy"
    },
    {
      "slug": "safety-guidelines",
      "title": "Equipment Safety & Operational Guidelines",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/user/legal/safety-guidelines"
    },
    {
      "slug": "grievance-redressal",
      "title": "Grievance Redressal Policy",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/user/legal/grievance-redressal"
    },
    {
      "slug": "data-deletion-policy",
      "title": "User Data Deletion & Privacy Rights",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/user/legal/data-deletion-policy"
    },
    {
      "slug": "faqs",
      "title": "Customer Frequently Asked Questions",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en", "hi"],
      "url": "/api/user/legal/faqs"
    },
    {
      "slug": "contact-and-support",
      "title": "Customer Support & Contact Directory",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/user/legal/contact-and-support"
    },
    {
      "slug": "about-us",
      "title": "About EquipShare Rentals",
      "version": "1.0.0",
      "effectiveDate": "2025-01-01",
      "languages": ["en"],
      "url": "/api/user/legal/about-us"
    }
  ]
}
```

---

## 2. GET `/api/user/legal/:slug`

Renders and streams the requested legal document as a high-resolution, branded PDF.

### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `lang` | `string` | No | `en` | ISO language code (e.g. `en`, `hi`). Falls back gracefully to `en` if requested language is unavailable. |
| `download` | `boolean` / `1` | No | `false` | When `true`, triggers browser download via `Content-Disposition: attachment`. |

### Example Request (Inline View)
```http
GET /api/user/legal/terms-and-conditions HTTP/1.1
Host: api.equipshare.com
```

### Response Headers (200 OK)
```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: inline; filename="terms-and-conditions-v1.0.0.pdf"
Cache-Control: public, max-age=86400
ETag: "9e403d5267fa52994ce3ab..."
Content-Length: 24510
```
*Body: Raw PDF binary stream starting with magic bytes `%PDF`.*

### Example Request with Download
```http
GET /api/user/legal/privacy-policy?download=true HTTP/1.1
Host: api.equipshare.com
```

### Response Headers (200 OK)
```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="privacy-policy-v1.0.0.pdf"
Cache-Control: public, max-age=86400
ETag: "bc12f91e9203a110a..."
```

### Example Conditional Request (Cached ETag)
```http
GET /api/user/legal/terms-and-conditions HTTP/1.1
Host: api.equipshare.com
If-None-Match: "9e403d5267fa52994ce3ab..."
```

### Response (304 Not Modified)
```http
HTTP/1.1 304 Not Modified
ETag: "9e403d5267fa52994ce3ab..."
```
*(No response body transmitted, saving bandwidth).*

### Worst Case: Unknown Document Slug (404 Not Found)
* **Trigger:** Client requests non-existent slug.
```json
{
  "success": false,
  "message": "Document with slug 'invalid-slug' not found",
  "data": null
}
```

---

## 3. GET `/api/user/legal/faqs`

Generates a multi-page, categorized FAQs PDF with a dedicated **Table of Contents** on Page 1 linking directly to each category:
1. **Account**
2. **Bookings**
3. **Payments**
4. **Security Deposit**
5. **Support**

### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `lang` | `string` | No | `en` | Supports English (`en`) and Hindi (`hi`). |
| `download` | `boolean` / `1` | No | `false` | Sets attachment header for download. |

### Request
```http
GET /api/user/legal/faqs?lang=en HTTP/1.1
Host: api.equipshare.com
```

### Response Headers (200 OK)
```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: inline; filename="faqs-v1.0.0.pdf"
Cache-Control: public, max-age=86400
ETag: "fa5a043e7bb..."
```
*Body: Valid multi-page PDF document.*

---

## 4. POST `/api/user/legal/consent`

Records a customer's explicit re-acceptance of an updated document version (e.g. after a terms update).

### Authentication
* **Required:** Bearer JWT in `Authorization` header (`Role.USER`).

### Request Headers
```http
POST /api/user/legal/consent HTTP/1.1
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
    "id": "user-consent-1760081234-abc1234",
    "userId": "usr_71fa990a-52bc-4279-b14a",
    "documentSlug": "terms-and-conditions",
    "version": "1.0.0",
    "acceptedAt": "2026-10-09T10:15:30.000Z",
    "ip": "203.0.113.195",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 ...)",
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
    "message": "Invalid document slug: 'unknown-doc'",
    "details": null
  }
}
```

---

## 5. Automated Consent Lifecycle

1. **Signup Flow:**
   - On initial registration via `POST /api/user/auth/verify-otp`, `acceptedTerms: true` is strictly mandatory.
   - The auth service automatically records initial consent entries in `UserConsent` for mandatory documents (`terms-and-conditions` and `privacy-policy`).
2. **Re-Consent Notification:**
   - When returning users authenticate via `POST /api/user/auth/verify-otp` or `POST /api/user/auth/login`, the response contains `requiresReconsent: Array<{ slug, version }>`.
   - If the active mandatory document version in `meta.json` exceeds the user's latest recorded consent, the slug is included in `requiresReconsent`.
3. **Re-Acceptance:**
   - The client application displays the updated terms dialog and sends `POST /api/user/legal/consent` with the updated version.

---

## 6. Document File Structure & Security

All document sources reside in standard project location:
```
src/shared/constants/content/legal/
├── meta.json                # Company configuration & version catalog
└── user/                    # Customer markdown sources
    ├── terms-and-conditions.en.md
    ├── privacy-policy.en.md
    ├── refund-policy.en.md
    ├── cancellation-policy.en.md
    ├── user-agreement.en.md
    ├── rental-and-deposit-policy.en.md
    ├── safety-guidelines.en.md
    ├── grievance-redressal.en.md
    ├── data-deletion-policy.en.md
    ├── faqs.en.md
    ├── faqs.hi.md
    ├── contact-and-support.en.md
    └── about-us.en.md
```

### Security & Sanitization
* Dynamic template placeholders (`{{COMPANY_NAME}}`, `{{LEGAL_ENTITY}}`, `{{SUPPORT_EMAIL}}`, etc.) are stripped of HTML tags (`<`, `>`) and interpolated safely.
* PDF output is cached in an in-memory LRU cache keyed by `slug:lang:version` for sub-millisecond responses.
