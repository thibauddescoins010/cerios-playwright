import { test, expect } from '@playwright/test';
import { OpenWeatherClient, APPID } from '../../api/openweather-client';

// ------------------------------------------------------------
// 1.1 – Error handling: no APPID → 401
// ------------------------------------------------------------
test.describe('OpenWeather API – Error handling (4xx)', () => {
  test('request without appid returns 401', async ({ request }) => {
    const client = new OpenWeatherClient(request);
    const response = await client.getCurrentWeather('Utrecht');

    expect(response.status()).toBe(401);

    const body = await response.json() as { cod: number; message: string };
    expect(body.cod).toBe(401);
    expect(body.message).toBeTruthy();
  });
});

// ------------------------------------------------------------
// 1.2 – Happy flow: Utrecht → 200 + name
// 1.3 – Custom test: full response structure for Amsterdam
// 1.4 – Parameterised: 4 cities × correct IDs
// ------------------------------------------------------------
test.describe('OpenWeather API – Happy flows (2xx)', () => {
  test('weather for Utrecht returns 200 and name "Provincie Utrecht"', async ({ request }) => {
    const client = new OpenWeatherClient(request);
    const response = await client.getCurrentWeather('Utrecht', APPID);

    expect(response.status()).toBe(200);

    const body = await response.json() as { name: string };
    expect(body.name).toBe('Provincie Utrecht');
  });

  test('weather response for Amsterdam contains all expected fields', async ({ request }) => {
    const client = new OpenWeatherClient(request);
    const response = await client.getCurrentWeather('Amsterdam', APPID);

    expect(response.status()).toBe(200);

    const body = await response.json() as {
      id: number;
      name: string;
      weather: { main: string; description: string }[];
      main: { temp: number; feels_like: number; humidity: number };
      wind: { speed: number };
      sys: { country: string };
    };

    expect(body.id).toBe(2759794);
    expect(body.sys.country).toBe('NL');
    expect(body.weather.length).toBeGreaterThan(0);
    expect(body.main.temp).toBeGreaterThan(0);
    expect(body.main.humidity).toBeGreaterThanOrEqual(0);
    expect(body.wind.speed).toBeGreaterThanOrEqual(0);
  });

  const cities: { name: string; id: number }[] = [
    { name: 'Amsterdam', id: 2759794 },
    { name: 'Rotterdam', id: 2747891 },
    { name: 'Den Haag',  id: 2747373 },
    { name: 'Groningen', id: 2755249 },
  ];

  for (const { name, id } of cities) {
    test(`weather for ${name} returns correct city id ${id}`, async ({ request }) => {
      const client = new OpenWeatherClient(request);
      const response = await client.getCurrentWeather(name, APPID);

      expect(response.status()).toBe(200);

      const body = await response.json() as { id: number };
      expect(body.id).toBe(id);
    });
  }
});

