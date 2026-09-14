import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { ProductPage } from '../../pages/product.page';
import { CartPage } from '../../pages/cart.page';
import { CheckoutPage } from '../../pages/checkout.page';
import { PaymentPage } from '../../pages/payment.page';
import { checkoutData } from '../../fixtures/test-data';

test.describe('Guest checkout', () => {
  test('guest can complete checkout', async ({ page }) => {
    test.setTimeout(30000);

    const homePage     = new HomePage(page);
    const productPage  = new ProductPage(page);
    const cartPage     = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const paymentPage  = new PaymentPage(page);

    await test.step('Add products to cart', async () => {
      for (const { name, quantity } of checkoutData.products) {
        console.log(`[Checkout] Adding product: ${name} (qty: ${quantity})`);
        await homePage.open();
        await homePage.openProduct(name);
        await productPage.expectProductName(name);
        await productPage.addToCart(quantity);
        await productPage.expectAddedToCart();
      }
    });

    await test.step('Verify cart contents', async () => {
      await homePage.header.cartLink.click();
      for (const { name, quantity } of checkoutData.products) {
        console.log(`[Checkout] Verifying cart row: ${name} (qty: ${quantity})`);
        await cartPage.expectProductInCart(name);
        await cartPage.expectRowQuantity(name, quantity);
      }
    });

    await test.step('Fill guest details', async () => {
      await cartPage.proceedToCheckout();
      const guestEmail = checkoutData.guest.email();
      console.log(`[Checkout] Guest email: ${guestEmail}`);
      await checkoutPage.fillGuestDetails(guestEmail, checkoutData.guest.firstName, checkoutData.guest.lastName);
    });

    await test.step('Fill billing address', async () => {
      const { country, postalCode, houseNumber, stateOverride } = checkoutData.billing;
      console.log(`[Checkout] Billing lookup: ${country} ${postalCode} ${houseNumber}`);
      await checkoutPage.fillBillingAddress(country, postalCode, houseNumber);
      await expect(checkoutPage.streetInput).not.toHaveValue('');
      await expect(checkoutPage.cityInput).not.toHaveValue('');

      // Lookup may return empty state; override explicitly.
      await checkoutPage.overrideState(stateOverride);
      await checkoutPage.proceedToPaymentButton.click();
    });

    await test.step('Confirm payment', async () => {
      console.log(`[Checkout] Payment method: ${checkoutData.paymentMethod}`);
      await paymentPage.selectPaymentMethod(checkoutData.paymentMethod);
      await paymentPage.clickFinish();
      await paymentPage.expectPaymentSuccess('Payment was successful');
      await paymentPage.expectNoOrderConfirmationYet();
    });

    await test.step('Create order and verify confirmation', async () => {
      await paymentPage.clickFinish();
      await paymentPage.expectOrderConfirmationNumber();
      console.log('[Checkout] Order confirmation received with invoice number');
    });
  });
});
