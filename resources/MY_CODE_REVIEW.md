# My Code Review (Playwright practice files)

A review of `first_automation_ecom.spec.js`, `test2.spec.js` and `UIBasics.spec.js` — plus, added 13 Oct 2026, `end_to_end_automation_ecom.spec.js` and `webAPI_1.spec.js`. Explanations of each topic are in [GUIDE.md](GUIDE.md) and [API_TESTING.md](API_TESTING.md); quick lookups in [QUICK_REFERENCE.md](QUICK_REFERENCE.md).

Once you've fixed your spec files, you can delete Part 1 (or this whole file) — Part 2 keeps the corrected tests as a reference.

## What's in this file

- [Part 1: Mistakes Found in My Code](#part-1-mistakes-found-in-my-code) — bugs, wrong comments, risky code, clean-ups, with line numbers (items 1–24: first three files; [items 25–41](#newer-files-13-oct-2026-end_to_end_automation_ecomspecjs-and-webapi_1specjs): the two newer files)
- [Part 2: Full Tests, Cleaned Up and Annotated](#part-2-full-tests-cleaned-up-and-annotated) — the tests rewritten with fixes and line-by-line comments


---

## Part 1: Mistakes Found in My Code

A review of your files. Line numbers match your files as of 13 Oct 2026.

**Status check (13 Oct 2026):** #19 is fixed ✓. #15 now applies to **three** files. #16 also applies to the two newer files. All other items 1–24 are still in the files.

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
| 15 | ecom : 21, UIBasics : 110, end_to_end : 4 | **RISKY** | `test.only` left in **three** files |
| 16 | ecom : 31–32 (also end_to_end : 20–21, webAPI : 3) | **RISKY** | Real personal login hard-coded |
| 17 | ecom : 34 | **RISKY** | Relying only on `networkidle` |
| 18 | test2 : 48, 52 | **CLEAN-UP** | `fill("")` before `fill(...)` is not needed |
| 19 | ecom : 29 | **CLEAN-UP** | `(await page).locator(...)` — ✓ fixed |
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

#### 15. `test.only` in three files — ecom line 21, UIBasics line 110, end_to_end line 4

`test.only` applies to the **whole run**. With all three present, `npx playwright test` runs only "ecom_test", "child window" and "ecom_automation"; every other test (including your API test) is silently skipped. Running one file by name still works, which hides the problem. Remove `.only` when you finish debugging. → [Guide → Part 1](GUIDE.md#part-1-test-setup-and-fixtures)

#### 16. Real login hard-coded — `first_automation_ecom.spec.js` lines 31–32

Your personal email and password are in the test file. If you push this to GitHub, anyone can see them. Use a throw-away practice account, or read them from environment variables:

```js
await email.fill(process.env.ECOM_EMAIL);
await password.fill(process.env.ECOM_PASSWORD);
```

The same email/password is also in `end_to_end_automation_ecom.spec.js` lines 20–21 and in the login payload of `webAPI_1.spec.js` line 3 — see [API_TESTING.md → Part 7](API_TESTING.md#part-7-the-full-test-cleaned-up) for the `process.env` version of a payload.

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

`page` is not a Promise, so the `await` does nothing. Write `page.locator(".card-body")`. **✓ Fixed** in your current file.

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

### Newer files (13 Oct 2026): `end_to_end_automation_ecom.spec.js` and `webAPI_1.spec.js`

`end_to_end` = `end_to_end_automation_ecom.spec.js`, `webAPI` = `webAPI_1.spec.js`. Both files **pass** on your machine — so there are no crashing bugs left. The bugs you hit in `webAPI` during the 13 Oct session (missing `()` on `ok`, `Headers`, `.status()` on the JSON, no `goto`, `page.waitFor()`) are all fixed; they're logged in [API_TESTING.md → Part 8](API_TESTING.md#part-8-debugging-log--the-errors-you-hit-and-why).

| # | File : line | Label | Issue |
|---|---|---|---|
| 25 | webAPI : 33 | **WRONG IDEA** | `addInitScript` "injects js into the browser console" |
| 26 | end_to_end : 115 | **WRONG IDEA** | `OrderId.includes(rawOrderID)` is backwards |
| 27 | end_to_end : 47–48 | **WRONG IDEA** (partly) | "need to manually wait for the cart page" |
| 28 | end_to_end : 15–17 | **RISKY** | Positional `input[type="text"]` + `nth(0/1/2)` |
| 29 | end_to_end : 114–115 | **RISKY** | Row id compared with `==` and without `trim()` |
| 30 | end_to_end : 103 | **RISKY** | `td label.ng-star-inserted` — Angular's own class |
| 31 | end_to_end : 46 | **RISKY** (small) | `:has-text()` is "contains", not "equals" |
| 32 | both | **RISKY** (fine for practice) | Every run places a real order |
| 33 | end_to_end : 4–6 | **CLEAN-UP** | `{ browser }` + `newContext()` not needed here |
| 34 | end_to_end : 26–38, 107–120 | **CLEAN-UP** | Loops can be one `filter()` each |
| 35 | end_to_end : 94–96 | **CLEAN-UP** | `toBeVisible()` before `toHaveText()` is optional |
| 36 | end_to_end : 108 | **CLEAN-UP** | `tbody.waitFor()` works — but for a hidden reason |
| 37 | webAPI : 31 | **CLEAN-UP** | A second API context isn't needed |
| 38 | webAPI : 43 | **CLEAN-UP** | `content-type` header is set for you |
| 39 | webAPI : 72 | **CLEAN-UP** | `waitFor()` before `toHaveText()` isn't needed |
| 40 | webAPI : 11 | **CLEAN-UP** | `productName` is never used |
| 41 | Small stuff | **CLEAN-UP** | Typos and naming |

#### 25. `addInitScript` and "the browser console" — `webAPI_1.spec.js` line 33

> "add InitScript function injects the js code into the browser console"

It injects the code into the **page**: the function runs inside the page **before the page's own scripts**, on every load / navigation of that page. Nothing goes through the console. (The commented `localStorage...` lines at the bottom of the file are what you'd type *in* the console to do the same thing by hand.) → [API_TESTING.md → Part 6](API_TESTING.md#part-6-logging-the-browser-in-with-a-token)

#### 26. `OrderId.includes(rawOrderID)` — `end_to_end_automation_ecom.spec.js` line 115

```js
if (currOrderId == OrderID){ // we could have done OrderId.includes(rawOrderID)
```

`rawOrderID` is the label text from the thank-you page, `" | 6ac888aa2be7a4bc2b96bf5a | "`. The clean id `OrderID` is **shorter** than that, so `OrderID.includes(rawOrderID)` is always `false`. What you meant is the other way round — "does the **row's** text contain the id?":

```js
if (currOrderId.includes(OrderID)) { ... }        // ✓ row text contains the id
// or skip the loop:
await rows.filter({ hasText: OrderID }).getByRole("button", { name: "View" }).click();
```

#### 27. "need to manually wait for the cart page" — `end_to_end_automation_ecom.spec.js` lines 47–48

The `isVisible()` part is right — it doesn't wait. But the line you actually wrote, `await expect(...).toBeVisible()`, is a web-first assertion: it **waits by itself** (up to 5 s). So no manual wait is needed, and leaving line 42 commented out was correct. → [Guide → Part 5](GUIDE.md#extra-isvisible--does-not-wait)

#### 28. Positional text boxes — `end_to_end_automation_ecom.spec.js` lines 15–17

```js
const cardNumber = mainPage.locator('input[type="text"]').nth(0);
const cvv        = mainPage.locator('input[type="text"]').nth(1);
const NameOfCard = mainPage.locator('input[type="text"]').nth(2);
```

Works today. If the page adds or reorders a text box, every index shifts silently and values go into the wrong fields. When you revisit this page, inspect each field for something of its own (`name`, a label for `getByLabel`, or its position inside its own row). → [Guide → Part 3](GUIDE.md#11-many-ways-to-find-the-same-element--which-one)

#### 29. `==` and no `trim()` on the row id — `end_to_end_automation_ecom.spec.js` lines 114–115

```js
const currOrderId = await rows.nth(i).locator('th').textContent();
if (currOrderId == OrderID) { ... }
```

Works because the `<th>` happens to contain only the id. If it ever had a space or a new line around it, the comparison would silently fail and the loop would find nothing. Your `webAPI_1.spec.js` version is better: `.trim()` + `===`. → [Guide → Part 9](GUIDE.md#12--vs-)

#### 30. `td label.ng-star-inserted` — `end_to_end_automation_ecom.spec.js` line 103

`ng-star-inserted` is a class **Angular adds by itself** to many elements that appear conditionally — it says nothing about *this* label. It works today because it's the only such label inside a `td` on that page (likely). If it ever breaks, look for something more specific around the order id. Same family as auto-generated classes in [css_class_understanding.md](css_class_understanding.md).

#### 31. `:has-text()` is "contains" — `end_to_end_automation_ecom.spec.js` line 46

`h3:has-text('IPHONE 13 PRO')` would also pass for an `h3` saying "IPHONE 13 PRO MAX" (contains, ignoring case — tested). Fine with today's product list; for an exact check use `toHaveText`: `await expect(page.locator("h3").filter({ hasText: productName })).toHaveText(productName)`.

#### 32. Every run places a real order — both files

Normal for this practice site. On a real project you'd clean up (e.g. delete the order through the API in `afterAll`).

#### 33. `{ browser }` + `newContext()` not needed — `end_to_end_automation_ecom.spec.js` lines 4–6

This test never opens a second tab or a second user, so `async ({ page }) =>` does the same in one line. (`{ browser }` was needed in the child-window test because you listened on the `context`.) → [Guide → Part 1](GUIDE.md#when-to-use-which)

#### 34. Loops → `filter()` — `end_to_end_automation_ecom.spec.js` lines 26–38 and 107–120

Both loops are correct and good practice. In real tests each can be one statement that also auto-waits — see [Guide → Part 10](GUIDE.md#part-10-working-with-lists-and-tables) and Test E below.

#### 35. `toBeVisible()` before `toHaveText()` — `end_to_end_automation_ecom.spec.js` lines 94–96

Harmless, but `toHaveText()` already retries until the toast has that text. One assertion is enough.

#### 36. `tbody.waitFor()` — `end_to_end_automation_ecom.spec.js` line 108

It works, and your comment (count has no auto-wait) is right. The hidden reason it works: an **empty** `<tbody>` has no size, so Playwright treats it as *not visible* and `waitFor()` keeps waiting until rows arrive (tested). `await rows.first().waitFor()` (as in `webAPI`) says what you mean more clearly. → [Guide → Part 7](GUIDE.md#5-waiting-before-a-count-loop)

#### 37. Second API context — `webAPI_1.spec.js` line 31

You create one context in `beforeAll` and another in the test. One shared `let apiContext` is enough. → [API_TESTING.md → Part 7](API_TESTING.md#part-7-the-full-test-cleaned-up)

#### 38. `content-type` header — `webAPI_1.spec.js` line 43

`data: { ... }` already sends JSON with `content-type: application/json` (tested). Only `authorization` is needed.

#### 39. `waitFor()` before `toHaveText()` — `webAPI_1.spec.js` line 72

`toHaveText()` retries for 5 s on its own. Delete line 72.

#### 40. Unused `productName` — `webAPI_1.spec.js` line 11

Declared, never used (the order payload uses the product **id**). Delete it, or keep it if you plan to check the product name on the details page.

#### 41. Small stuff

- `webAPI` line 14: `tets.beforeEach()` → `test.beforeEach()`.
- `end_to_end` line 17: `NameOfCard` → `nameOnCard` (variables start lowercase in JavaScript by convention).
- `end_to_end` line 108 comment: "doesnot" → "does not".
- `end_to_end` comment block at lines 133–146: the 5 ways to find "Checkout" are all valid — the guide ranks them: [Guide → Part 3 §11](GUIDE.md#11-many-ways-to-find-the-same-element--which-one).

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
| end_to_end 23 | `networkidle` is "not guaranteed to work" — right, and the docs discourage it |
| end_to_end 43, 47 | `isVisible()` has no auto-wait (tested) |
| end_to_end 51 | No wait needed for the checkout page because `click()` auto-waits |
| end_to_end 80 | Without an exact match, "British Indian Ocean Territory" is also picked (tested) |
| end_to_end 86–91 | Place Order is an `<a>`, so `getByRole("button")` won't find it (tested) |
| end_to_end 108 | `count()` has no auto-wait |
| end_to_end 109–110 | `rows` is a locator (no await), `count()` gives a number |
| end_to_end 124–126 | `toHaveValue` needs a locator and a form field; reading `textContent()` first gives up auto-waiting |
| end_to_end 128–129 | `.a .b` = parent → child; `.a.b` = one element with both classes |
| end_to_end 131 | `fill()` sets everything at once; `pressSequentially()` presses key by key |
| webAPI 5 | The JS object is turned into JSON when sent |
| webAPI 9 | `let` because the value is assigned later (a `const` needs its value immediately) |
| webAPI 26 | No `await` for `loginResponseJson.token` — it's already a plain object |


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

### Test E — E-commerce: place an order through the UI and find it in My Orders

Based on `end_to_end_automation_ecom.spec.js` → "ecom_automation". Same steps and the same selectors as your passing test, except where marked **NEW**.

> Not run against the real site (it couldn't be reached from the test environment). The **NEW** techniques (`filter`, `has`, waiting behaviour) were tested on local pages. Your original stays the "known good" version — if a line here fails, compare it with yours.

```js
const { test, expect } = require("@playwright/test");

test("@Web place an order and find it in My Orders", async ({ page }) => {   // NEW: { page } is enough
  const productName = "IPHONE 13 PRO";

  // ---- Login ----
  await page.goto("https://rahulshettyacademy.com/client/#/auth/login");
  await page.locator("#userEmail").fill(process.env.ECOM_EMAIL);          // NEW: no password in the file
  await page.locator("#userPassword").fill(process.env.ECOM_PASSWORD);
  await page.locator("#login").click();

  // ---- Add the product to the cart ----
  // NEW: filter instead of a loop. `has` checks the NAME (<b>), not the whole card text.
  const productCard = page.locator(".card-body")
    .filter({ has: page.locator("b", { hasText: productName }) });
  await productCard.locator(".fa-shopping-cart").click();                 // auto-waits for the products to load
  await expect(page.locator(".toast-message")).toContainText("Product Added To Cart");

  // ---- Cart → Checkout ----
  await page.locator("button[routerlink*='cart']").click();
  await expect(page.locator(`h3:has-text('${productName}')`)).toBeVisible();   // waits for the cart page
  await page.locator("text=Checkout").click();                            // or getByRole("button", { name: "Checkout" })

  // ---- Payment details ----
  await page.locator(".payment__types .payment__type--cc").click();       // credit card
  const textBoxes = page.locator('input[type="text"]');                   // positional — see item 28
  await textBoxes.nth(0).fill("9999 8888 7777 6666");                     // card number
  const expiry = page.locator("select.input.ddl");                        // 2 <select>s with both classes
  await expiry.first().selectOption("05");                                // month
  await expiry.last().selectOption("12");                                 // year
  await textBoxes.nth(1).fill("123");                                     // CVV
  await textBoxes.nth(2).fill("Souvik Mandal");                           // name on card
  await page.locator('input[name="coupon"]').fill("rahulshettyacademy");
  await page.getByRole("button", { name: "Apply Coupon" }).click();
  await expect(page.getByText("* Coupon Applied")).toBeVisible();

  // ---- Country (auto-suggest box) ----
  const country = page.getByRole("textbox", { name: "Select Country" });
  await country.pressSequentially("ind", { delay: 150 });                 // key by key → suggestions appear
  await page.locator(".ta-results button").filter({ hasText: /^\s*India\s*$/ }).click();  // exactly "India"
  await expect(country).toHaveValue("India");                             // input → toHaveValue

  // ---- Place the order ----
  await page.locator("a.btnn").click();                                   // an <a>, not a <button>
  await expect(page.locator(".toast-title")).toHaveText("Order Placed Successfully");  // NEW: one assertion is enough

  // ---- Read the order id from " | 6ac888aa2be7a4bc2b96bf5a | " ----
  const rawOrderId = await page.locator("td label.ng-star-inserted").textContent();
  const orderId = rawOrderId.split("|")[1].trim();
  console.log(orderId);

  // ---- My Orders → that row → View ----
  await page.locator("button[routerlink='/dashboard/myorders']").click();
  await page.locator("tbody tr")
    .filter({ hasText: orderId })                                        // NEW: replaces the loop + tbody wait
    .getByRole("button", { name: "View" })
    .click();
  await expect(page.locator(".col-text")).toHaveText(orderId);
});
```

The API + UI version of the order check (much shorter) is in [API_TESTING.md → Part 7](API_TESTING.md#part-7-the-full-test-cleaned-up).

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
| **Test E:** `{ browser }` → `{ page }` | No second tab or user needed |
| **Test E:** both loops → `filter()` | Shorter, auto-waits, clear error if not found |
| **Test E:** removed `tbody.waitFor()` and the extra `toBeVisible()` | `click()` / `toHaveText()` already wait |
| **Test E:** kept the positional text boxes | Couldn't check better selectors on the real page — flagged as item 28 |
