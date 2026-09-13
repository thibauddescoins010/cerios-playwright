import type { APIRequestContext, APIResponse } from '@playwright/test';

export class TvMazeClient {
  constructor(private readonly request: APIRequestContext) {}

  searchShows(query: string): Promise<APIResponse> {
    return this.request.get('/search/shows', { params: { q: query } });
  }

  getShow(id: number): Promise<APIResponse> {
    return this.request.get(`/shows/${id}`);
  }
}
