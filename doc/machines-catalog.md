# Machine & Category Rental Catalog API Documentation

This module provides public endpoints for browsing categories, searching equipment, filtering by rental rates, segments, fuel policies, and brands, as well as accessing machine specifications.

---

## 1. Endpoints Overview

| Method | Endpoint | Aliases | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/categories` | `/api/categories` | List active equipment categories with machine counts |
| `GET` | `/api/v1/categories/:idOrSlug` | `/api/categories/:idOrSlug` | Get category details with nested machines |
| `GET` | `/api/v1/machines` | `/api/machines` | Search and filter rental machines (paginated) |
| `GET` | `/api/v1/machines/:idOrSlug` | `/api/machines/:idOrSlug` | Get detailed machine specifications & rental info |
| `GET` | `/api/v1/machines/segments` | `/api/machines/segments` | Get overview and starting rates for LIGHT, HEAVY & OTHER |
| `GET` | `/api/v1/machines/featured` | `/api/machines/featured` | Get curated/iconic machines across segments |
| `GET` | `/api/v1/machines/search/suggestions` | `/api/machines/search/suggestions` | Fast autocomplete suggestions for search bars |

---

## 2. Segments & Rental Policies

* **Segments (`LIGHT`, `HEAVY`, `OTHER`)**:
  * **LIGHT**: Small home tools & site mixers (e.g. concrete mixer, needle vibrator, breaker, scaffolding, mini tipper). Doorstep delivery, usually operator not needed.
  * **HEAVY**: Heavy earthmoving, lifting & infrastructure equipment (e.g. JCB 3DX, 20T excavator, crawler crane, transit mixer, road roller). Booked with operator + mobilisation.
  * **OTHER**: Site support, power backup, farm, utilities and event units (e.g. portable cabins, site toilets, generators, lighting towers, farm tractors).

* **Fuel Policies**:
  * `WET`: Fuel + operator included in rate.
  * `DRY`: Customer supplies fuel on site.
  * `ELECTRIC`: Electric powered (3-phase/single-phase).
  * `NA`: Not applicable.

---

## 3. Endpoints Details

### 3.1 List Categories

* **URL**: `GET /api/v1/categories` (or `GET /api/categories`)
* **Query Parameters**:
  * `search` *(string, optional)*: Filter categories by name or description.
* **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Light Construction Tools",
      "slug": "light-construction-tools",
      "description": "Small, easy-to-use machines for house construction...",
      "iconUrl": "https://cdn.example.com/icons/light-tools.svg",
      "imageUrl": "https://cdn.example.com/machines/cat-light-tools.jpg",
      "bannerUrl": null,
      "mobileImageUrl": null,
      "webImageUrl": null,
      "displayOrder": 1,
      "machinesCount": 12,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 3.2 Get Category by ID or Slug

* **URL**: `GET /api/v1/categories/:idOrSlug` (or `GET /api/categories/:idOrSlug`)
* **Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Earthmoving Equipment",
    "slug": "earthmoving-equipment",
    "description": "JCBs, excavators, loaders...",
    "iconUrl": "https://cdn.example.com/icons/earthmoving.svg",
    "imageUrl": "https://cdn.example.com/machines/cat-earthmoving.jpg",
    "displayOrder": 2,
    "machinesCount": 10,
    "machines": [
      {
        "id": "uuid",
        "name": "JCB 3DX Backhoe Loader",
        "slug": "jcb-3dx-backhoe-loader",
        "segment": "HEAVY",
        "rental": {
          "hourlyInr": 1000,
          "dailyInr": 7500,
          "monthlyInr": 165000,
          "minBooking": "4 hours",
          "operatorIncluded": true,
          "fuelPolicy": "DRY",
          "deliveryAvailable": true
        }
      }
    ]
  }
}
```

---

### 3.3 List & Filter Machines

* **URL**: `GET /api/v1/machines` (or `GET /api/machines`)
* **Query Parameters**:
  * `search` *(string)*: Full-text search across machine name, slug, description, category name, aliases, use cases, and brands.
  * `category` *(string)*: Category UUID or slug (e.g. `earthmoving-equipment`).
  * `segment` *(string)*: `LIGHT`, `HEAVY`, or `OTHER`.
  * `fuelPolicy` *(string)*: `WET`, `DRY`, `ELECTRIC`, or `NA`.
  * `operatorIncluded` *(boolean)*: `true` or `false`.
  * `deliveryAvailable` *(boolean)*: `true` or `false`.
  * `minDailyRate` / `maxDailyRate` *(number)*: Filter by daily rental price in INR.
  * `minHourlyRate` / `maxHourlyRate` *(number)*: Filter by hourly rental price in INR.
  * `brand` *(string)*: Filter by popular brand (e.g. `JCB`, `Tata`, `Bosch`).
  * `useCase` *(string)*: Filter by common application (e.g. `Foundation digging`).
  * `page` *(number, default: 1)*: Page number.
  * `limit` *(number, default: 20, max: 100)*: Items per page.
  * `sortBy` *(string)*: `displayOrder` (default), `nameAsc`, `nameDesc`, `dailyRateAsc`, `dailyRateDesc`, `hourlyRateAsc`, `hourlyRateDesc`.

* **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "categoryId": "uuid",
      "name": "JCB 3DX Backhoe Loader",
      "slug": "jcb-3dx-backhoe-loader",
      "description": "India's most booked machine...",
      "imageUrl": "https://cdn.example.com/machines/jcb-3dx-backhoe-loader.jpg",
      "displayOrder": 1,
      "segment": "HEAVY",
      "aliases": ["JCB", "JCB 3DX", "backhoe", "khudai machine"],
      "useCases": ["Foundation digging", "Levelling plot", "Loading mud/sand"],
      "popularBrands": ["JCB", "Case", "Mahindra EarthMaster"],
      "rental": {
        "hourlyInr": 1000,
        "dailyInr": 7500,
        "monthlyInr": 165000,
        "minBooking": "4 hours",
        "operatorIncluded": true,
        "fuelPolicy": "DRY",
        "securityDepositInr": 0,
        "deliveryAvailable": true,
        "mobilisationNote": "Fuel by customer (~6-8 L/hr)..."
      },
      "specs": {
        "operatingWeightKg": 7500,
        "enginePowerHp": 76,
        "maxDiggingDepthM": 4.5
      },
      "category": {
        "id": "uuid",
        "name": "Earthmoving Equipment",
        "slug": "earthmoving-equipment"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 3.4 Get Machine Details

* **URL**: `GET /api/v1/machines/:idOrSlug` (or `GET /api/machines/:idOrSlug`)
* Returns the full machine detail DTO including complete `specifications`.

---

### 3.5 Segments Breakdown

* **URL**: `GET /api/v1/machines/segments` (or `GET /api/machines/segments`)
* Returns counts, title, description, starting daily rate, and sample machines for `LIGHT`, `HEAVY`, and `OTHER`.

---

### 3.6 Search Autocomplete Suggestions

* **URL**: `GET /api/v1/machines/search/suggestions?q=jcb` (or `GET /api/machines/search/suggestions?q=jcb`)
* **Response**:
```json
{
  "success": true,
  "data": [
    {
      "type": "machine",
      "text": "JCB 3DX Backhoe Loader",
      "machineSlug": "jcb-3dx-backhoe-loader",
      "segment": "HEAVY"
    },
    {
      "type": "alias",
      "text": "JCB breaker",
      "machineSlug": "jcb-with-breaker",
      "segment": "HEAVY"
    },
    {
      "type": "brand",
      "text": "JCB"
    }
  ]
}
```
