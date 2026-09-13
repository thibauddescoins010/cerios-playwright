import { test, expect } from '@playwright/test';
import { ApiClient } from '../../api/api-client';

test.describe('Catalog API', () => {
  test('brands endpoint returns data', async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.getBrands();

    expect(response.status()).toBe(200);
    expect(await response.json()).toBeTruthy();
  });

  test('categories endpoint returns data', async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.getCategories();

    expect(response.status()).toBe(200);
    expect(await response.json()).toBeTruthy();
  });

  test('product search returns pliers-related data', async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.searchProducts('pliers');

    expect(response.status()).toBe(200);

    const body: unknown = await response.json();
    expect(JSON.stringify(body).toLowerCase()).toContain('pliers');
  });
});

