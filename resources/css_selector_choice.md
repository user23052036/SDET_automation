Looking at your screenshots, here's how to use SelectorsHub to grab selectors for Playwright:

## How SelectorsHub Works

**Step 1 — Inspect the element**
Right-click any element on the page → "Inspect". This highlights it in the Elements panel.

**Step 2 — Read the SelectorsHub panel**
Once an element is selected, SelectorsHub (the tab on the right side of DevTools) automatically generates multiple selector options for that element. In your screenshot for "iphone X", you can see:

| Type                | Selector shown                                               |
| ------------------- | ------------------------------------------------------------ |
| **Rel cssSelector** | `body > app-root:nth-child(1) > app-shop:nth-child(3) > ...` |
| **Rel XPath**       | `//a[normalize-space()='iphone X']`                          |
| **index XPath**     | `'iphone X')[1]`                                             |
| **testRigor Path**  | `"iphone X"`                                                 |
| **jQuery**          | `$("body > app-root:nth-child(1) > ...")`                    |

**Step 3 — Copy and use in Playwright**

The most useful ones for Playwright's `page.locator()`:

```javascript
// Using CSS selector (copy from "Rel cssSelector")
page.locator(".card-body .card-title a");

// Using XPath (copy from "Rel XPath")
page.locator("//a[normalize-space()='iphone X']");

// Using text content (simplest)
page.locator("text=iphone X");

// Using nth() for duplicates (as your comments explain)
page.locator(".card-body .card-title a").nth(0); // first element
page.locator(".card-body .card-title a").first(); // same as nth(0)
```

## Practical Tips

**Prefer "Rel XPath" or "Rel cssSelector"** — these are _relative_ selectors (not absolute paths), so they're more resilient to page structure changes.

**Avoid absolute paths** like `body > app-root:nth-child(1) > ...` — they break the moment the DOM structure changes.

**Click the copy icon** (📋) next to any selector in SelectorsHub to copy it directly to your clipboard.

**Validate first** — type a selector in the SelectorsHub input field and press Enter; it highlights matching elements on the page so you can verify it before putting it in your test.

Your code at line 63 is already applying this correctly:

```javascript
// Gets the text of the first card title link
page.locator(".card-body .card-title a").nth(0).textContent();
```
