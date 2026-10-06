# Playwright Guide (JavaScript)

Revision notes built line by line from your practice files (`first_automation_ecom.spec.js`, `test2.spec.js`, `UIBasics.spec.js`). Simple explanations, use cases and examples — mostly from your own code.

**The notes are 3 files:**

| File | Use it when... |
|---|---|
| **GUIDE.md** (this file) | You want the full explanation of a topic |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | You forgot what a method does, or you're confused between two similar things (e.g. `textContent()` vs `inputValue()`) |
| [MY_CODE_REVIEW.md](MY_CODE_REVIEW.md) | You want to see what was wrong or misleading in your code, and the corrected tests |

**Tip:** press `Ctrl+F` and search for a method name (e.g. `inputValue`) to jump to every place it's explained.

## Contents

- [Part 1: Test Setup and Fixtures](#part-1-test-setup-and-fixtures) — `require`, `test()`, `test.only`, `{ browser }` vs `{ page }`, context, `goto`, headless, `page.pause()`
- [Part 2: Async, Await and Promises](#part-2-async-await-and-promises) — when to write `await` and when not to, `Promise.all`
- [Part 3: Locators and Selectors](#part-3-locators-and-selectors) — `page.locator()`, CSS, XPath, `first()` / `last()` / `nth()`, strict mode
- [Part 4: Actions](#part-4-actions) — `fill`, `type`, `click`, `check`, `uncheck`, `selectOption`, radio buttons, pop-ups
- [Part 5: Reading Data from the Page](#part-5-reading-data-from-the-page) — `textContent`, `inputValue`, `allTextContents`, `isChecked`, `page.title`
- [Part 6: Assertions with expect](#part-6-assertions-with-expect) — `toHaveTitle`, `toContainText`, `toBeChecked`, `toHaveAttribute`, `toHaveCount`, `toBeFalsy` ...
- [Part 7: Waiting and Timing](#part-7-waiting-and-timing) — auto-waiting, `waitFor()`, `waitForLoadState`, why `networkidle` failed
- [Part 8: New Tabs and Child Windows](#part-8-new-tabs-and-child-windows) — `context.waitForEvent("page")`, `Promise.all`, two tabs
- [Part 9: JavaScript Basics Used in Tests](#part-9-javascript-basics-used-in-tests) — destructuring, arrow functions, `split()`, truthy/falsy

---

## "I want to..." quick finder

| I want to... | Use this | Details |
|---|---|---|
| Open a website | `await page.goto(url)` | [Part 1](#part-1-test-setup-and-fixtures) |
| Find an element | `page.locator("selector")` | [Part 3](#part-3-locators-and-selectors) |
| Type into a textbox | `await locator.fill("text")` | [Part 4](#part-4-actions) |
| Click something | `await locator.click()` | [Part 4](#part-4-actions) |
| Tick a checkbox | `await locator.check()` (or `click()`) | [Part 4](#part-4-actions) |
| Untick a checkbox | `await locator.uncheck()` | [Part 4](#part-4-actions) |
| Choose a dropdown option | `await locator.selectOption("Consultant")` | [Part 4](#part-4-actions) |
| Read text of a heading / label / message / link | `await locator.textContent()` | [Part 5](#part-5-reading-data-from-the-page) |
| Read what is typed inside a textbox | `await locator.inputValue()` | [Part 5](#part-5-reading-data-from-the-page) |
| Read text of many elements at once | `await locator.allTextContents()` (wait first!) | [Part 5](#part-5-reading-data-from-the-page), [Part 7](#part-7-waiting-and-timing) |
| Know if a checkbox is ticked (true/false) | `await locator.isChecked()` | [Part 5](#part-5-reading-data-from-the-page) |
| Get the tab title | `await page.title()` | [Part 5](#part-5-reading-data-from-the-page) |
| Pick 1st / last / Nth element from many | `.first()` / `.last()` / `.nth(i)` | [Part 3](#part-3-locators-and-selectors) |
| Check the page title is correct | `await expect(page).toHaveTitle("...")` | [Part 6](#part-6-assertions-with-expect) |
| Check an element contains some text | `await expect(locator).toContainText("...")` | [Part 6](#part-6-assertions-with-expect) |
| Check a checkbox/radio is ticked | `await expect(locator).toBeChecked()` | [Part 6](#part-6-assertions-with-expect) |
| Check an attribute value | `await expect(locator).toHaveAttribute("class", "...")` | [Part 6](#part-6-assertions-with-expect) |
| Wait until an element shows up | `await locator.first().waitFor()` | [Part 7](#part-7-waiting-and-timing) |
| Wait until a list has items | `await expect(locator).not.toHaveCount(0)` | [Part 7](#part-7-waiting-and-timing) |
| Handle a link that opens a new tab | `context.waitForEvent("page")` + click | [Part 8](#part-8-new-tabs-and-child-windows) |
| Cut a piece out of a text | `text.split("@")[1]` | [Part 9](#part-9-javascript-basics-used-in-tests) |
| Run only one test | `test.only(...)` | [Part 1](#part-1-test-setup-and-fixtures) |
| Stop the test and look around (debug) | `await page.pause()` | [Part 1](#part-1-test-setup-and-fixtures) |

---

## The big picture (remember this shape)

```text
browser    → the browser app (Chromium / Firefox / WebKit)
 └─ context  → a fresh, incognito-like profile (its own cookies & storage)
     └─ page   → one tab
         └─ locator → a "pointer" to element(s) on that tab
              ├─ do something   → click(), fill(), check(), selectOption()
              ├─ read something → textContent(), inputValue(), isChecked()
              └─ check something → await expect(locator).toBeChecked()
```

Almost every test follows this order:

1. Get a `page` (directly with `{ page }`, or via `browser → context → page`)
2. `goto` the URL
3. Make locators for the elements you need
4. Do actions (`fill`, `click` ...)
5. Read values or assert with `expect`

---

## The 7 golden rules

1. **`await` everything that talks to the browser** (actions, reading values, `expect(locator/page)` assertions). Do **not** `await` `page.locator()`, `first()`, `last()`, `nth()` — they return instantly. → [Part 2](#part-2-async-await-and-promises)
2. **A locator is a search instruction, not the element.** It is created instantly and only searches the page when you use it. → [Part 3](#part-3-locators-and-selectors)
3. **Form fields (textbox, textarea, dropdown) are read with `inputValue()`; everything else with `textContent()`.** → [Part 5](#part-5-reading-data-from-the-page)
4. **If a locator matches many elements, pick one** with `first()` / `last()` / `nth(i)` before using single-element methods like `click()` or `textContent()` (this is called *strict mode*). → [Part 3](#part-3-locators-and-selectors)
5. **`allTextContents()` does not wait.** Wait for the list first. → [Part 7](#part-7-waiting-and-timing)
6. **Prefer `await expect(...)` checks** over "read a value then compare", because `expect` retries for up to 5 seconds. → [Part 6](#part-6-assertions-with-expect)
7. **`first()` needs brackets.** `first` without `()` is a bug. → [MY_CODE_REVIEW.md](MY_CODE_REVIEW.md#part-1-mistakes-found-in-my-code)

---

## How these notes were checked

- Behaviour was checked against the official Playwright documentation (playwright.dev).
- The tricky claims (e.g. `textContent()` on an input, `allTextContents()` not waiting, strict mode errors, `fill()` clearing text, the `networkidle` problem) were **tested by running small Playwright tests** (Playwright v1.56.0, October 2026) on local copies of similar pages.
- **(likely)** = the best explanation available, but not proven on the real course website (which couldn't be reached from the test environment).
- **Extra** = not in your files, but closely related and worth knowing. Skip on a first read.


---

## Part 1: Test Setup and Fixtures

How a test file starts, how a test is written, where `browser` / `context` / `page` come from, and how to run and debug tests.

---

### 1. Importing Playwright

```js
const { test, expect } = require("@playwright/test");
```

**What it means, in simple words:**

| Part | Meaning |
|---|---|
| `require("@playwright/test")` | Load the Playwright Test library into this file (like opening a toolbox). |
| `{ test, expect }` | From that toolbox, take out only two tools. (This `{ }` syntax is called *destructuring* — see [Part 9](#part-9-javascript-basics-used-in-tests).) |
| `test` | The function you use to **define a test case**. |
| `expect` | The function you use to **check results** (assertions). If an `expect` fails, the test fails. |

> **Extra:** In TypeScript or ES-module projects you will see the same thing written as
> `import { test, expect } from "@playwright/test";` — it does the same job.

**Watch out:** `expect` comes from `@playwright/test`, not from your config file. The commented-out line in your `UIBasics.spec.js` (`require('../playwright.config')`) would not give you `expect`.

---

### 2. Writing a test

```js
test("page playwrite test", async ({ page }) => {
  await page.goto("https://www.google.com/");
  // ...steps...
});
```

| Piece | What it is |
|---|---|
| `test(` | Start defining a test. |
| `"page playwrite test"` | The test's name. It shows up in the report. Keep it unique and readable. |
| `async` | Lets you use `await` inside the function. Needed because browser work is slow (see [Part 2](#part-2-async-await-and-promises)). |
| `({ page })` | Ask Playwright to hand you ready-made objects (called **fixtures**). Here: a `page`. |
| `=> { ... }` | Arrow function — the body of your test. |

#### Anonymous / arrow functions (from your comments)

- A function without a name is called an **anonymous function**.
- `async function () { }` and `async () => { }` do the same job here. The arrow version is shorter, so tests normally use it.

---

### 3. Fixtures — `{ browser }`, `{ context }`, `{ page }`

**Fixture = a ready-made object Playwright creates for you before your test starts and cleans up after it ends.** You ask for one by writing its name inside `({ })`.

| Fixture | What you get |
|---|---|
| `browser` | The browser app that is already launched. You create contexts/pages yourself. |
| `context` | A fresh browser profile (already created for you). |
| `page` | A fresh tab inside a fresh context (already created for you). Most tests only need this. |

You can ask for more than one: `async ({ context, page }) => { ... }`.

#### Way 1 — the long way with `{ browser }` (your test case 3)

```js
test("first playwrite test", async ({ browser }) => {
  const context = await browser.newContext(); // fresh profile: no cookies, no storage
  const page = await context.newPage();       // open a tab in that profile
  await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
});
```

#### Way 2 — the short way with `{ page }` (your test case 4)

```js
test("page playwrite test", async ({ page }) => {
  await page.goto("https://www.google.com/");
});
```

**Both give you a clean tab.** Way 2 just does the first two lines for you.

#### When to use which?

| Use `{ page }` when... | Use `{ browser }` + `newContext()` when... |
|---|---|
| You just need a normal clean tab (most tests). | You want to pass special settings to the context, e.g. `browser.newContext({ viewport: { width: 375, height: 667 } })`. |
| | You want **two separate users/profiles** in one test (two contexts = two separate cookie jars). |

**Need the `context` for new tabs?** You don't have to use `{ browser }` just for that. You can ask for both: `async ({ context, page }) => { ... }`. (Tested — works.) See [Part 8](#part-8-new-tabs-and-child-windows).

#### Your other commented example — this one does NOT work

```js
test("my test", async (fixture) => {   // ✗
  console.log(fixture.browser);
});
```

In plain JavaScript this would be fine, but **Playwright requires the `{ }`**. It reads the names inside `{ }` to decide which fixtures to create. Without them the file doesn't even load (tested):

```text
First argument must use the object destructuring pattern: fixture.browser
```

Correct version:

```js
test("my test", async ({ browser }) => {   // ✓
  console.log(browser);
});
```

---

### 4. `browser.newContext()` and `context.newPage()`

| Method | What it does | Returns | `await`? |
|---|---|---|---|
| `browser.newContext(options?)` | Creates a fresh, incognito-like profile. No cookies, no local storage, no logged-in state. | `BrowserContext` | Yes |
| `context.newPage()` | Opens a new tab in that context. | `Page` | Yes |

**Your comment said** "fresh instance without any cookie, proxy, plugins". Close enough — one small correction: a context does not carry browser extensions ("plugins"). What you *can* customise per context is things like cookies/storage, viewport size, locale, permissions and proxy settings.

---

### 5. `page.goto(url)`

**What it does:** Opens the URL in that tab.
**Waits until:** the page's `load` event by default (all the main resources of the page are loaded). *(Verified in docs.)*
**Needs await:** Yes.

```js
await page.goto("https://rahulshettyacademy.com/client");
```

**Watch out:** "page loaded" does not mean "data from the server has arrived". Single-page apps (like the e-commerce client app) often fetch products *after* `load`. That is why you sometimes need extra waiting — see [Part 7](#part-7-waiting-and-timing).

---

### 6. `test.only` — run just this one

```js
test.only("child window", async ({ browser }) => { ... });
```

- When any test is marked `.only`, Playwright runs **only the `.only` tests** and skips everything else.
- This applies to the **whole run**, not just the file. Right now both `first_automation_ecom.spec.js` ("ecom_test") and `UIBasics.spec.js` ("child window") have `test.only`, so running `npx playwright test` runs only those two tests.
- **Remove `.only` when you're done** — it's easy to forget and then other tests silently stop running.

> **Extra:** `test.skip("name", async ...)` does the opposite — skips that one test.

#### Tags in the test name

Your test is called `"@Web Client App login"`. Words starting with `@` in a title work as **tags**. You can run only tagged tests:

```bash
npx playwright test --grep @Web
```

---

### 7. How tests are run (order and parallel)

Your comment says: tests in the same file run one after another, but different files run in parallel. **That is the default behaviour — but it depends on one config setting:**

| Setting in `playwright.config.js` | Tests inside one file | Different files |
|---|---|---|
| `fullyParallel: false` (or not set) | One after another (in order) | In parallel (on separate workers) |
| `fullyParallel: true` | In parallel too | In parallel |

The config that `npm init playwright` generates usually has `fullyParallel: true`, so check yours.

---

### 8. Headless vs headed

- **Headless** = the browser runs without a visible window. This is the **default**.
- **Headed** = you can see the browser window.

```bash
npx playwright test                              # run all tests (headless)
npx playwright test tests/UIBasics.spec.js       # run one file
npx playwright test --headed                     # see the browser
npx playwright test --debug                      # step through with Playwright Inspector
npx playwright show-report                       # open the HTML report after a run
```

(You can also set `headless: false` inside `use: { }` in `playwright.config.js`.)

---

### 9. `page.pause()` — stop and look around (debugging)

```js
await dropdown.selectOption("Consultant");
await page.pause(); // opens Playwright Inspector so you can see the selected option
```

- **What it does:** Pauses the test and opens the **Playwright Inspector**. You can look at the page, try locators, then click **Resume**.
- **Needs headed mode.** The docs say it requires a headed browser. Run with `--headed` or `--debug`.
- In a normal headless run it does **not** stop — in testing it returned instantly. So it won't hang your headless runs, but it also won't do anything there.
- **Remove it when you're done** debugging.

---

### Recap: Test Setup and Fixtures

- `require("@playwright/test")` gives you `test` (define tests) and `expect` (check results).
- Fixtures are ready-made objects: `browser`, `context`, `page`. Ask for them in `({ })`.
- `{ page }` is the shortcut for `browser.newContext()` + `context.newPage()`.
- `goto` waits for the `load` event — not for data loaded later.
- `test.only` affects the whole run. Remove it after use.
- Headless is the default. Use `--headed` / `--debug` to see things. `page.pause()` only pauses in headed mode.


---

## Part 2: Async, Await and Promises

The single most common source of confusing Playwright errors is a missing (or unnecessary) `await`. This file gives you one clear rule.

---

### 1. Why do we need `await` at all?

Talking to the browser takes time (opening a page, clicking, reading text). JavaScript **does not wait by default** — it starts the job and immediately moves to the next line.

`await` means: **"stop here until this job is finished, then continue."**

#### What actually happens without `await` (tested)

```js
page.locator("#i").fill("not awaited");                 // no await!
console.log(await page.locator("#i").inputValue());     // printed "old" — the fill hadn't happened yet
```

The test then failed with `locator.fill: Test ended.` — the test finished before the fill could complete.

```js
expect(page.locator("#p")).toHaveText("WRONG TEXT");    // no await!
console.log("next line");                               // ran immediately, without waiting for the check
```

So your comment in `first_automation_ecom.spec.js` is basically right: without `await`, steps don't wait for each other and the test breaks. (More precisely, they don't run "in parallel" — JavaScript just starts the job and moves on without waiting for it to finish.)

---

### 2. What is a Promise?

A **Promise** is like an order receipt: "your result is not ready yet, but it will come."

Most Playwright methods return a Promise. A Promise is always in one of 3 states (your comment was correct):

| State | Meaning |
|---|---|
| **pending** | Still working |
| **fulfilled** | Finished successfully — the result is ready |
| **rejected** | Failed (an error) |

`await promise` waits until it is fulfilled and gives you the result (or throws the error if rejected).

```js
console.log(page.title());         // prints: Promise { <pending> }   ← the receipt, not the title
console.log(await page.title());   // prints: LoginPage Practise | Rahul Shetty Academy
```

---

### 3. `async` — the partner of `await`

You can only use `await` inside a function marked `async`. That's why every test looks like:

```js
test("name", async ({ page }) => {
  await page.goto("...");
});
```

---

### 4. THE RULE: what needs `await` and what doesn't

> **Rule: `await` anything that returns a Promise.** In Playwright that means: anything that talks to the browser.

| Thing | Needs `await`? | Why |
|---|---|---|
| `browser.newContext()`, `context.newPage()` | **Yes** | Creates things in the browser |
| `page.goto()`, `page.pause()` | **Yes** | Browser work |
| Actions: `click()`, `fill()`, `type()`, `check()`, `uncheck()`, `selectOption()` | **Yes** | Browser work |
| Reading: `textContent()`, `inputValue()`, `allTextContents()`, `isChecked()`, `page.title()`, `count()` | **Yes** | Has to ask the browser |
| Waiting: `waitFor()`, `page.waitForLoadState()` | **Yes** | Waiting takes time |
| `context.waitForEvent("page")` | **Yes** (or store it and `await` later — see [Part 8](#part-8-new-tabs-and-child-windows)) | Waits for a new tab |
| `Promise.all([...])` | **Yes** | It's a Promise itself |
| `page.locator()`, `.first()`, `.last()`, `.nth()` | **No** | Just builds a search instruction, instantly |
| `expect(locator or page).toXxx()` — e.g. `toBeChecked()`, `toHaveTitle()`, `toContainText()` | **Yes — before `expect`** | These keep retrying in the browser |
| `expect(plainValue).toXxx()` — e.g. `toBeFalsy()`, `toBe()` | **No** (but `await` inside to get the value) | It just compares a value you already have |
| `"text".split("@")`, `console.log()` | **No** | Plain JavaScript |

---

### 5. The `await` + `expect` confusion — clearing it up

Your comment in `UIBasics.spec.js` said:

> "await is used only when there is an action involved ... we don't write await outside expect as this is not an action, it is just an assertion ... but we write await inside expect because it involves an action like isChecked()"

**This is half right and leads to wrong code.** In the same file you wrote `await expect(page.locator("input#terms")).toBeChecked();` — an assertion *with* `await` outside — and that is correct. Here is the real rule:

```js
// 1) Web-first assertion: you give expect a LOCATOR or PAGE.
//    Playwright keeps re-checking the browser (up to 5 s) → it returns a Promise → await OUTSIDE.
await expect(page.locator("input#terms")).toBeChecked();

// 2) Generic assertion: you give expect a PLAIN VALUE (true/false, text, number).
//    It just compares, once, instantly → no Promise → NO await outside.
//    But getting the value talks to the browser → await INSIDE.
expect(await page.locator("input#terms").isChecked()).toBeFalsy();
```

#### How to tell in 2 seconds

Look at what's inside `expect( ... )`:

| Inside `expect( )` is... | Example | Write |
|---|---|---|
| a **locator** or **page** | `expect(page.locator("#terms"))`, `expect(page)` | `await expect(...).toXxx()` |
| a **value** you got from the browser | `expect(await locator.isChecked())` | `expect(await ...).toXxx()` |
| a **plain value** you already have | `expect(titles.length)` | `expect(...).toXxx()` (no await anywhere) |

---

### 6. "'await' has no effect on the type of this expression" (ts 80007)

Your note in `test2.spec.js` is correct:

- `page.locator()` is **synchronous** — it returns a `Locator` object directly, not a Promise.
- So `await page.locator(...)` does nothing, and VS Code warns you.

Same thing in `first_automation_ecom.spec.js`:

```js
const cardTitle = (await page).locator(".card-body");   // works, but the await does nothing
const cardTitle = page.locator(".card-body");           // ✓ cleaner
```

`page` is already a ready object, not a Promise.

**Tip:** That warning is useful. When you see it, you added an unnecessary `await`. When something prints `Promise { <pending> }`, you **forgot** an `await`.

---

### 7. `Promise.all([...])` — start several jobs together and wait for all

```js
const [newpage] = await Promise.all([
  context.waitForEvent("page"),   // job 0: start listening for a new tab
  doclink.click(),                // job 1: click the link that opens it
]);
// result = [Page, undefined]   (click returns nothing → undefined)
```

- `Promise.all` takes an **array of Promises**, starts waiting on all of them, and finishes when **all** are done.
- It returns **one Promise**, which gives you an **array of results in the same order**. You only get that array after `await` (your comment is correct).
- If **any** of them fails, the whole `Promise.all` fails.
- `const [newpage] = ...` takes the first item of that array (array destructuring — see [Part 9](#part-9-javascript-basics-used-in-tests)).

Full explanation of the new-tab case: [Part 8](#part-8-new-tabs-and-child-windows).

---

### 8. Mini self-test (answers below)

Which lines are wrong?

```js
const user = await page.locator("#username");               // A
user.fill("abc");                                           // B
console.log(user.inputValue());                             // C
expect(page.locator("#terms")).toBeChecked();               // D
expect(await page.locator("#terms").isChecked()).toBeTruthy(); // E
const title = await page.title();                           // F
```

<details>
<summary>Answers</summary>

- **A** — unnecessary `await` (locator is sync). Works, but VS Code warns.
- **B** — missing `await`. The fill may not happen before the next line.
- **C** — missing `await`. Prints `Promise { <pending> }`.
- **D** — missing `await` before `expect`. The check is not waited for.
- **E** — ✓ correct.
- **F** — ✓ correct.

</details>

---

### Recap: Async, Await and Promises

- `await` = wait for the browser job to finish.
- `await` anything that returns a Promise (actions, reads, waits, `expect(locator/page)`).
- Don't `await` `page.locator()` / `first()` / `last()` / `nth()`.
- `await expect(locator).toXxx()` vs `expect(await locator.read()).toXxx()` — depends on what's inside `expect()`.
- `Promise.all` = start together, wait for all, results in an array in the same order.


---

## Part 3: Locators and Selectors

How to point Playwright at the element you want.

---

### 1. `page.locator(selector)`

**What it does:** Creates a **locator** — a saved search instruction like "the input whose id is username".
**Returns:** a `Locator` object, **immediately**.
**Needs await:** **No.** It's synchronous. (`await` on it does nothing — that's the ts 80007 warning.)
**Auto-waits:** Not by itself. The search happens later, every time you *use* the locator (click it, read it, assert on it) — and that's when the waiting happens.

```js
const userName = page.locator("input#username");   // nothing is searched yet
await userName.fill("souvikmandal");               // NOW Playwright finds it (and waits for it)
```

#### Why it matters that a locator is "lazy"

- You can create all your locators at the top of the test, even before the page has loaded (you did this in "UI controls" — correct).
- Because the search runs fresh every time, the locator still works after the page changes (e.g. after login, after the list updates).

**Good habit from your code:** store locators in `const` variables at the top and reuse them:

```js
const userName = page.locator("input#username");
const password = page.locator("[type='password']");
const signIn   = page.locator("input#signInBtn");
```

---

### 2. CSS selectors (the ones you used, plus a few useful extras)

Playwright treats the string as **CSS** unless it starts with `//` (then it's XPath).

| Selector | Meaning | Example from your code |
|---|---|---|
| `#id` | element with this id | `#userEmail`, `#userPassword` |
| `tag#id` | this tag with this id | `input#username`, `input#signInBtn`, `input#terms` |
| `.class` | element having this class | `.card-body`, `.radiotextsty`, `.red` |
| `[attr='value']` | attribute equals value exactly | `[type='password']`, `[value='Login']` |
| `[attr*='part']` | attribute **contains** this text | `[style*='block']`, `[href*='documents-request']` |
| `A B` (space) | B anywhere **inside** A | `.card-body b`, `.card-body .card-title a` |
| **Extra:** `A > B` | B **directly** inside A (child only) | `ul > li` |
| **Extra:** `[attr^='start']` | attribute starts with | `[href^='https']` |
| **Extra:** `[attr$='end']` | attribute ends with | `[href$='.pdf']` |
| **Extra:** `tag.class` | this tag with this class | `select.form-control` |

#### Notes on your selectors

- **`input#username`** — An id should be unique on the page, so id-based selectors are the most reliable choice when an id exists (your comment is right).
- **`[style*='block']`** — finds "an element whose `style` attribute contains `block`". It works for the error message (`display: none` → `display: block` when the error shows), but it is **fragile**: any other element with `block` in its style would match too. If the element has a class or id (e.g. `.alert`), prefer that.
- **`.card-body b`** vs **`.card-body`** — `.card-body` gives you the *whole card* (name, price, button text...). `.card-body b` gives only the `<b>` inside it (the product name). Pick the smallest element that holds exactly what you want.

---

### 3. XPath selectors

Playwright automatically treats a selector as XPath when it starts with `//` (or `..`). A leading space like `" //input[@id='login']"` still works (tested), but remove it for tidiness.

| XPath | Meaning | From your code |
|---|---|---|
| `//input[@id='userEmail']` | any `input` whose `id` is exactly `userEmail` | `first_automation_ecom.spec.js` |
| `//button[@id='okayBtn']` | any `button` with id `okayBtn` | `UIBasics.spec.js` |
| `//select[@class='form-control']` | any `select` whose **whole** class attribute is exactly `form-control` | `UIBasics.spec.js` |
| `//a[normalize-space()='iphone X']` | any `a` whose text (spaces cleaned up) is exactly `iphone X` | comment in `test2.spec.js` |
| `//b[normalize-space()='ADIDAS ORIGINAL']` | any `b` with exactly that text | comment in ecom file |
| `//label[2]//span[2]` | the 2nd `label` (among its siblings), then the 2nd `span` inside it | `UIBasics.spec.js` |

#### Things to know

- **`normalize-space()`** removes spaces at the start/end and squeezes multiple spaces into one. Handy because HTML text often has extra spaces/new lines.
- **`@class='form-control'` is an exact match of the whole attribute.** If the element had `class="form-control big"`, it would **not** match (tested: 0 matches), while CSS `.form-control` would. For classes in XPath use `//select[contains(@class,'form-control')]`.
- **Positional XPath like `//label[2]//span[2]` is fragile.** It breaks as soon as a label/span is added or moved. Prefer something meaningful (a class, an id, a value, or the text).
- **Relative vs absolute XPath.** Relative (`//a[...]`) is much better than absolute (`/html/body/div[2]/div/a`). Your comment calls relative XPath "resilient to DOM changes" — it's *more* resilient than absolute XPath, but it still breaks if the text or attribute it relies on changes.

#### CSS or XPath? (general guideline)

| Prefer | When |
|---|---|
| id (`#id`) | An id exists |
| CSS | Class / attribute / "inside" relationships — shorter and easier to read |
| XPath | You need to match by exact text, or go **up** to a parent/ancestor (CSS can't go up) |

---

### 4. When a locator matches MANY elements — strict mode

`.card-body .card-title a` matches 4 product titles. What happens depends on the method:

| Method type | Examples | With 4 matches |
|---|---|---|
| Works on **one** element | `click()`, `fill()`, `textContent()`, `inputValue()`, `innerText()`, `isChecked()`, `waitFor()`, `expect().toBeVisible()`, `expect().toHaveText("one string")`, `expect().toContainText()` | **Error:** `strict mode violation: locator('.card-body .card-title a') resolved to 4 elements` |
| Works on **all** elements | `allTextContents()`, `count()`, `expect().toHaveCount(4)`, `expect().toHaveText([...array...])` | Fine — that's their job |

(All of the above was tested.)

This is called **strict mode**: Playwright refuses to guess which one you meant.

> **Correction to your comment in `test2.spec.js`:** it says `.card-body .card-title` is correct but `.card-body .card-title a` "will not work because it resolves into 4 elements". Actually **both** match 4 elements (one per card). Neither is "wrong" — the real fix is to pick one element with `first()` / `nth()` / `last()` when you use a single-element method.

---

### 5. Picking one: `first()`, `last()`, `nth(i)`

| Method | Picks | Needs await? |
|---|---|---|
| `.first()` | the first match | No (returns a new Locator) |
| `.last()` | the last match | No |
| `.nth(i)` | match number `i`, **counting from 0** | No |

```js
const cardTitle = page.locator(".card-body .card-title a");

await cardTitle.first().textContent();   // "iphone X"      (1st)
await cardTitle.nth(0).textContent();    // "iphone X"      (same as first())
await cardTitle.nth(1).textContent();    // 2nd title
await cardTitle.last().textContent();    // last title

await page.locator(".radiotextsty").last().click();   // last radio label ("User")
```

**Watch out — brackets!** `first` is a function, so it needs `()`:

```js
await cardTitle.first.textContent();     // BUG → TypeError: cardTitle.first.textContent is not a function
await cardTitle.first().textContent();   // ✓
```

(Your `test2.spec.js` line 65 has this bug — see [Code Review → Mistakes](MY_CODE_REVIEW.md#part-1-mistakes-found-in-my-code).)

---

### 6. Extra: chaining locators

Instead of one long selector, you can search inside another locator:

```js
page.locator(".card-body b");                  // one selector string
page.locator(".card-body").locator("b");       // same result, chained
```

Chaining becomes very useful later, e.g. "find the card that contains *zara coat 3*, then click *its* Add to Cart button".

---

### 7. Extra: `count()`

```js
const n = await page.locator(".card-body").count();   // number of matches right now
```

- Returns a number. **Does not wait** — if the list hasn't loaded yet, you get `0` (tested).
- To *check* a count, prefer `await expect(locator).toHaveCount(4)` because it retries.

---

### 8. Extra: Playwright's recommended locators

The official docs recommend "user-facing" locators because they survive HTML changes better. You'll meet them later in the course. (The examples below are generic — check the real labels/text on your page.)

| Locator | Finds by | Example |
|---|---|---|
| `page.getByRole()` | role + accessible name | `page.getByRole("button", { name: "Sign In" })` |
| `page.getByText()` | visible text | `page.getByText("Free Access")` |
| `page.getByLabel()` | the label of a form field | `page.getByLabel("Username")` |
| `page.getByPlaceholder()` | placeholder text | `page.getByPlaceholder("email@example.com")` |

They return normal locators, so `first()`, `click()`, `textContent()` etc. all work the same way.

---

### Recap: Locators and Selectors

- `page.locator()` is instant and lazy — no `await`.
- CSS: `#id`, `.class`, `[attr='v']`, `[attr*='part']`, `A B` (inside).
- XPath starts with `//`; `@class='x'` is an exact whole-attribute match; `normalize-space()` cleans spaces.
- Many matches + single-element method = strict mode error → use `first()` / `last()` / `nth(i)` (0-based, with brackets!).
- `allTextContents()`, `count()`, `toHaveCount()` are meant for many elements.


---

## Part 4: Actions

Typing, clicking, ticking, choosing from dropdowns.

**All actions need `await`.** All actions **auto-wait**: before acting, Playwright waits until the element exists and is ready (visible, enabled, not moving, and — for typing — editable). You do not need to add your own waits before a normal click or fill.

---

### `fill(text)` — type into a textbox (replaces what's there)

| | |
|---|---|
| **What it does** | Puts `text` into an `<input>` / `<textarea>` (or an editable element). **Replaces** any existing text. |
| **Returns** | nothing (`Promise<void>`) |
| **Needs await** | Yes |
| **Use it for** | Almost all typing: usernames, passwords, search boxes |

```js
await userName.fill("souvikmandal");
await password.fill("12dg5s5");
```

**Clearing a field:**

```js
await userName.fill("");      // clears it (the docs mention this)
await userName.clear();       // Extra: same thing, more readable
```

**Watch out — you don't need `fill("")` before `fill("new text")`.** `fill()` already replaces the old value (tested: `fill("rahulshettyacademy")` then `fill("second")` → value is `"second"`). So in `test2.spec.js` this:

```js
await userName.fill("");
await userName.fill("rahulshettyacademy");
```

can simply be:

```js
await userName.fill("rahulshettyacademy");
```

---

### `type(text)` — DEPRECATED (old way of typing)

| | |
|---|---|
| **What it does** | Types `text` key by key **at the cursor**, without clearing the field first. |
| **Status** | **Deprecated.** The docs say: "In most cases, you should use `fill()` instead." |
| **Use instead** | `fill()` normally; `pressSequentially()` if you really need key-by-key typing |

You used it in `UIBasics.spec.js`:

```js
await page.locator("#userPassword").type("Iamking@000");   // works, but deprecated
await page.locator("#userPassword").fill("Iamking@000");   // ✓ use this
```

**Why "doesn't clear" matters (tested):** a field containing `old`, then `type("abc")` → the value became `abcold`. `fill("abc")` would give `abc`.

---

### `pressSequentially(text)` — Extra: type one key at a time

| | |
|---|---|
| **What it does** | Focuses the element and presses each character as a real key (keydown / keypress / keyup). Doesn't clear first. |
| **Use it for** | Fields that react to every key: autocomplete / search suggestions, input masks |
| **Needs await** | Yes |

```js
await page.locator("#country").pressSequentially("ind");   // suggestion list appears as you "type"
```

---

### `click()` — click an element

| | |
|---|---|
| **What it does** | Clicks the element (waits until it's visible, stable and enabled first) |
| **Returns** | nothing (`Promise<void>`) |
| **Needs await** | Yes |

```js
await signIn.click();
await page.locator("input#terms").click();            // ticks the checkbox (it toggles)
await page.locator(".radiotextsty").last().click();   // clicks the "User" radio label
await page.locator("//button[@id='okayBtn']").click(); // clicks "Okay" in the pop-up box
```

**If the locator matches more than one element**, `click()` throws a strict mode error — use `first()` / `last()` / `nth()` (see [Part 3](#part-3-locators-and-selectors)).

---

### `check()` and `uncheck()` — tick / untick a checkbox or radio

| | `check()` | `uncheck()` |
|---|---|---|
| **What it does** | Makes sure it **is** ticked | Makes sure it **is not** ticked |
| **If already in that state** | Does nothing | Does nothing |
| **Works on** | checkbox or radio | checkbox (a radio can't be unticked by clicking) |
| **Needs await** | Yes | Yes |

```js
await page.locator("input#terms").check();
await page.locator("input#terms").uncheck();
```

#### `click()` vs `check()` for checkboxes

- `click()` **toggles**: ticked → unticked → ticked...
- `check()` **sets** it to ticked, no matter what it was.

Tested: `check()` twice → still ticked; then `click()` → unticked.

**Rule of thumb:** to tick, prefer `check()`; to untick, `uncheck()`. Then your test doesn't depend on the starting state.

---

### Radio buttons

A radio button is just a checkbox where only one in the group can be on. You can:

```js
await page.locator(".radiotextsty").last().click();      // click its label text (your way — fine)
await page.locator("input[value='user']").check();       // Extra: tick the radio input itself
```

(The second line assumes the radio's HTML has `value="user"` — inspect the page to confirm the actual value.)

Then verify:

```js
await expect(page.locator(".radiotextsty").last()).toBeChecked();
```

---

### Pop-up boxes (the "Okay" button)

When you choose "User" on the practice page, a pop-up box appears asking you to confirm. That box is **part of the web page (normal HTML)**, so you handle it with a normal locator + click:

```js
await page.locator("//button[@id='okayBtn']").click();
await page.locator("#okayBtn").click();                 // shorter CSS version of the same thing
```

> **Extra:** Real browser pop-ups created with JavaScript `alert()` / `confirm()` are different — you can't click them with a locator. You handle them with `page.on("dialog", (dialog) => dialog.accept());` You'll see this later in the course.

---

### `selectOption(...)` — choose from a `<select>` dropdown

| | |
|---|---|
| **What it does** | Selects an option in a `<select>` element |
| **A plain string matches** | the option's **value** OR its **visible label** (tested both) |
| **Returns** | an array of the selected option values |
| **Needs await** | Yes |
| **Works on** | real `<select>` elements only |

Suppose the HTML is:

```html
<select class="form-control">
  <option value="stud">Student</option>
  <option value="teach">Teacher</option>
  <option value="consult">Consultant</option>
</select>
```

```js
await dropdown.selectOption("Consultant");             // by visible label ✓ (your code)
await dropdown.selectOption("consult");                // by value ✓
await dropdown.selectOption({ label: "Consultant" });  // Extra: explicitly by label
await dropdown.selectOption({ value: "consult" });     // Extra: explicitly by value
await dropdown.selectOption({ index: 2 });             // Extra: 3rd option (0-based)
```

To read back what's selected: `await dropdown.inputValue()` → returns the **value** (`"consult"`), not the label.

> Many modern sites build "dropdowns" out of `<div>`s instead of `<select>`. `selectOption` won't work on those — you click to open them and click the option instead.

---

### Recap: Actions

| Want to... | Use |
|---|---|
| Type into a field | `fill()` (replaces old text) |
| Clear a field | `fill("")` or `clear()` |
| Type key by key | `pressSequentially()` (not `type()` — deprecated) |
| Click | `click()` |
| Tick / untick | `check()` / `uncheck()` (safer than `click()`) |
| Choose dropdown option | `selectOption("label or value")` |
| Click a button in an HTML pop-up box | normal locator + `click()` |

All actions: `await` + auto-wait + one element only (strict mode).


---

## Part 5: Reading Data from the Page

How to get text, typed values, checkbox state and the page title out of the browser.

---

### The comparison table (read this first)

| Method | Reads... | Works on | Returns | Waits for element? | If many matches |
|---|---|---|---|---|---|
| `textContent()` | the text **between the tags** (including hidden text) | any element | `string` (`""` for an `<input>`) | **Yes** | Error (strict mode) |
| `inputValue()` | what is **typed in / selected in** a form field right now | `<input>`, `<textarea>`, `<select>` only — anything else **throws** | `string` | **Yes** | Error (strict mode) |
| `allTextContents()` | `textContent` of **every** match | any elements | `string[]` (array) | **NO** — returns `[]` if nothing is there yet | That's its job |
| `isChecked()` | ticked or not | checkbox / radio (or an element inside its `<label>`) — anything else **throws** | `true` / `false` | **Yes** | Error (strict mode) |
| `page.title()` | the tab title (`<title>` tag) | the page | `string` | — | — |
| **Extra:** `innerText()` | the text **as you see it on screen** | any element | `string` | **Yes** | Error (strict mode) |
| **Extra:** `allInnerTexts()` | `innerText` of every match | any elements | `string[]` | **NO** | That's its job |

All of them need `await`.

---

### Which one do I use? (decision guide)

```text
What do I want to read?
│
├─ Text of a heading / label / link / button / message / paragraph
│     → textContent()
│
├─ What's inside a textbox, password box, textarea, or the selected dropdown value
│     → inputValue()
│
├─ Text of a LIST of elements (all product titles, all rows)
│     → wait first, then allTextContents()
│
├─ Is a checkbox / radio ticked? (true / false)
│     → isChecked()
│
└─ Title of the browser tab
      → page.title()
```

---

### `textContent()`

| | |
|---|---|
| **What it does** | Returns the text that sits **between the opening and closing tags** of one element (and of everything inside it). |
| **Returns** | `string` (can be `null` only in rare cases like the document itself) |
| **Needs await** | Yes |
| **Auto-waits** | Yes — waits until the element exists in the page |
| **Many matches** | Strict mode error → use `first()` / `nth()` / `last()` |

```js
// Error message (a <div>) — from test2.spec.js
console.log(await page.locator("[style*='block']").textContent());
// → "Incorrect username/password."

// Card titles — test2.spec.js
console.log(await cardTitle.first().textContent());   // 1st title
console.log(await cardTitle.nth(1).textContent());    // 2nd title

// Red text in the child window — UIBasics.spec.js
const redText = await newpage.locator(".red").textContent();
```

**Watch out**

- On an `<input>`, it returns `""` (empty) — even if you typed something. Use `inputValue()` for inputs.
- It includes **hidden** text (e.g. inside a `display:none` child). See `innerText()` below if you need only visible text.

---

### `inputValue()`

| | |
|---|---|
| **What it does** | Returns the **current value** of a form field — what the user typed, or the value of the selected dropdown option. |
| **Works on** | `<input>`, `<textarea>`, `<select>` (also a `<label>` connected to one of those) |
| **On anything else** | **Throws:** `Error: Node is not an <input>, <textarea> or <select> element` (tested on a `<div>`) |
| **Returns** | `string` |
| **Needs await** | Yes |
| **Auto-waits** | Yes |

```js
// From your child window test
await userName.fill("rahulshettyacademy");
console.log(await userName.inputValue());   // → "rahulshettyacademy"
console.log(await password.inputValue());   // → the password you filled

// Dropdown: returns the VALUE attribute, not the visible label
await dropdown.selectOption("Consultant");
console.log(await dropdown.inputValue());   // → e.g. "consult" (whatever value="" the option has)
```

---

### Why `textContent()` printed nothing for your username/password

Your test printed:

```text
username using textContent:            ← empty
password using textContent:            ← empty
username using inputValue:  rahulshettyacademy
password using inputValue:  Learning@830$3mK2
```

**The reason is the kind of element, not timing.** Look at the HTML:

```html
<div class="alert">Incorrect username/password.</div>
<!--             ↑ text sits BETWEEN the tags → textContent() reads it -->

<input id="username">
<!-- an <input> has NO closing tag and NO text between tags.
     What you type is stored in the input's "value", not as text.
     → textContent() gives "", inputValue() gives what you typed -->
```

#### Correcting your note at the end of `UIBasics.spec.js`

Your note says textContent() "will return text only when it is attached to the DOM when the page opens; to get text which is typed or altered after the DOM is opened, use inputValue()".

That's **not the real rule**:

- `textContent()` reads the **current** text — even text that changed after the page loaded. (Tested: a paragraph whose text changed 0.8 s after load → `textContent()` returned the new text.) Your own error-message example proves this too: the message only appears after you click Sign In, and `textContent()` read it fine.
- The real rule: **form fields → `inputValue()`; all other elements → `textContent()`**.

#### Correcting the comment in `test2.spec.js` line 35

```js
console.log(await page.locator("[style*='block']").textContent()); // use .inputValue()
```

The comment `// use .inputValue()` is wrong here. The error message is a `<div>`, not an input, so `inputValue()` would **throw**. `textContent()` is the right choice on this line.

---

### `allTextContents()`

| | |
|---|---|
| **What it does** | Returns the `textContent` of **every** element the locator matches, as an array. |
| **Returns** | `string[]`, e.g. `["iphone X", "Samsung Note 8", "Nokia Edge", "Blackberry"]` |
| **Needs await** | Yes |
| **Auto-waits** | **NO.** It takes whatever is on the page at that exact moment. If the list hasn't loaded yet → `[]`. |
| **Many matches** | No problem — designed for it |

Tested: on a page where products appear after 1 second, `allTextContents()` called straight away returned `[]`.

#### Always wait before calling it

```js
// Option 1 — wait for the first item to appear
await cardTitle.first().waitFor();
console.log(await cardTitle.allTextContents());

// Option 2 — assert the list is not empty (retries up to 5 s)
await expect(cardTitle).not.toHaveCount(0);
console.log(await cardTitle.allTextContents());
```

Both were in your `test2.spec.js` — both are correct. More in [Part 7](#part-7-waiting-and-timing).

#### `.card-body` vs `.card-body b` with `allTextContents()`

```js
await page.locator(".card-body").allTextContents();
// → each item is the WHOLE card's text (name + price + button text...)

await page.locator(".card-body b").allTextContents();
// → just the product names (the <b> inside each card)
```

Your `first_automation_ecom.spec.js` uses `.card-body`, so you get the whole card text. If you only want the names, use `.card-body b` (as in your "@Web Client App login" test).

**Tip from the official docs:** if you want to *check* the texts (not just print them), prefer `await expect(locator).toHaveText([...])` because it retries.

---

### `isChecked()`

| | |
|---|---|
| **What it does** | Tells you if a checkbox/radio is ticked |
| **Returns** | `true` / `false` |
| **Works on** | checkbox / radio, or any element inside its `<label>` (e.g. the `.radiotextsty` span — Playwright follows the label to the radio) — otherwise **throws** `Not a checkbox or radio button` (tested) |
| **Needs await** | Yes |

```js
console.log(await page.locator("input#terms").isChecked());          // print true/false
expect(await page.locator("input#terms").isChecked()).toBeFalsy();   // use it in a generic assertion
```

To **check** state, `await expect(locator).toBeChecked()` is usually better because it retries. Use `isChecked()` when you need the true/false value itself (printing it, or an `if`).

---

### `page.title()`

| | |
|---|---|
| **What it does** | Returns the title shown in the browser tab |
| **Returns** | `string` |
| **Needs await** | Yes — without it you print `Promise { <pending> }` |

```js
console.log(await page.title());   // "LoginPage Practise | Rahul Shetty Academy"
```

To check it: `await expect(page).toHaveTitle("LoginPage Practise | Rahul Shetty Academy");`

---

### Extra: `innerText()` vs `textContent()`

| | `textContent()` | `innerText()` |
|---|---|---|
| Hidden child elements | **included** | **left out** |
| CSS like `text-transform: uppercase` | ignored (raw text) | applied (text as you see it) |

Tested on `<div>Hello <span style="display:none">SECRET</span><span style="text-transform:uppercase">world</span></div>`:

```text
textContent() → "Hello SECRETworld"
innerText()   → "Hello WORLD"
```

For most simple elements both give the same result. Use `innerText()` when you want exactly what the user sees.

---

### Reading vs asserting — the matching pairs

If your goal is to **verify** something (not print it), use the `expect` version on the right. It retries, so it's less flaky.

| Read the value | Assert directly (preferred for checks) |
|---|---|
| `await locator.textContent()` | `await expect(locator).toHaveText("full text")` / `toContainText("part")` |
| `await locator.inputValue()` | `await expect(locator).toHaveValue("value")` |
| `await locator.allTextContents()` | `await expect(locator).toHaveText(["a", "b", ...])` |
| `await locator.isChecked()` | `await expect(locator).toBeChecked()` |
| `await page.title()` | `await expect(page).toHaveTitle("...")` |
| `await locator.count()` | `await expect(locator).toHaveCount(n)` |

---

### Recap: Reading Data from the Page

- **Text between tags → `textContent()`. Value of a form field → `inputValue()`.** It's about the element type, not timing.
- `inputValue()` throws on non-form elements. `textContent()` returns `""` on inputs.
- `allTextContents()` does **not** wait — wait first.
- `isChecked()` gives true/false; `toBeChecked()` asserts with retries.
- Everything here needs `await`.


---

## Part 6: Assertions with expect

An **assertion** is a check: "I expect this to be true." If it isn't, the test **fails** at that line.

---

### 1. Two kinds of assertions

| | **Web-first** (auto-retrying) | **Generic** (non-retrying) |
|---|---|---|
| You pass in | a **locator** or the **page** | a **plain value** (true/false, string, number, array) |
| Example | `await expect(locator).toBeChecked()` | `expect(value).toBeFalsy()` |
| Behaviour | Keeps re-checking the browser until it passes or the timeout runs out | Compares **once**, instantly |
| Default timeout | **5 seconds** (from the docs) | none (no waiting) |
| `await` | **Yes — before `expect`** | **No** (but `await` inside to get the value) |
| Typical matchers | `toHaveTitle`, `toHaveText`, `toContainText`, `toBeChecked`, `toHaveAttribute`, `toHaveCount`, `toBeVisible`, `toHaveValue` | `toBe`, `toEqual`, `toBeTruthy`, `toBeFalsy`, `toContain` |

**Prefer web-first assertions** for anything on the page. Because they retry, they handle slow pages without extra waits.

The `await` rule is explained in detail in [Part 2, section 5](#part-2-async-await-and-promises).

---

### 2. Page assertions

#### `toHaveTitle(title)`

**Checks:** the tab title. With a string it must match the **whole** title; use a regular expression for a partial match.

```js
await expect(page).toHaveTitle("LoginPage Practise | Rahul Shetty Academy");  // whole title
await expect(page).toHaveTitle("Google");
await expect(page).toHaveTitle(/Rahul Shetty/);                                // Extra: part of the title (regex)
```

Your comment "if we don't put await the validation step is run before the webpage opening" is the right idea: without `await`, the test doesn't wait for the check to finish.

> **Extra:** `await expect(page).toHaveURL(/shop/)` checks the URL the same way.

---

### 3. Text assertions

#### `toContainText(text)` — text is **somewhere inside**

```js
await expect(page.locator("[style*='block']")).toContainText("Incorrect");
```

- Passes if the element's text **contains** `"Incorrect"` (a part is enough — your comment is right).
- Case-sensitive by default (`{ ignoreCase: true }` exists if you need it).

#### `toHaveText(text)` — **Extra:** the **whole** text must match

```js
await expect(page.locator("[style*='block']")).toHaveText("Incorrect username/password.");  // ✓ whole text
await expect(page.locator("[style*='block']")).toHaveText("Incorrect");                     // ✗ fails (tested)
```

Extra spaces at the start/end are ignored. For a list of elements, you can pass an array:

```js
await expect(cardTitle).toHaveText(["iphone X", "Samsung Note 8", "Nokia Edge", "Blackberry"]);
```

**Rule of thumb:** `toContainText` when you know a key word; `toHaveText` when you know the exact full text.

---

### 4. Checkbox / radio assertions

#### `toBeChecked()`

```js
await expect(page.locator("input#terms")).toBeChecked();
await expect(page.locator("//label[2]//span[2]")).toBeChecked();   // from your "UI controls" test
```

- Passes if the checkbox/radio is ticked (retries up to 5 s).
- **Why your `//label[2]//span[2]` works:** that `span` sits inside the radio's `<label>`. When checking ticked/unticked state, Playwright follows the label to the radio input inside it (tested — passes). Pointing at the label text (`.radiotextsty`) or the input itself is clearer than a positional XPath, though.

**The opposite:**

```js
await expect(page.locator("input#terms")).not.toBeChecked();   // web-first, retries
expect(await page.locator("input#terms").isChecked()).toBeFalsy(); // generic (your version) — also fine
```

---

### 5. Attribute assertions

#### `toHaveAttribute(name, value)`

```js
await expect(page.locator("[href*='documents-request']")).toHaveAttribute("class", "blinkingText");
```

- Checks that the attribute `class` has the value `"blinkingText"`.
- **With a string, the whole attribute value must match.** If the element had `class="blinkingText other"`, this would fail (tested).
- To check just a part, use a regular expression:

```js
await expect(link).toHaveAttribute("class", /blinkingText/);   // ✓ passes even with more classes (tested)
```

> **Extra:** For classes specifically there's `toContainClass("blinkingText")` (works in v1.56 — tested) and `toHaveClass(...)`.
> Other attributes work the same way: `toHaveAttribute("href", /documents-request/)`, `toHaveAttribute("type", "password")`.

---

### 6. Count assertions

#### `toHaveCount(n)` and `.not.toHaveCount(0)`

```js
await expect(cardTitle).toHaveCount(4);        // exactly 4 matches
await expect(cardTitle).not.toHaveCount(0);    // at least one match (retries until items appear)
```

`.not.toHaveCount(0)` is a neat way to **wait until a list has loaded** before `allTextContents()` — see [Part 7](#part-7-waiting-and-timing).

---

### 7. Extra: other web-first assertions you'll use soon

| Assertion | Checks |
|---|---|
| `await expect(locator).toBeVisible()` | element is visible |
| `await expect(locator).toBeHidden()` | element is hidden / not there |
| `await expect(locator).toHaveValue("abc")` | an input's value (the assertion version of `inputValue()`) |
| `await expect(locator).toBeEnabled()` / `toBeDisabled()` | button/input enabled or not |
| `await expect(page).toHaveURL(/shop/)` | current URL |

---

### 8. `.not` — flip any assertion

Put `.not` before the matcher:

```js
await expect(cardTitle).not.toHaveCount(0);
await expect(page.locator("#terms")).not.toBeChecked();
expect(titles.length).not.toBe(0);
```

---

### 9. Generic assertions: `toBeFalsy()`, `toBeTruthy()` and friends

```js
expect(await page.locator("input#terms").isChecked()).toBeFalsy();    // from UIBasics.spec.js
expect(await page.locator("input#terms").isChecked()).toBeTruthy();
```

**Spelling:** it's `toBeTruthy()` — your comment says `toBeTruty()`. With the typo you'd get `Error: expect: Property 'toBeTruty' not found.` (tested).

#### What counts as "falsy" / "truthy"?

| Falsy (`toBeFalsy()` passes) | Truthy (`toBeTruthy()` passes) |
|---|---|
| `false`, `0`, `""` (empty string), `null`, `undefined`, `NaN` | everything else: `true`, `1`, `"abc"`, `[]`, `{}` ... |

**Watch out:** `toBeFalsy()` is loose — `""` and `null` also pass. When you specifically mean `false`, `expect(x).toBe(false)` is stricter.

#### Other generic matchers

| Matcher | Checks | Example |
|---|---|---|
| `toBe(x)` | exactly equal | `expect(redUser).toBe("rahulshettyacademy")` |
| `toEqual(x)` | same content (for arrays/objects) | `expect(titles).toEqual(["a", "b"])` |
| `toContain(x)` | string contains / array includes | `expect(allTitles).toContain("iphone X")` |
| `toBeGreaterThan(n)` | number bigger than | `expect(allTitles.length).toBeGreaterThan(0)` |

---

### 10. Changing the timeout

```js
await expect(locator).toBeVisible({ timeout: 10000 });   // this one assertion: 10 s
```

Or for all assertions, in `playwright.config.js`:

```js
expect: { timeout: 10000 },
```

---

### Recap: Assertions with expect

- `expect(locator or page)` → web-first → **`await expect(...)`**, retries up to 5 s.
- `expect(value)` → generic → **no `await` before `expect`**, compares once.
- `toContainText` = part of text; `toHaveText` = whole text.
- `toHaveAttribute("class", "x")` = whole value; use `/x/` for "contains".
- `.not` flips any assertion. `.not.toHaveCount(0)` = "list has loaded".
- It's `toBeTruthy`, not `toBeTruty`.


---

## Part 7: Waiting and Timing

When Playwright waits for you automatically, when it doesn't, and how to wait correctly.

---

### 1. What waits automatically, and what doesn't

| Waits automatically | Does NOT wait |
|---|---|
| **Actions:** `click()`, `fill()`, `check()`, `uncheck()`, `selectOption()` — wait until the element is there and ready | **`allTextContents()`** / `allInnerTexts()` — take whatever is on the page right now (maybe `[]`) |
| **Single-element reads:** `textContent()`, `inputValue()`, `innerText()`, `isChecked()` — wait until the element exists | **`count()`** — returns the count right now (maybe `0`) |
| **Web-first assertions:** `await expect(locator).toXxx()` — retry for up to 5 s | **Generic assertions:** `expect(value).toXxx()` — compare once |
| `page.goto()` — waits for the `load` event | `page.locator()` — doesn't search at all yet |

All tested: on a page where 4 product titles appear after 1 second:

```text
allTextContents() straight away  → []
first().textContent()            → "iphone X"     (waited for it)
allTextContents() after that     → ["iphone X", "Samsung Note 8", "Nokia Edge", "Blackberry"]
count() straight away            → 0
```

**Simple way to remember:** methods for **one** element wait; methods for **all** elements (`allTextContents`, `count`) don't.

---

### 2. Ways to wait

#### A. `locator.waitFor()` — wait for an element

```js
await cardTitle.first().waitFor();   // waits until the first title is visible
```

| | |
|---|---|
| **Default** | waits until the element is **visible** (tested: `waitFor()` on a hidden element times out) |
| **Other states** | `waitFor({ state: "attached" })` — just present in the HTML, even if hidden<br>`waitFor({ state: "hidden" })` — until it disappears or is hidden<br>`waitFor({ state: "detached" })` — until it's removed from the HTML |
| **Many matches** | Strict mode error → that's why you write `.first().waitFor()`, not `cardTitle.waitFor()` (tested) |
| **Needs await** | Yes |

#### B. `await expect(locator).not.toHaveCount(0)` — wait until a list has items

```js
await expect(cardTitle).not.toHaveCount(0);
console.log(await cardTitle.allTextContents());
```

Retries for up to 5 s until at least one match exists. Works with many matches (no strict-mode problem).

#### C. Any web-first assertion

`await expect(locator).toBeVisible()`, `toHaveText(...)`, `toHaveCount(4)` ... all wait (retry) up to 5 s. Often the assertion you need anyway *is* your wait.

#### D. `page.waitForLoadState(state)` — wait for the page to reach a loading stage

```js
await page.waitForLoadState("networkidle");
```

| State | Means |
|---|---|
| `"domcontentloaded"` | The HTML has been read and the page structure is built |
| `"load"` (default) | The page and its resources (images, styles, scripts) have loaded |
| `"networkidle"` | No network requests for at least 500 ms. **The official docs mark this as DISCOURAGED** for testing — they recommend web-first assertions instead |

**Important rule (from the docs):** if the page has **already** reached that state when you call it, it returns **immediately**.

#### E. Extra: `page.waitForURL(url)` — wait for navigation to a URL

```js
await page.waitForURL(/shop/);   // waits until the URL contains "shop"
```

Useful right after a click that goes to another page.

#### F. Extra: `page.waitForTimeout(ms)` — hard wait (avoid)

```js
await page.waitForTimeout(3000);   // just sleeps 3 s
```

The docs say not to use this in real tests: it is either too short (flaky) or too long (slow). Use A–E instead.

---

### 3. Why `waitForLoadState("networkidle")` didn't work in your child window test

In `UIBasics.spec.js` you wrote:

```js
await signIn.click();
// await page.waitForLoadState("networkidle"); (why this is not working)
await cardTitle.first().waitFor();   // waits until at least one title is visible
```

**Most likely reason (likely — reproduced locally, not on the real site): a timing race.**

```text
1. click Sign In            → the click finishes, but the shop page hasn't started loading yet
2. waitForLoadState(...)    → Playwright looks at the page: still the LOGIN page, and it's idle
                              → "already idle" → returns straight away ✓ (too early!)
3. allTextContents()        → reads the LOGIN page → []
4. ...a moment later        → the shop page starts loading
```

This was reproduced with a small local page that navigates to a shop page shortly after Sign In is clicked:

```text
networkidle resolved while URL was still: .../login
allTextContents() right after:            []
after waitForURL + first().waitFor():     ["iphone X", "Samsung Note 8", "Nokia Edge", "Blackberry"]
```

`waitForLoadState` answers "has **the current page** reached this state?" — not "has the **next** page loaded?". That's the trap.

#### What to do instead

```js
await signIn.click();
await cardTitle.first().waitFor();          // ✓ what you did — waits for the thing you actually need
console.log(await cardTitle.allTextContents());
```

Or, if you want to be explicit about the navigation:

```js
await signIn.click();
await page.waitForURL(/shop/);              // check the real URL of the shop page in your browser
await expect(cardTitle).not.toHaveCount(0);
console.log(await cardTitle.allTextContents());
```

#### Then why did `networkidle` seem to work in the e-commerce tests? (likely)

The e-commerce client app (`/client`) is a single-page app: when you click Login it immediately starts sending requests to the server (login, then the product list). Because the network is busy right away, `networkidle` actually waits for those requests to finish. On the practice login page, the click doesn't keep the network busy right away, so `networkidle` sees "already idle".

Even in your "@Web Client App login" test you used **both** `networkidle` **and** `.first().waitFor()`. That's a good safety net. If you keep only one, keep `.first().waitFor()` (or an `expect`), since it waits for the exact thing you need.

---

### 4. Timeouts — how long does Playwright wait?

| What | Default | Change it in `playwright.config.js` |
|---|---|---|
| Whole test | 30 s | `timeout: 40 * 1000` |
| Each web-first `expect` | 5 s | `expect: { timeout: 10000 }` |
| Each action (`click`, `fill`, `textContent`...) | no own limit — it can use up the remaining test time | `use: { actionTimeout: 10000 }` |

Your comment in `test2.spec.js` says Playwright "will wait for 10 sec as configured by us". That number comes from **your** `playwright.config.js` — open it and check `timeout` / `actionTimeout` / `expect.timeout` to see what you set.

You can also set a timeout for one call:

```js
await cardTitle.first().waitFor({ timeout: 10000 });
await expect(cardTitle).not.toHaveCount(0, { timeout: 10000 });
```

---

### Recap: Waiting and Timing

- One-element methods and web-first assertions wait. `allTextContents()` and `count()` don't.
- Before `allTextContents()`: `await locator.first().waitFor()` **or** `await expect(locator).not.toHaveCount(0)`.
- `waitFor()` waits for **visible** by default; use it on one element (`.first()`).
- `waitForLoadState` only checks the **current** page — right after a click it can return too early. `networkidle` is discouraged by the docs.
- Avoid `waitForTimeout()` (fixed sleeps).
- Defaults: test 30 s, expect 5 s.


---

## Part 8: New Tabs and Child Windows

What to do when clicking a link opens a **new tab** (a "child window").

---

### 1. The problem

The blinking link on the practice page opens in a new tab (it has `target="_blank"`). After the click:

- your `page` variable **still points to the old tab**
- the new tab is a **new `Page` object** that you need to catch

New tabs open inside the same **context**, so you listen on the `context` for a new `"page"` event.

---

### 2. Pattern A — `Promise.all` (your code)

```js
const [newpage] = await Promise.all([
  context.waitForEvent("page"),   // slot 0 → start listening for a new tab → gives the new Page
  doclink.click(),                // slot 1 → click the link → gives undefined (click returns nothing)
]);                               // result = [Page, undefined]   (tested)
```

#### Why both at the same time?

You must **start listening before the tab opens**. If you `await` the click first and only then start listening, the new tab may already be open — the event has already happened, so you'd wait until timeout.

`Promise.all` starts both jobs together and waits for both to finish.

#### Why `const [newpage]`?

`Promise.all` gives an **array** of results in the same order as you listed the jobs. `[newpage]` takes the **first** item (the Page) and ignores the second (`undefined` from `click`). This is array destructuring — see [Part 9](#part-9-javascript-basics-used-in-tests).

---

### 3. Pattern B — the 3-step way (the one the official docs show)

```js
const pagePromise = context.waitForEvent("page");   // 1. start listening (no await yet!) — keep the Promise
await doclink.click();                              // 2. open the new tab
const newPage = await pagePromise;                  // 3. now wait for it and get the Page
```

Your comment calls this the "complicated way" — actually this is the version shown in the official Playwright docs ("Pages" → handling new pages). Both patterns do the same thing and both are correct. Pick the one you find easier to read.

**The key detail in Pattern B:** step 1 has **no `await`**. If you wrote `await context.waitForEvent("page")` first, the test would sit there until it times out, because the click (which opens the tab) never gets to run.

---

### 4. Getting a `context` to listen on

| Your test starts with | How to get the context |
|---|---|
| `async ({ browser }) =>` | `const context = await browser.newContext();` then `const page = await context.newPage();` (your way) |
| `async ({ page }) =>` | **Extra:** ask for it too: `async ({ context, page }) =>` (tested — works), or use `page.context()` |

> **Extra:** If the new tab is opened *by this page* (a popup), you can also listen on the page:
>
> ```js
> const popupPromise = page.waitForEvent("popup");
> await doclink.click();
> const popup = await popupPromise;
> ```

---

### 5. Working with both tabs

There is no "switching" like in Selenium. You simply use the right variable:

```js
const redText = await newpage.locator(".red").textContent();   // read from the NEW tab
await userName.fill(redUser);                                  // userName was made from `page` → OLD tab
```

| To act on... | Use locators from... |
|---|---|
| the original tab | `page.locator(...)` |
| the new tab | `newpage.locator(...)` |

Your locators like `userName` were created from `page`, so they always point to the original tab — even after the new tab opens.

> **Extra:** `context.pages()` gives an array of all open tabs in that context (tested: `2` after opening the child tab). `await newpage.close()` closes the child tab.

---

### 6. Pulling the username out of the red text (`split`)

The red text in the new tab says something like:

```text
Please email us at mentor@rahulshettyacademy.com with below template to receive response
```

Your code, step by step:

```js
const redText = await newpage.locator(".red").textContent();

const redEmail = redText.split("@")[1].split(" ")[0];
const redUser  = redEmail.split(".")[0];
```

| Step | Result |
|---|---|
| `redText.split("@")` | `["Please email us at mentor", "rahulshettyacademy.com with below template to receive response"]` |
| `[1]` | `"rahulshettyacademy.com with below template to receive response"` |
| `.split(" ")` | `["rahulshettyacademy.com", "with", "below", ...]` |
| `[0]` | `"rahulshettyacademy.com"` → stored in `redEmail` |
| `redEmail.split(".")` | `["rahulshettyacademy", "com"]` |
| `[0]` | `"rahulshettyacademy"` → stored in `redUser` |

(Tested with that sentence: domain = `rahulshettyacademy.com`, user = `rahulshettyacademy`.)

**Small naming note:** `redEmail` actually holds the **domain** (`rahulshettyacademy.com`), not the full email. A name like `domain` would make the code easier to read later.

**Watch out:** this depends on the exact sentence. If the text changes (e.g. no space after the email), the split breaks. That's normal for this kind of exercise — just know why it would fail.

More on `split()`: [Part 9](#part-9-javascript-basics-used-in-tests).

---

### 7. Full flow (cleaned up)

```js
test("child window", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("https://rahulshettyacademy.com/loginpagePractise/");

  const userName = page.locator("input#username");
  const doclink = page.locator("[href*='documents-request']");

  // 1. Open the child tab and catch it
  const [newpage] = await Promise.all([
    context.waitForEvent("page"),
    doclink.click(),
  ]);

  // 2. Read from the child tab
  const redText = await newpage.locator(".red").textContent();
  const domain = redText.split("@")[1].split(" ")[0];
  const user = domain.split(".")[0];

  // 3. Use it in the parent tab
  await userName.fill(user);
  console.log(await userName.inputValue());   // "rahulshettyacademy"
});
```

---

### Recap: New Tabs and Child Windows

- New tab = new `Page`. Catch it with `context.waitForEvent("page")`.
- Start listening **before** the click: `Promise.all([...])` or "store the promise, click, then await".
- `Promise.all` result is `[Page, undefined]` → `const [newpage] = ...`.
- Use `newpage.locator()` for the child tab, `page.locator()` for the parent. No switching needed.


---

## Part 9: JavaScript Basics Used in Tests

Only the plain-JavaScript parts that appear in your files, explained simply. (Async/await has its own file: [Part 2](#part-2-async-await-and-promises).)

---

### 1. `const` and `let`

```js
const email = "anshika@gmail.com";
const userName = page.locator("input#username");
```

| Keyword | Can you assign a new value later? | Use for |
|---|---|---|
| `const` | No | Almost everything in tests (locators, fixed values) |
| `let` | Yes | A value you will change later (e.g. a counter in a loop) |

**Rule of thumb:** start with `const`; switch to `let` only if you need to reassign.

---

### 2. Object destructuring — `{ test, expect }`

```js
const { test, expect } = require("@playwright/test");
```

`require(...)` gives back an **object** with many things inside. `{ test, expect }` pulls out just those two, by name, into variables.

It's the short version of:

```js
const playwright = require("@playwright/test");
const test = playwright.test;
const expect = playwright.expect;
```

The same thing happens in test functions:

```js
test("name", async ({ page }) => { ... });   // pulls `page` out of the fixtures object
```

In Playwright tests the `{ }` here is **required**, not optional — Playwright reads those names to know which fixtures to set up. `async (fixture) => fixture.page` fails with "First argument must use the object destructuring pattern" (tested).

**Names must match.** `{ test, expect }` works because the library has things called exactly `test` and `expect`. For example, `{ sign }` from `"node:crypto"` pulls out a function called `sign` — that line in your `UIBasics.spec.js` isn't used anywhere (see [Code Review → Mistakes](MY_CODE_REVIEW.md#part-1-mistakes-found-in-my-code)).

---

### 3. Array destructuring — `const [newpage] = ...`

```js
const [newpage] = await Promise.all([ ... ]);   // result is [Page, undefined]
```

Square brackets pull items out of an **array by position**:

```js
const [a, b] = ["first", "second"];   // a = "first", b = "second"
const [x] = ["first", "second"];      // x = "first" (the rest is ignored)
```

| Brackets | Pulls out by | Used on |
|---|---|---|
| `{ }` | **name** | objects |
| `[ ]` | **position** | arrays |

---

### 4. Functions: normal, anonymous, arrow, async

```js
function greet1() { }           // normal named function
const greet2 = function () { };  // anonymous function (no name of its own), stored in a variable
const greet3 = () => { };        // arrow function — shorter way to write the same idea
const load = async () => { };    // async arrow function — allows `await` inside
```

In tests you pass an **anonymous async arrow function** to `test`:

```js
test("my test", async ({ page }) => {
  // test steps
});
```

As your comment says, `async function () {}` and `async () => {}` do the same job here.

---

### 5. Strings: `split()` and picking pieces

`text.split(separator)` cuts a string at every `separator` and gives you an **array** of the pieces.

```js
"mentor@rahulshettyacademy.com".split("@");   // ["mentor", "rahulshettyacademy.com"]
"a b c".split(" ");                           // ["a", "b", "c"]
"rahulshettyacademy.com".split(".");          // ["rahulshettyacademy", "com"]
```

Then pick a piece with `[index]` (counting from 0):

```js
"mentor@rahulshettyacademy.com".split("@")[0];   // "mentor"
"mentor@rahulshettyacademy.com".split("@")[1];   // "rahulshettyacademy.com"
```

You can **chain** splits — each one works on the result of the previous step:

```js
const domain = redText.split("@")[1].split(" ")[0];
```

Full walkthrough with your real code: [Part 8, section 6](#part-8-new-tabs-and-child-windows).

#### Extra string helpers you'll often need

| Method | Does | Example → result |
|---|---|---|
| `.trim()` | removes spaces/new lines at the start and end | `"  iphone X \n".trim()` → `"iphone X"` |
| `.includes(x)` | does the text contain x? | `"Incorrect password".includes("Incorrect")` → `true` |
| `.toLowerCase()` | all lowercase | `"ZARA COAT 3".toLowerCase()` → `"zara coat 3"` |

`.trim()` is very handy with `textContent()`, because HTML text often has extra spaces.

---

### 6. Arrays: index from 0

```js
const titles = ["iphone X", "Samsung Note 8", "Nokia Edge", "Blackberry"];
titles[0];          // "iphone X"     (first)
titles[1];          // "Samsung Note 8"
titles.length;      // 4
titles.includes("Nokia Edge");   // true
```

This is the same counting as Playwright's `nth()`: `nth(0)` is the first element, `nth(1)` the second.

---

### 7. `console.log` with several values

```js
console.log("username using inputValue: ", await userName.inputValue());
// prints: username using inputValue:  rahulshettyacademy
```

Separate values with commas; they are printed with a space between them. Handy for labelling what you print.

---

### 8. Comments

```js
// one-line comment

/*
   multi-line comment
*/

/**
 * documentation-style comment (often used above functions)
 */
```

---

### 9. Truthy and falsy

In JavaScript, these values count as **false** in a check: `false`, `0`, `""` (empty string), `null`, `undefined`, `NaN`. Everything else counts as **true**.

That's what `toBeFalsy()` / `toBeTruthy()` test — see [Part 6](#part-6-assertions-with-expect).

---

### 10. Extra: `null` and why TypeScript complains

`textContent()` is typed as returning `string | null`. In plain JavaScript you can call `.split()` on it directly. In **TypeScript**, the editor may warn that it "is possibly null". Common fixes:

```ts
const redText = (await newpage.locator(".red").textContent()) ?? "";   // use "" if null
```

You'll need this when you move to `.ts` test files.

---

### Recap: JavaScript Basics Used in Tests

- `const` by default; `let` only when you reassign.
- `{ }` destructuring pulls by **name** (objects); `[ ]` pulls by **position** (arrays).
- `async () => {}` = anonymous async arrow function = what you pass to `test`.
- `split()` → array; `[i]` picks a piece (from 0); you can chain.
- Arrays and `nth()` both count from 0.
