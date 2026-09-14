import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class PaymentPage extends BasePage {
  readonly paymentMethodSelect: Locator;
  readonly finishButton: Locator;
  readonly paymentSuccessMessage: Locator;
  readonly orderConfirmation: Locator;

  constructor(page: Page) {
    super(page);

    this.paymentMethodSelect  = page.locator('[data-test="payment-method"]');
    this.finishButton         = page.locator('[data-test="finish"]');
    this.paymentSuccessMessage = page.locator('[data-test="payment-success-message"]');
    this.orderConfirmation    = page.locator('#order-confirmation');
  }

  async selectPaymentMethod(method: string): Promise<void> {
    await this.paymentMethodSelect.selectOption(method);
  }

  async clickFinish(): Promise<void> {
    await this.finishButton.click();
  }

  async expectPaymentSuccess(message: string): Promise<void> {
    await expect(this.paymentSuccessMessage).toHaveText(message);
  }

  async expectNoOrderConfirmationYet(): Promise<void> {
    await expect(this.orderConfirmation).toHaveCount(0);
  }

  async expectOrderConfirmation(invoiceNumber: string): Promise<void> {
    await expect(this.orderConfirmation).toContainText(invoiceNumber);
  }

  async expectOrderConfirmationNumber(): Promise<void> {
    await expect(this.orderConfirmation).toContainText(/INV-\d+/);
  }
}
