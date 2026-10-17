const { expect } = require("@playwright/test");

// ---------------------------------------------------------------------------
// Endpoint constants — in real projects these come from a config/env file,
// but we define them here for clarity while learning.
// ---------------------------------------------------------------------------
const ENDPOINTS = {
  LOGIN: process.env.LOGIN_ENDPOINT,
  ADD_TO_CART: process.env.ADD_TO_CART_ENDPOINT,
  CREATE_ORDER: process.env.CREATE_ORDER_ENDPOINT,
};

const BASE_URL = process.env.BASE_URL;

class APIUtils {
  constructor(apiContext) {
    this.apiContext = apiContext;
  }

  // async createAccount(){

  // }

  async getLoginToken(loginPayload) {
    const loginResponse = await this.apiContext.post(
      `${BASE_URL}${ENDPOINTS.LOGIN}`,
      { data: loginPayload },
    );

    expect(
      loginResponse.ok(), // 200, 201, 202,...299
      `Login API failed with status ${loginResponse.status()}`, // error message displayed when the assertion fails
    ).toBeTruthy(); // true

    const responseBody = await loginResponse.json();
    console.log(responseBody);
    return responseBody;
  }

  async addToCart(addToCartPayload, token) {
    const cartResponse = await this.apiContext.post(
      `${BASE_URL}${ENDPOINTS.ADD_TO_CART}`,
      {
        data: addToCartPayload,
        headers: { Authorization: token },
      },
    );

    expect(
      cartResponse.ok(),
      `Add To Cart API failed with status ${cartResponse.status()}`,
    ).toBeTruthy();

    const responseBody = await cartResponse.json();
    // console.log(cartResponse);
    return responseBody;
  }

  async createOrder(orderPayload, token) {
    const orderResponse = await this.apiContext.post(
      `${BASE_URL}${ENDPOINTS.CREATE_ORDER}`,
      {
        data: orderPayload,
        headers: {
          // Standard Authorization header — every secured endpoint needs this.
          Authorization: token,
        },
      },
    );

    const bodyText = await orderResponse.text();
    expect(
      orderResponse.ok(),
      `Create Order failed: ${orderResponse.status()}\nResponse: ${bodyText}`,
    ).toBeTruthy();

    const responseBody = await orderResponse.json();
    console.log(responseBody);
    return responseBody;
  }
}

module.exports = { APIUtils };
