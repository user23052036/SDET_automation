
const { expect } = require('@playwright/test');

// ---------------------------------------------------------------------------
// Endpoint constants — in real projects these come from a config/env file,
// but we define them here for clarity while learning.
// ---------------------------------------------------------------------------
const ENDPOINTS = {
  LOGIN:        '/api/ecom/auth/login',         // POST — returns { token, userId, message }
  CREATE_ORDER: '/api/ecom/order/create-order', // POST — needs Authorization header
};

const BASE_URL = 'https://rahulshettyacademy.com';



class APIUtils {

  constructor(apiContext) {
    this.apiContext = apiContext;
  }

  async getToken(loginPayload) {
    const loginResponse = await this.apiContext.post(
      `${BASE_URL}${ENDPOINTS.LOGIN}`,
      { data: loginPayload }
    );

    expect(loginResponse.ok(), // 200, 201, 202,...299
          `Login API failed with status ${loginResponse.status()}`  // error message displayed when the assertion fails
          ).toBeTruthy(); // true

    const responseBody = await loginResponse.json();
    console.log(responseBody);
    return responseBody.token;
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
      }
    );

    expect(orderResponse.ok(), 
          `Create Order API failed with status ${orderResponse.status()}`
          ).toBeTruthy();

    const responseBody = await orderResponse.json();
    console.log(responseBody);
    return responseBody.orders[0];
  }
}

module.exports = {APIUtils};