import { test, expect } from '@playwright/test';
import { TvMazeClient } from '../../api/tvmaze-client';

test.describe('TVMaze API', () => {
  test('show url for Breaking Bad contains the show id', async ({ request }) => {
    const client = new TvMazeClient(request);

    // Step 1: search for "breaking bad"
    const searchResponse = await client.searchShows('breaking bad');
    expect(searchResponse.status()).toBe(200);

    // Step 2: grab the first show id from the results
    const results = await searchResponse.json() as { show: { id: number } }[];
    const showId = results[0].show.id;

    // Step 3: fetch the show details using the id
    const showResponse = await client.getShow(showId);
    expect(showResponse.status()).toBe(200);

    // Step 4: assert that the url property contains the show id
    const show = await showResponse.json() as { url: string };
    expect(show.url).toContain(String(showId));
  });
});
