const {test,expect} = require('@playwright/test')

test.only('new_test_1', async ({browser})=>{

    const context = await browser.newContext();
    const page = await context.newPage()
    await page.goto('https://rahulshettyacademy.com/loginpagePractise/')

    const userName = page.locator('input#username');
    const password = page.locator("[type='password']");
    const signIn = page.locator('input#signInBtn');

    // getting title
    console.log(await page.title())

    // validate the title 'LoginPage Practise | Rahul Shetty Academy'
    await expect(page).toHaveTitle('LoginPage Practise | Rahul Shetty Academy')

    // to locate any element in the page (it can identify css selectors)
    // best choice is when an ID is available, its unique, so easily, located
    await userName.fill('souvikmandal');  // type is depreciated

    await password.fill('12dg5s5');

    // for accepting the terms and conditions
    await page.locator('input#terms').click();

    // clicking on the sign-in button
    await signIn.click();  

    // getting the error message
    // when no error message then: style="display: none;"
    // else: style="display: block;"
    // playwright will wait for 10sec as configured by us to extract the error message,then display
    console.log(await page.locator("[style*='block']").textContent());

    // inside toContainText writting substring is enough
    await expect(page.locator("[style*='block']")).toContainText('Incorrect');

/**
    The error 'await' has no effect on the type of this expression. ts(80007) is happening 
    because page.locator() is synchronous — it doesn't return a Promise, it returns a Locator 
    object directly.
    So await-ing it does nothing, and TypeScript warns you about it.
*/

    // wipes off the existing content
    await userName.fill('');
    await userName.fill('rahulshettyacademy');

    // entered the correct password
    await password.fill('');
    await password.fill('Learning@830$3mK2');
    await signIn.click();

/*
     Correct — looks for an element with class "card-title" inside .card-body 
    .card-body .card-title

    .card-body .card-title a ---> will not work because it resolves into 4 elements
    we can mention the numerical order nth(0) element in case of conflict
*/
    console.log(await page.locator('.card-body .card-title a').nth(0).textContent());

});