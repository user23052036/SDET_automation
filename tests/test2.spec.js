const {test,expect} = require('@playwright/test')

test.only('new_test_1', async ({browser})=>{
    const context = await browser.newContext();
    const page = await context.newPage()
    await page.goto('https://www.google.com')

    // getting title
    console.log(await page.title())

    // validate the title 'Google'
    await expect(page).toHaveTitle('Google')

    // to locate any element in the page (it can identify css selectors)
    // best choice is when an ID is available, its unique, so easily ,located
    page.locator()
});