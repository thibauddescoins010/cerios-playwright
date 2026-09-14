import type { Page, Response } from '@playwright/test';
import { BASE_URLS } from '../../fixtures/base-urls';

/**
 * Register BEFORE the action that triggers the request.
 * Matches by HTTP method and exact pathname against the API origin.
 */
export function responseFor(page: Page, method: string, path: string) {
  return page.waitForResponse(response => {
    const url = new URL(response.url());
    return (
      url.origin === BASE_URLS.toolshopApi &&
      url.pathname === path &&
      response.request().method() === method
    );
  });
}

/**
 * Asserts the expected HTTP status, then parses and returns the JSON body.
 * Fails immediately with the raw body when the status doesn't match.
 */
export async function json<T>(response: Response, expectedStatus: number): Promise<T> {
  const body = await response.text();
  const label = `${response.request().method()} ${response.url()}\n${body}`;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { expect } = require('@playwright/test') as typeof import('@playwright/test');
  expect(response.status(), label).toBe(expectedStatus);
  return JSON.parse(body) as T;
}

/**
 * Converts a price string or number to integer cents to avoid floating-point noise.
 * e.g. "$14.15" → 1415
 */
export function cents(value: string | number): number {
  return Math.round(Number(String(value).replace(/[^0-9.-]/g, '')) * 100);
}
