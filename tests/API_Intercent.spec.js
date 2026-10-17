const { test, expect, request } = require("@playwright/test");
const { APIUtils } = require("./utils/APIUtils");

const loginPayLoad = {
  userEmail: "qnhmtm@gmail.com",
  userPassword: "Kitti001.@",
};
const orderPayLoad = {
  orders: [{ country: "India", productOrderedId: "6960eac0c941646b7a8b3e68" }],
};
const fakePayLoadOrders = { data: [], message: "No Orders" };

let token;
let response;

test.beforeAll(async () => {
  const apiContext = await request.newContext();
  const apiUtils = new APIUtils(apiContext);

  const loginResponse = await apiUtils.getLoginToken(loginPayLoad);
  token = loginResponse.token;
  response = await apiUtils.createOrder(orderPayLoad, token);
});

//create order is success
test("Place the order", async ({ page }) => {
  page.addInitScript((value) => {
    window.localStorage.setItem("token", value);
  }, token);

  await page.goto("https://rahulshettyacademy.com/client");
  await page.route(
    "https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*", // orders GET endpint and intercent
    async (route) => {
      // //intercepting response -APi response-> { playwright fakeresponse}->browser->render data on front end
      const response = await page.request.fetch(route.request());
      let body = JSON.stringify(fakePayLoadOrders);
      // Converts a JavaScript value to a JavaScript Object Notation (JSON) string.

      await route.fulfill({
        response,
        body,
      });
    },
  );

  // we need to fack the response before clicking on the orders button
  await page.locator("button[routerlink*='myorders']").click();
  await page.waitForResponse(
    "https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*",
  );

  console.log(await page.locator(".mt-4").textContent());
});
