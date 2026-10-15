
const { test, expect, request } = require('@playwright/test');
const { APIUtils } = require('./utils/APIUtils');

// ---------------------------------------------------------------------------
// Test data — in real projects this comes from a fixtures file or env vars.
// Hardcoding here is fine while learning.
// ---------------------------------------------------------------------------
const LOGIN_PAYLOAD = {
  userEmail:    'qnhmtm@gmail.com',
  userPassword: 'Kitti001.@',
};

const ORDER_PAYLOAD = {
  orders: [{
      country: 'Cuba',
      productOrderedId: '6960ea76c941646b7a8b3dd5',
    },
  ],
};

const PRODUCT_NAME = 'IPHONE 13 PRO';
const APP_URL      = 'https://rahulshettyacademy.com/client/#/dashboard/dash';



// ---------------------------------------------------------------------------
// Module-scoped variables — declared here so all tests in this file can
// share them. They are populated once in beforeAll, not before every test.
// ---------------------------------------------------------------------------
let apiContext; // Playwright HTTP client (no browser)
let apiUtils;   // Our helper class
let token;      // Bearer token from login
let orderId;    // Order ID created via API, verified via UI



// ---------------------------------------------------------------------------
// beforeAll — runs ONCE before any test in this file.
// Perfect for expensive setup: login, seed data, etc.
// Use beforeEach only when each test truly needs a fresh state.
// ---------------------------------------------------------------------------
test.beforeAll(async () => {
  // Create a dedicated API context (no browser, just HTTP).
  // ignoreHTTPSErrors is useful in non-prod environments with self-signed certs.
  apiContext = await request.newContext({ ignoreHTTPSErrors: true });
  apiUtils   = new APIUtils(apiContext);

  // Step 1 — Authenticate once and cache the token.
  token   = await apiUtils.getToken(LOGIN_PAYLOAD);

  // Step 2 — Create an order via API so the UI test has something to verify.
  orderId = await apiUtils.createOrder(ORDER_PAYLOAD, token);
  console.log(`[Setup] Token acquired. Order created: ${orderId}`);
});



test('Verify API-created order is visible in My Orders (UI)', async ({ page }) => {

  // STEP 1 — Inject the auth token into the browser's localStorage BEFORE
  // the app loads. addInitScript runs on every new page/frame before any JS.
  // This simulates a logged-in session without clicking the login form.
  await page.addInitScript((value) => {
    window.localStorage.setItem('token', value);
  }, token);

  
  await page.goto(APP_URL);
  await page.locator('button[routerlink*="myorders"]').click();

  // Example: find the row containing our Order ID
  await page.locator('tbody').waitFor();  // because count doesnot have auto wait capability 
  const rows = page.locator("tbody tr"); 
  const countOrder = await rows.count();  // number
  
  for(let i=0; i<countOrder; i++){

    const currOrderId = await rows.nth(i).locator('th').textContent();
    if (currOrderId == orderId){ 
      
      await rows.nth(i).getByRole('button', {name: 'View'}).click();
      break;
    }
  }
  await expect(page.locator('.col-text')).toHaveText(orderId);
  console.log(`[Test] Verifying orderId: ${orderId} for product: ${PRODUCT_NAME}`);
});

// ---------------------------------------------------------------------------
// afterAll — clean up the API context when all tests in this file finish.
// Always dispose of contexts you created manually (request.newContext).
// Playwright auto-disposes browser contexts, but NOT manual API contexts.
// ---------------------------------------------------------------------------
test.afterAll(async () => {
  await apiContext.dispose();
  console.log('[Teardown] API context disposed.');
});