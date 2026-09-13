import type { Locator, Page } from '@playwright/test';

export class HeaderComponent {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly signInLink: Locator;
  readonly cartLink: Locator;

  constructor(private readonly page: Page) {
    this.searchInput = page
      .locator('[data-test="search-query"], input[type="search"]')
      .first();

    this.searchButton = page
      .locator('[data-test="search-submit"], button[type="submit"]')
      .first();

    this.signInLink = page.getByRole('link', {
      name: /sign in|login|se connecter|inloggen/i,
    });

    this.cartLink = page.getByRole('link', { name: /cart/i });
  }

  async searchFor(term: string): Promise<void> {
    console.log(`[Header] Searching for: "${term}"`);
    await this.searchInput.fill(term);
    await this.searchButton.click();
    console.log('[Header] Search submitted');
  }
}
