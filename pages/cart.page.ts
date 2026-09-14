import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';
import { cents } from './utils/network';

export class CartPage extends BasePage {
  readonly proceedToCheckoutButton: Locator;
  readonly cartTotal: Locator;
  readonly cartItemRows: Locator;
  readonly productTitleSelector: string;
  readonly productQuantitySelector: string;
  readonly linePriceSelector: string;

  constructor(page: Page) {
    super(page);

    this.proceedToCheckoutButton = page
      .locator('[data-test="proceed-1"]')
      .or(page.getByRole('button', { name: /proceed to checkout|checkout/i }))
      .first();

    this.cartTotal = page.locator('[data-test="cart-total"]');
    this.cartItemRows = page.locator('tr, [data-test="cart-item"]');
    this.productTitleSelector = '[data-test="product-title"]';
    this.productQuantitySelector = '[data-test="product-quantity"]';
    this.linePriceSelector = '[data-test="line-price"]';
  }

  async open(): Promise<void> {
    console.log('[CartPage] Opening cart / checkout page');
    await this.goto('/checkout');
    await this.waitUntilLoaded();
  }

  productRow(productName: string): Locator {
    return this.cartItemRows
      .filter({ has: this.page.locator(this.productTitleSelector, { hasText: new RegExp(`^${this.escapeForRegex(productName)}\\s*$`) }) })
      .first();
  }

  productQuantityInput(productName: string): Locator {
    return this.productRow(productName).locator(this.productQuantitySelector);
  }

  productLinePrice(productName: string): Locator {
    return this.productRow(productName).locator(this.linePriceSelector);
  }

  async expectProductInCart(productName: string): Promise<void> {
    console.log(`[CartPage] Asserting product is in cart: "${productName}"`);
    await expect(this.productRow(productName)).toBeVisible();
    console.log(`[CartPage] Product found in cart: "${productName}"`);
  }

  async expectRowQuantity(productName: string, quantity: number): Promise<void> {
    await expect(this.productQuantityInput(productName)).toHaveValue(String(quantity));
  }

  async expectRowLinePrice(productName: string, unitPriceCents: number, quantity: number): Promise<void> {
    const expectedLineCents = unitPriceCents * quantity;
    await expect.poll(async () =>
      cents(await this.productLinePrice(productName).innerText()),
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

  private escapeForRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
