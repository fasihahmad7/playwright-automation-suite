import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { MyAccountPage } from '../pages/MyAccountPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { TestDataProvider, UserData } from '../utils/TestDataProvider';
import { ApiHelper, blockAds } from '../utils/ApiHelper';
import { allure } from 'allure-playwright';

test.describe('Automation Exercise - Complete Test Suite', () => {
  let homePage: HomePage;
  let api: ApiHelper;
  // Accounts created during a test; deleted in afterEach so the live site isn't polluted
  let createdUsers: UserData[];

  test.beforeEach(async ({ page, request }) => {
    await blockAds(page);
    api = new ApiHelper(request);
    createdUsers = [];
    homePage = new HomePage(page);
    await homePage.navigateToHomePage();
  });

  test.afterEach(async () => {
    for (const user of createdUsers) {
      await api.deleteAccount(user.email, user.password);
    }
  });

  /** Create a fresh account through the API (fast) for tests that need an existing user. */
  async function createUserViaApi(): Promise<UserData> {
    const user = TestDataProvider.generateUser();
    await api.createAccount(user);
    createdUsers.push(user);
    return user;
  }

  async function loginViaUi(user: UserData): Promise<MyAccountPage> {
    const loginPage = await homePage.clickSignupLogin();
    await expect(loginPage.loginToAccountText).toHaveText('Login to your account');
    const accountPage = await loginPage.loginUser(user.email, user.password);
    await expect(accountPage.loggedInAsText).toContainText(`Logged in as ${user.name}`);
    return accountPage;
  }

  /** Fill the signup form + full registration form, then verify ACCOUNT CREATED. */
  async function registerViaUi(loginPage: LoginPage, user: UserData): Promise<MyAccountPage> {
    await expect(loginPage.newUserSignupText).toHaveText('New User Signup!');
    const registrationPage: RegistrationPage = await loginPage.signupNewUser(user.name, user.email);
    await expect(registrationPage.enterAccountInfoText).toBeVisible();

    const accountPage = await registrationPage.fillRegistrationForm(
      user.title, user.password, user.day, user.month, user.year,
      user.firstName, user.lastName, user.company, user.address,
      user.address2, user.country, user.state, user.city,
      user.zipcode, user.mobileNumber
    );
    // Registered through the UI — still make sure it gets cleaned up if the test fails later
    createdUsers.push(user);

    await expect(accountPage.accountCreatedMessage).toHaveText(/account created!/i);
    await accountPage.clickContinue();
    await expect(accountPage.loggedInAsText).toContainText(`Logged in as ${user.name}`);
    return accountPage;
  }

  /** From the checkout page: verify the order review, place the order and pay. */
  async function placeOrderAndPay(checkoutPage: CheckoutPage) {
    await expect(checkoutPage.addressDetailsHeading).toBeVisible();
    await expect(checkoutPage.reviewOrderHeading).toBeVisible();

    const paymentPage = await checkoutPage.placeOrder('Please deliver between 9am and 5pm.');
    await paymentPage.payAndConfirm(TestDataProvider.getCardDetails());

    await expect(paymentPage.orderPlacedHeading).toHaveText(/order placed!/i);
    await expect(paymentPage.orderConfirmedMessage).toHaveText('Congratulations! Your order has been confirmed!');
    return paymentPage;
  }

  async function deleteAccountViaUi(accountPage: MyAccountPage) {
    await accountPage.deleteAccount();
    await expect(accountPage.accountDeletedMessage).toHaveText(/account deleted!/i);
    await accountPage.clickContinue();
  }

  // ---------------------------------------------------------------------------
  // User management
  // ---------------------------------------------------------------------------

  test('TC01: Register User', async ({ page }) => {
    await allure.description('Complete user registration flow');
    await allure.tag('registration');
    await allure.tag('user-management');

    // 3. Verify that home page is visible successfully
    expect(await homePage.isHomePageVisible()).toBe(true);

    // 4. Click on 'Signup / Login' button
    const loginPage = await homePage.clickSignupLogin();

    // 5-16. Sign up, fill account information, verify 'ACCOUNT CREATED!' and 'Logged in as username'
    const user = TestDataProvider.generateUser();
    const accountPage = await registerViaUi(loginPage, user);

    // 17-18. Click 'Delete Account' and verify 'ACCOUNT DELETED!'
    await deleteAccountViaUi(accountPage);
  });

  test('TC02: Login User with correct email and password', async ({ page }) => {
    await allure.description('Login with valid credentials');
    await allure.tag('login');
    await allure.tag('authentication');

    const user = await createUserViaApi();

    // 3. Verify that home page is visible successfully
    expect(await homePage.isHomePageVisible()).toBe(true);

    // 4-8. Login and verify 'Logged in as username' is visible
    const accountPage = await loginViaUi(user);

    // 9-10. Click 'Delete Account' and verify 'ACCOUNT DELETED!'
    await deleteAccountViaUi(accountPage);
  });

  test('TC03: Login User with incorrect email and password', async ({ page }) => {
    await allure.description('Login with invalid credentials');
    await allure.tag('login');
    await allure.tag('negative-test');

    // 3. Verify that home page is visible successfully
    expect(await homePage.isHomePageVisible()).toBe(true);

    // 4. Click on 'Signup / Login' button
    const loginPage = await homePage.clickSignupLogin();

    // 5. Verify 'Login to your account' is visible
    await expect(loginPage.loginToAccountText).toHaveText('Login to your account');

    // 6-7. Enter incorrect email address and password, click 'login'
    await loginPage.fillLoginForm('invalid@email.com', 'wrongpassword');
    await loginPage.clickLoginButton();

    // 8. Verify error 'Your email or password is incorrect!' is visible and user is NOT logged in
    await expect(loginPage.loginErrorMessage).toHaveText('Your email or password is incorrect!');
    await expect(page.locator('a[href="/logout"]')).toHaveCount(0);
  });

  test('TC04: Logout User', async ({ page }) => {
    await allure.description('User logout functionality');
    await allure.tag('logout');
    await allure.tag('authentication');

    const user = await createUserViaApi();

    // 4-8. Login and verify 'Logged in as username'
    const accountPage = await loginViaUi(user);

    // 9. Click 'Logout' button
    await accountPage.logout();

    // 10. Verify that user is navigated to login page and is logged out
    await expect(page).toHaveURL(/\/login$/);
    await expect(accountPage.loggedInAsText).toHaveCount(0);
  });

  test('TC05: Register User with existing email', async ({ page }) => {
    await allure.description('Register with existing email');
    await allure.tag('registration');
    await allure.tag('negative-test');

    const existingUser = await createUserViaApi();

    // 3. Verify that home page is visible successfully
    expect(await homePage.isHomePageVisible()).toBe(true);

    // 4. Click on 'Signup / Login' button
    const loginPage = await homePage.clickSignupLogin();

    // 5. Verify 'New User Signup!' is visible
    await expect(loginPage.newUserSignupText).toHaveText('New User Signup!');

    // 6-7. Enter name and an already registered email address, click 'Signup'
    await loginPage.fillSignupForm('Another Person', existingUser.email);
    await loginPage.clickSignupButton();

    // 8. Verify error 'Email Address already exist!' is visible
    await expect(loginPage.signupErrorMessage).toHaveText('Email Address already exist!');
  });

  // ---------------------------------------------------------------------------
  // Contact & navigation
  // ---------------------------------------------------------------------------

  test('TC06: Contact Us Form', async ({ page }) => {
    await allure.description('Contact Us form submission');
    await allure.tag('contact');
    await allure.tag('form-submission');

    // 3. Verify that home page is visible successfully
    expect(await homePage.isHomePageVisible()).toBe(true);

    // 4. Click on 'Contact Us' button
    const contactPage = await homePage.clickContactUs();

    // 5. Verify 'GET IN TOUCH' is visible
    await expect(contactPage.getInTouchText).toBeVisible();

    // 6. Enter name, email, subject and message
    const contact = TestDataProvider.getContactTestData()[0];
    await contactPage.fillContactForm(contact.name, contact.email, contact.subject, contact.message);

    // 8-9. Click 'Submit' and accept the confirmation dialog (handled in submitForm)
    await contactPage.submitForm();

    // 10. Verify success message is visible
    await expect(contactPage.successMessage).toHaveText('Success! Your details have been submitted successfully.');

    // 11. Click 'Home' button and verify that landed on home page successfully
    await contactPage.clickHome();
    expect(await homePage.isHomePageVisible()).toBe(true);
  });

  test('TC07: Verify Test Cases Page', async ({ page }) => {
    await allure.description('Navigate to Test Cases page');
    await allure.tag('navigation');
    await allure.tag('test-cases');

    // 3. Verify that home page is visible successfully
    expect(await homePage.isHomePageVisible()).toBe(true);

    // 4. Click on 'Test Cases' button
    const testCasesPage = await homePage.clickTestCases();

    // 5. Verify user is navigated to test cases page successfully
    await expect(page).toHaveURL(/\/test_cases$/);
    expect(await testCasesPage.isTestCasesPageVisible()).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // Products & search
  // ---------------------------------------------------------------------------

  test('TC08: Verify All Products and product detail page', async ({ page }) => {
    await allure.description('View all products and product details');
    await allure.tag('products');
    await allure.tag('product-details');

    // 3. Verify that home page is visible successfully
    expect(await homePage.isHomePageVisible()).toBe(true);

    // 4. Click on 'Products' button
    const productsPage = await homePage.clickProducts();

    // 5. Verify user is navigated to ALL PRODUCTS page successfully
    expect(await productsPage.isAllProductsPageVisible()).toBe(true);

    // 6. The products list is visible
    expect(await productsPage.areProductsListVisible()).toBe(true);

    // 7-8. Click on 'View Product' of first product; user lands on product detail page
    const details = await productsPage.clickViewProductOfFirstProduct();
    await expect(page).toHaveURL(/\/product_details\/1$/);

    // 9. Verify details are visible: product name, category, price, availability, condition, brand
    await expect(details.productName).toHaveText('Blue Top');
    await expect(details.productCategory).toContainText('Category:');
    await expect(details.productPrice).toHaveText(/Rs\. \d+/);
    await expect(details.productAvailability).toContainText('Availability:');
    await expect(details.productCondition).toContainText('Condition:');
    await expect(details.productBrand).toContainText('Brand:');
  });

  test('TC09: Search Product', async ({ page }) => {
    await allure.description('Search for products');
    await allure.tag('search');
    await allure.tag('products');

    // 3. Verify that home page is visible successfully
    expect(await homePage.isHomePageVisible()).toBe(true);

    // 4-5. Click 'Products' and verify ALL PRODUCTS page
    const productsPage = await homePage.clickProducts();
    expect(await productsPage.isAllProductsPageVisible()).toBe(true);

    // 6. Enter product name in search input and click search button
    await productsPage.searchProduct('Top');

    // 7. Verify 'SEARCHED PRODUCTS' is visible
    expect(await productsPage.isSearchedProductsVisible()).toBe(true);

    // 8. Verify the products related to search are visible
    // (the site also matches on category, e.g. 'Little Girls Mr. Panda Shirt' is under Tops)
    const names = await productsPage.getProductNames();
    console.log('Search results:', names);
    expect(names.length).toBeGreaterThan(0);
    expect(names).toContain('Blue Top');
  });

  // ---------------------------------------------------------------------------
  // Subscription
  // ---------------------------------------------------------------------------

  test('TC10: Verify Subscription in home page', async ({ page }) => {
    await allure.description('Verify subscription functionality on home page');
    await allure.tag('subscription');
    await allure.tag('newsletter');

    // 3. Verify that home page is visible successfully
    expect(await homePage.isHomePageVisible()).toBe(true);

    // 4-5. Scroll down to footer and verify text 'SUBSCRIPTION'
    await homePage.scrollToFooter();
    expect(await homePage.isSubscriptionVisible()).toBe(true);

    // 6. Enter email address in input and click arrow button
    await homePage.subscribeWithEmail(TestDataProvider.generateRandomEmail());

    // 7. Verify success message 'You have been successfully subscribed!' is visible
    await expect(homePage.subscriptionSuccessMessage).toHaveText('You have been successfully subscribed!');
  });

  test('TC11: Verify Subscription in Cart page', async ({ page }) => {
    await allure.description('Verify subscription functionality on cart page');
    await allure.tag('subscription');
    await allure.tag('cart');

    // 3. Verify that home page is visible successfully
    expect(await homePage.isHomePageVisible()).toBe(true);

    // 4. Click 'Cart' button
    const cartPage = await homePage.clickCart();

    // 5-6. Scroll down to footer and verify text 'SUBSCRIPTION'
    expect(await cartPage.isSubscriptionVisible()).toBe(true);

    // 7. Enter email address in input and click arrow button
    await cartPage.subscribeWithEmail(TestDataProvider.generateRandomEmail());

    // 8. Verify success message 'You have been successfully subscribed!' is visible
    await expect(cartPage.subscriptionSuccessMessage).toHaveText('You have been successfully subscribed!');
  });

  // ---------------------------------------------------------------------------
  // Cart
  // ---------------------------------------------------------------------------

  test('TC12: Add Products in Cart', async ({ page }) => {
    await allure.description('Add products to cart');
    await allure.tag('cart');
    await allure.tag('add-products');

    // 3. Verify that home page is visible successfully
    expect(await homePage.isHomePageVisible()).toBe(true);

    // 4. Click 'Products' button
    const productsPage = await homePage.clickProducts();

    // 5-6. Hover over first product, click 'Add to cart', then 'Continue Shopping'
    await productsPage.addProductToCartAndContinue(0);

    // 7-8. Hover over second product, click 'Add to cart', then 'View Cart'
    await productsPage.addProductToCart(1);
    const cartPage = await productsPage.clickViewCart();

    // 9. Verify both products are added to Cart
    await expect(cartPage.cartRows).toHaveCount(2);
    expect(await cartPage.getProductNames()).toEqual(['Blue Top', 'Men Tshirt']);

    // 10. Verify their prices, quantity and total price
    expect(await cartPage.getQuantities()).toEqual(['1', '1']);
    await expect(cartPage.totalPrice).toHaveText(['Rs. 500', 'Rs. 400']);
  });

  test('TC13: Verify Product quantity in Cart', async ({ page }) => {
    await allure.description('Verify product quantity in cart');
    await allure.tag('cart');
    await allure.tag('quantity');

    // 3. Verify that home page is visible successfully
    expect(await homePage.isHomePageVisible()).toBe(true);

    // 4-5. Click 'View Product' and verify product detail is opened
    const productsPage = await homePage.clickProducts();
    const details = await productsPage.clickViewProductOfFirstProduct();
    expect(await details.isProductDetailVisible()).toBe(true);

    // 6. Increase quantity to 4
    await details.setQuantity('4');

    // 7-8. Click 'Add to cart', then 'View Cart'
    await details.clickAddToCart();
    const cartPage = await details.clickViewCart();

    // 9. Verify that product is displayed in cart page with exact quantity
    await expect(cartPage.cartRows).toHaveCount(1);
    expect(await cartPage.getQuantities()).toEqual(['4']);
  });

  test('TC17: Remove Products From Cart', async ({ page }) => {
    await allure.description('Remove products from cart');
    await allure.tag('cart');
    await allure.tag('remove-products');

    // 3. Verify that home page is visible successfully
    expect(await homePage.isHomePageVisible()).toBe(true);

    // 4-5. Add a product to cart and open the cart
    const productsPage = await homePage.clickProducts();
    await productsPage.addProductToCart(0);
    const cartPage = await productsPage.clickViewCart();

    // 6. Verify that cart page is displayed with the product
    await expect(cartPage.cartRows).toHaveCount(1);

    // 7. Click 'X' button corresponding to the product
    await cartPage.deleteItem();

    // 8. Verify that product is removed from the cart
    await expect(cartPage.cartRows).toHaveCount(0);
    await expect(cartPage.emptyCartMessage).toContainText('Cart is empty!');
  });

  // ---------------------------------------------------------------------------
  // Checkout & orders
  // ---------------------------------------------------------------------------

  test('TC14: Place Order: Register while Checkout', async ({ page }) => {
    await allure.description('Place order by registering during checkout');
    await allure.tag('checkout');
    await allure.tag('registration');

    // 3. Verify that home page is visible successfully
    expect(await homePage.isHomePageVisible()).toBe(true);

    // 4-6. Add product to cart, open cart
    const productsPage = await homePage.clickProducts();
    await productsPage.addProductToCart(0);
    let cartPage = await productsPage.clickViewCart();
    await expect(cartPage.cartRows).toHaveCount(1);

    // 7-8. Proceed To Checkout as a guest, then click 'Register / Login'
    await cartPage.proceedToCheckout();
    const loginPage = await cartPage.clickRegisterLoginInCheckoutModal();

    // 9-12. Fill all details in Signup, create account, verify 'Logged in as username'
    const user = TestDataProvider.generateUser();
    const accountPage = await registerViaUi(loginPage, user);

    // 13-14. Click 'Cart' and 'Proceed To Checkout' — the cart survived registration
    cartPage = await homePage.clickCart();
    await expect(cartPage.cartRows).toHaveCount(1);
    const checkoutPage = await cartPage.proceedToCheckout();
    await checkoutPage.waitForLoaded();

    // 15-20. Verify address & order review, place order, pay, verify order confirmed
    await placeOrderAndPay(checkoutPage);

    // 21-22. Delete account and verify 'ACCOUNT DELETED!'
    await deleteAccountViaUi(accountPage);
  });

  test('TC15: Place Order: Register before Checkout', async ({ page }) => {
    await allure.description('Place order after registering first');
    await allure.tag('checkout');
    await allure.tag('pre-registration');

    // 3. Verify that home page is visible successfully
    expect(await homePage.isHomePageVisible()).toBe(true);

    // 4-7. Register a new account via the UI and verify 'Logged in as username'
    const loginPage = await homePage.clickSignupLogin();
    const user = TestDataProvider.generateUser();
    const accountPage = await registerViaUi(loginPage, user);

    // 8-10. Add product to cart, open cart
    const productsPage = await homePage.clickProducts();
    await productsPage.addProductToCart(0);
    const cartPage = await productsPage.clickViewCart();
    await expect(cartPage.cartRows).toHaveCount(1);

    // 11-17. Checkout, place order, pay, verify order confirmed
    const checkoutPage = await cartPage.proceedToCheckout();
    await checkoutPage.waitForLoaded();
    await placeOrderAndPay(checkoutPage);

    // 18-19. Delete account and verify 'ACCOUNT DELETED!'
    await deleteAccountViaUi(accountPage);
  });

  test('TC16: Place Order: Login before Checkout', async ({ page }) => {
    await allure.description('Place order after logging in');
    await allure.tag('checkout');
    await allure.tag('login');

    const user = await createUserViaApi();

    // 3-6. Login and verify 'Logged in as username'
    await loginViaUi(user);

    // 7-9. Add product to cart, open cart
    const productsPage = await homePage.clickProducts();
    await productsPage.addProductToCart(0);
    const cartPage = await productsPage.clickViewCart();
    await expect(cartPage.cartRows).toHaveCount(1);

    // 10-16. Checkout, place order, pay, verify order confirmed
    const checkoutPage = await cartPage.proceedToCheckout();
    await checkoutPage.waitForLoaded();
    await placeOrderAndPay(checkoutPage);
  });

  test('TC23: Verify address details in checkout page', async ({ page }) => {
    await allure.description('Verify address details in checkout');
    await allure.tag('checkout');
    await allure.tag('address');

    const user = await createUserViaApi();

    // 3-7. Login (account was created with a known address)
    await loginViaUi(user);

    // 8-10. Add product to cart, open cart, proceed to checkout
    const productsPage = await homePage.clickProducts();
    await productsPage.addProductToCart(0);
    const cartPage = await productsPage.clickViewCart();
    const checkoutPage = await cartPage.proceedToCheckout();
    await checkoutPage.waitForLoaded();

    // 11-12. Verify delivery AND billing address match the address used at registration
    const expectedLines = [
      `${user.title}. ${user.firstName} ${user.lastName}`,
      user.company,
      user.address,
      user.address2,
      `${user.city} ${user.state} ${user.zipcode}`,
      user.country,
      user.mobileNumber
    ];
    for (const line of expectedLines) {
      await expect(checkoutPage.deliveryAddress).toContainText(line);
      await expect(checkoutPage.billingAddress).toContainText(line);
    }
  });

  test('TC24: Download Invoice after purchase order', async ({ page }) => {
    await allure.description('Download invoice after purchase');
    await allure.tag('invoice');
    await allure.tag('download');

    const user = await createUserViaApi();
    await loginViaUi(user);

    // Add product, checkout, place order and pay
    const productsPage = await homePage.clickProducts();
    await productsPage.addProductToCart(0);
    const cartPage = await productsPage.clickViewCart();
    const checkoutPage = await cartPage.proceedToCheckout();
    await checkoutPage.waitForLoaded();
    const paymentPage = await placeOrderAndPay(checkoutPage);

    // Click 'Download Invoice' and verify invoice is downloaded successfully
    const download = await paymentPage.downloadInvoice();
    expect(download.suggestedFilename()).toBe('invoice.txt');
    const invoicePath = test.info().outputPath('invoice.txt');
    await download.saveAs(invoicePath);
    await test.info().attach('invoice', { path: invoicePath, contentType: 'text/plain' });
  });

  // ---------------------------------------------------------------------------
  // Categories, brands, search + login, reviews, recommended
  // ---------------------------------------------------------------------------

  test('TC18: View Category Products', async ({ page }) => {
    await allure.description('View products by category');
    await allure.tag('categories');
    await allure.tag('products');

    // 3. Verify that categories are visible on left side bar
    const productsPage = await homePage.clickProducts();
    expect(await productsPage.areCategoriesVisible()).toBe(true);

    // 4-5. Click on 'Women' category, then 'Dress'
    await productsPage.expandCategory('Women');
    await productsPage.clickSubCategory('Women', 'Dress');

    // 6. Verify that category page is displayed and confirm text 'WOMEN - DRESS PRODUCTS'
    expect((await productsPage.getTitleText()).toUpperCase()).toBe('WOMEN - DRESS PRODUCTS');
    expect(await productsPage.areProductsListVisible()).toBe(true);

    // 7-8. On left side bar, click on a sub-category link of 'Men' and verify that page
    await productsPage.expandCategory('Men');
    await productsPage.clickSubCategory('Men', 'Tshirts');
    expect((await productsPage.getTitleText()).toUpperCase()).toBe('MEN - TSHIRTS PRODUCTS');
  });

  test('TC19: View & Cart Brand Products', async ({ page }) => {
    await allure.description('View products by brand');
    await allure.tag('brands');
    await allure.tag('products');

    // 3. Click on 'Products' button
    const productsPage = await homePage.clickProducts();

    // 4. Verify that Brands are visible on left side bar
    expect(await productsPage.areBrandsVisible()).toBe(true);

    // 5-6. Click on a brand name; verify brand page and brand products are displayed
    await productsPage.clickBrand('Polo');
    expect((await productsPage.getTitleText()).toUpperCase()).toBe('BRAND - POLO PRODUCTS');
    expect(await productsPage.areProductsListVisible()).toBe(true);

    // 7-8. Click on another brand and verify that page
    await productsPage.clickBrand('Madame');
    expect((await productsPage.getTitleText()).toUpperCase()).toBe('BRAND - MADAME PRODUCTS');
    expect(await productsPage.areProductsListVisible()).toBe(true);
  });

  test('TC20: Search Products and Verify Cart After Login', async ({ page }) => {
    await allure.description('Search products and verify cart after login');
    await allure.tag('search');
    await allure.tag('cart');
    await allure.tag('login');

    const user = await createUserViaApi();

    // 3-4. Click on 'Products' and verify ALL PRODUCTS page
    const productsPage = await homePage.clickProducts();
    expect(await productsPage.isAllProductsPageVisible()).toBe(true);

    // 5-7. Search and verify 'SEARCHED PRODUCTS' with results
    await productsPage.searchProduct('Jeans');
    expect(await productsPage.isSearchedProductsVisible()).toBe(true);
    const resultCount = await productsPage.getSearchResultsCount();
    expect(resultCount).toBeGreaterThan(0);

    // 8. Add those products to cart
    for (let i = 0; i < resultCount; i++) {
      await productsPage.addProductToCartAndContinue(i);
    }

    // 9. Click 'Cart' and verify that products are visible in cart
    let cartPage = await productsPage.clickViewCart();
    await expect(cartPage.cartRows).toHaveCount(resultCount);
    const namesBeforeLogin = await cartPage.getProductNames();

    // 10. Click 'Signup / Login' and submit login details
    await loginViaUi(user);

    // 11-12. Go to Cart again and verify the same products are still in the cart
    cartPage = await homePage.clickCart();
    await expect(cartPage.cartRows).toHaveCount(resultCount);
    expect(await cartPage.getProductNames()).toEqual(namesBeforeLogin);
  });

  test('TC21: Add review on product', async ({ page }) => {
    await allure.description('Add review on product');
    await allure.tag('review');
    await allure.tag('products');

    // 3-4. Click on 'Products' and verify ALL PRODUCTS page
    const productsPage = await homePage.clickProducts();
    expect(await productsPage.isAllProductsPageVisible()).toBe(true);

    // 5. Click on 'View Product'
    const details = await productsPage.clickViewProductOfFirstProduct();

    // 6. Verify 'Write Your Review' is visible
    expect(await details.isWriteReviewVisible()).toBe(true);

    // 7-8. Enter name, email and review; click 'Submit'
    await details.writeReview('John Doe', 'test@email.com', 'This is a great product!');

    // 9. Verify success message 'Thank you for your review.'
    expect(await details.isReviewSuccessMessageVisible()).toBe(true);
  });

  test('TC22: Add to cart from Recommended items', async ({ page }) => {
    await allure.description('Add recommended items to cart');
    await allure.tag('recommended');
    await allure.tag('cart');

    // 3. Scroll to bottom of page
    await homePage.scrollToBottom();

    // 4. Verify 'RECOMMENDED ITEMS' are visible
    expect(await homePage.areRecommendedItemsVisible()).toBe(true);

    // 5. Click on 'Add To Cart' on a recommended product
    const productName = await homePage.addRecommendedItemToCart();

    // 6. Click on 'View Cart' button
    const cartPage = await homePage.clickViewCartInModal();

    // 7. Verify that the same product is displayed in cart page
    await expect(cartPage.cartRows).toHaveCount(1);
    expect(await cartPage.getProductNames()).toEqual([productName]);
  });

  // ---------------------------------------------------------------------------
  // Scrolling
  // ---------------------------------------------------------------------------

  test('TC25: Verify Scroll Up using Arrow button and Scroll Down functionality', async ({ page }) => {
    await allure.description('Verify scroll up and down functionality');
    await allure.tag('scroll');
    await allure.tag('navigation');

    // 3. Verify that home page is visible successfully
    expect(await homePage.isHomePageVisible()).toBe(true);

    // 4-5. Scroll down page to bottom and verify 'SUBSCRIPTION' is visible
    await homePage.scrollToBottom();
    expect(await homePage.isSubscriptionVisible()).toBe(true);
    await expect(homePage.fullFledgedHeading).not.toBeInViewport();

    // 6. Click on arrow at bottom right side to move upward
    await homePage.clickScrollUpArrow();

    // 7. Verify page is scrolled up and 'Full-Fledged practice website...' is visible on screen
    await expect(homePage.fullFledgedHeading).toBeInViewport();
    await expect(homePage.fullFledgedHeading).toHaveText('Full-Fledged practice website for Automation Engineers');
  });

  test('TC26: Verify Scroll Up without Arrow button and Scroll Down functionality', async ({ page }) => {
    await allure.description('Verify scroll functionality without arrow button');
    await allure.tag('scroll');
    await allure.tag('navigation');

    // 3. Verify that home page is visible successfully
    expect(await homePage.isHomePageVisible()).toBe(true);

    // 4-5. Scroll down page to bottom and verify 'SUBSCRIPTION' is visible
    await homePage.scrollToBottom();
    expect(await homePage.isSubscriptionVisible()).toBe(true);
    await expect(homePage.fullFledgedHeading).not.toBeInViewport();

    // 6. Scroll up page to top
    await homePage.scrollToTop();

    // 7. Verify page is scrolled up and 'Full-Fledged practice website...' is visible on screen
    await expect(homePage.fullFledgedHeading).toBeInViewport();
    await expect(homePage.fullFledgedHeading).toHaveText('Full-Fledged practice website for Automation Engineers');
  });

  // ---------------------------------------------------------------------------
  // Negative scenarios — the application must REJECT bad input.
  // These tests pass when the app correctly blocks the action.
  // ---------------------------------------------------------------------------

  test('TC27: Search for a non-existent product returns no results', async ({ page }) => {
    await allure.description('Searching for a product that does not exist shows an empty result list');
    await allure.tag('search');
    await allure.tag('negative-test');

    const productsPage = await homePage.clickProducts();
    await productsPage.searchProduct('xyz123nonexistent');

    expect(await productsPage.isSearchedProductsVisible()).toBe(true);
    expect(await productsPage.getSearchResultsCount()).toBe(0);
  });

  test('TC28: Login with empty password is blocked', async ({ page }) => {
    await allure.description('Browser-side validation prevents submitting the login form without a password');
    await allure.tag('login');
    await allure.tag('negative-test');

    const loginPage = await homePage.clickSignupLogin();
    await loginPage.fillLoginForm('someone@example.com', '');
    await loginPage.clickLoginButton();

    // Form is not submitted: still on /login, no error from the server, not logged in
    await expect(page).toHaveURL(/\/login$/);
    const validationMessage = await loginPage.loginPasswordField.evaluate(
      el => (el as HTMLInputElement).validationMessage
    );
    console.log('Browser validation message:', validationMessage);
    expect(validationMessage).not.toBe('');
    await expect(page.locator('a[href="/logout"]')).toHaveCount(0);
  });

  test('TC29: Contact Us form rejects an invalid email address', async ({ page }) => {
    await allure.description('Contact form cannot be submitted with a malformed email');
    await allure.tag('contact');
    await allure.tag('negative-test');

    const contactPage = await homePage.clickContactUs();
    await contactPage.fillContactForm('John Doe', 'not-an-email', 'Subject', 'Message');

    // No confirmation dialog should ever appear — fail the test if one does
    let dialogShown = false;
    page.once('dialog', async dialog => {
      dialogShown = true;
      await dialog.dismiss();
    });
    await contactPage.submitButton.click();

    const isEmailValid = await contactPage.emailField.evaluate(el => (el as HTMLInputElement).checkValidity());
    expect(isEmailValid).toBe(false);
    expect(dialogShown).toBe(false);
    await expect(contactPage.successMessage).toBeHidden();
  });

  test('TC30: Guest cannot checkout without logging in', async ({ page }) => {
    await allure.description('Proceeding to checkout as a guest prompts the user to register or log in');
    await allure.tag('checkout');
    await allure.tag('negative-test');

    const productsPage = await homePage.clickProducts();
    await productsPage.addProductToCart(0);
    const cartPage: CartPage = await productsPage.clickViewCart();
    await cartPage.proceedToCheckout();

    // User stays on the cart page and is asked to Register / Login
    await expect(cartPage.checkoutModalMessage).toHaveText('Register / Login account to proceed on checkout.');
    await expect(cartPage.checkoutModalRegisterLoginLink).toBeVisible();
    await expect(page).toHaveURL(/\/view_cart$/);
  });
});
