import type { APIRequestContext, APIResponse } from '@playwright/test';

export const OPENWEATHER_APP_IDS = [
  '18dc2ccb7c55012cdf53af5b8e1fec9a',
  '969437dd660b6c2251c86d58ae2458c5',
  '1b86881d19e79087f3a0527e484e08d0',
] as const;

export const APPID = OPENWEATHER_APP_IDS[0];

export class OpenWeatherClient {
  constructor(private readonly request: APIRequestContext) {}

  getCurrentWeather(city: string, appid?: string): Promise<APIResponse> {
    const params: Record<string, string> = { q: city };
    if (appid) params['appid'] = appid;
    return this.request.get('/data/2.5/weather', { params });
  }

  getCurrentWeatherById(id: number, appid = APPID): Promise<APIResponse> {
    return this.request.get('/data/2.5/weather', {
      params: { id: String(id), appid },
    });
  }
}
