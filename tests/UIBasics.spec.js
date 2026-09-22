// importing required import package
const {test,expect} = require('@playwright/test');
// const {expect} = require('../playwright.config')
// test launches the browser and starts executing tests from fresh page

// function without name is called as anonomous function
// async function(){} is same as async ()=>{}
// test case 1
test('test case name1',async function(){  // outer structure of our testcase
// playwrite code can be writte here

});

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
test('first playwrite test', async ({browser})=>{
    const context = await browser.newContext(); // fresh instance without any cookie,proxy,plugins
    const page = await context.newPage();
    await page.goto('https://rahulshettyacademy.com/loginpagePractise/')
});

// by default playwrite runs the testcases in headless mode 

// test case 4
test('page playwrite test',async ({page})=>{ // this page is called fixtures
    await page.goto('https://www.google.com/')

    // get page title
    console.log(await page.title());

    // assertion page title match 
    await expect(page).toHaveTitle('Google');
    // if we dont put await the validation step is run before the webpage opening

});