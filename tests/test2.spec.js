const { test, expect } = require("@playwright/test");

test("new_test_1", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("https://rahulshettyacademy.com/loginpagePractise/");

  const userName = page.locator("input#username");
  const password = page.locator("[type='password']");
  const signIn = page.locator("input#signInBtn");
  const cardTitle = page.locator(".card-body .card-title a");

  // getting title
  console.log(await page.title());

  // validate the title 'LoginPage Practise | Rahul Shetty Academy'
  await expect(page).toHaveTitle("LoginPage Practise | Rahul Shetty Academy");

  // to locate any element in the page (it can identify css selectors)
  // best choice is when an ID is available, its unique, so easily, located
  await userName.fill("souvikmandal"); // type is depreciated

  await password.fill("12dg5s5");

  // for accepting the terms and conditions
  await page.locator("input#terms").click();

  // clicking on the sign-in button
  await signIn.click();

  // getting the error message
  // when no error message then: style="display: none;"
  // else: style="display: block;"
  // playwright will wait for 10sec as configured by us to extract the error message,then display
  console.log(await page.locator("[style*='block']").textContent()); // use .inputValue()

  // inside toContainText writting substring is enough
  await expect(page.locator("[style*='block']")).toContainText("Incorrect");

  /**
    The error 'await' has no effect on the type of this expression. ts(80007) is happening 
    because page.locator() is synchronous — it doesn't return a Promise, it returns a Locator 
    object directly.
    So await-ing it does nothing, and TypeScript warns you about it.
*/

  // wipes off the existing content
  await userName.fill("");
  await userName.fill("rahulshettyacademy");

  // entered the correct password
  await password.fill("");
  await password.fill("Learning@830$3mK2");
  await signIn.click();

  /*
     Correct — looks for an element with class "card-title" inside .card-body 
    .card-body .card-title

    .card-body .card-title a ---> will not work because it resolves into 4 elements
    we can mention the numerical order nth(0) element in case of conflict
*/
  // can use Rel XPath //a[normalize-space()='iphone X'] inside locator, these are relative paths and are resilient to
  // DOM structure changes
  console.log(await cardTitle.first.textContent());
  console.log(await cardTitle.nth(0).textContent());
  console.log(await cardTitle.nth(1).textContent());

  //   textContent() / nth(0).textContent() → has auto-waiting built in. Playwright waits
  //   until the element exists in the DOM before reading it.

  //   allTextContents() → has NO auto-waiting. It resolves
  //   immediately with whatever is in the DOM at that exact moment, even if it's empty.

  console.log(await cardTitle.allTextContents());

  // Option 1: Wait for at least the first element
  await cardTitle.first().waitFor();
  console.log(await cardTitle.allTextContents());

  // Option 2: Assert count is non-zero first
  await expect(cardTitle).not.toHaveCount(0);
  console.log(await cardTitle.allTextContents());

  // there is another way
  // colsole.log(await page.locator('.card-body .card-title a').first().textContent());
  // .nth(1) --> for the second element
});
