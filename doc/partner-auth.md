# Partner Authentication API Documentation

This document covers all endpoints for Partner phone-based OTP authentication, session management, and referral code tracking.

---

## Base URLs & Route Aliases

All partner auth endpoints are accessible through either the direct alias or versioned API route:
* **Direct Path:** `/api/partner/auth` or `/api/partners/auth`
* **Versioned Path:** `/api/v1/partners/auth` or `/api/v1/partner/auth`

---

## Overview of Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/send-otp` | Generates and sends a 6-digit secure OTP to an E.164 phone number. |
| `POST` | `/verify-otp` | Verifies the OTP, manages signup/login, and links referral codes. |
| `POST` | `/resend-otp` | Invalidates previous OTP and dispatches a fresh code. |
| `POST` | `/refresh` | Rotates the JWT access and refresh tokens. |
| `POST` | `/logout` | Revokes the refresh token. |

---

## 1. POST `/api/partner/auth/send-otp`

Dispatches a cryptographically secure 6-digit OTP via the configured SMS provider (e.g. Twilio / MSG91). Only a SHA-256 hash is persisted, expiring in 5 minutes.

### Rate Limiting
* Maximum **3 OTP requests** per phone number per **10-minute sliding window**.

### Request Headers
```http
Content-Type: application/json
```

### Request Body
```json
{
  "phone": "+919876543210",
  "referralCode": "REF1234"
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `phone` | `string` | **Yes** | Phone number in strict E.164 format (e.g., `+919876543210`). |
| `referralCode` | `string` | No | Optional 6–8 character alphanumeric referral code. |

---

### Happy Path (200 OK)
**Response Body:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phone": "+919876543210",
    "expiresInSeconds": 300,
    "message": "OTP sent successfully"
  }
}
```

---

### Worst Cases & Errors

#### Case 1: Invalid Phone Number Format (422 Unprocessable Entity)
* **Trigger:** Phone missing `+` prefix, contains letters, spaces, or invalid country code.
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "phone",
        "message": "Phone number must be in E.164 format (e.g. +919876543210)"
      }
    ],
    "requestId": "req-98f24b91"
  }
}
```

#### Case 2: Exceeded Rate Limit (429 Too Many Requests)
* **Trigger:** More than 3 OTP requests within a 10-minute window for the same phone.
```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Too many OTP requests for this phone number. Maximum 3 requests allowed per 10 minutes. Please try again later.",
    "details": {
      "resetInMs": 482120
    },
    "requestId": "req-31a89c44"
  }
}
```

#### Case 3: Invalid Referral Code Length / Format (422 Unprocessable Entity)
* **Trigger:** Provided `referralCode` is shorter than 6 or longer than 8 characters.
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "referralCode",
        "message": "Referral code must be 6-8 alphanumeric characters"
      }
    ],
    "requestId": "req-5f33a1e2"
  }
}
```

---

## 2. POST `/api/partner/auth/verify-otp`

Validates the OTP using constant-time hash comparison:
* Single use: OTP is permanently deleted upon successful verification.
* New Partner Signup: Automatically provisions partner profile and creates a unique 6–8 character referral code. Links `referredBy` if a valid `referralCode` is provided.
* Existing Partner: Authenticates the user and returns fresh session tokens.

### Request Body
```json
{
  "phone": "+919876543210",
  "otp": "482915",
  "referralCode": "REF1234",
  "acceptedTerms": true
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `phone` | `string` | **Yes** | Phone number in E.164 format. |
| `otp` | `string` | **Yes** | Exactly 6 digits (e.g., `"482915"`). |
| `referralCode` | `string` | No | Optional referral code applied at first signup. |
| `acceptedTerms` | `boolean` | **Yes (Signup)** | Must be `true` when registering as a new partner. Records initial consent for mandatory legal terms. |

---

### Happy Path (200 OK)

#### Scenario A: New Partner First Signup
**Response Body:**
```json
{
  "success": true,
  "message": "Partner registered and verified successfully",
  "data": {
    "partner": {
      "id": "usr_99bf21a0-53bc-4279-b14a",
      "email": "919876543210@partner.local",
      "phone": "+919876543210",
      "firstName": null,
      "lastName": null,
      "role": "PARTNER",
      "isActive": true,
      "partnerProfile": {
        "id": "prof_12bc44a0-71cd-4389-c25e",
        "phone": "+919876543210",
        "companyName": "",
        "businessRegNumber": null,
        "businessCategory": null,
        "status": "PENDING",
        "commissionRate": 10.0,
        "referralCode": "KY84NW2",
        "referredById": "prof_parent_partner_id",
        "verifiedAt": null,
        "createdAt": "2026-10-06T10:15:30.000Z",
        "updatedAt": "2026-10-06T10:15:30.000Z"
      },
      "createdAt": "2026-10-06T10:15:30.000Z",
      "updatedAt": "2026-10-06T10:15:30.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "15m"
    },
    "isNewPartner": true,
    "requiresReconsent": []
  }
}
```

#### Scenario B: Returning Partner Login
**Response Body:**
```json
{
  "success": true,
  "message": "Partner authenticated successfully",
  "data": {
    "partner": {
      "id": "usr_99bf21a0-53bc-4279-b14a",
      "email": "919876543210@partner.local",
      "phone": "+919876543210",
      "firstName": "Alex",
      "lastName": "Merchant",
      "role": "PARTNER",
      "isActive": true,
      "partnerProfile": {
        "id": "prof_12bc44a0-71cd-4389-c25e",
        "phone": "+919876543210",
        "companyName": "Silk Route Logistics",
        "status": "APPROVED",
        "commissionRate": 10.0,
        "referralCode": "KY84NW2",
        "referredById": null,
        "verifiedAt": "2026-10-06T08:00:00.000Z",
        "createdAt": "2026-10-05T12:00:00.000Z",
        "updatedAt": "2026-10-06T08:00:00.000Z"
      },
      "createdAt": "2026-10-05T12:00:00.000Z",
      "updatedAt": "2026-10-06T08:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "15m"
    },
    "isNewPartner": false,
    "requiresReconsent": [
      {
        "slug": "terms-and-conditions",
        "version": "1.0.0"
      }
    ]
  }
}
```

---

### Worst Cases & Errors

#### Case 1: Terms Not Accepted on Signup (400 Bad Request)
* **Trigger:** New partner registration attempted with `acceptedTerms` omitted or set to `false`.
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Terms and conditions must be accepted to register as a partner",
    "details": null,
    "requestId": "req-9b882f00"
  }
}
```

