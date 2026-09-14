import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { ProductPage } from '../../pages/product.page';
import { CartPage } from '../../pages/cart.page';
import { catalogData } from '../../fixtures/test-data';

test.describe('Shopping cart', () => {
  test('user can add an in-stock product to the cart', async ({ page }) => {
    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);

    await test.step('Find and open a product', async () => {
      await homePage.open();
      await homePage.searchFor(catalogData.searchTerm);
      await homePage.openProduct(catalogData.expectedProduct);
      await productPage.expectProductName(catalogData.expectedProduct);
    });

    await test.step('Add the product to the cart', async () => {
      await productPage.addToCart(1);
      await productPage.expectAddedToCart();
    });

    await test.step('Verify the cart contents', async () => {
      await cartPage.open();
      await cartPage.expectProductInCart(catalogData.expectedProduct);
      await expect(cartPage.proceedToCheckoutButton).toBeVisible();
    });
  });

  test('user cannot order an out-of-stock product (regression)', async ({ page }) => {
    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);

    await test.step('Open an out-of-stock product', async () => {
      await homePage.open();
      await homePage.searchFor(catalogData.outOfStockProduct);
      await homePage.openProduct(catalogData.outOfStockProduct);
      await productPage.expectProductName(catalogData.outOfStockProduct);
    });

    await test.step('Verify product cannot be ordered', async () => {
      const buttonText = (await productPage.addToCartButton.innerText()).trim();
      const isDisabled = await productPage.addToCartButton.isDisabled();
      const hasOutOfStockLabel = /out of stock/i.test(buttonText);
      const hasBlockedPurchaseState = isDisabled || hasOutOfStockLabel;

      expect(
        hasBlockedPurchaseState,
        `Expected blocked purchase for out-of-stock product "${catalogData.outOfStockProduct}", got disabled=${isDisabled}, buttonText="${buttonText}"`,
      ).toBeTruthy();
    });
  });
});
