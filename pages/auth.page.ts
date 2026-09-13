import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export interface RegistrationData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  street: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  password: string;
}

export class AuthPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly dateOfBirthInput: Locator;
  readonly streetInput: Locator;
  readonly postalCodeInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly countrySelect: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly registerButton: Locator;

  constructor(page: Page) {
    super(page);

    this.firstNameInput = page.locator('[data-test="first-name"]');
    this.lastNameInput = page.locator('[data-test="last-name"]');
    this.dateOfBirthInput = page.locator('[data-test="dob"]');
    this.streetInput = page.locator('[data-test="street"]');
    this.postalCodeInput = page.locator('[data-test="postal_code"]');
    this.cityInput = page.locator('[data-test="city"]');
    this.stateInput = page.locator('[data-test="state"]');
    this.countrySelect = page.locator('[data-test="country"]');
    this.phoneInput = page.locator('[data-test="phone"]');
    this.emailInput = page.locator('[data-test="email"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.registerButton = page.locator('[data-test="register-submit"]');
  }

  async openRegistration(): Promise<void> {
    console.log('[AuthPage] Opening registration page');
    await this.goto('/auth/register');
    await this.waitUntilLoaded();
  }

  async register(data: RegistrationData): Promise<void> {
    console.log(`[AuthPage] Filling registration form for: ${data.firstName} ${data.lastName} (${data.email})`);
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.dateOfBirthInput.fill(data.dateOfBirth);
    await this.streetInput.fill(data.street);
    await this.postalCodeInput.fill(data.postalCode);
    await this.cityInput.fill(data.city);
    await this.stateInput.fill(data.state);
    await this.countrySelect.selectOption({ label: data.country });
    await this.phoneInput.fill(data.phone);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    console.log('[AuthPage] Submitting registration form');
    await this.registerButton.click();
  }

  async expectRegistrationCompleted(): Promise<void> {
    console.log('[AuthPage] Asserting redirect to login page after registration');
    await expect(this.page).toHaveURL(/\/auth\/login/);
    console.log('[AuthPage] Registration completed — redirected to login');
  }
}
