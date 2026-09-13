# TVMaze API Tests – Explained

## What are we testing?

We are testing the **TVMaze API** — a free, public web service that provides information about TV shows: cast, episodes, schedules, and more. Just like the weather API, you interact with it by sending HTTP requests and receiving JSON responses.

Our goal is to verify that we can **search for a show by name**, **retrieve its details using its unique ID**, and **assert that the response contains correct data**.

---

## How is the test suite structured?

This suite contains a single test covering **assignment 1.5**, which chains two API calls together — the output of the first request feeds directly into the second. This is a common real-world pattern called a **dependent request flow**.

There is no authentication required for the TVMaze API — it is fully public.

---

## The test, step by step

### Test – Show URL for Breaking Bad contains the show ID

> *"Can I find Breaking Bad, look it up by its ID, and confirm the response points to the right page?"*

This test performs **four sequential steps** inside a single scenario:

---

#### Step 1 – Search for "Breaking Bad"
We send a request to the search endpoint:
```
GET /search/shows?q=breaking+bad
```
We verify the response status is **200 (OK)**, meaning the search worked.

The API returns a list of matching shows, each wrapped with a relevance score. Example structure:
```json
[
  { "score": 0.9, "show": { "id": 169, "name": "Breaking Bad", ... } },
  { "score": 0.4, "show": { "id": 5678, "name": "Breaking Bad Fan Film", ... } },
  ...
]
```

---

#### Step 2 – Save the first show ID
We extract the `id` from the **first result** (`results[0].show.id`) and store it in a variable called `showId`.

For Breaking Bad, this value is `169`.

> Why the first result? TVMaze ranks results by relevance, so the closest match always comes first.

---

#### Step 3 – Fetch the full show details
Using `showId`, we make a second request to the show details endpoint:
```
GET /shows/169
```
We again verify the status is **200 (OK)**.

---

#### Step 4 – Assert the URL contains the show ID
The show detail response includes a `url` field — a link to the show's page on tvmaze.com:
```
https://www.tvmaze.com/shows/169/breaking-bad
```
We assert that this URL **contains the show ID** (`"169"`), confirming:
- We got data for the correct show
- The API's internal ID and the public URL are consistent

---

## Why chain two requests?

This pattern reflects how APIs are used in practice. You rarely know an exact ID upfront — you first **search** to discover it, then **use it** to fetch more details. Testing this flow end-to-end ensures both endpoints work correctly *together*, not just in isolation.

---

## How does the code talk to the API?

All requests go through a dedicated **`TvMazeClient`** class, keeping URLs out of the test file:

```
Test file  →  TvMazeClient  →  TVMaze API
               (sends requests)   (returns show data)
```

The client exposes two methods:
| Method | What it does |
|---|---|
| `searchShows(query)` | Searches shows by name |
| `getShow(id)` | Fetches full details for a show by its ID |

---

## Running the tests

```bash
npx playwright test tests/api/tvmaze.api.spec.ts --project=tvmaze --reporter=list
```

The test completes in well under 1 second. ✅
