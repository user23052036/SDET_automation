//
// https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/6ac29de02be7a4bc2b898730

const { test, expect, request } = require("@playwright/test");
const { APIUtils } = require("./utils/APIUtils");

const APP_URL = process.env.APP_URL;
const PRODUCT_NAME = process.env.PRODUCT_NAME;

let token;
let userID;
let cartResponse;
let orderID;

const LOGIN_PAYLOAD = {
  userEmail: "qnhmtm@gmail.com",
  userPassword: "Kitti001.@",
};
const ADD_TO_CART_PAYLOAD = {
  _id: "",
  product: {
    _id: "6960eac0c941646b7a8b3e68",
    productName: "ZARA COAT 3",
    productCategory: "electronics",
    productSubCategory: "mobiles",
    productPrice: 11500,
    productDescription: "Apple phone",
    productImage:
      "https://rahulshettyacademy.com/api/ecom/uploads/productImage_1767959232316.jpeg",
    productRating: "0",
    productTotalOrders: "0",
    productStatus: true,
    productFor: "women",
    productAddedBy: "admin",
    __v: 0,
  },
};
const ORDER_PAYLOAD = {
  orders: [{ country: "Cuba", productOrderedId: "6960eac0c941646b7a8b3e68" }],
};

// No. A test.beforeAll in one spec file does not run when you execute other spec files. Its scope is the file, or the test.
// describe block it’s declared in.

// we try to sit/intersept the incomming GET request before it hits the browser and edit the incomming json and render it
// in the browser

test.beforeAll(async () => {
  const apiContext = await request.newContext();
  const apiUtils = new APIUtils(apiContext);

  const loginResponse = await apiUtils.getLoginToken(LOGIN_PAYLOAD);
  token = loginResponse.token;

  ADD_TO_CART_PAYLOAD._id = loginResponse.userId;
  cartResponse = await apiUtils.addToCart(ADD_TO_CART_PAYLOAD, token);
  console.log(cartResponse);

  let response = await apiUtils.createOrder(ORDER_PAYLOAD, token);
  orderID = response.orders[0];
  console.log(`[Setup] Token acquired. Order created: ${orderID}`);
});

test("Verify API-created order is visible in My Orders (UI)", async ({
  page,
}) => {
  await page.addInitScript((value) => {
    window.localStorage.setItem("token", value);
  }, token);

  await page.goto(APP_URL);
  await page.locator('button[routerlink*="myorders"]').click();

  const orderRow = page.locator("tbody tr").filter({
    has: page.locator("th", { hasText: orderID }),
  });

  await expect(orderRow).toHaveCount(1);
  await orderRow.getByRole("button", { name: "View", exact: true }).click();

  await expect(page.locator(".col-text")).toHaveText(orderID);

  console.log(`[Test] Verified order: ${orderID} for product: ${PRODUCT_NAME}`);
});
