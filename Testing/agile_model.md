For a QA interview, you should understand **Agile and Scrum as a complete system**, not as separate definitions.

# 1. What is Agile?

**Agile is a way of developing software in small, frequent steps instead of building the entire product at once.**

In Agile, the team:

**Plan → Build → Test → Get feedback → Improve → Repeat**

For example, suppose we are building an e-commerce website.

Instead of spending 8 months building the whole website and testing it at the end, we might do:

* Sprint 1 → Login and registration
* Sprint 2 → Product search
* Sprint 3 → Shopping cart
* Sprint 4 → Payment
* Sprint 5 → Order tracking

Each part is developed and tested, and feedback can be incorporated along the way.

### Main idea of Agile

> **Build small pieces, test them, get feedback, and continuously improve.**

Agile is particularly useful when requirements can change frequently.

---

# 2. What is Scrum?

**Scrum is one specific framework used to follow Agile principles.**

Think of it like this:

> **Agile = overall approach**
> **Scrum = one popular way of implementing Agile**

Scrum divides development into fixed periods called **Sprints**.

A Sprint is usually **1–4 weeks** long.

For example:

```text
Product
   ↓
Sprint 1 → Build + Test
   ↓
Sprint 2 → Build + Test
   ↓
Sprint 3 → Build + Test
   ↓
Working Product
```

---

# 3. What is a Sprint?

A **Sprint is a fixed period during which the team works on selected tasks and produces a usable increment of the product.**

For example:

> Sprint duration = 2 weeks

During those two weeks, the team might work on:

* Login
* Forgot password
* Logout

At the end of the Sprint, these features should be developed and tested.

---

# 4. What is a Product Backlog?

The **Product Backlog is the complete list of work that may need to be done for the product.**

It can contain:

* New features
* Bug fixes
* Improvements
* Technical work
* Requirements

Example:

```text
Product Backlog

1. User registration
2. Login
3. Forgot password
4. Product search
5. Shopping cart
6. Payment
7. Order tracking
8. Fix payment bug
```

The Product Backlog can keep changing as requirements and priorities change.

---

# 5. What is a Sprint Backlog?

The **Sprint Backlog is the list of work selected from the Product Backlog for the current Sprint.**

For example:

```text
Product Backlog
      ↓
Select important tasks
      ↓
Sprint Backlog

1. Login
2. Forgot password
3. Logout
```

So remember:

**Product Backlog = all planned work**

**Sprint Backlog = work selected for this Sprint**

---

# 6. Product Owner

The **Product Owner** represents the customer's/business side.

Their main responsibility is to make sure the team is building the **right product**.

They:

* Decide what is important
* Prioritize the Product Backlog
* Clarify requirements
* Communicate with stakeholders
* Explain what the business needs

### Example

Suppose the business says:

> "Payment is more important than adding a new color theme."

The Product Owner may prioritize payment higher in the backlog.

### Easy way to remember:

> **Product Owner = What should we build and what is most important?**

---

# 7. Scrum Master

The **Scrum Master helps the team follow Scrum and removes obstacles that are preventing the team from working effectively.**

They are **not simply the team's manager**.

For example, suppose:

> The testing team cannot test because they don't have access to the test environment.

The Scrum Master may help coordinate with the appropriate people to get that issue resolved.

They also help with Scrum ceremonies and make sure the team understands Scrum practices.

### Easy way to remember:

> **Scrum Master = Helps the team work effectively and removes obstacles.**

---

# 8. Development Team

The **Development Team** is the people who actually build the product.

Depending on the organization, this may include:

* Developers
* QA/Testers
* Automation Engineers
* Designers
* Other technical specialists

In modern Scrum terminology, these people are generally part of the broader **Developers** account­ability within the Scrum Team.

---

# 9. Scrum Team

A Scrum Team consists of:

**Product Owner + Scrum Master + Developers**

They work together to deliver the product.

A QA tester is normally part of the Scrum Team rather than being completely separate from it.

---

# 10. Daily Scrum

The **Daily Scrum** is a short daily meeting, usually **15 minutes**.

The team discusses progress and what needs attention.

Traditionally, people often answer:

1. What did I do yesterday?
2. What will I do today?
3. Is anything blocking me?

However, the actual purpose is broader: **inspect progress toward the Sprint Goal and adjust the plan if necessary.**

### Example

A QA tester might say:

> "Yesterday I tested the login feature. Today I'll test forgot-password functionality. I'm blocked because the API for password reset is not available."

The team can then address the problem.

---

# 11. Sprint Planning

At the **beginning of the Sprint**, the team decides:

> **What should we work on during this Sprint, and how will we approach it?**

The Product Owner explains priorities, and the Developers decide what work they can realistically take into the Sprint.

---

# 12. Sprint Review

At the **end of the Sprint**, the team shows the completed work to stakeholders and gets feedback.

Example:

> The team demonstrates the new payment feature to the Product Owner and business stakeholders.

They may say:

> "The payment works, but we also need UPI support."

That feedback can influence future backlog items.

---

# 13. Sprint Retrospective

The **Retrospective** is about the team's **process**, not primarily about demonstrating the product.

The team asks:

> What went well?

> What went wrong?

> What can we improve in the next Sprint?

Example:

The team realizes:

> "QA receives builds too late, so testing gets rushed."

The team might decide:

> "Developers should provide testable builds earlier."

This is an important Agile concept: **continuous improvement**.

---

