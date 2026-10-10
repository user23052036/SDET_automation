const { test, expect } = require("@playwright/test");

// creating the main test case
test.only("ecom_automation", async ({ browser }) => {
  const mainContext = await browser.newContext();
  const mainPage = await mainContext.newPage();
  await mainPage.goto("https://rahulshettyacademy.com/client/#/auth/login");

  const userName = mainPage.locator("//input[@id='userEmail']");
  const passWord = mainPage.locator("//input[@id='userPassword']");
  const logIn = mainPage.locator("//input[@id='login']");
  const cardBody = mainPage.locator(".card-body");
  const productName = "IPHONE 13 PRO";
  const paymentTypes = mainPage.locator(".payment__types");
  const cardNumber = mainPage.locator('input[type="text"]').nth(0);
  const cvv = mainPage.locator('input[type="text"]').nth(1);
  const NameOfCard = mainPage.locator('input[type="text"]').nth(2);
  const coupon = mainPage.locator('input[name="coupon"]');

  await userName.fill("qnhmtm@gmail.com");
  await passWord.fill("Kitti001.@");
  await logIn.click();
  // await mainPage.waitForLoadState("networkidle"); // as here it is not enough (not guaranteed to work)
  await cardBody.last().waitFor(); // waiting forthe last card to load

  const countProduct = await cardBody.count();
  for (let i = 0; i < countProduct; i++) {

    const product = (await cardBody.nth(i).locator("b").textContent()).trim();
    console.log(product);
    if (product.toLowerCase() === productName.toLowerCase()) {
      // add the product to cart
      await cardBody.nth(i).locator(".fa-shopping-cart").click(); // or we can search by text='Add To Cart'
      await expect(mainPage.locator(".toast-message")).toContainText("Product Added To Cart");
      // varify with the floating message if the item is added to cart
      break;
    }
  }

  // go to cart page
  await mainPage.locator("button[routerlink*='cart']").click();
  // await mainPage.locator("div li").first().waitFor(); // waiting for page to
  // we are only using waitFor() method here because isVisible() does not have auto-wait capability

  // need to varify the product
  await expect(mainPage.locator(`h3:has-text('${productName}')`)).toBeVisible();
  // .isVisible() will not wait untilthe page properly loads thats why we need to manually wait for
  // cart page to load
  await mainPage.locator("text=Checkout").click();

  // we dont have to wait for checkout page to load because click() auto waits
  await paymentTypes.locator(".payment__type--cc").click(); // click credit-card option

  await cardNumber.fill("9999 8888 7777 6666");

  const expiry = mainPage.locator("select.input.ddl");
  await expiry.first().selectOption('05');
  await expiry.last().selectOption('12');

  await cvv.fill("123");
  await NameOfCard.fill('Souvik Mandal');
  await coupon.fill("rahulshettyacademy");

  await mainPage.getByRole('button', {name: "Apply Coupon"}).click();
  await expect(mainPage.getByText('* Coupon Applied')).toBeVisible();


  const country = mainPage.getByRole('textbox', {name: "Select Country"});
  await country.pressSequentially('ind', {delay: 150});  // ~150ms between keys, like a person

//   <button type="button" class="ta-item list-group-item">
//   <span>
//     <i class="fa fa-search">::before</i>   ← the 🔍 icon, a Font Awesome character drawn by CSS
//     " India"                               ← the visible text, with a leading space
//   </span>
// </button>

  // await mainPage.getByRole('button', {name: " India", exact: true}).click(); 
  await mainPage.locator('.ta-results button').filter({ hasText: /^\s*India\s*$/ }).click();
  // without exact playwright will also consider British Indian Ocean Territory

  // validation
  await expect(country).toHaveValue('India');

  // place order
  // this is not a button just looks like a button, getByRole button will not work

  //   <a class="btnn action__submit ng-star-inserted">
  //   "Place Order "
  //   <i class="icon icon-arrow-right-circle"></i>
  // </a>
  await mainPage.locator('a.btnn').click();

  // finally getting the order id
  //   <td class="em-spacer-1" ...>
  //   <label class="ng-star-inserted"> | 6ac888aa2be7a4bc2b96bf5a | </label>
  // </td>

  const rawOrderID = await mainPage.locator('em-spacer-1').textContent();
  const OrderID = rawOrderID.split('|')[1].trim();
  console.log(OrderID);

  const allOrders = await mainPage.locator("button[routerlink='/dashboard/myorders']").click();
  await mainPage.locator('tbody').waitFor();  // because count doesnot have auto wait capability 
  const countOrder = await mainPage.locator("tbody tr").count();
  
  for(let i=0; i<countOrder; i++){

    const currOrderId = allOrders.nth(i).locator('th').textContent();
    if (currOrderId == OrderID){ // we could have done OrderId.includes(rawOrderID)
      
      await countOrder.nth(i).getByRole('button', {name: 'View'}).click();
      break;
    }
  }
  const checkOrderId =  await mainPage.locator('.col-text').textContent();
  await expect(checkOrderId ).toHaveValue(OrderID); 
  });

// .a .b (space)	an element with class b inside an element with class a (parent → child)
// .a.b (no space)	one element that has both classes

// .fill() dumps the whole text at once instead of pressing keys one by one use .pressSequenciallly()

// // 1. Recommended: find it by role and visible name
// await page.getByRole('button', { name: 'Checkout' }).click();

// // 2. Playwright's own text pseudo-class
// await page.locator("button:has-text('Checkout')").click();

// // 3. Playwright's text selector (note: no square brackets)
// await page.locator("text=Checkout").click();

// // 4. Plain CSS based on structure (this one also works in SelectorsHub)
// await page.locator("li.totalRow button").click();

// // 5. XPath (also works in SelectorsHub)
// await page.locator("//button[normalize-space()='Checkout']").click();


// // 1. Best: only buttons with that text
// await mainPage.getByRole("button", { name: "Apply Coupon" }).click();

// // 2. Element tag + text
// await mainPage.locator("button:has-text('Apply Coupon')").click();

// // 3. getByText, narrowed down to the button
// await mainPage.locator("button").getByText("Apply Coupon").click();

// // 4. getByText + position (works, but breaks if the layout changes)
// await mainPage.getByText("Apply Coupon").last().click();


// Option 1: by its class (meaningful name, likely stable)
// await mainPage.locator(".action__submit").click();

// Option 2: by its text
// await mainPage.getByText("Place Order").click();
