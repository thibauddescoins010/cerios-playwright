# Catalog API Tests – Explained

## What are we testing?

We are testing the **Toolshop Catalog API**.

The goal is simple:
- verify that core catalog endpoints respond correctly,
- and verify that product search returns relevant data.

This suite checks three endpoints:
1. `GET /brands`
2. `GET /categories`
3. `GET /products/search?q=...`

---

## How is the suite structured?

The suite contains 3 tests:
- **Brands endpoint returns data**
- **Categories endpoint returns data**
- **Product search returns pliers-related data**

Each test follows the same pattern:
1. Create `ApiClient`
2. Call one API method
3. Assert status code
4. Assert response content

This keeps tests consistent and easy to read.

---

## Methods we use (and why)

## In `api/api-client.ts`

- `getBrands()`
  - Sends `GET /brands`
  - Why: central place for brand endpoint call.

- `getCategories()`
  - Sends `GET /categories`
  - Why: central place for category endpoint call.

- `searchProducts(query)`
  - Sends `GET /products/search` with query param `q`
  - Why: reusable way to search products without hardcoding URLs in tests.

## In `tests/api/catalog.api.spec.ts`

- `expect(response.status()).toBe(200)`
  - Why: confirms endpoint is available and request is successful.

- `expect(await response.json()).toBeTruthy()`
  - Why: confirms response contains data (not empty/null).

- `expect(JSON.stringify(body).toLowerCase()).toContain('pliers')`
  - Why: confirms search result is relevant to the requested keyword.

---

## Test breakdown (action → method → why)

### Test 1: Brands endpoint returns data

- **Action:** Request list of brands.
- **Method:** `api.getBrands()`
- **Why:** Brands are a core catalog dataset and should always be available.

- **Action:** Validate successful response and data presence.
- **Method:** `status()`, `json()`, `expect(...)`
- **Why:** Confirms endpoint health + usable payload.

### Test 2: Categories endpoint returns data

- **Action:** Request list of categories.
- **Method:** `api.getCategories()`
- **Why:** Categories are used for filtering/navigation in UI and must be available.

- **Action:** Validate successful response and data presence.
- **Method:** `status()`, `json()`, `expect(...)`
- **Why:** Confirms endpoint health + usable payload.

### Test 3: Product search returns pliers-related data

- **Action:** Search products with query `pliers`.
- **Method:** `api.searchProducts('pliers')`
- **Why:** Verifies search endpoint behavior with a realistic keyword.

- **Action:** Validate success and relevance.
- **Method:** `status()`, `json()`, `JSON.stringify(...).toLowerCase()`, `toContain('pliers')`
- **Why:** Confirms request succeeds and returned content is related to the search term.

---

## Why use an `ApiClient` class?

Using `ApiClient` gives:
- **Readability:** tests focus on behavior, not URL construction.
- **Reusability:** endpoint calls can be shared across multiple test files.
- **Maintainability:** if endpoint paths change, update one file only.

Flow:

`catalog.api.spec.ts` → `ApiClient` → Catalog API

---

## File references

- Test file: [tests/api/catalog.api.spec.ts](tests/api/catalog.api.spec.ts)
- Client file: [api/api-client.ts](api/api-client.ts)

---

## How to run

- `npm run test:api`
