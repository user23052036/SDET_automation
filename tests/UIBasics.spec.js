// importing required import package
const {test} = require('@playwright/test');
// test launches the browser and starts executing tests from fresh page

// function without name is called as anonomous function
// async function(){} is same as async ()=>{}
test('test case name1',async function(){  // outer structure of our testcase
// playwrite code can be writte here

});

// here 
test('test2',async ({browser})=>{ // browser passed as parameter to the test function first
    console.log(browser);
});

// test('my test', async (fixture)=>{
//     console.log(fixture.browser);
// })




/**
 * 
 * we need not explicitely write those two lines creating context and page if we dont want any       innitial plugins,proxy etc. 
 * 
 * we can simply do {browser,page}
 */

test('first playwrite test', async ({browser})=>{
    const context = await browser.newContext(); // fresh instance without any cookie,proxy,plugins
    const page = await context.newPage();
    await page.goto('https://rahulshettyacademy.com/loginpagePractise/')
});

test('page playwrite test',async ({page})=>{
    const page = page.goto('https://rahulshettyacademy.com/loginpagePractise/')
});