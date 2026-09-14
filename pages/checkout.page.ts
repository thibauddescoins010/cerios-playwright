import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CheckoutPage extends BasePage {
  // Step 2 – Sign in / Guest tab
  readonly guestTab: Locator;
  readonly guestEmailInput: Locator;
  readonly guestFirstNameInput: Locator;
  readonly guestLastNameInput: Locator;
  readonly guestSubmitButton: Locator;
  readonly proceedToAddressButton: Locator;

  // Step 3 – Billing address
  readonly countrySelect: Locator;
  readonly postalCodeInput: Locator;
  readonly houseNumberInput: Locator;
  readonly streetInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly proceedToPaymentButton: Locator;

  constructor(page: Page) {
    super(page);

    this.guestTab            = page.getByRole('tab', { name: /guest/i });
    this.guestEmailInput     = page.locator('[data-test="guest-email"]');
    this.guestFirstNameInput = page.locator('[data-test="guest-first-name"]');
    this.guestLastNameInput  = page.locator('[data-test="guest-last-name"]');
    this.guestSubmitButton   = page.locator('[data-test="guest-submit"]');
    this.proceedToAddressButton = page.locator('[data-test="proceed-2-guest"]');

    this.countrySelect        = page.locator('[data-test="country"]');
    this.postalCodeInput      = page.locator('[data-test="postal_code"]');
    this.houseNumberInput     = page.locator('[data-test="house_number"]');
    this.streetInput          = page.locator('[data-test="street"]');
    this.cityInput            = page.locator('[data-test="city"]');
    this.stateInput           = page.locator('[data-test="state"]');
    this.proceedToPaymentButton = page.locator('[data-test="proceed-3"]');
  }

  async fillGuestDetails(email: string, firstName: string, lastName: string): Promise<void> {
    await this.guestTab.click();
    await this.guestEmailInput.fill(email);
    await this.guestFirstNameInput.fill(firstName);
    await this.guestLastNameInput.fill(lastName);
    await this.guestSubmitButton.click();
    await this.proceedToAddressButton.click();
  }

  async fillBillingAddress(
    country: string,
    postalCode: string,
    houseNumber: string,
  ): Promise<void> {
    await this.countrySelect.selectOption(country);
    await this.postalCodeInput.fill(postalCode);
    await this.houseNumberInput.fill(houseNumber);
    await this.houseNumberInput.blur();
  }

  async overrideState(state: string): Promise<void> {
    await this.stateInput.fill(state);
  }

  async readBillingValues(): Promise<{
    billing_street: string;
    billing_city: string;
    billing_state: string;
    billing_country: string;
    billing_postal_code: string;
  }> {
    return {
      billing_street:      await this.streetInput.inputValue(),
      billing_city:        await this.cityInput.inputValue(),
      billing_state:       await this.stateInput.inputValue(),
      billing_country:     await this.countrySelect.inputValue(),
      billing_postal_code: await this.postalCodeInput.inputValue(),
    };
  }

  async expectAddressPopulated(street: string, city: string): Promise<void> {
    await expect(this.streetInput).toHaveValue(street);
    await expect(this.cityInput).toHaveValue(city);
  }
}
