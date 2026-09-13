import type { Page } from '@playwright/test';

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  async goto(path = '/'): Promise<void> {
    console.log(`[Navigation] Navigating to: ${path}`);
    await this.page.goto(path);
  }

  async waitUntilLoaded(): Promise<void> {
    console.log('[Navigation] Waiting for DOM content to load...');
    await this.page.waitForLoadState('domcontentloaded');
    console.log(`[Navigation] Page loaded: ${this.page.url()}`);
  }
}
