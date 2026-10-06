// importing required import package
const { test, expect } = require("@playwright/test");
const { sign } = require("node:crypto");
// const {expect} = require('../playwright.config')
// test launches the browser and starts executing tests from fresh page

// function without name is called as anonomous function
// async function(){} is same as async ()=>{}

// here test case 2
// test('test2',async ({browser})=>{ // browser passed as parameter to the test function first
//     console.log(browser);
// });

// test('my test', async (fixture)=>{
//     console.log(fixture.browser);
// })

// playwright.congif.js
// will triiger all the test cases mentioned inside a file sequentially
// but config file when triggered it runs the folder .tests/ parallely
// only tests present in the same file is run sequencially

/**
 *
 * we need not explicitely write those two lines creating context and page if we dont want any  
 * innitial plugins,proxy etc.
 *
 * we can simply do {browser,page}
 */

// test case 3
test("first playwrite test", async ({ browser }) => {
  const context = await browser.newContext(); // fresh instance without any cookie,proxy,plugins
  const page = await context.newPage();
  await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
});

// by default playwrite runs the testcases in headless mode

// test case 4
test("page playwrite test", async ({ page }) => {
  // this page is called fixtures
  await page.goto("https://www.google.com/");

  // get page title
  console.log(await page.title());

  // assertion page title match
  await expect(page).toHaveTitle("Google");
  // if we dont put await the validation step is run before the webpage opening
});

test("@Web Client App login", async ({ page }) => {
  //js file- Login js, DashboardPage
  const email = "anshika@gmail.com";
  const productName = "zara coat 3";
  const products = page.locator(".card-body");
  await page.goto("https://rahulshettyacademy.com/client");
  await page.locator("#userEmail").fill(email);
  await page.locator("#userPassword").type("Iamking@000");
  await page.locator("[value='Login']").click();
  await page.waitForLoadState("networkidle");
  await page.locator(".card-body b").first().waitFor();
  const titles = await page.locator(".card-body b").allTextContents();
  console.log(titles);
});

test("UI controls", async ({ page }) => {
  const userName = page.locator("input#username");
  const password = page.locator("[type='password']");
  const dropdown = page.locator("//select[@class='form-control']");
  const signIn = page.locator("input#signInBtn");
  const cardTitle = page.locator(".card-body .card-title a");

  await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
  await userName.fill("souvikmandal");
  await password.fill("12dg5s5");
  await page.locator(".radiotextsty").last().click();
  // //button[@id='okayBtn']
  await page.locator("//button[@id='okayBtn']").click();

  // one assertion to check the user got successfully selected or not
  await expect(page.locator("//label[2]//span[2]")).toBeChecked();
  // if you want to print if check in true/false
  // .isChecked() and print in the console.log()

  await dropdown.selectOption("Consultant");
  await page.pause(); // debug mode opens so that we can see the dropdown consultant selected

  // for accepting the terms and conditions
  await page.locator("input#terms").click();
  await expect(page.locator("input#terms")).toBeChecked();
  await page.locator("input#terms").uncheck();
  expect(await page.locator("input#terms").isChecked()).toBeFalsy(); // False == False
  // we also have a method .toBeTruty()

  // varify the blinking text in the UI
  await expect(page.locator("[href*='documents-request']")).toHaveAttribute(
    "class",
    "blinkingText",
  );
  await signIn.click();

  // we would notice that actual await is used only when there is a action involved
  // this is the reason why we dont write await outside expect as this is not an action, it is just an assertion
  // but notice we are writting await inside expect because it involves an action like isChecked()
});

test.only("child window", async ({ browser }) => {
  const context = await browser.newContext(); // fresh instance without any cookie,proxy,plugins
  const page = await context.newPage();
  await page.goto("https://rahulshettyacademy.com/loginpagePractise/");

  const userName = page.locator("input#username");
  const password = page.locator("[type='password']");
  const dropdown = page.locator("//select[@class='form-control']");
  const doclink = page.locator("[href*='documents-request']");
  const signIn = page.locator("input#signInBtn");
  const cardTitle = page.locator(".card-body .card-title a");

  // so a new page will be created in my original context, returns the new page as an object

  // a promise can be in threee stages pending,rejected, fulfilled
  // Promise.all returns a Promise that will resolve to an array. You only get the array after await.
  const [newpage] = await Promise.all([
    context.waitForEvent("page"), // slot 0 → the new Page
    doclink.click(), // slot 1 → undefined (click returns nothing)
  ]); // result = [Page, undefined]

  // can also be done in this complicated way
  // const pagePromise = context.waitForEvent("page");  // 1. start listening, keep the Promise
  // await doclink.click();                             // 2. trigger the new tab
  // const newPage = await pagePromise;                  // 3. now wait for it and get the Page

  const redText = await newpage.locator(".red").textContent();
  console.log(redText);

  // const redEmail = newpage.locator("[href*='mentor@rahul']").textContent();

  // split on the based of delimeter
  const redEmail = redText.split("@")[1].split(" ")[0];
  console.log(redEmail);
  const redUser = redEmail.split(".")[0];
  console.log(redUser);

  await userName.fill(redUser);
  await password.fill("Learning@830$3mK2");

  await page.locator(".radiotextsty").last().click();
  await page.locator("//button[@id='okayBtn']").click();

  await dropdown.selectOption("Consultant");
  await page.locator("input#terms").click();

  console.log("username using textContent: ", await userName.textContent()); // nothing got printed
  console.log("password using textContent: ", await password.textContent()); // nothing got printed
  console.log("username using inputValue: ", await userName.inputValue()); // rahulshettyacademy
  console.log("password using inputValue: ", await password.inputValue()); // Learning@830$3mK2

  await signIn.click();
  // await page.waitForLoadState("networkidle"); (why this is not working)
  await cardTitle.first().waitFor(); // waits until at least one title is visible

  const allTitles = await cardTitle.allTextContents();
  console.log(allTitles);
});

// testContent() will return text only whe it is attached to the DOM, when the page opens,
// if we are looking to get the text which is typed or altered after the DOM is opened. need to use inputValue()
