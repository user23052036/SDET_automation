# Playwright Quick Reference (JavaScript)

Fast answers for revision. Full explanations are in [GUIDE.md](GUIDE.md); mistakes and corrected tests are in [MY_CODE_REVIEW.md](MY_CODE_REVIEW.md).

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

---

### Actions (all auto-wait, all one element only)

| Code | What it does | await? |
|---|---|---|
| `locator.fill("text")` | Replace field text with "text" | Yes |
| `locator.fill("")` / `locator.clear()` | Empty the field | Yes |
| `locator.type("text")` | **Deprecated** — use `fill()` | Yes |
| `locator.pressSequentially("text")` | Type key by key (doesn't clear) | Yes |
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

### JavaScript bits

| Code | Result |
|---|---|
| `"a@b.com".split("@")` | `["a", "b.com"]` |
| `"a@b.com".split("@")[1]` | `"b.com"` |
| `"  hi  ".trim()` | `"hi"` |
| `const [first] = [1, 2]` | `first = 1` |
| `const { test } = require(...)` | pulls `test` out by name |

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
