import { test } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { catalogData } from '../../fixtures/test-data';

test.describe('Catalog', () => {
  test('user can search for a product', async ({ page }) => {
    const homePage = new HomePage(page);

    await test.step('Open the product catalog', async () => {
      await homePage.open();
    });

    await test.step('Search for a product', async () => {
      await homePage.searchFor(catalogData.searchTerm);
    });

    await test.step('Verify a relevant product is shown', async () => {
      await homePage.expectProductVisible(catalogData.expectedProduct);
    });
  });

  test('user can filter products by category', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.open();
    await homePage.filterByCategory(catalogData.category);
    await homePage.expectProductVisible(catalogData.categoryProduct);
  });
});
