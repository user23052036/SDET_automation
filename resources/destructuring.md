# Understanding `{ browser }` in Playwright Tests

> Part of your Playwright notes — main index: [GUIDE.md](GUIDE.md) · quick lookups: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

When you start with Playwright, you see code like this:

```js
test('my test', async ({ browser }) => {
    // ...
});
```

And you ask: **what are those curly braces `{ }` around `browser` doing?**

The short answer: it's a normal JavaScript feature called **destructuring**. Playwright didn't invent it. This guide builds up to it one small step at a time.

---

## Step 1: An object is a box with labeled items

In JavaScript, an **object** holds values, and each value has a name (a **key**).

```js
const person = {
    name: 'Souvik',
    city: 'Kolkata',
    age: 25
};
```

Think of `person` as a box with three labeled items inside: `name`, `city`, and `age`.

To take one item out, use a dot:

```js
console.log(person.name); // 'Souvik'
console.log(person.city); // 'Kolkata'
```

You probably know this already. Keep it in mind, because everything below builds on it.

---

## Step 2: Destructuring is a shortcut for taking items out

Say you want the `name` in its own variable. The normal way:

```js
const name = person.name;
```

**Destructuring** does the same thing with shorter syntax:

```js
const { name } = person;
```

Both lines mean the same thing:

> "Look inside `person`, find the item called `name`, and put it in a new variable called `name`."

```js
const { name } = person;
console.log(name); // 'Souvik'
```

You can take out more than one item at once:

```js
const { name, city } = person;

console.log(name); // 'Souvik'
console.log(city); // 'Kolkata'
```

**Rule to remember:** when `{ }` appears on the **left** side of `=`, it means "take these items out of the object."

The name inside the braces must match a key in the object. If it doesn't, you get `undefined`:

```js
const { country } = person;
console.log(country); // undefined, because person has no 'country' key
```

---

## Step 3: Using destructuring on a function's input

A function receives input through its **parameters**. Here's a function that takes a whole object:

```js
function greet(person) {
    console.log('Hello ' + person.name);
}

greet({ name: 'Souvik', city: 'Kolkata' });
// Hello Souvik
```

`person` is the whole box, so you use `person.name` to get the name.

You can also destructure **directly in the parameter list**:

```js
function greet({ name }) {
    console.log('Hello ' + name);
}

greet({ name: 'Souvik', city: 'Kolkata' });
// Hello Souvik
```

Here, `{ name }` says:

> "Someone will pass me an object. I only care about its `name` item, so give me that directly."

This is exactly the same idea as Step 2, just placed inside the function's parentheses.

---

## Step 4: With braces vs. without braces

This is the part that usually causes confusion, so here it is side by side.

The same object is passed to both functions:

```js
const box = { name: 'Souvik', city: 'Kolkata' };
```

| You write | What the variable contains |
|---|---|
| `function f(name) { ... }` | `name` = **the whole box**: `{ name: 'Souvik', city: 'Kolkata' }` |
| `function f({ name }) { ... }` | `name` = **only the item inside**: `'Souvik'` |

```js
function withoutBraces(name) {
    console.log(name);
}

function withBraces({ name }) {
    console.log(name);
}

withoutBraces(box); // { name: 'Souvik', city: 'Kolkata' }
withBraces(box);    // 'Souvik'
```

- **Without braces:** the variable is just a label for the whole object. The label can be any word you like.
- **With braces:** you reach inside the object and pull out the item with that exact name.

---

## Step 5: Now look at Playwright

When Playwright runs your test, it calls your function and passes it **one object**. That object holds ready-to-use tools, which Playwright calls **fixtures**.

You can picture that object like this (simplified):

```js
{
    browser: /* a Browser, e.g. Chromium */,
    context: /* a fresh browser session (like an incognito window) */,
    page:    /* a new tab, ready to use */,
    request: /* a tool for sending API calls */
}
```

So when you write:

```js
test('my test', async ({ browser }) => {
    console.log(browser);
});
```

you are doing exactly what you did in Step 3:

> "Playwright, you're passing me an object of fixtures. From it, I only want `browser`."

Need more than one? List them, just like in Step 2:

```js
test('my test', async ({ page, request }) => {
    await page.goto('https://example.com');
});
```

---

## Step 6: In Playwright, the braces are required

In plain JavaScript, you could skip destructuring and use a dot instead. **Playwright doesn't allow that.** This does **not** work:

```js
// ❌ Playwright throws an error
test('my test', async (fixtures) => {
    console.log(fixtures.browser);
});
```

Playwright stops with an error along the lines of *"First argument must use the object destructuring pattern"*.

**Why?** Playwright reads the names inside your `{ }` **before** running the test, to decide which fixtures to create. If you ask for `{ page }`, it opens a page. If you don't ask for `request`, it never builds one. That saves time, but only works if you list the names in braces.

So in Playwright tests, always use the `{ ... }` form.

---

## Step 7: Is `browser` a global variable?

**No.** `browser` exists only inside your test function, like any other function parameter.

```js
test('my test', async ({ browser }) => {
    console.log(browser); // ✅ works, we're inside the function
});

console.log(browser); // ❌ ReferenceError: browser is not defined
```

Each test gets its own copy through its own parameter. If a different test needs `browser`, it asks for it in its own braces.

---

## Step 8: `page` vs `browser`, a common first question

You'll see both of these styles:

**Style A: ask for `page` directly (most common)**

```js
test('open google', async ({ page }) => {
    await page.goto('https://google.com');
});
```

Playwright already created the browser, the session, and the tab for you.

**Style B: ask for `browser` and build the rest yourself**

```js
test('open google', async ({ browser }) => {
    const context = await browser.newContext(); // new session
    const page = await context.newPage();       // new tab

    await page.goto('https://google.com');
});
```

Both open Google. Style B is useful when you need extra control, for example two separate users logged in during the same test. As a beginner, start with **Style A**.

---

## Quick summary

| Code | Meaning |
|---|---|
| `const { name } = person;` | Take `name` out of `person` into its own variable |
| `function f(x)` | `x` is the whole object passed in |
| `function f({ x })` | `x` is only the `x` item from the object passed in |
| `async ({ browser }) => {}` | Take the `browser` fixture out of the object Playwright passes |
| `async ({ page, request }) => {}` | Take two fixtures at once |
| `async (fixtures) => {}` | Plain JS allows it, but **Playwright rejects it** |

**One sentence to remember:**
`{ browser }` means *"from the object Playwright gives my test, take out the item named `browser`."* It's plain JavaScript destructuring, and the variable only exists inside that test.

---

## Try it yourself

Run this in the browser console or with Node, without Playwright:

```js
const fakeFixtures = {
    browser: 'I am the browser',
    page: 'I am the page'
};

function myTest({ browser }) {
    console.log(browser);
}

myTest(fakeFixtures);
```

**Question:** What gets printed?
**Answer:** `I am the browser`

Now change `{ browser }` to `{ page }` and run it again. Then remove the braces entirely and see what prints. Trying these three versions is the quickest way to get comfortable with it.