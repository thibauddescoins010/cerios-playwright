# Checkout Integration Test – Simple Explanation

## What this test checks

This test verifies one full guest checkout flow from start to finish, with both UI and API validation.

Flow covered:
1. Open products and add them to cart in the UI.
2. Verify cart API responses are correct.
3. Open cart page and compare UI values with API values.
4. Fill guest + billing details and validate postcode lookup API.
5. Select payment and validate payment-check API.
6. Finish order and validate invoice API + invoice number shown in UI.

So this is not only “button clicks”. It checks that the backend data matches what the user sees.

---

## Test breakdown (action → method → why)

### Step 1: Load catalog and prepare selected products

- **Action:** Get product data from API and match test products.
- **Methods:** `page.request.get(...)`, `expect(...)`.
- **Why:** We need real product IDs and prices from backend to validate later API calls and UI totals.

### Step 2: Add products in UI and validate add-to-cart API

- **Action:** Open each product page and add quantity to cart.
- **Methods:** `HomePage.open()`, `HomePage.openProduct(name)`, `ProductPage.expectProductName(name)`, `ProductPage.addToCart(qty)`, `ProductPage.expectAddedToCart()`.
- **Why:** This reproduces real user behavior.

- **Action:** Capture create-cart and add-to-cart API responses.
- **Methods:** `page.waitForResponse(...)`, `json(...)`, `assertAddToCartResponse(...)`.
- **Why:** Confirms backend cart creation and cart updates are correct after each UI action.

### Step 3: Open cart and compare UI with API data

- **Action:** Open cart page and fetch `GET /carts/{cartId}`.
- **Methods:** `responseFor(page, 'GET', ...)`, `assertCartResponse(...)`.
- **Why:** Validates cart contract (items, quantities, prices) in one reusable helper.

- **Action:** Compare each cart row and total in UI.
- **Methods:** `CartPage.expectProductInCart(...)`, `CartPage.expectRowQuantity(...)`, `CartPage.expectRowLinePrice(...)`, `CartPage.expectCartTotal(...)`, `cents(...)`.
- **Why:** Ensures user-visible values match backend values exactly.

### Step 4: Fill checkout details and validate postcode lookup

- **Action:** Fill guest details and billing address.
- **Methods:** `CartPage.proceedToCheckout()`, `CheckoutPage.fillGuestDetails(...)`, `CheckoutPage.fillBillingAddress(...)`.
- **Why:** Moves flow to checkout with realistic guest data.

- **Action:** Validate postcode lookup API response and auto-filled fields.
- **Methods:** `page.waitForResponse(...)`, `assertPostcodeLookupResponse(...)`, `expect(checkoutPage.streetInput)...`, `expect(checkoutPage.cityInput)...`.
- **Why:** Confirms lookup service returns valid data and UI applies it.

- **Action:** Re-apply state until checkout is actionable.
- **Methods:** `CheckoutPage.overrideState(...)`, `checkoutPage.proceedToPaymentButton.isEnabled()`.
- **Why:** Lookup can overwrite state asynchronously; this prevents flaky timing failures.

### Step 5: Validate payment check

- **Action:** Select payment method and click finish first time.
- **Methods:** `PaymentPage.selectPaymentMethod(...)`, `PaymentPage.clickFinish()`, `responseFor(page, 'POST', '/payment/check')`, `assertPaymentCheckResponse(...)`.
- **Why:** Verifies payment request payload and success response before order creation.

### Step 6: Validate invoice creation and confirmation UI

- **Action:** Click finish second time and validate invoice API.
- **Methods:** `CheckoutPage.readBillingValues()`, `responseFor(page, 'POST', '/invoices/guest')`, `assertInvoiceResponse(...)`.
- **Why:** Confirms final order payload and invoice values (`subtotal`, `total`, invoice format).

- **Action:** Validate final confirmation shown to user.
- **Methods:** `PaymentPage.expectOrderConfirmation(...)`.
- **Why:** Ensures UI displays the same invoice reference returned by backend.

---

## Which methods are used, and why

## Network helper methods

- `responseFor(page, method, path)`
  - Waits for a specific API call.
  - Why: avoids race conditions and makes the test deterministic.

- `json(response, expectedStatus)`
  - Reads JSON and asserts expected HTTP status.
  - Why: keeps response parsing and status checking consistent.

- `cents(value)`
  - Converts money values to cents for exact comparisons.
  - Why: avoids floating-point rounding issues.

## Checkout API utility methods

(From `pages/utils/checkout-api.utils.ts`)

- `assertAddToCartResponse(response)`
  - Checks add-to-cart API result.
  - Why: reusable assertion, cleaner test steps.

- `assertCartResponse(response, cartId, selections)`
  - Verifies cart payload content (items, quantities, prices), returns computed total cents.
  - Why: centralizes cart API validation logic.

- `assertPostcodeLookupResponse(response)`
  - Parses and validates postcode lookup response.
  - Why: single place for postcode API contract.

- `assertPaymentCheckResponse(response, paymentMethod)`
  - Verifies payment-check request payload + success response message.
  - Why: protects payment contract and keeps test readable.

- `assertInvoiceResponse(response, expected)`
  - Verifies invoice request payload and invoice response fields.
  - Why: makes final order validation robust and reusable.

## Page object methods

- `HomePage.open()`, `HomePage.openProduct(name)`
  - Why: abstract navigation details.

- `ProductPage.expectProductName(name)`, `ProductPage.addToCart(qty)`, `ProductPage.expectAddedToCart()`
  - Why: encapsulate product-page UI actions/assertions.

- `CartPage.expectProductInCart(name)`, `CartPage.expectRowQuantity(name, qty)`, `CartPage.expectRowLinePrice(...)`, `CartPage.expectCartTotal(...)`, `CartPage.proceedToCheckout()`
  - Why: keep cart UI checks readable and reusable.

- `CheckoutPage.fillGuestDetails(...)`, `CheckoutPage.fillBillingAddress(...)`, `CheckoutPage.overrideState(...)`, `CheckoutPage.readBillingValues()`
  - Why: handle checkout form interactions in one place.

- `PaymentPage.selectPaymentMethod(...)`, `PaymentPage.clickFinish()`, `PaymentPage.expectPaymentSuccess(...)`, `PaymentPage.expectNoOrderConfirmationYet()`, `PaymentPage.expectOrderConfirmation(...)`
  - Why: isolate payment page behavior and final confirmation checks.

---

## Why this structure is good

- Readability: test reads like business flow.
- Reusability: repeated API assertions are in utilities.
- Stability: explicit response waits reduce flaky timing.
- Maintenance: if API contract changes, update helper once.

---

## File under test

- Main test: `tests/integration/checkout.ui-api.spec.ts`
- API helper: `pages/utils/checkout-api.utils.ts`

---

## How to run

Use the integration project:

- `npm run test:integration`
