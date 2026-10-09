# Customer Homepage & Discovery Feed API

This document details all endpoints for the Customer Homepage and equipment discovery feed, designed for high-performance mobile apps and web platforms.

---

## Base URLs & Route Aliases

All customer homepage endpoints are mounted and accessible under both direct aliases and versioned routes:
* **Direct Paths:** `/api/user/home`, `/api/users/home`, `/api/user/homepage`
* **Versioned Paths:** `/api/v1/user/home`, `/api/v1/users/home`

---

## Overview of Endpoints

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/user/home` | Optional | **Unified Home Feed**: Returns complete aggregated homepage in a single round-trip call. Supports `?format=sdui` and `?platform=app\|web`. |
| `GET` | `/api/user/home/feed` | Optional | Alias for unified homepage feed. |
| `GET` | `/api/user/home/sdui` *(or `/layout`)* | Optional | **Server-Driven UI (SDUI)**: Dynamic screen layout, widget components, design tokens, and deep-link actions tailored for App & Web (`?platform=app\|web`). |
| `GET` | `/api/user/home/banners` | Public | Promotional hero banners and carousel slides. |
| `GET` | `/api/user/home/categories` | Public | Curated top categories with machine counts and popular tags (`?limit=`). |
| `GET` | `/api/user/home/featured` | Public | Curated iconic & trending machines (`?segment=LIGHT\|HEAVY\|OTHER`, `?limit=`). |
| `GET` | `/api/user/home/segments` | Public | Machinery segments overview (LIGHT, HEAVY, OTHER) with starting daily rates. |
| `GET` | `/api/user/home/promotions` | Public | Active platform discount coupons and promotional offers. |
| `GET` | `/api/user/home/trust-markers` | Public | Platform trust badges, safety audits, and guarantees. |
| `GET` | `/api/user/home/testimonials` | Public | Verified contractor reviews and customer stories. |
| `GET` | `/api/user/home/search-trends` | Public | Trending machinery search keywords. |

---

## 1. GET `/api/user/home` (Unified Home Feed)

Provides the complete homepage dataset in a single call to eliminate waterfall network requests on app launch.

### Headers (Optional)
```http
Authorization: Bearer <access_token>
```
*If provided and valid, returns personalized `user` context and customized greeting. If absent or invalid, gracefully defaults to guest context (`user: null`).*

### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `city` | `string` | No | Optional city to customize local banners and fleet availability. |

### Happy Path (200 OK — Guest Visitor)
```json
{
  "success": true,
  "data": {
    "greeting": "Heavy & Light Construction Equipment Rental",
    "user": null,
    "heroBanners": [
      {
        "id": "banner-monsoon-prep",
        "title": "Monsoon Site Protection Sale",
        "subtitle": "Flat 15% off on dewatering pumps, compactors & diesel generators",
        "tag": "SEASONAL OFFER",
        "imageUrl": "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80",
        "mobileImageUrl": "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80",
        "ctaText": "Rent Light Tools",
        "actionType": "CATEGORY",
        "actionTarget": "light-construction-tools",
        "backgroundColor": "#1E3A8A",
        "displayOrder": 1,
        "isActive": true
      }
    ],
    "categories": [
      {
        "id": "c1111111-1111-1111-1111-111111111111",
        "name": "Earthmoving & Excavation",
        "slug": "earthmoving-excavation",
        "description": "JCBs, excavators, bulldozers",
        "iconUrl": "https://cdn.example.com/icons/earthmoving.svg",
        "imageUrl": "https://cdn.example.com/machines/cat-earthmoving.jpg",
        "displayOrder": 1,
        "machinesCount": 12,
        "isPopular": true
      }
    ],
    "featuredMachines": [
      {
        "id": "m1111111-1111-1111-1111-111111111111",
        "name": "JCB 3DX Backhoe Loader",
        "slug": "jcb-3dx-backhoe-loader",
        "categoryName": "Earthmoving & Excavation",
        "categorySlug": "earthmoving-excavation",
        "segment": "HEAVY",
        "imageUrl": "https://cdn.example.com/machines/jcb-3dx.jpg",
        "startingDailyRateInr": 7500,
        "startingHourlyRateInr": 1000,
        "minBooking": "4 hours",
        "popularBrands": ["JCB", "Mahindra"],
        "tag": "Most Popular",
        "rating": 4.8,
        "reviewsCount": 137
      }
    ],
    "segments": [
      {
        "segment": "LIGHT",
        "title": "Home & Light Construction Tools",
        "description": "Small, easy-to-use machines for house construction, renovation and repair. Doorstep delivery, operator optional.",
        "badge": "HOUSE BUILDERS & DIY",
        "keyFeatures": [
          "Doorstep delivery to site",
          "Easy-to-use plug-and-play tools",
          "No certified operator needed",
          "Affordable daily & weekly rates"
        ],
        "startingDailyRateInr": 500,
        "machineCount": 12,
        "popularMachines": [
          { "name": "Concrete Mixer Machine (Half Bag)", "slug": "concrete-mixer-half-bag" }
        ]
      },
      {
        "segment": "HEAVY",
        "title": "Earthmoving & Heavy Site Equipment",
        "description": "Heavy infrastructure and site equipment including JCBs, excavators and cranes. Typically booked with operator and mobilisation.",
        "badge": "COMMERCIAL & INFRA",
        "keyFeatures": [
          "Certified operators included",
          "Heavy earthmoving & compaction",
          "Pan-India mobilization support",
          "Full statutory GST documentation"
        ],
        "startingDailyRateInr": 7500,
        "machineCount": 18,
        "popularMachines": [
          { "name": "JCB 3DX Backhoe Loader", "slug": "jcb-3dx-backhoe-loader" }
        ]
      },
      {
        "segment": "OTHER",
        "title": "Site Support, Farm & Events",
        "description": "Cabins, mobile toilets, farm tractors, lighting towers and utility equipment to keep sites and events operating.",
        "badge": "UTILITIES & EVENTS",
        "keyFeatures": [
          "Diesel generators & site power",
          "Mobile lighting towers",
          "Farm tractors & site cabins",
          "Emergency replacement guarantee"
        ],
        "startingDailyRateInr": 2000,
        "machineCount": 8,
        "popularMachines": [
          { "name": "Diesel Silent Generator 62.5 kVA", "slug": "diesel-generator-small" }
        ]
      }
    ],
    "promotions": [
      {
        "id": "promo-first1000",
        "code": "EQUIP1000",
        "title": "Flat ₹1,000 Off on First Rental",
        "description": "Get ₹1,000 off on your first machinery hire across all categories.",
        "discountType": "FLAT",
        "discountValue": 1000,
        "minOrderValueInr": 5000,
        "validUntil": "2026-12-31",
        "termsSummary": "Valid once per verified user on rental contracts >= ₹5,000.",
        "badge": "NEW USER"
      }
    ],
    "trustMarkers": [
      {
        "id": "trust-verified-fleet",
        "icon": "shield-check",
        "title": "100% Certified Fleet",
        "description": "Every machine passes a mandatory 50-point mechanical & safety audit before dispatch."
      }
    ],
    "testimonials": [
      {
        "id": "test-1",
        "authorName": "Rajesh Varma",
        "roleOrCompany": "Managing Director, Varma Infra Projects",
        "city": "Bangalore",
        "rating": 5.0,
        "content": "We rented two 20T hydraulic excavators for our metro line project. Mobilization was on time, operators were professional, and machine uptime was 100%. Highly recommended!",
        "machineUsed": "20 Ton Hydraulic Excavator"
      }
    ],
    "trendingSearches": [
      "JCB 3DX Backhoe Loader",
      "20 Ton Excavator",
      "Concrete Mixer Half Bag",
      "Scaffolding Rental",
      "Diesel Generator 62.5 kVA"
    ]
  }
}
```

### Happy Path (200 OK — Authenticated Customer)
When an `Authorization: Bearer <valid_jwt>` header is provided:
```json
{
  "success": true,
  "data": {
    "greeting": "Welcome back, Vikram!",
    "user": {
      "id": "usr_71fa990a-52bc-4279-b14a",
      "firstName": "Vikram",
      "phone": "+919876543210",
      "referralCode": "VIKRAM99",
      "hasActiveBookings": false,
      "pendingReconsentsCount": 0
    },
    "heroBanners": [ "..." ]
  }
}
```

---

## 2. GET `/api/user/home/banners`

Fetches active hero promotional banners for mobile slider and web carousel.

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "banner-monsoon-prep",
      "title": "Monsoon Site Protection Sale",
      "subtitle": "Flat 15% off on dewatering pumps, compactors & diesel generators",
      "tag": "SEASONAL OFFER",
      "imageUrl": "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80",
      "ctaText": "Rent Light Tools",
      "actionType": "CATEGORY",
      "actionTarget": "light-construction-tools",
      "backgroundColor": "#1E3A8A",
      "displayOrder": 1,
      "isActive": true
    }
  ]
}
```

