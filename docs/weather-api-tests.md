# Weather API Tests – Explained

## What are we testing?

We are testing the **OpenWeatherMap API** — a public web service that returns live weather data for any city in the world. You talk to it by sending an HTTP request (like a browser visiting a website), and it responds with a JSON message containing weather information.

Our goal is to verify that the API behaves correctly: that it returns the right data when we ask nicely, and that it properly refuses requests when something is wrong.

---

## How is the test suite structured?

The tests are split into **two groups**, mirroring how a real API can behave:

### 🔴 Error handling (4xx)
These tests intentionally send *bad* or *incomplete* requests to verify that the API returns the correct error. Think of it as checking that a locked door stays locked.

### 🟢 Happy flows (2xx)
These tests send *correct* requests and verify that the API returns the right data. Think of it as checking that a door opens properly when you have the right key.

---

## Authentication – what is an `appid`?

The OpenWeatherMap API requires an **API key** (called `appid`) to identify who is making the request. Without it, the API refuses to answer — just like a members-only club checking your card at the door.

We have three shared API keys available:
- `18dc2ccb7c55012cdf53af5b8e1fec9a`
- `969437dd660b6c2251c86d58ae2458c5`
- `1b86881d19e79087f3a0527e484e08d0`

---

## The tests, one by one

### Test 1 – No API key → expect a refusal (401)
> *"What happens if I forget my membership card?"*

We send a request for the weather in Utrecht **without** including an API key. We then verify two things:
1. The HTTP status code is **401** (Unauthorized) — the API is telling us "you're not allowed in".
2. The response body contains a `cod` field equal to `401` and a non-empty `message` explaining why.

This confirms the API correctly protects itself against unauthenticated access.

---

### Test 2 – Utrecht weather returns the correct city name
> *"Can I get the weather for Utrecht, and does the response make sense?"*

We send a valid request for Utrecht with a correct API key. We verify:
1. The status code is **200** (OK) — the request was successful.
2. The `name` field in the response equals `"Provincie Utrecht"` — confirming we got data for the right place.

---

### Test 3 – Amsterdam response contains all expected fields (custom test)
> *"Does the API give us a complete and usable weather report?"*

We request the weather for Amsterdam and check that the response includes all the fields a real application would need:

| Field | What it means |
|---|---|
| `id` | Unique city identifier (must be `2759794` for Amsterdam) |
| `sys.country` | Country code (must be `"NL"`) |
| `weather` | At least one weather condition entry |
| `main.temp` | Temperature in Kelvin (must be above 0) |
| `main.humidity` | Humidity percentage (0 or higher) |
| `wind.speed` | Wind speed in m/s (0 or higher) |

This ensures the API doesn't just respond successfully but actually returns *useful* data.

---

### Test 4 – Parameterised: correct city IDs for 4 Dutch cities
> *"Does the API return the right city for each of our four locations?"*

Each city in the OpenWeatherMap database has a unique numeric ID. We use a **parameterised test** — one piece of test code that runs four times, once per city — to verify that searching by name always returns the correct ID.

| City | Expected ID |
|---|---|
| Amsterdam | 2759794 |
| Rotterdam | 2747891 |
| Den Haag | 2747373 |
| Groningen | 2755249 |

**Why parameterised?** Instead of writing four near-identical tests, we define the data in a table and let the framework loop through it. This keeps the code DRY (Don't Repeat Yourself) and makes it trivial to add more cities later by simply adding a row to the table.

---

## How does the code talk to the API?

All HTTP requests go through a dedicated **`OpenWeatherClient`** class. This is a design choice — it means:
- Tests don't contain raw URLs or query parameters.
- If the API endpoint ever changes, we update it in one place only.
- Tests stay readable and focused on *what* is being verified, not *how* the request is built.

```
Test file  →  OpenWeatherClient  →  OpenWeatherMap API
                (sends the request)     (returns the data)
```

---

## Running the tests

```bash
npx playwright test tests/api/weather.api.spec.ts --project=openweather --reporter=list
```

All 7 tests should complete in under 2 seconds. ✅
