import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  readonly proceedToCheckoutButton: Locator;

  constructor(page: Page) {
    super(page);

    this.proceedToCheckoutButton = page
      .locator('[data-test="proceed-1"]')
      .or(page.getByRole('button', { name: /proceed to checkout|checkout/i }))
      .first();
  }

  async open(): Promise<void> {
    console.log('[CartPage] Opening cart / checkout page');
    await this.goto('/checkout');
    await this.waitUntilLoaded();
  }

  productRow(productName: string): Locator {
    return this.page
      .locator('tr, [data-test="cart-item"]')
      .filter({ hasText: productName })
      .first();
  }

  async expectProductInCart(productName: string): Promise<void> {
    console.log(`[CartPage] Asserting product is in cart: "${productName}"`);
    await expect(this.productRow(productName)).toBeVisible();
    console.log(`[CartPage] Product found in cart: "${productName}"`);
  }
}
