# My Code Review (Playwright practice files)

A review of `first_automation_ecom.spec.js`, `test2.spec.js` and `UIBasics.spec.js`. Explanations of each topic are in [GUIDE.md](GUIDE.md); quick lookups in [QUICK_REFERENCE.md](QUICK_REFERENCE.md).

Once you've fixed your spec files, you can delete Part 1 (or this whole file) — Part 2 keeps the corrected tests as a reference.

## What's in this file

- [Part 1: Mistakes Found in My Code](#part-1-mistakes-found-in-my-code) — bugs, wrong comments, risky code, clean-ups, with line numbers
- [Part 2: Full Tests, Cleaned Up and Annotated](#part-2-full-tests-cleaned-up-and-annotated) — the tests rewritten with fixes and line-by-line comments


---

## Part 1: Mistakes Found in My Code

A review of your three files. Line numbers match your uploaded files.

**Labels**

| Label | Meaning |
|---|---|
| **BUG** | The test will crash or give a wrong result |
| **WRONG IDEA** | A comment that teaches something incorrect — fix your understanding |
| **RISKY** | Works now, but deprecated or fragile |
| **CLEAN-UP** | Works fine; just tidier |

"Tested" means the behaviour was reproduced by running Playwright v1.56.0. "(likely)" means it's the best explanation available, but it couldn't be proven on the real site.

---

### Summary

| # | File : line | Label | Issue |
|---|---|---|---|
| 1 | test2 : 65 | **BUG** | `cardTitle.first.textContent()` — missing `()` after `first` |
| 2 | test2 : 35 | **WRONG IDEA** | Comment says "use .inputValue()" for the error message |
| 3 | UIBasics : 169–170 | **WRONG IDEA** | textContent vs inputValue explained as a timing issue |
| 4 | UIBasics : 105–107 | **WRONG IDEA** | "No await outside expect because it's just an assertion" |
| 5 | test2 : 56–62 | **WRONG IDEA** | `.card-body .card-title a` "won't work" |
| 6 | UIBasics : 162 | Answer | Why `waitForLoadState("networkidle")` didn't work |
| 7 | UIBasics : 96 | **WRONG IDEA** | `toBeTruty()` → `toBeTruthy()` |
| 8 | UIBasics : 4 | **WRONG IDEA** | `expect` from the config file |
| 9 | UIBasics : 15–17 | **WRONG IDEA** | `async (fixture) => fixture.browser` doesn't work in Playwright |
| 10 | UIBasics : 19–22 | **WRONG IDEA** (partly) | Parallel/sequential depends on `fullyParallel` |
| 11 | test2 : 34 | **WRONG IDEA** (partly) | "Wait 10 sec" comes from your config, not a Playwright default |
| 12 | UIBasics : 61 | **RISKY** | `.type()` is deprecated |
| 13 | UIBasics : 99–102 | **RISKY** | `toHaveAttribute("class", "blinkingText")` is an exact match |
| 14 | UIBasics : 84 | **RISKY** | Positional XPath `//label[2]//span[2]` |
| 15 | ecom : 21, UIBasics : 110 | **RISKY** | `test.only` left in two files |
| 16 | ecom : 31–32 | **RISKY** | Real personal login hard-coded |
| 17 | ecom : 34 | **RISKY** | Relying only on `networkidle` |
| 18 | test2 : 48, 52 | **CLEAN-UP** | `fill("")` before `fill(...)` is not needed |
| 19 | ecom : 29 | **CLEAN-UP** | `(await page).locator(...)` |
| 20 | ecom : 28 | **CLEAN-UP** | Leading space in `" //input[@id='login']"` |
| 21 | UIBasics : 3 | **CLEAN-UP** | Unused `require("node:crypto")` |
| 22 | UIBasics : 89 | **CLEAN-UP** | `page.pause()` left in |
| 23 | UIBasics : 92, 154 | **CLEAN-UP** | Use `check()` instead of `click()` to tick |
| 24 | Small stuff | **CLEAN-UP** | Naming, typos in comments |

---

### BUGS

#### 1. `cardTitle.first.textContent()` — `test2.spec.js` line 65

```js
console.log(await cardTitle.first.textContent());   // ✗
```

`first` is a **function**. Without `()` you're pointing at the function itself, which has no `textContent` method.

**What happens (tested):** `TypeError: cardTitle.first.textContent is not a function`. The test stops at this line, so **nothing after line 65 runs** in that test.

**Fix:**

```js
console.log(await cardTitle.first().textContent());   // ✓
```

**Bonus insight:** once fixed, your line 75 (`allTextContents()` without waiting) will print the full list — but only because lines 65–67 (`textContent()`) already waited for the titles to load. If you deleted those lines, line 75 could print `[]`. → [Guide → Part 7](GUIDE.md#part-7-waiting-and-timing)

---

### WRONG IDEAS (in comments)

#### 2. `// use .inputValue()` on the error message — `test2.spec.js` line 35

```js
console.log(await page.locator("[style*='block']").textContent()); // use .inputValue()
```

The error message is a `<div>`, not a form field. `inputValue()` only works on `<input>`, `<textarea>`, `<select>`. On a `<div>` it **throws** `Error: Node is not an <input>, <textarea> or <select> element` (tested).

**`textContent()` is correct on this line. Delete the comment.** → [Guide → Part 5](GUIDE.md#part-5-reading-data-from-the-page)

#### 3. textContent vs inputValue explained as "timing" — `UIBasics.spec.js` lines 169–170

> "textContent() will return text only when it is attached to the DOM, when the page opens; if we are looking to get the text which is typed or altered after the DOM is opened, need to use inputValue()"

**Correct idea:** it's about **what kind of element** it is, not *when* the text appeared.

- `<input>` has no text between tags; typed text lives in its `value` → `inputValue()`.
- Other elements have text between tags → `textContent()`, even if that text changed after the page loaded (tested: text changed 0.8 s after load was read fine). Your error message (line 35 of test2) only appears after clicking Sign In — and `textContent()` read it.

**Replace the comment with:** "Form fields (input / textarea / select) → inputValue(). Everything else → textContent()." → [Guide → Part 5](GUIDE.md#part-5-reading-data-from-the-page)

#### 4. "await only for actions, not outside expect" — `UIBasics.spec.js` lines 105–107

> "actual await is used only when there is an action involved ... we don't write await outside expect as this is not an action, it is just an assertion"

Half right, and it contradicts your own line 93 (`await expect(page.locator("input#terms")).toBeChecked();`), which correctly has `await` outside.

**Correct rule:** `await` anything that returns a Promise.

- `expect(locator or page).toXxx()` (web-first, retries) → returns a Promise → **`await expect(...)`**
- `expect(plainValue).toXxx()` (generic) → no Promise → no `await` outside, but `await` the browser call inside: `expect(await locator.isChecked()).toBeFalsy()`

→ [Guide → Part 2](GUIDE.md#part-2-async-await-and-promises)

#### 5. "`.card-body .card-title a` will not work" — `test2.spec.js` lines 56–62

Both `.card-body .card-title` **and** `.card-body .card-title a` match 4 elements (one per product card). The `a` is not the problem.

The real issue is **strict mode**: single-element methods (`textContent()`, `click()` ...) throw `strict mode violation: ... resolved to 4 elements` when a locator matches more than one element (tested). Your fix — `nth(0)` / `first()` — is the correct one. → [Guide → Part 3](GUIDE.md#part-3-locators-and-selectors)

#### 6. "why this is not working" — `waitForLoadState("networkidle")` — `UIBasics.spec.js` line 162

**(likely, reproduced locally)** A timing race: right after `signIn.click()`, the browser is still on the login page, which is already idle. `waitForLoadState` checks the **current** page, sees "already idle", and returns immediately — before the shop page has even started loading. Then `allTextContents()` reads the login page → `[]`.

Also, the official docs mark `networkidle` as **discouraged** for tests.

**Your replacement `await cardTitle.first().waitFor();` is the right fix.** Full explanation with a timeline: [Guide → Part 7](GUIDE.md#part-7-waiting-and-timing).

#### 7. `toBeTruty()` — `UIBasics.spec.js` line 96

It's **`toBeTruthy()`**. With the typo you'd get `Error: expect: Property 'toBeTruty' not found.` (tested). → [Guide → Part 6](GUIDE.md#part-6-assertions-with-expect)

#### 8. `expect` from the config — `UIBasics.spec.js` line 4

```js
// const {expect} = require('../playwright.config')
```

`expect` comes from `@playwright/test` (line 2 already does this). The config file exports settings, not `expect`. It's commented out, so harmless — just don't use it.

#### 9. `async (fixture) => fixture.browser` — `UIBasics.spec.js` lines 15–17 (commented out)

```js
// test('my test', async (fixture)=>{ console.log(fixture.browser); })
```

In plain JavaScript this looks fine, but Playwright **requires** the first argument to be destructured with `{ }` — it reads the names inside to decide which fixtures to create. If you un-comment it, the file fails to load (tested):

```text
First argument must use the object destructuring pattern: fixture.browser
```

**Fix:** `async ({ browser }) => { console.log(browser); }` → [Guide → Part 1](GUIDE.md#part-1-test-setup-and-fixtures)

#### 10. "Same file sequential, folder parallel" — `UIBasics.spec.js` lines 19–22

True **only when `fullyParallel` is `false`/not set** in `playwright.config.js`. With `fullyParallel: true` (common in generated configs), tests inside one file also run in parallel. Check your config. → [Guide → Part 1](GUIDE.md#part-1-test-setup-and-fixtures)

#### 11. "Playwright will wait for 10 sec as configured by us" — `test2.spec.js` line 34

The 10 seconds is from **your** config, not a Playwright default. Defaults: test timeout 30 s, `expect` timeout 5 s, actions have no limit of their own (they use the test's remaining time). Open `playwright.config.js` and check `timeout`, `expect.timeout`, `use.actionTimeout`. → [Guide → Part 7](GUIDE.md#part-7-waiting-and-timing)

---

### RISKY

#### 12. `.type()` is deprecated — `UIBasics.spec.js` line 61

```js
await page.locator("#userPassword").type("Iamking@000");   // deprecated, doesn't clear first
await page.locator("#userPassword").fill("Iamking@000");   // ✓
```

Your comment in test2 line 21 ("type is depreciated") is correct (spelling: *deprecated*). → [Guide → Part 4](GUIDE.md#part-4-actions)

#### 13. Exact class check — `UIBasics.spec.js` lines 99–102

```js
await expect(page.locator("[href*='documents-request']")).toHaveAttribute("class", "blinkingText");
```

Passes only if the class attribute is **exactly** `blinkingText`. If the site ever adds another class, it fails (tested with `"blinkingText other"`). Safer:

```js
await expect(page.locator("[href*='documents-request']")).toHaveAttribute("class", /blinkingText/);
// or
await expect(page.locator("[href*='documents-request']")).toContainClass("blinkingText");
```

#### 14. Positional XPath — `UIBasics.spec.js` line 84

```js
await expect(page.locator("//label[2]//span[2]")).toBeChecked();
```

It works (tested: the `span` is inside the radio's `<label>`, and Playwright follows the label to its radio), but "2nd label, 2nd span" breaks if the layout changes. Clearer:

```js
await expect(page.locator(".radiotextsty").last()).toBeChecked();
```

#### 15. `test.only` in two files — ecom line 21, UIBasics line 110

`test.only` applies to the **whole run**. With both present, `npx playwright test` runs only "ecom_test" and "child window"; every other test is silently skipped. Remove `.only` when you finish debugging. → [Guide → Part 1](GUIDE.md#part-1-test-setup-and-fixtures)

#### 16. Real login hard-coded — `first_automation_ecom.spec.js` lines 31–32

Your personal email and password are in the test file. If you push this to GitHub, anyone can see them. Use a throw-away practice account, or read them from environment variables:

```js
await email.fill(process.env.ECOM_EMAIL);
await password.fill(process.env.ECOM_PASSWORD);
```

#### 17. Relying only on `networkidle` — `first_automation_ecom.spec.js` line 34

It probably works on this app (likely — the app starts loading products right after login, so the network is busy). But the docs discourage it. Your commented line 40 is the more reliable way — turn it on:

```js
await expect(cardTitle).not.toHaveCount(0);   // or: await cardTitle.first().waitFor();
const allTitles = await cardTitle.allTextContents();
```

---

### CLEAN-UP

#### 18. `fill("")` before `fill(...)` — `test2.spec.js` lines 48 and 52

`fill()` already replaces the old text (tested). Delete the `fill("")` lines.

#### 19. `(await page).locator(...)` — `first_automation_ecom.spec.js` line 29

`page` is not a Promise, so the `await` does nothing. Write `page.locator(".card-body")`.

#### 20. Leading space — `first_automation_ecom.spec.js` line 28

`" //input[@id='login']"` works (tested — Playwright trims it), but write `"//input[@id='login']"` to avoid confusion.

#### 21. Unused import — `UIBasics.spec.js` line 3

```js
const { sign } = require("node:crypto");
```

Nothing in the file uses `sign`. Most likely VS Code auto-added it when you typed `sign...` (e.g. `signIn`) and accepted a suggestion (likely). Delete the line.

#### 22. `page.pause()` left in — `UIBasics.spec.js` line 89

In headed / `--debug` runs it stops the test every time. (In a headless run it returned instantly in testing, so it doesn't break CI — but it's still debug code.) Remove it when you're done.

#### 23. Ticking with `click()` — `UIBasics.spec.js` lines 92 and 154

`click()` toggles; `check()` guarantees "ticked". Prefer `await page.locator("input#terms").check();` → [Guide → Part 4](GUIDE.md#part-4-actions)

#### 24. Small stuff

- `UIBasics.spec.js` line 142: `redEmail` actually holds the domain (`rahulshettyacademy.com`). A name like `domain` reads better.
- `test2.spec.js` line 86 (comment): `colsole.log` → `console.log`.
- `UIBasics.spec.js` lines 57–58: `productName` and `products` are declared but not used (probably for the next lesson — fine).
- Test names: "playwrite" → "playwright" (cosmetic).
- `.card-body` (ecom line 29) returns the **whole card text** with `allTextContents()`. For just product names use `.card-body b`. → [Guide → Part 5](GUIDE.md#part-5-reading-data-from-the-page)

---

### Your comments that are CORRECT (keep trusting these)

| Where | Comment |
|---|---|
| ecom 3–16 | `require` / `{ test, expect }` explanation |
| ecom 36–37, test2 72–73 | `allTextContents()` has no auto-waiting |
| test2 69–70 | `textContent()` / `nth(0).textContent()` auto-wait |
| test2 41–44 | `page.locator()` is synchronous, so `await` on it has no effect (ts 80007) |
| test2 19–20 | id is the best choice when available (unique) |
| test2 21 | `type` is deprecated |
| test2 38 | `toContainText` accepts a substring |
| UIBasics 24–30 | You don't need to create context/page yourself — use `{ page }` |
| UIBasics 39 | Headless is the default |
| UIBasics 124–125 | Promise states; `Promise.all` gives an array only after `await` |
| UIBasics 127–129 | `[Page, undefined]` — click returns nothing |
| UIBasics 156–159 | Your observed output (textContent empty, inputValue shows values) |


---

## Part 2: Full Tests, Cleaned Up and Annotated

Your tests, rewritten with the fixes from [Mistakes](#part-1-mistakes-found-in-my-code) and a comment on (almost) every line. Use these as "known good" references.

> The steps and URLs follow your files. The real course website couldn't be reached from the test environment, so all four tests were run against a **local imitation** of those pages (same selectors and behaviour) — all four passed. On the real site, small differences (exact texts, timings) are possible.

---

### Template — the shape of every test

```js
const { test, expect } = require("@playwright/test");   // 1. import

test("what this test checks", async ({ page }) => {      // 2. define test, get a tab
  await page.goto("https://example.com");                // 3. open the page

  const button = page.locator("#submit");                // 4. locators (no await)

  await button.click();                                  // 5. actions (await)

  await expect(page).toHaveURL(/done/);                  // 6. assertions (await expect)
});
```

---

### Test A — Wrong login shows an error, right login shows products

Based on `test2.spec.js` → "new_test_1".

```js
const { test, expect } = require("@playwright/test");

test("login error, then login and read product titles", async ({ page }) => {
  // ---- Open the page ----
  await page.goto("https://rahulshettyacademy.com/loginpagePractise/");

  // ---- Locators (created instantly, searched only when used) ----
  const userName = page.locator("input#username");        // tag + id (CSS)
  const password = page.locator("[type='password']");     // attribute equals (CSS)
  const signIn = page.locator("input#signInBtn");
  const terms = page.locator("input#terms");
  const errorMsg = page.locator("[style*='block']");      // the error box once it becomes display: block
  const cardTitle = page.locator(".card-body .card-title a"); // matches ALL product titles (4)

  // ---- Title ----
  console.log(await page.title());                        // read the title (await!)
  await expect(page).toHaveTitle("LoginPage Practise | Rahul Shetty Academy"); // whole title must match

  // ---- Wrong login ----
  await userName.fill("souvikmandal");                    // fill() replaces any existing text
  await password.fill("12dg5s5");
  await terms.check();                                    // check() = make sure it's ticked
  await signIn.click();

  // The error box is a <div> → read it with textContent() (NOT inputValue())
  console.log(await errorMsg.textContent());              // auto-waits for the element
  await expect(errorMsg).toContainText("Incorrect");      // part of the text is enough

  // ---- Right login ----
  await userName.fill("rahulshettyacademy");              // no need for fill("") first
  await password.fill("Learning@830$3mK2");
  await signIn.click();

  // ---- Product titles ----
  // cardTitle matches 4 elements → single-element methods need first()/nth()/last()
  console.log(await cardTitle.first().textContent());     // first()  ← brackets!
  console.log(await cardTitle.nth(1).textContent());      // second title (0-based)

  // allTextContents() does NOT wait → make sure the list is there first
  await expect(cardTitle).not.toHaveCount(0);             // retries up to 5 s
  const allTitles = await cardTitle.allTextContents();    // ["iphone X", "Samsung Note 8", ...]
  console.log(allTitles);
});
```

---

### Test B — UI controls (radio, pop-up box, dropdown, checkbox, attribute)

Based on `UIBasics.spec.js` → "UI controls".

```js
const { test, expect } = require("@playwright/test");

test("UI controls", async ({ page }) => {
  await page.goto("https://rahulshettyacademy.com/loginpagePractise/");

  const userName = page.locator("input#username");
  const password = page.locator("[type='password']");
  const dropdown = page.locator("select.form-control");   // CSS: <select> having class form-control
  const userRadio = page.locator(".radiotextsty").last(); // last radio label = "User"
  const terms = page.locator("input#terms");
  const docLink = page.locator("[href*='documents-request']"); // href CONTAINS this text

  await userName.fill("souvikmandal");
  await password.fill("12dg5s5");

  // ---- Radio button + pop-up box ----
  await userRadio.click();                                // choose "User"
  await page.locator("#okayBtn").click();                 // the pop-up is normal HTML → normal click
  await expect(userRadio).toBeChecked();                  // web-first assertion → await OUTSIDE
  console.log(await userRadio.isChecked());               // true/false value → await INSIDE

  // ---- Dropdown ----
  await dropdown.selectOption("Consultant");              // string matches option value OR label
  console.log(await dropdown.inputValue());               // prints the option's VALUE attribute
  // await page.pause();                                  // un-comment + run with --headed to look around

  // ---- Checkbox ----
  await terms.check();                                    // tick (doesn't toggle)
  await expect(terms).toBeChecked();
  await terms.uncheck();                                  // untick
  expect(await terms.isChecked()).toBeFalsy();            // generic assertion on a value
  await expect(terms).not.toBeChecked();                  // same check, web-first style

  // ---- Attribute ----
  await expect(docLink).toHaveAttribute("class", /blinkingText/); // "contains", safer than exact

  await page.locator("input#signInBtn").click();
});
```

---

### Test C — Child window (new tab) and using its text

Based on `UIBasics.spec.js` → "child window".

```js
const { test, expect } = require("@playwright/test");

test("child window", async ({ browser }) => {
  // { browser } way: we create context + page ourselves (we need `context` for the new tab)
  const context = await browser.newContext();             // fresh profile, no cookies
  const page = await context.newPage();                   // tab 1 (parent)
  await page.goto("https://rahulshettyacademy.com/loginpagePractise/");

  const userName = page.locator("input#username");
  const password = page.locator("[type='password']");
  const dropdown = page.locator("select.form-control");
  const docLink = page.locator("[href*='documents-request']");
  const terms = page.locator("input#terms");
  const signIn = page.locator("input#signInBtn");
  const cardTitle = page.locator(".card-body .card-title a");

  // ---- Open the new tab and catch it ----
  // Start listening BEFORE the click. Result = [Page, undefined]
  const [newPage] = await Promise.all([
    context.waitForEvent("page"),                         // → the new Page
    docLink.click(),                                      // → undefined
  ]);

  // ---- Read from the child tab ----
  const redText = await newPage.locator(".red").textContent();
  console.log(redText);

  const domain = redText.split("@")[1].split(" ")[0];     // "rahulshettyacademy.com"
  const user = domain.split(".")[0];                      // "rahulshettyacademy"
  console.log(domain, user);

  // ---- Back to the parent tab: just use its locators ----
  await userName.fill(user);
  await password.fill("Learning@830$3mK2");
  await page.locator(".radiotextsty").last().click();
  await page.locator("#okayBtn").click();
  await dropdown.selectOption("Consultant");
  await terms.check();

  // Form fields → inputValue(), NOT textContent()
  console.log("username:", await userName.inputValue());  // "rahulshettyacademy"
  console.log("password:", await password.inputValue());

  await signIn.click();

  // Wait for the thing we need (NOT waitForLoadState — it can return too early here)
  await cardTitle.first().waitFor();                      // waits until the first title is visible
  console.log(await cardTitle.allTextContents());
});
```

---

### Test D — E-commerce client app: login and list products

Based on `first_automation_ecom.spec.js` and "@Web Client App login".

```js
const { test, expect } = require("@playwright/test");

test("@Web ecom login and list products", async ({ page }) => {
  await page.goto("https://rahulshettyacademy.com/client/#/auth/login");

  const email = page.locator("#userEmail");
  const password = page.locator("#userPassword");
  const login = page.locator("#login");
  const productNames = page.locator(".card-body b");      // just the names (not the whole card)

  // Your own test account — better from environment variables than hard-coded
  await email.fill(process.env.ECOM_EMAIL);
  await password.fill(process.env.ECOM_PASSWORD);
  await login.click();

  // Products load AFTER the page → wait for them before allTextContents()
  await productNames.first().waitFor();                   // or: await expect(productNames).not.toHaveCount(0);

  const titles = await productNames.allTextContents();
  console.log(titles);
  expect(titles.length).toBeGreaterThan(0);               // generic assertion on a plain value
});
```

**How to pass the environment variables** (Extra):

```bash
# macOS / Linux
ECOM_EMAIL="you@example.com" ECOM_PASSWORD="yourPassword" npx playwright test

# Windows PowerShell
$env:ECOM_EMAIL="you@example.com"; $env:ECOM_PASSWORD="yourPassword"; npx playwright test
```

If you forget to set them, `process.env.ECOM_EMAIL` is `undefined` and `fill()` will throw an error — that's your reminder.

---

### What changed compared to your originals (summary)

| Change | Why |
|---|---|
| `first` → `first()` | Bug fix (TypeError) |
| Removed `fill("")` before `fill(...)` | `fill()` already replaces |
| `type()` → `fill()` | `type()` is deprecated |
| `click()` → `check()` for ticking | `check()` doesn't toggle |
| Added a wait before every `allTextContents()` | It doesn't wait on its own |
| Removed `waitForLoadState("networkidle")` | Can return too early; discouraged in docs |
| Exact class → `/blinkingText/` | Doesn't break if more classes are added |
| `//label[2]//span[2]` → `.radiotextsty` + `.last()` | Easier to read, less fragile |
| `.card-body` → `.card-body b` (ecom) | Just the product names |
| Credentials from `process.env` | Don't commit passwords |
| Removed unused `node:crypto` import and `test.only` | Clean-up |
