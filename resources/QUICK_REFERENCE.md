# Playwright Quick Reference (JavaScript)

Fast answers for revision. Full explanations are in [GUIDE.md](GUIDE.md); API calls in [API_TESTING.md](API_TESTING.md); mistakes and corrected tests are in [MY_CODE_REVIEW.md](MY_CODE_REVIEW.md).

## What's in this file

- [Part A: Cheat Sheet](#part-a-cheat-sheet) — every method on one page: what it does, what it returns, whether it needs `await`
- [Part B: X vs Y Comparisons](#part-b-x-vs-y-comparisons) — the confusing pairs side by side (e.g. `textContent()` vs `inputValue()`)


---

## Part A: Cheat Sheet

**await?** = do you write `await` in front? **Waits?** = does it wait for the element by itself?

---

### Setup

| Code | What it does | await? |
|---|---|---|
| `const { test, expect } = require("@playwright/test");` | Import `test` (define tests) and `expect` (check results) | — |
| `test("name", async ({ page }) => { ... });` | Define a test; get a ready tab | — |
| `test.only("name", ...)` | Run only this test (whole run). Remove afterwards | — |
| `async ({ browser }) =>` | Get the browser; you create context + page | — |
| `async ({ context, page }) =>` | Get both context and page | — |
| `await browser.newContext()` | New clean profile (no cookies) → `BrowserContext` | Yes |
| `await context.newPage()` | New tab → `Page` | Yes |
| `await page.goto(url)` | Open URL, wait for `load` | Yes |
| `await page.pause()` | Pause + open Inspector (headed / `--debug` only) | Yes |
| `test.beforeAll(async () => { ... })` | Run once before the tests in the file (per worker) | — |
| `test.beforeEach(async ({ page }) => { ... })` | Run before every test | — |

---

### Finding elements (all return a `Locator`, instantly)

| Code | Finds | await? |
|---|---|---|
| `page.locator("#id")` | by id | **No** |
| `page.locator("input#username")` | tag + id | **No** |
| `page.locator(".class")` | by class | **No** |
| `page.locator("[type='password']")` | attribute equals | **No** |
| `page.locator("[href*='documents-request']")` | attribute contains | **No** |
| `page.locator(".card-body b")` | `b` inside `.card-body` | **No** |
| `page.locator("//input[@id='userEmail']")` | XPath | **No** |
| `page.locator("//a[normalize-space()='iphone X']")` | XPath by exact text | **No** |
| `locator.first()` | first match | **No** |
| `locator.last()` | last match | **No** |
| `locator.nth(i)` | match `i` (from 0) | **No** |
| `page.locator("select.input.ddl")` | one element with **both** classes (no space) | **No** |
| `page.locator("button[routerlink*='cart']")` | tag + attribute contains | **No** |
| `page.getByRole("button", { name: "Apply Coupon" })` | by role + name (part of name, ignore case) | **No** |
| `page.getByRole("button", { name: "India", exact: true })` | role + **exact** name | **No** |
| `page.getByRole("textbox", { name: "Select Country" })` | textbox by its label / placeholder | **No** |
| `page.getByText("* Coupon Applied")` | by visible text (part, ignore case) | **No** |
| `page.locator("text=Checkout")` | text contains, ignore case (Playwright-only) | **No** |
| `page.locator('text="Checkout"')` | text exactly "Checkout" | **No** |
| `page.locator("h3:has-text('IPHONE 13 PRO')")` | `h3` containing the text (Playwright-only) | **No** |
| `locator.filter({ hasText: "India" })` | keep matches containing the text | **No** |
| `locator.filter({ hasText: /^\s*India\s*$/ })` | keep matches whose whole text is "India" | **No** |
| `locator.filter({ has: page.locator("b", { hasText: "X" }) })` | keep matches that contain that child | **No** |

---

### Actions (all auto-wait, all one element only)

| Code | What it does | await? |
|---|---|---|
| `locator.fill("text")` | Replace field text with "text" | Yes |
| `locator.fill("")` / `locator.clear()` | Empty the field | Yes |
| `locator.type("text")` | **Deprecated** — use `fill()` | Yes |
| `locator.pressSequentially("text")` | Type key by key (doesn't clear) | Yes |
| `locator.pressSequentially("ind", { delay: 150 })` | Same, 150 ms between keys (auto-suggest boxes) | Yes |
| `locator.click()` | Click (toggles checkboxes) | Yes |
| `locator.check()` | Make checkbox/radio ticked | Yes |
| `locator.uncheck()` | Make checkbox unticked | Yes |
| `locator.selectOption("Consultant")` | Choose `<select>` option by value **or** label | Yes |

---

### Reading values

| Code | Returns | Waits? | await? |
|---|---|---|---|
| `page.title()` | tab title (`string`) | — | Yes |
| `locator.textContent()` | text between tags (`string`; `""` on inputs) | Yes | Yes |
| `locator.innerText()` | visible text (`string`) | Yes | Yes |
| `locator.inputValue()` | value of input / textarea / select (`string`); throws on other elements | Yes | Yes |
| `locator.allTextContents()` | text of every match (`string[]`) | **No** | Yes |
| `locator.allInnerTexts()` | visible text of every match (`string[]`) | **No** | Yes |
| `locator.isChecked()` | `true` / `false`; throws if not checkbox/radio | Yes | Yes |
| `locator.count()` | number of matches | **No** | Yes |
| `locator.isVisible()` | `true` / `false` — shown **right now**? | **No** | Yes |

---

### Waiting

| Code | Waits until | await? |
|---|---|---|
| `locator.first().waitFor()` | element is visible (default) | Yes |
| `locator.waitFor({ state: "attached" })` | element is in the HTML (even hidden) | Yes |
| `locator.waitFor({ state: "hidden" })` | element hidden / gone | Yes |
| `expect(locator).not.toHaveCount(0)` | at least one match exists | Yes |
| `page.waitForLoadState("load")` | **current** page fired `load` (returns at once if already) | Yes |
| `page.waitForLoadState("networkidle")` | no network for 500 ms — **discouraged** | Yes |
| `page.waitForURL(/shop/)` | URL matches | Yes |
| `page.waitForTimeout(ms)` | fixed sleep — **avoid** | Yes |

---

### Web-first assertions (retry up to 5 s) — `await expect(...)`

| Code | Passes when |
|---|---|
| `await expect(page).toHaveTitle("Exact title")` | title equals (use `/regex/` for part) |
| `await expect(page).toHaveURL(/shop/)` | URL matches |
| `await expect(locator).toHaveText("Full text")` | whole text equals |
| `await expect(locator).toHaveText(["a", "b"])` | list texts equal, in order |
| `await expect(locator).toContainText("part")` | text contains "part" |
| `await expect(locator).toBeChecked()` | ticked |
| `await expect(locator).not.toBeChecked()` | not ticked |
| `await expect(locator).toHaveAttribute("class", "x")` | attribute equals exactly "x" |
| `await expect(locator).toHaveAttribute("class", /x/)` | attribute contains "x" |
| `await expect(locator).toContainClass("x")` | has class "x" (among others) |
| `await expect(locator).toHaveCount(4)` | exactly 4 matches |
| `await expect(locator).not.toHaveCount(0)` | at least 1 match |
| `await expect(locator).toBeVisible()` | visible |
| `await expect(locator).toHaveValue("abc")` | input value is "abc" |

### Generic assertions (no retry, no `await` before `expect`)

| Code | Passes when |
|---|---|
| `expect(await locator.isChecked()).toBeFalsy()` | value is falsy (`false`, `0`, `""`, `null`, `undefined`, `NaN`) |
| `expect(await locator.isChecked()).toBeTruthy()` | value is truthy (note spelling: Trut**hy**) |
| `expect(x).toBe(y)` | exactly equal |
| `expect(arr).toEqual(["a", "b"])` | same content |
| `expect(arr).toContain("a")` | array includes / string contains |
| `expect(n).toBeGreaterThan(0)` | number bigger |

---

### New tab

```js
const [newpage] = await Promise.all([
  context.waitForEvent("page"),
  link.click(),
]);
// or
const pagePromise = context.waitForEvent("page");   // no await
await link.click();
const newpage = await pagePromise;
```

---

### API (details: [API_TESTING.md](API_TESTING.md))

| Code | What it does | await? |
|---|---|---|
| `const { test, expect, request } = require("@playwright/test");` | import `request` too | — |
| `request.newContext({ ignoreHTTPSErrors: true })` | create an API context | Yes |
| `ctx.post(url, { data: obj, headers: { authorization: token } })` | POST; `data` object → JSON + content-type | Yes |
| `res.ok()` | `true` for 200–299 (**brackets!**) | No |
| `res.status()` | status code, e.g. `201` | No |
| `res.json()` | body → JS object | Yes |
| `res.text()` | body → string (good for debugging) | Yes |
| `await expect(res).toBeOK()` | assert 2xx | Yes |
| `page.addInitScript((v) => localStorage.setItem("token", v), token)` | put the token in the page **before** the app loads — call before `goto` | Yes |

---

### JavaScript bits

| Code | Result |
|---|---|
| `"a@b.com".split("@")` | `["a", "b.com"]` |
| `"a@b.com".split("@")[1]` | `"b.com"` |
| `"  hi  ".trim()` | `"hi"` |
| `const [first] = [1, 2]` | `first = 1` |
| `const { test } = require(...)` | pulls `test` out by name |
| `(await loc.textContent()).trim()` | wait first, **then** trim — brackets needed |
| `a === b` | strict equal (use this, not `==`) |
| `` `h3:has-text('${name}')` `` | template literal — backticks + `${}` |
| `/^\s*India\s*$/` | regex: exactly "India", spaces allowed around it |
| `for (let i = 0; i < n; i++) { ... break; }` | loop 0 … n-1, `break` = stop early |
| `"x".toLowerCase()` | `"x"` in lowercase — compare ignoring case |

---

### Commands

| Command | Does |
|---|---|
| `npx playwright test` | run all tests (headless) |
| `npx playwright test tests/UIBasics.spec.js` | run one file |
| `npx playwright test --headed` | show the browser |
| `npx playwright test --debug` | step through with Inspector |
| `npx playwright test --grep @Web` | run tests with `@Web` in the name |
| `npx playwright show-report` | open last HTML report |
| `npx playwright show-trace test-results/.../trace.zip` | open the trace of a failed test (step-by-step replay) |

---

### Defaults to remember

| Thing | Default |
|---|---|
| Browser mode | headless |
| Test timeout | 30 s |
| `expect` timeout | 5 s |
| `goto` waits for | `load` |
| `waitFor()` waits for | `visible` |
| `nth()` counting | starts at 0 |
| `getByRole` / `getByText` / `text=` / `filter({ hasText })` with a string | "contains", ignoring case (use `exact: true` or a regex for exact) |
| `isVisible()` / `count()` / `allTextContents()` | do **not** wait |


---

## Part B: X vs Y Comparisons

Quick side-by-side answers for "which one do I use?". Each pair ends with a **rule of thumb**. Links point to the full explanation.

### Contents

1. [`textContent()` vs `inputValue()`](#1-textcontent-vs-inputvalue)
2. [`textContent()` vs `allTextContents()`](#2-textcontent-vs-alltextcontents)
3. [`textContent()` vs `innerText()`](#3-textcontent-vs-innertext)
4. [`isChecked()` vs `toBeChecked()`](#4-ischecked-vs-tobechecked)
5. [`toHaveText()` vs `toContainText()`](#5-tohavetext-vs-tocontaintext)
6. [`await expect(...)` vs `expect(await ...)`](#6-await-expect-vs-expectawait-)
7. [`fill()` vs `type()` vs `pressSequentially()`](#7-fill-vs-type-vs-presssequentially)
8. [`click()` vs `check()` / `uncheck()`](#8-click-vs-check--uncheck)
9. [`first()` vs `first` vs `nth(0)` vs `last()`](#9-first-vs-first-vs-nth0-vs-last)
10. [`{ browser }` vs `{ page }`](#10--browser--vs--page-)
11. [browser vs context vs page](#11-browser-vs-context-vs-page)
12. [`waitForLoadState` vs `waitFor()` vs `expect().not.toHaveCount(0)`](#12-waitforloadstate-vs-waitfor-vs-expectnottohavecount0)
13. [`page.locator()` (no await) vs `locator.textContent()` (await)](#13-pagelocator-no-await-vs-locatortextcontent-await)
14. [CSS vs XPath](#14-css-vs-xpath)
15. [`toHaveAttribute("class", "x")` vs `/x/` vs `toContainClass("x")`](#15-tohaveattributeclass-x-vs-x-vs-tocontainclassx)
16. [`selectOption` by label vs by value](#16-selectoption-by-label-vs-by-value)
17. [`Promise.all` vs the 3-step pattern](#17-promiseall-vs-the-3-step-pattern)
18. [`test()` vs `test.only()`](#18-test-vs-testonly)
19. [`toBeTruthy()` vs `toBeFalsy()` vs `toBe(false)`](#19-tobetruthy-vs-tobefalsy-vs-tobefalse)
20. [`isVisible()` vs `toBeVisible()` vs `waitFor()`](#20-isvisible-vs-tobevisible-vs-waitfor)
21. [`toHaveText()` vs `toHaveValue()`](#21-tohavetext-vs-tohavevalue)
22. [`getByRole()` vs `getByText()` vs `locator("css")`](#22-getbyrole-vs-getbytext-vs-locatorcss)
23. [`text=X` vs `text="X"` vs `:has-text('X')`](#23-textx-vs-textx-vs-has-textx)
24. [`.a .b` vs `.a.b`](#24-a-b-vs-ab)
25. [Loop with `nth(i)` vs `filter()`](#25-loop-with-nthi-vs-filter)
26. [`==` vs `===`](#26--vs-)
27. [`res.ok` vs `res.ok()`, and `res` vs `await res.json()`](#27-resok-vs-resok-and-res-vs-await-resjson)
28. [`beforeAll` vs `beforeEach`](#28-beforeall-vs-beforeeach)
29. [UI login vs API login + `addInitScript`](#29-ui-login-vs-api-login--addinitscript)

---

### 1. `textContent()` vs `inputValue()`

| | `textContent()` | `inputValue()` |
|---|---|---|
| Reads | text **between the tags** | the **value** of a form field (what's typed / selected) |
| Works on | any element | only `<input>`, `<textarea>`, `<select>` |
| On an `<input>` | returns `""` (empty) | returns what you typed ✓ |
| On a `<div>` / `<span>` / `<a>` | returns its text ✓ | **throws an error** |
| On a `<select>` | text of **all** options joined together | the **value** of the selected option ✓ |

```js
await userName.fill("rahulshettyacademy");
await userName.textContent();   // ""                      ✗ wrong tool for inputs
await userName.inputValue();    // "rahulshettyacademy"    ✓

await page.locator(".alert").textContent();   // "Incorrect username/password."  ✓
await page.locator(".alert").inputValue();    // Error: Node is not an <input>, <textarea> or <select> element
```

**Rule of thumb:** *Can the user type in it or pick from it?* → `inputValue()`. *Otherwise* → `textContent()`.
It's about the **type of element**, not about when the text appeared. → [Guide → Part 5](GUIDE.md#part-5-reading-data-from-the-page)

---

### 2. `textContent()` vs `allTextContents()`

| | `textContent()` | `allTextContents()` |
|---|---|---|
| For | **one** element | **all** matching elements |
| Returns | `string` | `string[]` (array) |
| Waits for element? | **Yes** | **No** — may return `[]` |
| If locator matches many | strict mode error → use `first()`/`nth()` | fine |

```js
await cardTitle.first().textContent();   // "iphone X"
await cardTitle.allTextContents();       // ["iphone X", "Samsung Note 8", ...]  (after waiting!)
```

**Rule of thumb:** one item → `textContent()`; a list → wait, then `allTextContents()`. → [Guide → Part 5](GUIDE.md#part-5-reading-data-from-the-page), [Guide → Part 7](GUIDE.md#part-7-waiting-and-timing)

---

### 3. `textContent()` vs `innerText()`

| | `textContent()` | `innerText()` |
|---|---|---|
| Hidden child text | included | left out |
| CSS (e.g. uppercase) | ignored | applied |
| Gives you | raw text in the HTML | text as the user sees it |

```text
<div>Hello <span style="display:none">SECRET</span><span style="text-transform:uppercase">world</span></div>
textContent() → "Hello SECRETworld"
innerText()   → "Hello WORLD"
```

**Rule of thumb:** usually the same; use `innerText()` when you care about what's *visible*. → [Guide → Part 5](GUIDE.md#part-5-reading-data-from-the-page)

---

### 4. `isChecked()` vs `toBeChecked()`

| | `isChecked()` | `toBeChecked()` |
|---|---|---|
| Is a... | read method | web-first assertion |
| Returns | `true` / `false` | nothing — passes or fails the test |
| Retries? | No — answers once | Yes — up to 5 s |
| Written as | `await locator.isChecked()` | `await expect(locator).toBeChecked()` |

```js
console.log(await terms.isChecked());                  // print it / use in an if
expect(await terms.isChecked()).toBeFalsy();           // generic assertion on the value
await expect(terms).toBeChecked();                     // assertion with retries ✓ preferred for checks
await expect(terms).not.toBeChecked();
```

**Rule of thumb:** need the true/false **value** → `isChecked()`. Want to **verify** → `toBeChecked()`. → [Guide → Part 6](GUIDE.md#part-6-assertions-with-expect)

---

### 5. `toHaveText()` vs `toContainText()`

| | `toHaveText("x")` | `toContainText("x")` |
|---|---|---|
| Passes when | the **whole** text equals `x` (outer spaces ignored) | the text **contains** `x` somewhere |
| `"Incorrect"` vs element text `"Incorrect username/password."` | ✗ fails | ✓ passes |

**Rule of thumb:** know the exact full text → `toHaveText`; know a key word → `toContainText`. → [Guide → Part 6](GUIDE.md#part-6-assertions-with-expect)

---

### 6. `await expect(...)` vs `expect(await ...)`

| Inside `expect( )` | Write | Example |
|---|---|---|
| a **locator** or **page** | `await expect(...)` | `await expect(page.locator("#terms")).toBeChecked();` |
| a **value** read from the browser | `expect(await ...)` | `expect(await page.locator("#terms").isChecked()).toBeFalsy();` |

**Rule of thumb:** `await` goes wherever the Promise is. Web-first assertion = Promise → `await` outside. `isChecked()` = Promise → `await` inside. → [Guide → Part 2](GUIDE.md#part-2-async-await-and-promises)

---

### 7. `fill()` vs `type()` vs `pressSequentially()`

| | `fill()` | `type()` | `pressSequentially()` |
|---|---|---|---|
| Clears existing text first? | **Yes** (replaces) | No — types at cursor | No |
| How | sets the value in one go | key by key | key by key |
| Status | ✓ use this | **deprecated** | ✓ use when you need key-by-key |
| Field with `old`, then `"abc"` | `abc` | `abcold` (tested) | `abcold` (tested — same as `type()`) |

**Rule of thumb:** always `fill()`. Use `pressSequentially()` only for fields that react to each key (autocomplete). Never `type()`. → [Guide → Part 4](GUIDE.md#part-4-actions)

---

### 8. `click()` vs `check()` / `uncheck()`

| | `click()` | `check()` | `uncheck()` |
|---|---|---|---|
| On a checkbox | **toggles** (on↔off) | makes it **on** | makes it **off** |
| If already in target state | still toggles | does nothing | does nothing |

**Rule of thumb:** for checkboxes, `check()` / `uncheck()` — your test won't depend on the starting state. → [Guide → Part 4](GUIDE.md#part-4-actions)

---

### 9. `first()` vs `first` vs `nth(0)` vs `last()`

| Code | Meaning |
|---|---|
| `locator.first()` | first match ✓ |
| `locator.first` | **BUG** — that's the function itself, not called → `TypeError: ... is not a function` |
| `locator.nth(0)` | first match (same as `first()`) |
| `locator.nth(1)` | second match (counts from 0) |
| `locator.last()` | last match |

None of them need `await` — they just return a new locator. → [Guide → Part 3](GUIDE.md#part-3-locators-and-selectors)

---

### 10. `{ browser }` vs `{ page }`

| | `async ({ browser }) =>` | `async ({ page }) =>` |
|---|---|---|
| You get | the browser | a ready clean tab |
| Extra lines needed | `const context = await browser.newContext();`<br>`const page = await context.newPage();` | none |
| Use when | you need custom context settings, or 2 separate users | most tests |

Need the context for new tabs but want the short way? `async ({ context, page }) =>`. → [Guide → Part 1](GUIDE.md#part-1-test-setup-and-fixtures)

---

### 11. browser vs context vs page

| | Real-life picture | Created by |
|---|---|---|
| **browser** | the Chrome app | Playwright (fixture) |
| **context** | an incognito window — own cookies & logins | `browser.newContext()` |
| **page** | a tab in that window | `context.newPage()` |

Two contexts don't share cookies (two different users). Two pages in one context do (same user, two tabs). → [Guide → Part 1](GUIDE.md#part-1-test-setup-and-fixtures)

---

### 12. `waitForLoadState` vs `waitFor()` vs `expect().not.toHaveCount(0)`

| | `page.waitForLoadState("networkidle")` | `locator.first().waitFor()` | `await expect(locator).not.toHaveCount(0)` |
|---|---|---|---|
| Waits for | the **current page** to reach a load state (`load` / `networkidle`) | **one element** to be visible | **at least one** match to exist |
| Trap | returns at once if the current page is already in that state (e.g. right after a click, before the next page starts loading) | strict mode → use `.first()` | — |
| Docs say | `networkidle` is **discouraged** | ✓ | ✓ |

**Rule of thumb:** wait for **the thing you need** (element / list), not for "the network". → [Guide → Part 7](GUIDE.md#part-7-waiting-and-timing)

---

### 13. `page.locator()` (no await) vs `locator.textContent()` (await)

| | `page.locator("#x")` | `locator.textContent()` |
|---|---|---|
| Talks to the browser? | No — just builds a search instruction | Yes |
| Returns | `Locator` instantly | a Promise that gives the text later |
| `await`? | No (VS Code warns "await has no effect") | **Yes** |

→ [Guide → Part 2](GUIDE.md#part-2-async-await-and-promises)

---

### 14. CSS vs XPath

| | CSS | XPath |
|---|---|---|
| Looks like | `input#username`, `.card-body b`, `[type='password']` | `//input[@id='userEmail']`, `//a[normalize-space()='iphone X']` |
| Match by text | not in plain CSS | ✓ |
| Go up to a parent | ✗ | ✓ |
| Class match | `.form-control` = has this class | `@class='form-control'` = whole attribute exactly |
| Readability | shorter | longer |

**Rule of thumb:** id → CSS → XPath (only when you need text or parent). → [Guide → Part 3](GUIDE.md#part-3-locators-and-selectors)

---

### 15. `toHaveAttribute("class", "x")` vs `/x/` vs `toContainClass("x")`

| Element has `class="blinkingText other"` | Result |
|---|---|
| `toHaveAttribute("class", "blinkingText")` | ✗ fails (whole value must match) |
| `toHaveAttribute("class", /blinkingText/)` | ✓ passes |
| `toContainClass("blinkingText")` | ✓ passes |

(All tested.) → [Guide → Part 6](GUIDE.md#part-6-assertions-with-expect)

---

### 16. `selectOption` by label vs by value

For `<option value="consult">Consultant</option>`:

| Code | Works? |
|---|---|
| `selectOption("Consultant")` | ✓ (matches the label) |
| `selectOption("consult")` | ✓ (matches the value) |
| `selectOption({ label: "Consultant" })` | ✓ label only |
| `selectOption({ value: "consult" })` | ✓ value only |

And `inputValue()` on the select returns the **value** (`"consult"`). → [Guide → Part 4](GUIDE.md#part-4-actions)

---

### 17. `Promise.all` vs the 3-step pattern

```js
// Promise.all
const [newPage] = await Promise.all([context.waitForEvent("page"), doclink.click()]);

// 3-step (shown in the official docs)
const pagePromise = context.waitForEvent("page");   // no await here!
await doclink.click();
const newPage = await pagePromise;
```

Same result. Both start listening **before** the click. → [Guide → Part 8](GUIDE.md#part-8-new-tabs-and-child-windows)

---

### 18. `test()` vs `test.only()`

| | `test()` | `test.only()` |
|---|---|---|
| Runs | normally | **only** the `.only` tests run — in the whole run, all files |
| Leave it in? | yes | no — remove after debugging |

→ [Guide → Part 1](GUIDE.md#part-1-test-setup-and-fixtures)

---

### 19. `toBeTruthy()` vs `toBeFalsy()` vs `toBe(false)`

| Value | `toBeTruthy()` | `toBeFalsy()` | `toBe(false)` |
|---|---|---|---|
| `true` | ✓ | ✗ | ✗ |
| `false` | ✗ | ✓ | ✓ |
| `""`, `0`, `null`, `undefined` | ✗ | ✓ | ✗ |
| `"abc"`, `1`, `[]` | ✓ | ✗ | ✗ |

**Rule of thumb:** for `isChecked()` results either works; `toBe(false)` / `toBe(true)` is the strictest. → [Guide → Part 6](GUIDE.md#part-6-assertions-with-expect)

---

### 20. `isVisible()` vs `toBeVisible()` vs `waitFor()`

| | `await loc.isVisible()` | `await expect(loc).toBeVisible()` | `await loc.waitFor()` |
|---|---|---|---|
| Is a... | read method | web-first assertion | wait |
| Waits? | **No** — answers right now (tested: `false` for an element that appeared 0.7 s later) | Yes, retries up to 5 s | Yes, until visible |
| Gives you | `true` / `false` | pass / fail | nothing (continues when ready) |
| Use for | an `if` ("is the pop-up there right now?") | **checking** something is shown | waiting before something that doesn't wait (`count()`, `allTextContents()`) |

→ [Guide → Part 5](GUIDE.md#part-5-reading-data-from-the-page), [Guide → Part 7](GUIDE.md#part-7-waiting-and-timing)

---

### 21. `toHaveText()` vs `toHaveValue()`

| | `toHaveText("x")` | `toHaveValue("x")` |
|---|---|---|
| Checks | text between the tags | value of a form field |
| Use on | `.col-text`, `.toast-title`, headings, cells | the country `<input>`, any textbox / select |
| On the wrong element | input → fails (no text) | div → `Error: Not an input element` (tested) |

Both need a **locator** — not a string you already read. → [Guide → Part 6](GUIDE.md#part-6-assertions-with-expect)

---

### 22. `getByRole()` vs `getByText()` vs `locator("css")`

| | `getByRole("button", { name: "X" })` | `getByText("X")` | `locator("css")` |
|---|---|---|---|
| Finds by | role + accessible name | visible text | HTML structure / attributes |
| Default text match | contains, ignore case | contains, ignore case | — |
| Breaks when | the button's text changes | the text changes | classes / layout change |
| Trap | `<a>` without `href` styled as a button is **not** a button (0 matches, tested) | matches *any* element with that text | auto-generated classes |

**Rule of thumb:** `getByRole` first; `getByText` for messages; CSS when the element has no good role/text (e.g. `a.btnn`). → [Guide → Part 3](GUIDE.md#part-3-locators-and-selectors)

---

### 23. `text=X` vs `text="X"` vs `:has-text('X')`

| Selector | Matches (tested on `Checkout now`, `CHECKOUT`) |
|---|---|
| `text=Checkout` | contains, ignore case → 2 |
| `text="Checkout"` | exactly "Checkout", case-sensitive → 0 |
| `button:has-text('Checkout')` | `button`s containing it, ignore case → 2 |

All three are Playwright-only (not in SelectorsHub / DevTools). → [Guide → Part 3](GUIDE.md#part-3-locators-and-selectors)

---

### 24. `.a .b` vs `.a.b`

| Selector | Means | Your example |
|---|---|---|
| `.card-body .card-title` (space) | `.card-title` **inside** `.card-body` — two elements | product titles |
| `.input.ddl` (no space) | **one** element with both classes | the expiry `<select>`s |

→ [Guide → Part 3](GUIDE.md#part-3-locators-and-selectors)

---

### 25. Loop with `nth(i)` vs `filter()`

```js
// Loop
await rows.first().waitFor();
const n = await rows.count();
for (let i = 0; i < n; i++) {
  if ((await rows.nth(i).locator("th").textContent()).trim() === orderId) {
    await rows.nth(i).getByRole("button", { name: "View" }).click();
    break;
  }
}

// filter — same thing
await rows.filter({ hasText: orderId }).getByRole("button", { name: "View" }).click();
```

| | Loop | `filter()` |
|---|---|---|
| Needs a wait first | yes | no (click auto-waits) |
| Not found | silent, fails later | clear timeout on that line |
| Exact match | you decide (`===`) | contains → use a regex if needed |

→ [Guide → Part 10](GUIDE.md#part-10-working-with-lists-and-tables)

---

### 26. `==` vs `===`

| | `1 == "1"` | `1 === "1"` |
|---|---|---|
| Result | `true` (converts types) | `false` (no conversion) |

**Rule of thumb:** always `===`. → [Guide → Part 9](GUIDE.md#part-9-javascript-basics-used-in-tests)

---

### 27. `res.ok` vs `res.ok()`, and `res` vs `await res.json()`

| Code | What it is | Result |
|---|---|---|
| `expect(res.ok).toBeTruthy()` | the function itself | **always passes**, even on 404 (tested) ✗ |
| `expect(res.ok()).toBeTruthy()` | calls it | real check ✓ |
| `res.status()` | on the **response** | `201` ✓ |
| `(await res.json()).status()` | on the **JSON object** | `TypeError: ... is not a function` ✗ |
| `(await res.json()).token` | a field of the JSON | the token ✓ |

→ [API_TESTING.md → Part 4](API_TESTING.md#part-4-reading-the-response)

---

### 28. `beforeAll` vs `beforeEach`

| | `test.beforeAll` | `test.beforeEach` |
|---|---|---|
| Runs | once (per worker) before the file's tests | before **every** test |
| Gets `{ page }`? | no (there's no single test page yet) — use `request.newContext()` or `{ browser }` / `{ request }` | yes |
| Use for | API login → token | open the start page |

→ [API_TESTING.md → Part 5](API_TESTING.md#part-5-hooks-and-sharing-values-between-them)

---

### 29. UI login vs API login + `addInitScript`

| | UI login (`end_to_end...spec.js`) | API login (`webAPI_1.spec.js`) |
|---|---|---|
| How | fill email, password, click Login | `post()` to `/auth/login` → token → `addInitScript` puts it in `localStorage` |
| Speed | slow (page loads) | fast |
| Tests the login page? | yes | no |
| Order that matters | — | `addInitScript` **before** `goto` (after `goto`, the first load misses the token — tested) |

**Rule of thumb:** test the login screen once with the UI; everywhere else, log in through the API. → [API_TESTING.md → Part 6](API_TESTING.md#part-6-logging-the-browser-in-with-a-token)