# 14. User Story

A **User Story** describes a requirement from the user's perspective.

A common format is:

> **As a [user], I want [feature], so that [benefit].**

Example:

> As a customer, I want to reset my password so that I can access my account if I forget it.

The Product Backlog is often made up of User Stories along with bugs, technical work, etc.

---

# 15. Acceptance Criteria

**Acceptance Criteria define the conditions that must be satisfied for a User Story to be considered acceptable.**

Example:

User Story:

> As a customer, I want to reset my password.

Acceptance Criteria:

```text
1. User can enter their registered email.
2. User receives a reset link.
3. Reset link expires after a specified time.
4. User can create a new password.
5. User sees a success message.
```

For a QA, acceptance criteria are very important because they help define **what needs to be tested**.

---

# 16. Definition of Done (DoD)

**Definition of Done is the team's agreed standard for when a piece of work is truly complete.**

For example:

A story is considered Done only when:

* Code is completed
* Code review is completed
* Testing is completed
* Critical bugs are fixed
* Acceptance criteria are satisfied
* Required documentation is completed

So:

**Acceptance Criteria = requirements for a particular story**

**Definition of Done = team's overall standard for calling work complete**

---

# 17. Epic

An **Epic is a large feature or requirement that is too big to complete in one Sprint.**

For example:

> **Epic: Online Shopping**

This could be divided into smaller stories:

```text
Epic: Online Shopping

    ↓
User registration
    ↓
Product search
    ↓
Shopping cart
    ↓
Payment
    ↓
Order tracking
```

---

# 18. Bug / Defect

A **bug** is a problem where the actual behavior does not match the expected behavior.

Example:

Expected:

> User enters correct password → Login successful.

Actual:

> User enters correct password → "Invalid password."

That's a defect.

In Agile, bugs can be added to the backlog and prioritized along with other work.

---

# 19. User Story → Task

A User Story can be broken into smaller tasks.

Example:

**User Story:**

> As a customer, I want to log in.

Tasks might be:

```text
1. Design login page
2. Develop login API
3. Implement frontend
4. Write unit tests
5. Perform functional testing
6. Perform automation testing
```

---

# Agile Example From a QA Perspective

Imagine your company is developing a food-delivery application.

### Sprint 1

Requirement:

> User should be able to log in.

The team:

**Sprint Planning**
→ Select Login story

**Development**
→ Developer builds login

**QA**
→ Tester tests valid login, invalid login, empty fields, password masking, etc.

**Daily Scrum**
→ Team discusses progress/blockers

**Sprint Review**
→ Demonstrate login

**Retrospective**
→ Discuss what could be improved

Then Sprint 2 starts with the next set of work.

---

# Agile vs Waterfall

This is a very common interview question.

### Waterfall

Waterfall follows a relatively **sequential approach**.

```text
Requirements
     ↓
Design
     ↓
Development
     ↓
Testing
     ↓
Deployment
```

Usually, one phase is substantially completed before the next phase begins.

Suppose requirements were finalized in January.

Development happens afterward.

Testing happens near the end.

If the customer says during testing:

> "Actually, we need the payment system to work differently."

Changing the requirement can be expensive and disruptive.

---

### Agile

Agile works in **short iterations**.

```text
Sprint 1
Plan → Develop → Test → Feedback

Sprint 2
Plan → Develop → Test → Feedback

Sprint 3
Plan → Develop → Test → Feedback
```

Requirements can be reprioritized and adjusted as the product evolves.

---

# Main Differences

| Waterfall                                        | Agile                                          |
| ------------------------------------------------ | ---------------------------------------------- |
| Sequential                                       | Iterative/incremental                          |
| Requirements usually defined upfront             | Requirements can evolve                        |
| Testing usually happens after development phases | Testing happens continuously within iterations |
| Customer feedback often comes later              | Frequent feedback                              |
| Changes can be expensive                         | Changes are generally easier to incorporate    |
| Releases are often less frequent                 | Frequent/incremental releases are common       |
| Teams may work in phase-oriented handoffs        | Cross-functional collaboration is emphasized   |

---

# Most Important Terms to Remember for a QA Interview

You don't need to memorize 30 definitions. Understand this flow:

```text
Product Owner
      ↓
Product Backlog
      ↓
Sprint Planning
      ↓
Sprint Backlog
      ↓
Sprint
      ↓
Development + Testing
      ↓
Daily Scrum
      ↓
Working Increment
      ↓
Sprint Review
      ↓
Sprint Retrospective
      ↓
Next Sprint
```

And the roles:

**Product Owner → prioritizes the product work**

**Scrum Master → helps the team follow Scrum and removes impediments**

**Developers/Team → build and test the product**

**QA → verifies quality, identifies defects, and helps ensure requirements are met**

### One interview-ready answer

> **"Agile is a software development approach where we develop and deliver software in small iterations and continuously take feedback. Scrum is a framework used to implement Agile. In Scrum, the work is maintained in a Product Backlog, and the team selects items for a Sprint during Sprint Planning. The Product Owner prioritizes the backlog, the Scrum Master helps the team follow Scrum and removes impediments, and the development team builds and tests the product. During the Sprint, there is a Daily Scrum to discuss progress and blockers. At the end, we have a Sprint Review to demonstrate the work and a Retrospective to discuss improvements. Unlike Waterfall, where development follows a more sequential process and testing generally comes later, Agile involves continuous development, testing, feedback, and adaptation."**
