This is an important Playwright concept. The easiest way to remember it is:

> **`timeout` = maximum time for the entire test.**
> **`expect` timeout = maximum time for an individual assertion to become true.**

For example, in `playwright.config.js` you might have:

```js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30 * 1000,

  expect: {
    timeout: 5 * 1000
  }
});
```

That means:

* `timeout: 30s` → the **whole test** can run for up to 30 seconds.
* `expect.timeout: 5s` → each `expect()` assertion can wait up to 5 seconds.

---

## 1. `timeout`

Consider:

```js
test('login test', async ({ page }) => {

    await page.goto('https://example.com');

    await page.locator('#username').fill('souvik');

    await page.locator('#password').fill('password');

    await page.locator('#login').click();

});
```

If you configure:

```js
timeout: 30000
```

Playwright gives this **entire test** a maximum of 30 seconds.

So the clock covers:

```text
test starts
    │
    ├── page.goto()
    │
    ├── fill username
    │
    ├── fill password
    │
    ├── click login
    │
    └── assertions
    │
test finishes
```

If the test takes longer than 30 seconds overall, Playwright can terminate it because the **test timeout** has been exceeded.

---

# 2. `expect.timeout`

Now consider:

```js
test('login test', async ({ page }) => {

    await page.goto('https://example.com');

    await page.locator('#dashboard').click();

    await expect(page.locator('#welcome-message'))
        .toBeVisible();

});
```

Suppose:

```js
expect: {
    timeout: 5000
}
```

Playwright will keep checking:

```text
Is #welcome-message visible?
       ↓
     No
       ↓
wait
       ↓
Is #welcome-message visible?
       ↓
     No
       ↓
wait
       ↓
Is #welcome-message visible?
       ↓
     YES
       ↓
assertion passes
```

It can retry that assertion for up to **5 seconds**.

If it never becomes visible:

```text
5 seconds
    ↓
expect() fails
    ↓
test fails
```

---

# The key difference

Imagine:

```js
timeout: 30000,

expect: {
    timeout: 5000
}
```

Your test has a total budget of:

```text
30 seconds
```

while an individual assertion has a waiting period of:

```text
5 seconds
```

Think of it like this:

```text
┌──────────────────────────────────────────────┐
│              TEST TIMEOUT: 30s              │
│                                              │
│  goto()       fill()       click()           │
│    │            │            │               │
│    └────────────┴────────────┴──────┐        │
│                                     │        │
│                            expect() │        │
│                            ┌────────┴───┐    │
│                            │  max 5 sec │    │
│                            └────────────┘    │
│                                              │
└──────────────────────────────────────────────┘
```

So **`expect.timeout` lives inside the overall test timeout**.

---

# One very important distinction

Don't confuse these three things:

### Test timeout

```js
timeout: 30000
```

Controls:

> How long the **entire test** is allowed to run.

---

### Assertion timeout

```js
expect: {
    timeout: 5000
}
```

Controls:

> How long Playwright's `expect()` assertions retry/wait for the expected condition.

For example:

```js
await expect(page.locator('#message')).toBeVisible();
```

---

### Action timeout

There is also:

```js
use: {
    actionTimeout: 10000
}
```

This controls how long individual Playwright actions can wait.

For example:

```js
await page.locator('#login').click();
```

If the button isn't ready/clickable, Playwright can wait according to the **action timeout**.

---

## So you can have all three

```js
export default defineConfig({

    timeout: 30000,

    expect: {
        timeout: 5000
    },

    use: {
        actionTimeout: 10000
    }

});
```

Think of them as:

| Setting          | Controls              | Example                                      |
| ---------------- | --------------------- | -------------------------------------------- |
| `timeout`        | Entire test           | Test must finish within 30s                  |
| `expect.timeout` | Individual `expect()` | Element must become visible within 5s        |
| `actionTimeout`  | Individual actions    | `click()`, `fill()`, etc. can wait up to 10s |

### Simple memory trick

**Test timeout → "How long can my test live?"**

**Action timeout → "How long can my action wait?"**

**Assertion timeout → "How long can my expectation wait for the condition to become true?"**