#### Case 2: Expired OTP (400 Bad Request)
* **Trigger:** Verification attempted more than 5 minutes after OTP was generated.
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "OTP has expired. Please request a new OTP.",
    "details": null,
    "requestId": "req-9b882f01"
  }
}
```

#### Case 2: Wrong OTP Code (400 Bad Request — Attempts Remaining)
* **Trigger:** Incorrect OTP submitted (attempts < 5).
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid OTP. 3 attempts remaining.",
    "details": null,
    "requestId": "req-14e99f2b"
  }
}
```

#### Case 3: Exceeded Maximum Failed Attempts (400 Bad Request)
* **Trigger:** 5 consecutive failed attempts. OTP is invalidated and purged.
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Maximum OTP verification attempts exceeded. Please request a new OTP.",
    "details": null,
    "requestId": "req-62bb44cc"
  }
}
```

#### Case 4: Invalid Referral Code (400 Bad Request — Without Blocking Signup)
* **Trigger:** Referral code does not exist in the database. The OTP is NOT invalidated, allowing immediate retry with the correct code or without a code.
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid referral code",
    "details": null,
    "requestId": "req-71fa88ad"
  }
}
```

#### Case 5: Self-Referral Attempt (400 Bad Request)
* **Trigger:** The referral code belongs to the partner's own account.
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Self-referral is not allowed",
    "details": null,
    "requestId": "req-89e41cb3"
  }
}
```

#### Case 6: Deactivated Partner Account (401 Unauthorized)
* **Trigger:** Partner account marked `isActive: false`.
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Account has been deactivated. Please contact support.",
    "details": null,
    "requestId": "req-20df94ab"
  }
}
```

---

## 3. POST `/api/partner/auth/resend-otp`

Invalidates any existing active OTP for the specified phone number, generates a fresh 6-digit secure code, and resets failed attempt counters. Subject to the 3 OTP requests / 10 minutes sliding rate limit.

### Request Body
```json
{
  "phone": "+919876543210"
}
```

---

### Happy Path (200 OK)
```json
{
  "success": true,
  "message": "OTP resent successfully",
  "data": {
    "phone": "+919876543210",
    "expiresInSeconds": 300,
    "message": "OTP resent successfully"
  }
}
```

---

### Worst Cases & Errors

#### Case 1: Rate Limit Exceeded (429 Too Many Requests)
* **Trigger:** Phone number has already requested 3 OTPs within the 10-minute sliding window.
```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Too many OTP requests for this phone number. Maximum 3 requests allowed per 10 minutes. Please try again later.",
    "details": {
      "resetInMs": 312000
    },
    "requestId": "req-44cc21ea"
  }
}
```

---

## 4. POST `/api/partner/auth/refresh`

Rotates the refresh token and issues a new JWT access token pair.

### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Happy Path (200 OK)
```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "15m"
    }
  }
}
```

---

### Worst Cases & Errors

#### Case 1: Expired or Revoked Refresh Token (401 Unauthorized)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Refresh token is invalid, expired, or revoked",
    "details": null,
    "requestId": "req-91ab772d"
  }
}
```

---

## 5. POST `/api/partner/auth/logout`

Revokes the active refresh token.

### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Happy Path (200 OK)
```json
{
  "success": true,
  "message": "Partner logged out successfully"
}
```

---

## Security Specifications

1. **OTP Storage:** Only SHA-256 hashes are persisted. Plaintext OTPs are only retained in memory during the generation and SMS dispatch cycle.
2. **Comparison:** OTP matching uses `crypto.timingSafeEqual` to avoid timing side-channels.
3. **Attempt Limit:** Invalidation occurs strictly on the 5th failed attempt.
4. **Referral Code Integrity:**
   * Generated as 6–8 uppercase alphanumeric characters using a cryptographically secure charset.
   * Self-referral (`referrer.phone === partner.phone`) is rejected with HTTP 400.
   * Referral codes are only applicable at first signup; subsequent logins ignore or preserve existing referral associations.
