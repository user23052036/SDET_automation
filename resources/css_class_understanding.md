Great observation! That's actually **not one class name with spaces** — those are **multiple separate classes** applied to the same element.

In HTML, a single element can have **many classes at once**, and you separate them with spaces:

```html
class="Y4agH tLoa5 col-12 uni-mt-16 uni-pv-16 uni-pv-8 uni-ph-32 mzjMa rJteP PM45p"
```

This means the button has **10 different classes** applied to it simultaneously:

| Class | Likely purpose |
|---|---|
| `Y4agH` | Some component style |
| `tLoa5` | Another component style |
| `col-12` | Full width (like Bootstrap grid) |
| `uni-mt-16` | Margin top 16px |
| `uni-pv-16` | Padding vertical 16px |
| `uni-pv-8` | Padding override |
| `uni-ph-32` | Padding horizontal 32px |
| `mzjMa` | Auto-generated style |
| `rJteP` | Auto-generated style |
| `PM45p` | Auto-generated style |

Think of it like tags on a product — one item can have many tags.

```html
<!-- Same idea, easier to read -->
<button class="big red rounded full-width">Click me</button>
```

That button has 4 classes: `big`, `red`, `rounded`, `full-width`.

---

**This is also why class selectors are risky for testing** — frameworks like Tailwind, Bootstrap, or CSS Modules auto-generate those jumbled names like `Y4agH` and they change whenever the UI is rebuilt. That's why `data-testid` is always the safer choice for Playwright tests.