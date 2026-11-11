import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { blockAds } from '../utils/ApiHelper';
import { allure } from 'allure-playwright';

/**
 * INTENTIONALLY FAILING TESTS — for demonstrating failure reporting.
 *
 * Every test below fails on purpose, each for a different, realistic reason,
 * to show what a failure looks like in the console and the HTML report
 * (error diff, screenshot, video, trace).
 *
 * This file is excluded from the normal run (`npm test`) by `testIgnore`
 * in playwright.config.ts. Run it with:   npm run test:failures
 * Then open its report with:               npm run test:failures:report
 */
test.describe('Failure Demonstrations (intentional)', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    await blockAds(page);
    homePage = new HomePage(page);
    await homePage.navigateToHomePage();
  });

  test('FD01: Price regression - product price does not match expected value', async ({ page }) => {
    await allure.tag('failure-demo');
    // Scenario: the business expects "Blue Top" to cost Rs. 450 after a price change,
    // but the site still shows Rs. 500. The report shows Expected vs Received side by side.
    const productsPage = await homePage.clickProducts();
    const details = await productsPage.clickViewProductOfFirstProduct();

    await expect(details.productName).toHaveText('Blue Top');
    await expect(details.productPrice, 'Blue Top should be on sale for Rs. 450').toHaveText('Rs. 450', { timeout: 5000 });
  });

  test('FD02: Broken locator - expected button is missing from the page', async ({ page }) => {
    await allure.tag('failure-demo');
    // Scenario: a developer renamed/removed a button the test depends on.
    // Playwright waits, then fails with "element(s) not found" and a screenshot of the page.
    const productsPage = await homePage.clickProducts();
    await productsPage.addProductToCart(0);
    const cartPage = await productsPage.clickViewCart();

    await expect(
      page.locator('[data-qa="express-checkout"]'),
      'Express Checkout button should be shown in the cart'
    ).toBeVisible({ timeout: 5000 });
    await cartPage.proceedToCheckout();
  });

  test('FD03: Wrong cart count - business rule not met', async ({ page }) => {
    await allure.tag('failure-demo');
    // Scenario: requirement says adding the same product twice should create two cart lines,
    // but the site merges them into one line with quantity 2.
    const productsPage = await homePage.clickProducts();
    await productsPage.addProductToCartAndContinue(0);
    await productsPage.addProductToCart(0);
    const cartPage = await productsPage.clickViewCart();

    await expect(cartPage.cartRows, 'Each "Add to cart" click should create its own cart line').toHaveCount(2, { timeout: 5000 });
  });

  test('FD04: Soft assertions - several checks fail, all reported together', async ({ page }) => {
    await allure.tag('failure-demo');
    // Scenario: expect.soft() records a failure but lets the test continue, so one run
    // reports every mismatch on the page instead of stopping at the first one.
    const productsPage = await homePage.clickProducts();
    const details = await productsPage.clickViewProductOfFirstProduct();

    await expect.soft(details.productName).toHaveText('Blue Top');                                   // passes
    await expect.soft(details.productBrand, 'brand').toContainText('Brand: H&M', { timeout: 3000 });   // fails (Polo)
    await expect.soft(details.productCondition).toContainText('Condition: New');                       // passes
    await expect.soft(details.productAvailability, 'stock').toContainText('Out of Stock', { timeout: 3000 }); // fails (In Stock)
  });
});
