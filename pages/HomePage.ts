import { Page, Locator } from '@playwright/test';
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
    this.subscriptionSuccessMessage = page.locator('.alert-success');
    this.recommendedItems = page.locator('.recommended_items');
    this.categoryProducts = page.locator('.category-products');
    this.brandsProducts = page.locator('.brands_products');
    this.firstProduct = page.locator('.features_items .col-sm-4').first();
  }

  async navigateToHomePage() {
    await this.navigateTo('/');
    await this.waitForPageLoad();
  }

  async isHomePageVisible(): Promise<boolean> {
    try {
      // Wait for page to load and check for key elements
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      
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
    return new ContactUsPage(this.page);
  }

  async clickTestCases(): Promise<TestCasesPage> {
    await this.clickElement(this.testCasesButton);
    return new TestCasesPage(this.page);
  }

  async clickCart(): Promise<CartPage> {
    await this.clickElement(this.cartButton);
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

  async addRecommendedItemToCart() {
    try {
      await this.scrollToElement(this.recommendedItems);
      const addToCartButton = this.recommendedItems.locator('.add-to-cart').first();
      await this.clickElement(addToCartButton);
    } catch (error) {
      console.log('Could not add recommended item to cart:', error);
    }
  }

  async clickScrollUpArrow() {
    try {
      const scrollUpArrow = this.page.locator('#scrollUp');
      await this.clickElement(scrollUpArrow);
    } catch (error) {
      console.log('Scroll up arrow not found:', error);
    }
  }

  async isFullFledgedTextVisible(): Promise<boolean> {
    try {
      // Look for the text in multiple possible locations
      const textSelectors = [
        'text=Full-Fledged practice website for Automation Engineers',
        '.carousel-inner',
        '.item.active',
        'h2'
      ];
      
      for (const selector of textSelectors) {
        try {
          const element = this.page.locator(selector);
          if (await element.isVisible()) {
            const text = await element.textContent();
            if (text && text.toLowerCase().includes('full-fledged')) {
              return true;
            }
          }
        } catch {
          continue;
        }
      }
      
      // Alternative: check page content directly
      const pageContent = await this.page.content();
      return pageContent.toLowerCase().includes('full-fledged') || 
             pageContent.toLowerCase().includes('automation engineers');
    } catch {
      return false;
    }
  }

  async clickHome(): Promise<HomePage> {
    try {
      const homeButton = this.page.locator('a[href="/"]');
      await this.clickElement(homeButton);
      return new HomePage(this.page);
    } catch {
      return this;
    }
  }
}