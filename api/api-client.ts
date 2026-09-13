import type {
  APIRequestContext,
  APIResponse,
} from '@playwright/test';

export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  getBrands(): Promise<APIResponse> {
    return this.request.get('/brands');
  }

  getCategories(): Promise<APIResponse> {
    return this.request.get('/categories');
  }

  searchProducts(query: string): Promise<APIResponse> {
    return this.request.get('/products/search', {
      params: { q: query },
    });
  }
}