---

## 3. GET `/api/user/home/categories`

Returns curated top categories.

### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `limit` | `number` | No | `12` | Maximum categories to return (max `30`). |

---

## 4. GET `/api/user/home/featured`

Returns curated machines with starting rental rates and badges.

### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `segment` | `string` | No | - | Filter by `'LIGHT'`, `'HEAVY'`, or `'OTHER'`. |
| `limit` | `number` | No | `8` | Maximum machines to return (max `20`). |

### Errors
* **Invalid Segment (422 Unprocessable Entity):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "details": [
      {
        "path": "segment",
        "message": "Invalid enum value. Expected 'LIGHT' | 'HEAVY' | 'OTHER'"
      }
    ]
  }
}
```

---

## 5. GET `/api/user/home/segments`

Returns segment cards with starting daily rental price, machine count, and top 4 popular machines per segment.

---

## 6. GET `/api/user/home/promotions`

Returns active promotional coupons.

---

## 7. GET `/api/user/home/trust-markers` & `/api/user/home/testimonials`

- `/trust-markers`: Platform certifications, safety standards, transparent rate policy.
- `/testimonials`: Real contractor feedback with ratings and equipment hire details.

---

## 8. GET `/api/user/home/search-trends`

Returns trending search keywords for search bar quick suggestions.
