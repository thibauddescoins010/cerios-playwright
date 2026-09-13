import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from './components/header.component';

export class HomePage extends BasePage {
  readonly header: HeaderComponent;
  readonly sortSelect: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.sortSelect = page
      .locator('[data-test="sort"], select')
      .first();
  }

  async open(): Promise<void> {
    console.log('[HomePage] Opening home page');
    await this.goto('/');
    await this.waitUntilLoaded();
  }

  productByName(name: string): Locator {
    return this.page.getByText(name, { exact: false }).first();
  }

  categoryCheckbox(category: string): Locator {
    return this.page.getByLabel(new RegExp(category, 'i')).first();
  }

  async searchFor(term: string): Promise<void> {
    await this.header.searchFor(term);
  }

  async filterByCategory(category: string): Promise<void> {
    console.log(`[HomePage] Filtering by category: "${category}"`);
    await this.categoryCheckbox(category).check();
    console.log(`[HomePage] Category filter applied: "${category}"`);
  }

  async sortBy(label: string): Promise<void> {
    console.log(`[HomePage] Sorting by: "${label}"`);
    await this.sortSelect.selectOption({ label });
  }

  async openProduct(name: string): Promise<void> {
    console.log(`[HomePage] Opening product: "${name}"`);
    await this.productByName(name).click();
  }

  async expectProductVisible(name: string): Promise<void> {
    console.log(`[HomePage] Asserting product is visible: "${name}"`);
    await expect(this.productByName(name)).toBeVisible();
    console.log(`[HomePage] Product visible: "${name}"`);
  }
}
