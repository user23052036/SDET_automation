# API Testing with Playwright (JavaScript)

Revision notes built from your `webAPI_1.spec.js` — logging in and placing an order through the **API**, then checking the order in the **browser**. Same style as the other notes: simple explanations, your own code, and a log of the errors you actually hit.

| File | Use it when... |
|---|---|
| [GUIDE.md](GUIDE.md) | Full explanation of UI topics (locators, actions, waiting ...) |
| **API_TESTING.md** (this file) | Anything about `request`, tokens, `beforeAll`, `addInitScript` |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Fast lookups and "X vs Y" comparisons (API rows included) |
| [MY_CODE_REVIEW.md](MY_CODE_REVIEW.md) | What was wrong in your code, and corrected tests |

**How these notes were checked:** the behaviour marked *(tested)* was reproduced with Playwright v1.56.0 against a small local server (October 2026). Your own runs used Playwright v1.63.0 — nothing used here changed between those versions as far as the docs show. **(likely)** = best explanation, not proven on your machine.

## Contents

- [Part 1: Why mix API and UI?](#part-1-why-mix-api-and-ui)
- [Part 2: The request context](#part-2-the-request-context) — `request`, `newContext()`, `ignoreHTTPSErrors`
- [Part 3: Sending a request](#part-3-sending-a-request) — `post()`, `data`, `headers`
- [Part 4: Reading the response](#part-4-reading-the-response) — `ok()`, `status()`, `json()`, `text()`
- [Part 5: Hooks and sharing values between them](#part-5-hooks-and-sharing-values-between-them) — `beforeAll`, `beforeEach`, `let token`
- [Part 6: Logging the browser in with a token](#part-6-logging-the-browser-in-with-a-token) — `localStorage`, `addInitScript`
- [Part 7: The full test, cleaned up](#part-7-the-full-test-cleaned-up)
- [Part 8: Debugging log — the errors you hit and why](#part-8-debugging-log--the-errors-you-hit-and-why)

---

## Part 1: Why mix API and UI?

In `end_to_end_automation_ecom.spec.js` you did everything through the browser: log in → find product → cart → checkout → fill card → place order → find order. That's ~100 lines and every step can be slow or flaky.

In `webAPI_1.spec.js` you did the **setup** with API calls and kept the **browser only for the part you actually want to check**:

```text
API  : POST /auth/login          → get a token           (no browser, ~100 ms)
API  : POST /order/create-order  → get an order id       (no browser, ~100 ms)
UI   : open the site already logged in (token in localStorage)
UI   : My Orders → find that order id → View → check the details page
```

| | Full UI flow | API setup + UI check |
|---|---|---|
| Speed | slow (many pages) | fast (your run: 2.9 s) |
| Flakiness | every page can break the test | only the page you're testing |
| What it proves | the whole user journey works | "My Orders shows an order correctly" |

**Rule of thumb:** keep *one* full UI journey test (you have it). For other tests, create the data with the API and test only the screen you care about.

---

## Part 2: The request context

### 1. Importing `request`

```js
const { test, expect, request } = require("@playwright/test");
```

`request` is a third tool from the same toolbox. It creates **API request contexts** — think "a mini HTTP client", no browser involved.

### 2. `request.newContext(options)`

```js
const apiContext = await request.newContext({ ignoreHTTPSErrors: true });
```

| | |
|---|---|
| **What it does** | Creates an `APIRequestContext` — the object you call `.get()`, `.post()` ... on |
| **Returns** | `APIRequestContext` |
| **Needs await** | Yes |
| **Like** | `browser.newContext()`, but for API calls (it keeps its own cookies) |

Useful options:

| Option | Meaning | Example |
|---|---|---|
| `ignoreHTTPSErrors` | Don't reject HTTPS certificates Node doesn't trust | `true` |
| `baseURL` | Prefix for every URL, so you can write `post("/api/ecom/auth/login")` | `"https://rahulshettyacademy.com"` |
| `extraHTTPHeaders` | Headers added to **every** request from this context | `{ authorization: token }` |

**Extra:** when you're done, `await apiContext.dispose();` frees it. Not required in a small test, but tidy.

### 3. Setting `ignoreHTTPSErrors` once in the config (tested)

Instead of repeating the option, you can put it in `playwright.config.js`:

```js
use: { ignoreHTTPSErrors: true },
```

Tested with a self-signed local server: with that config line, **`page.goto()`, the `{ request }` fixture and `request.newContext()` (inside a test *and* inside `beforeAll`) all stopped failing**. Without it, all of them failed (`self-signed certificate` / `ERR_CERT_AUTHORITY_INVALID`).

### 4. Extra: the `{ request }` fixture

Just like `{ page }`, Playwright can hand you a ready-made API context:

```js
test("api only", async ({ request }) => {
  const res = await request.get("https://example.com/api/items");
});
```

Note the name clash: inside that test, `request` means the **fixture** (already a context — call `.get()` on it directly), not the imported tool (which needs `.newContext()` first). Tested: the fixture also works in `test.beforeAll(async ({ request }) => ...)`. Your way (`request.newContext()`) is also fine and is what the course uses.

---

## Part 3: Sending a request

### 1. `apiContext.post(url, options)`

```js
const apiResponse = await apiContext.post(
  "https://rahulshettyacademy.com/api/ecom/auth/login",
  { data: loginPayLoad }
);
```

| Option | Meaning |
|---|---|
| `data` | The request body. Give it a **JavaScript object** and Playwright turns it into JSON **and** sets `content-type: application/json` for you (tested). Your comment on line 5 is correct. |
| `headers` | Extra headers for this one request, e.g. the token |
| `params` | **Extra:** query string, e.g. `{ page: 2 }` → `?page=2` |

### 2. The payloads (JavaScript object → JSON)

```js
const loginPayLoad = { userEmail: "qnhmtm@gmail.com", userPassword: "Kitti001.@" };
const orderPayLoad = { orders: [{ country: "Cuba", productOrderedId: "6960ea76c941646b7a8b3dd5" }] };
```

The **key names must be exactly what the server expects** (`userEmail`, `productOrderedId` ...). You find them in the browser: DevTools → **Network** tab → do the action by hand → click the request → **Payload**. The same tab's **Response** shows what you'll get back.

### 3. Headers — sending the token

```js
headers: {
  authorization: token,                                  // this API wants the raw token (no "Bearer ")
  "content-type": "application/json; charset=utf-8",    // optional — data:{...} already sets it
},
```

- The option name is **`headers`, all lowercase**. JavaScript property names are case-sensitive: `Headers: {...}` is an unknown option, Playwright **silently ignores it** and the token is never sent (tested: the server received no `authorization` header, and no error was thrown).
- Header *names* themselves are not case-sensitive in HTTP: `authorization` and `Authorization` both reach the server (tested).
- Whether the value needs `Bearer ` in front depends on the API. This one accepts the raw token — your run got `201`. Check the **Request Headers** of the real request in the Network tab.

### 4. Other HTTP methods (Extra)

| Method | Typical use | Code |
|---|---|---|
| `get` | read data | `await apiContext.get(url)` |
| `post` | create something (login, order) | `await apiContext.post(url, { data })` |
| `put` / `patch` | update | `await apiContext.put(url, { data })` |
| `delete` | delete | `await apiContext.delete(url)` |

---

## Part 4: Reading the response

`post()` gives you an `APIResponse` object. Its methods:

| Method | Returns | `await`? | Example from your run |
|---|---|---|---|
| `res.ok()` | `true` if status is 200–299 | No | `true` |
| `res.status()` | the status code (number) | No | `200` (login), `201` (order created) |
| `res.json()` | the body turned into a JS object | **Yes** | `{ token, userId, message }` |
| `res.text()` | the body as a string | **Yes** | `'{"orders":[...],...}'` |
| `res.headers()` | response headers (object) | No | `{ "content-type": "application/json", ... }` |

### The two objects — don't mix them up

```js
const apiResponse = await apiContext.post(...);       // APIResponse → has ok(), status(), json()
const loginResponseJson = await apiResponse.json();   // plain object → has .token, .userId, .message

apiResponse.status();          // ✓ 200
loginResponseJson.token;       // ✓ "eyJhbGci..."   (no await — it's already a plain value, your comment is right)
loginResponseJson.status();    // ✗ TypeError: loginResponseJson.status is not a function (tested)
```

### `ok` vs `ok()` — the silent bug

```js
expect(apiResponse.ok).toBeTruthy();     // ✗ ALWAYS passes — even on a 404 (tested)
expect(apiResponse.ok()).toBeTruthy();   // ✓ really checks the status
```

`apiResponse.ok` without brackets is the function itself, and a function is *truthy*. Same family of bug as `first` vs `first()` ([Guide → Part 3](GUIDE.md#5-picking-one-first-last-nthi)).

**Extra:** `await expect(apiResponse).toBeOK();` is a dedicated assertion — and when it fails, its message shows the response, which is easier to debug.

### Picking values out of the JSON

```js
token   = loginResponseJson.token;          // "eyJhbGci..."
OrderID = orderResponseJson.orders[0];      // orders is an ARRAY → [0] = first id
```

Print the whole object first (`console.log(orderResponseJson)`) so you can see its shape before picking from it.

---

## Part 5: Hooks and sharing values between them

### 1. The four hooks

| Hook | Runs | Typical use |
|---|---|---|
| `test.beforeAll(async () => {...})` | **once**, before all tests in the file | log in via API, get a token |
| `test.beforeEach(async ({ page }) => {...})` | before **every** test | open the start page |
| `test.afterEach(...)` | after every test | clean up |
| `test.afterAll(...)` | once, after all tests in the file | `apiContext.dispose()` |

Your comment `// test.beforeAll    tets.beforeEach()` — spelling: `test.beforeEach()`.

In the report these show up under **Before Hooks** / **After Hooks** (you saw `Before Hooks 1.3s` — that was the login call).

**Watch out — `beforeAll` and workers:** "once per file" really means once per **worker** that runs tests from the file. If several tests from one file run in parallel on different workers, each worker runs `beforeAll` again (likely, from the docs). With your one test, it runs once.

### 2. Sharing a value: `let` at the top of the file

```js
let token;     // declared outside → visible to the hook AND the test
let OrderID;

test.beforeAll(async () => { token = loginResponseJson.token; });   // fills it
test("...", async ({ page }) => { /* uses token */ });              // reads it
```

Your comment on line 9 is right: a `const` must get its value in the same line and can never be re-assigned. Here the value only arrives later (inside the hook), so you need `let`.

---

## Part 6: Logging the browser in with a token

### 1. How this site remembers you're logged in

After a normal login, the app saves the token in the browser's **localStorage** (a small key → value store per website). On every page load the app reads `localStorage.getItem("token")` — if it's there, you're logged in.

You can see it yourself: DevTools → **Application** → **Local Storage** → the site → key `token`. The commands at the bottom of your file are for trying this in the DevTools **Console**:

```js
localStorage.getItem("token");                    // read it
localStorage.removeItem("token");                 // log out (then reload)
localStorage.setItem("token", "PASTE_TOKEN");     // log in with a token
location.reload();                                // reload the page
location.href = "https://rahulshettyacademy.com/client/#/dashboard/dash";   // go to a URL
```

### 2. `page.addInitScript(fn, arg)`

```js
await page.addInitScript((value) => {
  window.localStorage.setItem("token", value);
}, token);
```

| | |
|---|---|
| **What it does** | Registers a script that runs **inside the page, before the page's own JavaScript**, on **every** future page load / navigation of this page |
| **`fn`** | runs in the **browser**, not in Node — it can't see your test's variables |
| **`arg`** | how you pass a value in: `token` becomes `value` inside `fn` |
| **Needs await** | Yes (registering it), but it runs later — on the next load |

**Correction to your comment:** it doesn't inject code into "the browser console". It injects code into the **page**, early in every load. The console snippets above are a manual way of doing the same thing.

### 3. Order matters: `addInitScript` → then `goto` (tested)

```text
addInitScript BEFORE goto → app reads the token on its first load   → "token=ABC"   ✓
addInitScript AFTER goto  → first load already happened              → "token=null"  ✗
                            (only a reload / next navigation picks it up)
```

And without any `goto` at all, the browser stays on an empty `about:blank` page, so `click()` on "My Orders" waits until the 30 s test timeout — exactly the error you got.

**Why the script needs `arg` (Extra):** `fn` is sent to the browser as text. Writing `() => localStorage.setItem("token", token)` would fail in the browser with `token is not defined`, because `token` only exists in Node. Pass it as the second argument instead.

---

## Part 7: The full test, cleaned up

Your test, with the fixes from Part 8 plus a few tidy-ups (marked **NEW**). Your version works — this one is just shorter and safer.

```js
const { test, expect, request } = require("@playwright/test");

const loginPayLoad = { userEmail: process.env.ECOM_EMAIL, userPassword: process.env.ECOM_PASSWORD }; // NEW: no real password in the file
const orderPayLoad = { orders: [{ country: "Cuba", productOrderedId: "6960ea76c941646b7a8b3dd5" }] };

let apiContext;   // NEW: one API context, shared by the hook and the test
let token;

test.beforeAll(async () => {
  apiContext = await request.newContext({ ignoreHTTPSErrors: true }); // or set it once in the config

  const loginResponse = await apiContext.post("https://rahulshettyacademy.com/api/ecom/auth/login", {
    data: loginPayLoad,                          // object → JSON + content-type set automatically
  });
  expect(loginResponse.ok()).toBeTruthy();       // ok() — with brackets!

  const loginJson = await loginResponse.json();  // body → plain object
  token = loginJson.token;
});

test.afterAll(async () => {
  await apiContext.dispose();                    // NEW: tidy
});

test("order created by API shows in My Orders", async ({ page }) => {
  // 1. Create the order through the API
  const orderResponse = await apiContext.post("https://rahulshettyacademy.com/api/ecom/order/create-order", {
    data: orderPayLoad,
    headers: { authorization: token },           // lowercase `headers`; raw token for this API
  });
  expect(orderResponse.ok()).toBeTruthy();
  const orderId = (await orderResponse.json()).orders[0];   // brackets around the await, then .orders[0]
  console.log("orderId =", orderId);

  // 2. Put the token in localStorage BEFORE the app loads
  await page.addInitScript((value) => {
    window.localStorage.setItem("token", value);
  }, token);

  // 3. Open the app — it starts already logged in
  await page.goto("https://rahulshettyacademy.com/client/#/dashboard/dash");

  // 4. My Orders → the row that contains our id → View
  await page.locator("button[routerlink='/dashboard/myorders']").click();
  await page.locator("tbody tr").filter({ hasText: orderId })   // NEW: filter instead of a for loop
            .getByRole("button", { name: "View" })
            .click();                                            // auto-waits for the row to appear

  // 5. Details page shows the same id
  await expect(page.locator(".col-text")).toHaveText(orderId);  // retries — no waitFor() needed first
});
```

What changed and why:

| Change | Why |
|---|---|
| One `apiContext` in `beforeAll` | No need to create a second one inside the test |
| Removed the `content-type` header | `data: {...}` already sets it (tested) |
| `filter({ hasText: orderId })` instead of the loop | One line; `click()` auto-waits for the row, so no `waitFor()` / `count()` needed. Your loop also works — see [Guide → Part 3](GUIDE.md#10-filter--keep-only-the-matches-that-contain-something) |
| Removed `waitFor()` before `toHaveText` | `toHaveText` already retries for 5 s |
| Credentials from `process.env` | Don't commit a real password — see [Code Review](MY_CODE_REVIEW.md#16-real-login-hard-coded--first_automation_ecomspecjs-lines-3132) |
| Removed `productName` | It was never used |

Run it with: `ECOM_EMAIL="you@example.com" ECOM_PASSWORD="..." npx playwright test tests/webAPI_1.spec.js`

**Watch out:** every run places a **real order** on the practice site. That's fine here; on a real project you'd delete it in `afterAll` (there's usually a DELETE endpoint).

---

## Part 8: Debugging log — the errors you hit and why

The errors from your runs on 13 Oct 2026, in the order they appeared. Keep this table — the same mistakes come back in every API test.

| # | What you saw | Cause | Fix |
|---|---|---|---|
| 1 | `apiRequestContext.post: self-signed certificate in certificate chain` | Node.js didn't trust a certificate in the HTTPS chain (see below) | `request.newContext({ ignoreHTTPSErrors: true })` or `use: { ignoreHTTPSErrors: true }` in the config |
| 2 | No error, but the login check could never fail | `expect(apiResponse.ok)` — missing `()`, a function is always truthy (tested on a 404) | `expect(apiResponse.ok()).toBeTruthy()` |
| 3 | `expect(received).toBeTruthy()  Received: false` on line 45 (create-order) | The server rejected the request — the token wasn't being sent | Check `headers` spelling (lowercase); log `status()` and `await res.text()` to see the server's reason |
| 4 | `TypeError: loginResponseJson.status is not a function` (would happen) | `.status()` called on the JSON object instead of the response | `apiResponse.status()` |
| 5 | `Test timeout of 30000ms exceeded ... waiting for locator('button[routerlink=...]')` | No `page.goto()` — the browser was on a blank page | `await page.goto(...)` **after** `addInitScript` |
| 6 | `TypeError: page.waitFor is not a function` (would happen) | `page.waitFor()` was removed from Playwright (tested) | `await locator.waitFor()` or just the web-first `expect` |

### The debugging habit that solved #3

When an API check fails, print the status **and** the body *before* the `expect`:

```js
console.log("Status:", orderResponse.status());
console.log("Body:", await orderResponse.text());   // text() works even when the body isn't JSON
expect(orderResponse.ok()).toBeTruthy();
```

The status tells you *what kind* of problem (401/403 = auth, 400 = bad payload, 404 = wrong URL, 500 = server). The body usually tells you *exactly* what's wrong.

### Corrections to advice given during that session

- **"The site uses a self-signed certificate" — probably not.** The site loads fine in Chrome, so its certificate is most likely valid. The usual cause of `self-signed certificate in certificate chain` in **Node** on a work laptop is a company network / security tool that inspects HTTPS and re-signs it with the company's own certificate (likely). Your Mac and Chrome trust that company certificate; Node.js uses its own list and doesn't. `ignoreHTTPSErrors: true` is fine for practice. The "proper" fix is to point Node at the company certificate: `export NODE_EXTRA_CA_CERTS=/path/to/company-root.pem` (ask IT for the file).
- **"Add `Bearer` before the token" — not needed for this API.** It was a guess; the raw token worked (`201`). Always check the real request in DevTools → Network.
- **"HTTP header keys must be lowercase" — imprecise.** The Playwright *option* must be spelled `headers` (lowercase). The header *names* inside it can be any case.

---

## Recap: API Testing

- `request.newContext()` → API context → `.post(url, { data, headers })`.
- `data: {...}` → JSON + `content-type` automatically. Option is `headers` (lowercase) — a wrong spelling is silently ignored.
- Response: `ok()` and `status()` (no `await`), `json()` and `text()` (`await`). Don't call response methods on the JSON object.
- `ok` without `()` always passes.
- `beforeAll` runs once (per worker); share values with `let` at the top of the file.
- `addInitScript(fn, arg)` runs in the page before the app's own code, on every load → register it **before** `goto`.
- When an API check fails: log `status()` and `await res.text()` first.
