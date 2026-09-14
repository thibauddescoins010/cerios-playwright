import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';
import { cents } from './utils/network';

export class CartPage extends BasePage {
  readonly proceedToCheckoutButton: Locator;
  readonly cartTotal: Locator;

  constructor(page: Page) {
    super(page);

    this.proceedToCheckoutButton = page
      .locator('[data-test="proceed-1"]')
      .or(page.getByRole('button', { name: /proceed to checkout|checkout/i }))
      .first();

    this.cartTotal = page.locator('[data-test="cart-total"]');
  }

  async open(): Promise<void> {
    console.log('[CartPage] Opening cart / checkout page');
    await this.goto('/checkout');
    await this.waitUntilLoaded();
  }

  productRow(productName: string): Locator {
    return this.page
      .locator('tr, [data-test="cart-item"]')
      .filter({
        has: this.page.locator('[data-test="product-title"]').filter({
          hasText: new RegExp(`^${productName}\\s*$`),
        }),
      })
      .first();
  }

  async expectProductInCart(productName: string): Promise<void> {
    console.log(`[CartPage] Asserting product is in cart: "${productName}"`);
    await expect(this.productRow(productName)).toBeVisible();
    console.log(`[CartPage] Product found in cart: "${productName}"`);
  }

  async expectRowQuantity(productName: string, quantity: number): Promise<void> {
    const row = this.productRow(productName);
    await expect(row.locator('[data-test="product-quantity"]')).toHaveValue(String(quantity));
  }

  async expectRowLinePrice(productName: string, unitPriceCents: number, quantity: number): Promise<void> {
    const row = this.productRow(productName);
    const expectedLineCents = unitPriceCents * quantity;
    await expect.poll(async () =>
      cents(await row.locator('[data-test="line-price"]').innerText()),
    ).toBe(expectedLineCents);
  }

  async expectCartTotal(totalCents: number): Promise<void> {
    await expect.poll(async () =>
      cents(await this.cartTotal.innerText()),
    ).toBe(totalCents);
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutButton.click();
  }
}
