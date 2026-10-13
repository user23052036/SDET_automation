const {test,expect,request} = require('@playwright/test');

const loginPayLoad = {userEmail:"qnhmtm@gmail.com",userPassword:"Kitti001.@"};
const orderPayLoad = {orders:[{country:"Cuba",productOrderedId:"6960ea76c941646b7a8b3dd5"}]};
// at run-time the java-script object will be converted into json

let token;
let OrderID;
// const can be declaired only whe we know the value like innitializing.. that why we have used let  

const productName = "IPHONE 13 PRO";


// test.beforeAll    tets.beforeEach()
test.beforeAll( async ()=>{
    const apiContext = await request.newContext({ignoreHTTPSErrors: true});
    const apiResponse = await apiContext.post("https://rahulshettyacademy.com/api/ecom/auth/login",
                                        {data: loginPayLoad});
    console.log("Status:", apiResponse.status());
    expect(apiResponse.ok()).toBeTruthy();  // 200,201,202 ...

    // grab the json response
    const loginResponseJson = await apiResponse.json();
    console.log(loginResponseJson);

    token = loginResponseJson.token;  // here we dont need await as loginResponseJson allready has token, userID, message
});


test("ecom_API_automation", async ({page}) => {
  const apiContext = await request.newContext({ignoreHTTPSErrors: true});

  // add InitScript function injects the js code into the browser console
  await page.addInitScript(value => {     
      window.localStorage.setItem('token',value); 
  },token);

  const orderResponse = await apiContext.post("https://rahulshettyacademy.com/api/ecom/order/create-order", // this is an end point where we can call API
                  {
                    data: orderPayLoad,
                    headers: {
                      'authorization': token,
                      "content-type": "application/json; charset=utf-8"
                    },
                  });
  console.log("Status:", orderResponse.status());
  expect(orderResponse.ok()).toBeTruthy(); 

  const orderResponseJson = await orderResponse.json();
  console.log(orderResponseJson);

  OrderID = orderResponseJson.orders[0];
  console.log("OrderID = ",OrderID);

  await page.goto('https://rahulshettyacademy.com/client/#/dashboard/dash');
  // 9. Find the order in My Orders and open it
  await page.locator("button[routerlink='/dashboard/myorders']").click();
  const rows = page.locator("tbody tr");
  await rows.first().waitFor();

  // search for the orderID in the order page
  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    const rowOrderId = (await rows.nth(i).locator("th").textContent()).trim();
    if (rowOrderId === OrderID) {
      await rows.nth(i).getByRole("button", { name: "View" }).click();
      break;
    }
  }

  // 10. Verify order details
  await page.locator(".col-text").waitFor();
  await expect(page.locator(".col-text")).toHaveText(OrderID);
});


// localStorage.getItem('token')
// localStorage.removeItem('token');
// location.reload();
// localStorage.setItem('token', 'PASTE_YOUR_TOKEN_HERE');
// location.href = 'https://rahulshettyacademy.com/client/#/dashboard/dash';