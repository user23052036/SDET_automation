
// to debug
// in VSCode type shift + command + p and type Debug npm script 

// remember COntext is ike a memory that a page can be injected with

const{test,expect} = require('@playwright/test');
let webContext;

test.beforeAll(async({browser})=>{
    const mainContext = await browser.newContext();
    const mainPage = await mainContext.newPage();
    
    const userName = mainPage.locator("//input[@id='userEmail']");
    const passWord = mainPage.locator("//input[@id='userPassword']"); 
    const logIn = mainPage.locator("//input[@id='login']");
    const cardBody = mainPage.locator(".card-body");

    await mainPage.goto("https://rahulshettyacademy.com/client/#/auth/login");
    await userName.fill("qnhmtm@gmail.com");
    await passWord.fill("Kitti001.@");
    await logIn.click();
    await cardBody.last().waitFor();
    await  mainContext.storageState({path: 'state.json'});
    webContext = await browser.newContext({storageState: 'state.json'});

})

test("client app login", async()=>{
    const page = await webContext.newPage();
    const cardBody = page.locator(".card-body");

    await page.goto("https://rahulshettyacademy.com/client/#/dashboard/dash");
    const title = await cardBody.allTextContents();
    console.log(title);

})