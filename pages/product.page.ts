import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductPage extends BasePage {
  readonly productName: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.productName = page
      .locator('[data-test="product-name"], h1')
      .first();

    this.quantityInput = page
      .locator('[data-test="quantity"], #quantity-input, input[type="number"]')
      .first();

    this.addToCartButton = page
      .locator('[data-test="add-to-cart"]')
      .or(page.getByRole('button', { name: /add to cart/i }))
      .first();

    this.successMessage = page.getByText(
      /product added to shopping cart|added to cart/i,
    );
  }

  async setQuantity(quantity: number): Promise<void> {
    console.log(`[ProductPage] Setting quantity to: ${quantity}`);
    await this.quantityInput.fill(String(quantity));
  }

  async addToCart(quantity = 1): Promise<void> {
    console.log(`[ProductPage] Adding ${quantity} item(s) to cart`);
    await this.setQuantity(quantity);
    await this.addToCartButton.click();
    console.log('[ProductPage] Add to cart button clicked');
  }

  async expectProductName(name: string): Promise<void> {
    console.log(`[ProductPage] Asserting product name contains: "${name}"`);
    await expect(this.productName).toContainText(name);
    console.log(`[ProductPage] Product name verified: "${name}"`);
  }

  async expectAddedToCart(): Promise<void> {
    console.log('[ProductPage] Asserting success message is visible');
    await expect(this.successMessage).toBeVisible();
    console.log('[ProductPage] Product successfully added to cart');
  }
}
