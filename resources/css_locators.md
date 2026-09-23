# Playwright CSS Locators — Beginner's Guide

## What Are Locators?

In Playwright, a **locator** is how you tell the test *which element on the page* you want to interact with (click, type, read text, etc.). Think of it like giving directions — you need to describe the element precisely enough that Playwright can find exactly the right one.

CSS Selectors are one of the most common ways to write locators in Playwright.

---

## 1. Locating by ID

Every HTML element can have a unique `id` attribute. This is the **most reliable** selector because IDs are meant to be unique on a page.

**HTML Example:**
```html
<button id="submit-btn">Submit</button>
<input id="username" type="text" />
```

**CSS Selector syntax:**
```
tagname#id     →   button#submit-btn
#id            →   #submit-btn       (shorthand, works the same)
```

**Playwright usage:**
```js
await page.locator('button#submit-btn').click();
await page.locator('#username').fill('myuser');
```

> ✅ **Best choice** when an ID is available — it's unique and stable.

---

## 2. Locating by Class

HTML elements often have `class` attributes for styling. You can target them using a dot (`.`) prefix.

**HTML Example:**
```html
<div class="error-message">Invalid credentials</div>
<button class="btn primary">Login</button>
```

**CSS Selector syntax:**
```
tagname.class     →   div.error-message
.class            →   .error-message    (shorthand)
```

**Playwright usage:**
```js
await page.locator('div.error-message').isVisible();
await page.locator('.btn').click();
```

> ⚠️ **Be careful** — class names are often reused on multiple elements. If more than one element shares a class, use a more specific selector (combine with tagname or parent traversal below).

---

## 3. Locating by Any Attribute

Sometimes an element has neither a clean `id` nor a unique `class`, but it has other attributes like `name`, `placeholder`, `type`, `data-testid`, etc. You can target any attribute using square bracket `[ ]` notation.

**HTML Example:**
```html
<input type="email" placeholder="Enter email" />
<button data-testid="login-button">Login</button>
<input name="password" type="password" />
```

**CSS Selector syntax:**
```
[attribute='value']     →   [type='email']
                            [data-testid='login-button']
                            [name='password']
```

**Playwright usage:**
```js
await page.locator("[type='email']").fill('test@example.com');
await page.locator("[data-testid='login-button']").click();
await page.locator("[name='password']").fill('secret123');
```

> 💡 **Pro tip:** `data-testid` attributes are specifically added by developers for testing purposes — always prefer them when available, as they won't change due to design updates.

---

## 4. Traversing from Parent to Child

Sometimes multiple elements look alike, but they live inside different parent containers. You can **narrow down** your selector by walking from a parent element to a specific child inside it.

**HTML Example:**
```html
<div class="login-form">
  <button class="btn">Submit</button>
</div>

<div class="signup-form">
  <button class="btn">Submit</button>   <!-- same class! -->
</div>
```

Without parent traversal, `page.locator('.btn')` would match **both** buttons. You can be specific:

**CSS Selector syntax:**
```
parenttagname >> childtagname
```

**Playwright usage:**
```js
// Targets the Submit button ONLY inside .login-form
await page.locator('.login-form >> button').click();

// Or using the CSS child/descendant combinator (also valid):
await page.locator('.login-form button').click();
```

> 📌 The `>>` in Playwright means "look inside this parent for this child". It's Playwright's way of chaining selectors.

---

## 5. Locating by Text Content

Sometimes the simplest thing is to find an element by what it **says** on screen. Playwright has a special `text=` locator for this.

**HTML Example:**
```html
<button>Sign In</button>
<a href="/home">Go to Dashboard</a>
<p>Welcome back, Souvik!</p>
```

**Locator syntax:**
```
text='exact text here'
```

**Playwright usage:**
```js
await page.locator("text='Sign In'").click();
await page.locator("text='Go to Dashboard'").click();

// Or use the more modern getByText (recommended in newer Playwright):
await page.getByText('Sign In').click();
await page.getByText('Welcome back').click();  // partial match also works
```

> ✅ **Great for buttons, links, and labels** where the text is stable and unlikely to change.

---

## Quick Reference Cheat Sheet

| Scenario | CSS Selector | Playwright Example |
|---|---|---|
| Element has an ID | `#myId` or `tag#myId` | `page.locator('#myId')` |
| Element has a class | `.myClass` or `tag.myClass` | `page.locator('.myClass')` |
| Match any attribute | `[attr='value']` | `page.locator("[name='email']")` |
| Parent → Child | `parent >> child` | `page.locator('.form >> button')` |
| By visible text | `text='...'` | `page.locator("text='Login'")` |

---

## Selector Priority (Best to Least Preferred)

1. **`data-testid` attribute** — Added for testing, never changes with redesigns
2. **ID (`#id`)** — Unique, reliable
3. **Text (`text=`)** — Human readable, good for buttons/links
4. **Attribute (`[attr='val']`)** — Good fallback for forms
5. **Class (`.class`)** — Use with caution, often not unique
6. **Parent → Child traversal** — Use to disambiguate when needed

---

## Full Example: Login Test

```js
const { test, expect } = require('@playwright/test');

test('User can log in', async ({ page }) => {
  await page.goto('https://example.com/login');

  // By attribute (name)
  await page.locator("[name='username']").fill('testuser');

  // By ID
  await page.locator('#password').fill('mypassword123');

  // By text
  await page.locator("text='Sign In'").click();

  // Verify we landed on dashboard (by class inside a parent)
  await expect(page.locator('.dashboard >> h1')).toHaveText('Welcome!');
});
```

---

## Summary

- Use **`#id`** when an element has a unique ID — it's the most stable.
- Use **`.class`** carefully — classes are often shared across elements.
- Use **`[attribute='value']`** for any HTML attribute like `name`, `type`, `placeholder`, or `data-testid`.
- Use **`parent >> child`** to narrow down elements that look the same but live in different sections.
- Use **`text='...'`** to click buttons or links by what they say on screen.

---

Great real-world example! Here's how every strategy from your notes applies to that exact button:

```js
// 1. BY ID — best option here, it's unique
await page.locator('#otp-login-btn').click();
await page.locator('button#otp-login-btn').click();

// 2. BY CLASS — works but risky, it has many classes
await page.locator('.Y4agH').click();
await page.locator('button.Y4agH').click();
// ⚠️ avoid this — those class names look auto-generated and will break easily

// 3. BY ATTRIBUTE — great options here!
await page.locator("[data-testid='btn-signup']").click();   // ✅ best attribute choice
await page.locator("[data-test='btn-signup']").click();     // also works
await page.locator("[type='button']").click();              // too generic, matches many buttons

// 4. BY TEXT
await page.locator("text='Send code'").click();
// Modern Playwright way:
await page.getByText('Send code').click();

// 5. PARENT >> CHILD (if this button is inside a form/div)
await page.locator('.some-parent-form >> button').click();
```

---

**For this specific button, the priority order would be:**

```js
// 🥇 Best — data-testid exists, use it
await page.locator("[data-testid='btn-signup']").click();

// 🥈 Also great — ID is present and unique
await page.locator('#otp-login-btn').click();

// 🥉 Good fallback — text is clear
await page.locator("text='Send code'").click();

// ❌ Avoid — class names like "Y4agH" are auto-generated by CSS frameworks
//    they change whenever the UI is rebuilt
```

The `data-testid` wins here because developers specifically put it there **for testing** — that's its only job, so it won't disappear when someone redesigns the button.