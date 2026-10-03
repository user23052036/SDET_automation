## TDD and BDD in QA

### 1. TDD — Test-Driven Development

**TDD means we write the test before writing the actual code.**

The basic idea is:

**Write Test → Write Code → Pass Test → Improve Code**

### Simple example

Suppose we need to create a **login function**.

First, the developer writes a test:

```python
def test_login():
    assert login("admin", "1234") == True
```

At this point, the `login()` function may not even exist.

Then the developer writes the actual login code until the test passes.

So, in TDD:

> **Test comes first, code comes second.**

### Why is TDD useful?

It helps developers:

* find bugs early
* write code that is actually testable
* avoid unnecessary code
* make sure each feature satisfies its expected behavior

---

# 2. BDD — Behavior-Driven Development

**BDD focuses on how the application should behave from the user's/business perspective.**

Instead of focusing mainly on code, we describe the expected behavior in simple language.

BDD commonly uses:

**Given → When → Then**

### Simple example

For a login page:

```text
Given the user is on the login page
When the user enters a valid username and password
Then the user should be logged in successfully
```

Another example:

```text
Given the user is on the login page
When the user enters an incorrect password
Then an error message should be displayed
```

The advantage is that **developers, testers, and business people can all understand the requirement**.

---

## TDD vs BDD

| TDD                                      | BDD                                                  |
| ---------------------------------------- | ---------------------------------------------------- |
| Test-driven development                  | Behavior-driven development                          |
| Mostly focuses on code and functionality | Focuses on user/business behavior                    |
| Test is written before code              | Behavior/scenario is defined before implementation   |
| Mainly used by developers                | Developers, QA, and business teams can work together |
| Usually uses programming languages       | Often uses simple language like Given-When-Then      |

### Easy way to remember

**TDD:**

> "Does my code work correctly?"

**BDD:**

> "Does my application behave correctly for the user?"

### Interview answer

You can say:

> **"TDD means writing tests before writing the actual code. The developer first writes a test, then writes code to make that test pass. BDD is more focused on application behavior from the user's or business perspective. It commonly uses Given, When, and Then to describe scenarios in simple language. TDD mainly focuses on code correctness, while BDD focuses on expected behavior and collaboration between developers, testers, and business teams."**
