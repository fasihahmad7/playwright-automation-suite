import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoginPage } from './LoginPage';
import { ProductsPage } from './ProductsPage';
import { ContactUsPage } from './ContactUsPage';
import { CartPage } from './CartPage';
import { TestCasesPage } from './TestCasesPage';

export class HomePage extends BasePage {
  readonly signupLoginButton: Locator;
  readonly productsButton: Locator;
  readonly contactUsButton: Locator;
  readonly testCasesButton: Locator;
  readonly cartButton: Locator;
  readonly logo: Locator;
  readonly carousel: Locator;
  readonly featuresItems: Locator;
  readonly subscriptionEmailInput: Locator;
  readonly subscribeButton: Locator;
  readonly subscriptionSuccessMessage: Locator;
  readonly recommendedItems: Locator;
  readonly categoryProducts: Locator;
  readonly brandsProducts: Locator;
  readonly firstProduct: Locator;
  readonly fullFledgedHeading: Locator;
  readonly scrollUpArrow: Locator;
  readonly cartModal: Locator;

  constructor(page: Page) {
    super(page);
    this.signupLoginButton = page.locator('a[href="/login"]').first();
    this.productsButton = page.locator('a[href="/products"]').first();
    this.contactUsButton = page.locator('a[href="/contact_us"]').first();
    this.testCasesButton = page.locator('a[href="/test_cases"]').first();
    this.cartButton = page.locator('a[href="/view_cart"]').first();
    this.logo = page.locator('.logo img');
    this.carousel = page.locator('.carousel-inner');
    this.featuresItems = page.locator('.features_items');
    this.subscriptionEmailInput = page.locator('#susbscribe_email');
    this.subscribeButton = page.locator('#subscribe');
    this.subscriptionSuccessMessage = page.locator('#success-subscribe');
    this.recommendedItems = page.locator('.recommended_items');
    this.categoryProducts = page.locator('.category-products');
    this.brandsProducts = page.locator('.brands_products');
    this.firstProduct = page.locator('.features_items .col-sm-4').first();
    this.fullFledgedHeading = page.locator('#slider-carousel .item.active h2');
    this.scrollUpArrow = page.locator('#scrollUp');
    this.cartModal = page.locator('#cartModal');
  }

  async navigateToHomePage() {
    await this.navigateTo('/');
    await this.waitForPageLoad();
  }

  async isHomePageVisible(): Promise<boolean> {
    try {
      // Wait for page to load and check for key elements
      await this.page.waitForLoadState('load', { timeout: 10000 });
      
      // Check for multiple indicators that we're on the home page
      const logoVisible = await this.logo.isVisible().catch(() => false);
      const featuresVisible = await this.featuresItems.isVisible().catch(() => false);
      const currentUrl = await this.getCurrentUrl();
      
      return (logoVisible || featuresVisible) && (currentUrl.includes('automationexercise.com') || currentUrl === 'https://automationexercise.com/');
    } catch {
      return false;
    }
  }

  async clickSignupLogin(): Promise<LoginPage> {
    await this.clickElement(this.signupLoginButton);
    return new LoginPage(this.page);
  }

  async clickProducts(): Promise<ProductsPage> {
    await this.clickElement(this.productsButton);
    return new ProductsPage(this.page);
  }

  async clickContactUs(): Promise<ContactUsPage> {
    await this.clickElement(this.contactUsButton);
    // Wait for full load: the form's submit handler (confirm dialog) is bound by page JS,
    // and submitting before it is attached silently skips the success message.
    await this.page.waitForURL('**/contact_us', { waitUntil: 'load' });
    return new ContactUsPage(this.page);
  }

  async clickTestCases(): Promise<TestCasesPage> {
    await this.clickElement(this.testCasesButton);
    return new TestCasesPage(this.page);
  }

  async clickCart(): Promise<CartPage> {
    await this.clickElement(this.cartButton);
    await this.page.waitForURL('**/view_cart');
    return new CartPage(this.page);
  }

  async scrollToFooter() {
    await this.scrollToBottom();
  }

  async isSubscriptionVisible(): Promise<boolean> {
    await this.scrollToFooter();
    return await this.subscriptionEmailInput.isVisible();
  }

  async subscribeWithEmail(email: string) {
    await this.scrollToFooter();
    await this.fillElement(this.subscriptionEmailInput, email);
    await this.clickElement(this.subscribeButton);
  }

  async isSubscriptionSuccessMessageVisible(): Promise<boolean> {
    try {
      await this.subscriptionSuccessMessage.waitFor({ timeout: 5000 });
      return await this.subscriptionSuccessMessage.isVisible();
    } catch {
      return false;
    }
  }

  async getSubscriptionSuccessMessage(): Promise<string> {
    if (await this.isSubscriptionSuccessMessageVisible()) {
      return await this.getText(this.subscriptionSuccessMessage);
    }
    return '';
  }

  async areCategoriesVisible(): Promise<boolean> {
    return await this.categoryProducts.isVisible();
  }

  async areBrandsVisible(): Promise<boolean> {
    return await this.brandsProducts.isVisible();
  }

  async areRecommendedItemsVisible(): Promise<boolean> {
    await this.scrollToElement(this.recommendedItems);
    return await this.recommendedItems.isVisible();
  }

  /** Adds the first visible recommended product and returns its name. */
  async addRecommendedItemToCart(): Promise<string> {
    await this.scrollToElement(this.recommendedItems);
    const item = this.recommendedItems.locator('.item.active .productinfo').first();
    const name = (await this.getText(item.locator('p'))).trim();
    await this.clickElement(item.locator('.add-to-cart'));
    await this.cartModal.waitFor({ state: 'visible', timeout: 15000 });
    return name;
  }

  async clickViewCartInModal(): Promise<CartPage> {
    await this.clickElement(this.cartModal.locator('a[href="/view_cart"]'));
    await this.page.waitForURL('**/view_cart');
    return new CartPage(this.page);
  }

  async clickScrollUpArrow() {
    await this.clickElement(this.scrollUpArrow);
  }

  /** Current vertical scroll offset — 0 means the page is at the very top. */
  async getScrollY(): Promise<number> {
    return await this.page.evaluate(() => window.scrollY);
  }

  /** True only when the hero heading is actually inside the viewport (i.e. the page is scrolled to the top). */
  async isFullFledgedTextVisible(): Promise<boolean> {
    try {
      await expect(this.fullFledgedHeading).toBeInViewport({ timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickHome(): Promise<HomePage> {
    await this.clickElement(this.page.locator('.shop-menu a[href="/"]'));
    return new HomePage(this.page);
  }
}