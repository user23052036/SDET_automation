// In simple words:

// **`require("@playwright/test")`** — this imports the Playwright testing library into your file,
// the same way you'd import any tool before using it.

// **`{ test, expect }`** — from that library, you're pulling out just two specific things:

// - **`test`** — the function you use to define a test case. Every time you write
// `test('my test name', async () => { ... })`, you're using this.

// - **`expect`** — the function you use to make assertions (i.e., "I expect this element to have this text",
// "I expect this button to be visible"). If the assertion fails, the test fails.
// await expect(page.locator("[style*='block']")).toContainText("Incorrect");

// Think of it like this — if Playwright is a toolbox, this line opens the toolbox and takes out exactly the
// two tools you need: one to *write tests* and one to *check results*.

// if we dont write await then, instructions can be called parallely in js, resulting in code-break
const { test, expect } = require("@playwright/test");

test.only("ecom_test", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("https://rahulshettyacademy.com/client/#/auth/login");

  const email = page.locator("//input[@id='userEmail']");
  const password = page.locator("//input[@id='userPassword']");
  const signIn = page.locator(" //input[@id='login']");
  const cardTitle = (await page).locator(".card-body");

  await email.fill("qnhmtm@gmail.com");
  await password.fill("Kitti001.@");
  await signIn.click();
  await page.waitForLoadState("networkidle");

  //   allTextContents() → has NO auto-waiting. It resolves
  //   immediately with whatever is in the DOM at that exact moment, even if it's empty.

  // getting all card titles
  // await expect(cardTitle).not.toHaveCount(0); // this is to ensure that DOM loads before allTextContents() starts making queries
  const allTitles = await cardTitle.allTextContents(); //  //b[normalize-space()='ADIDAS ORIGINAL']
  console.log(allTitles);
});
