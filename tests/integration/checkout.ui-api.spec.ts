import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { ProductPage } from '../../pages/product.page';
import { CartPage } from '../../pages/cart.page';
import { CheckoutPage } from '../../pages/checkout.page';
import { PaymentPage } from '../../pages/payment.page';
import { checkoutData } from '../../fixtures/test-data';
import { BASE_URLS } from '../../fixtures/base-urls';
import { responseFor, json, cents } from '../../pages/utils/network';
import {
  Product,
  assertAddToCartResponse,
  assertCartResponse,
  assertInvoiceResponse,
  assertPaymentCheckResponse,
  assertPostcodeLookupResponse,
} from '../../pages/utils/checkout-api.utils';

test.describe('Checkout integration (UI + API)', () => {
  test('customer adds products and places order with API validations', async ({ page }) => {
    test.setTimeout(90_000);

    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const paymentPage = new PaymentPage(page);

    const catalogResponse = await page.request.get(`${BASE_URLS.toolshopApi}/products`);
    expect(catalogResponse.status()).toBe(200);
    const catalog = (await catalogResponse.json()) as { data: Product[] };

    const selections = checkoutData.products.map(({ name, quantity }) => {
      const product = catalog.data.find((p) => p.name === name);
      expect(product, `Product not found in catalog: ${name}`).toBeDefined();
      return { product: product!, quantity };
    });

    let cartId = '';

    await test.step('Add products and validate cart add APIs', async () => {
      for (const { product, quantity } of selections) {
        console.log(`[Integration] Add product UI action: ${product.name} (id=${product.id}, qty=${quantity})`);
        await homePage.open();
        await homePage.openProduct(product.name);
        await productPage.expectProductName(product.name);

        const createCartPromise = cartId
          ? undefined
          : page.waitForResponse((r) => {
              const url = new URL(r.url());
              return (
                url.origin === BASE_URLS.toolshopApi &&
                url.pathname === '/carts' &&
                r.request().method() === 'POST'
              );
            });

        const addToCartPromise = page.waitForResponse((r) => {
          const url = new URL(r.url());
          return (
            url.origin === BASE_URLS.toolshopApi &&
            /^\/carts\/[^/]+$/.test(url.pathname) &&
            r.request().method() === 'POST' &&
            r.request().postDataJSON()?.product_id === product.id &&
            r.request().postDataJSON()?.quantity === quantity
          );
        });

        await productPage.addToCart(quantity);
        await productPage.expectAddedToCart();

        if (createCartPromise) {
          const createCart = await json<{ id: string }>(await createCartPromise, 201);
          cartId = createCart.id;
          expect(cartId).toBeTruthy();
        }

        const addToCartResponse = await addToCartPromise;
        await assertAddToCartResponse(addToCartResponse);
        console.log(`[Integration] API add-to-cart response validated for ${product.name}`);
      }
    });

    let totalCents = 0;

    await test.step('Open cart and validate GET /carts response against UI', async () => {
      const cartPromise = responseFor(page, 'GET', `/carts/${cartId}`);
      await homePage.header.cartLink.click();
      const { cart, totalCents: apiTotalCents } = await assertCartResponse(await cartPromise, cartId, selections);
      console.log(`[Integration] API cart loaded: id=${cart.id}, items=${cart.cart_items.length}`);
      totalCents = apiTotalCents;

      for (const { product, quantity } of selections) {
        await cartPage.expectProductInCart(product.name);
        await cartPage.expectRowQuantity(product.name, quantity);
        await cartPage.expectRowLinePrice(product.name, cents(product.price), quantity);

        const uiQty = await cartPage.productRow(product.name).locator('[data-test="product-quantity"]').inputValue();
        const uiLine = await cartPage.productRow(product.name).locator('[data-test="line-price"]').innerText();
        console.log(
          `[Integration] UI vs API row ${product.name}: apiQty=${quantity}, uiQty=${uiQty}, apiUnit=${product.price}, uiLine=${uiLine}`,
        );
      }

      await cartPage.expectCartTotal(totalCents);
      const uiTotal = await cartPage.cartTotal.innerText();
      console.log(`[Integration] UI vs API total: apiTotalCents=${totalCents}, uiTotal=${uiTotal}`);
    });

    const guestEmail = checkoutData.guest.email();

    await test.step('Fill personal data and validate postcode lookup API', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.fillGuestDetails(
        guestEmail,
        checkoutData.guest.firstName,
        checkoutData.guest.lastName,
      );

      const { country, postalCode, houseNumber, stateOverride } = checkoutData.billing;

      const lookupPromise = page.waitForResponse((r) => {
        const url = new URL(r.url());
        return (
          url.origin === BASE_URLS.toolshopApi &&
          url.pathname === '/postcode-lookup' &&
          r.request().method() === 'GET' &&
          url.searchParams.get('country') === country &&
          url.searchParams.get('postcode') === postalCode &&
          url.searchParams.get('house_number') === houseNumber
        );
      });

      await checkoutPage.fillBillingAddress(country, postalCode, houseNumber);
      const lookupResponse = await lookupPromise;
      const lookupBody = await assertPostcodeLookupResponse(lookupResponse);
      console.log(`[Integration] API postcode lookup response: ${JSON.stringify(lookupBody)}`);

      // UI vs API: street/city should match postcode lookup response.
      if (lookupBody.street) {
        await expect(checkoutPage.streetInput).toHaveValue(lookupBody.street);
      }
      if (lookupBody.city) {
        await expect(checkoutPage.cityInput).toHaveValue(lookupBody.city);
      }
      if (!lookupBody.street) {
        await expect(checkoutPage.streetInput).not.toHaveValue('');
      }
      if (!lookupBody.city) {
        await expect(checkoutPage.cityInput).not.toHaveValue('');
      }

      // Postcode lookup can fire asynchronously and overwrite the state field.
      // Re-apply state until the form is actually actionable (Proceed button enabled).
      let proceedEnabled = false;
      for (let attempt = 0; attempt < 8; attempt++) {
        await checkoutPage.overrideState(stateOverride);
        await checkoutPage.stateInput.blur();
        await page.waitForTimeout(250);

        proceedEnabled = await checkoutPage.proceedToPaymentButton.isEnabled();
        const currentState = await checkoutPage.stateInput.inputValue();
        console.log(
          `[Integration] State attempt ${attempt + 1}: state="${currentState}", proceedEnabled=${proceedEnabled}`,
        );

        if (proceedEnabled) {
          break;
        }
      }

      expect(proceedEnabled, 'Proceed to payment button never became enabled after setting state.').toBe(true);
      console.log('[Integration] UI billing form ready for payment step');
      await checkoutPage.proceedToPaymentButton.click();
    });

    await test.step('Validate payment API after first confirm', async () => {
      await paymentPage.selectPaymentMethod(checkoutData.paymentMethod);

      const paymentPromise = responseFor(page, 'POST', '/payment/check');
      await paymentPage.clickFinish();

      const paymentBody = await assertPaymentCheckResponse(await paymentPromise, checkoutData.paymentMethod);
      console.log(`[Integration] API payment response: ${JSON.stringify(paymentBody)}`);

      await paymentPage.expectPaymentSuccess('Payment was successful');
      await paymentPage.expectNoOrderConfirmationYet();
      const uiPaymentMessage = await paymentPage.paymentSuccessMessage.innerText();
      console.log(`[Integration] UI vs API payment message: api="${paymentBody.message}", ui="${uiPaymentMessage}"`);
    });

    await test.step('Validate invoice API after second confirm and verify UI order confirmation', async () => {
      const billing = await checkoutPage.readBillingValues();

      const invoicePromise = responseFor(page, 'POST', '/invoices/guest');
      await paymentPage.clickFinish();
      const invoice = await assertInvoiceResponse(await invoicePromise, {
        billing,
        cartId,
        guestEmail,
        guestFirstName: checkoutData.guest.firstName,
        guestLastName: checkoutData.guest.lastName,
        paymentMethod: checkoutData.paymentMethod,
        totalCents,
      });
      console.log(`[Integration] API invoice response: ${JSON.stringify(invoice)}`);

      await paymentPage.expectOrderConfirmation(invoice.invoice_number);
      const uiConfirmation = await paymentPage.orderConfirmation.innerText();
      console.log(`[Integration] UI vs API invoice number: api=${invoice.invoice_number}, uiText="${uiConfirmation}"`);
    });
  });
});
