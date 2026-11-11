import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { CheckoutPage } from './CheckoutPage';
import { LoginPage } from './LoginPage';

export class CartPage extends BasePage {
  readonly cartRows: Locator;
  readonly totalPrice: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly deleteFirstItemButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly firstProductName: Locator;
  readonly firstProductPrice: Locator;
  readonly checkoutModalMessage: Locator;
  readonly checkoutModalRegisterLoginLink: Locator;
  readonly subscriptionEmailInput: Locator;
  readonly subscribeButton: Locator;
  readonly subscriptionSuccessMessage: Locator;

  constructor(page: Page) {
    super(page);
    // One <tr> per product. (Note: '#cart_items .cart_info' is the table wrapper and
    // is always present — even for an empty cart — so it must not be used for counting.)
    this.cartRows = page.locator('#cart_info_table tbody tr');
    this.totalPrice = page.locator('.cart_total_price');
    this.proceedToCheckoutButton = page.locator('.btn.btn-default.check_out');
    this.deleteFirstItemButton = page.locator('.cart_quantity_delete').first();
    this.emptyCartMessage = page.locator('#empty_cart');
    this.firstProductName = page.locator('#cart_info_table .cart_description h4 a').first();
    this.firstProductPrice = page.locator('#cart_info_table .cart_price p').first();
    this.checkoutModalMessage = page.locator('#checkoutModal .modal-body p').first();
    this.checkoutModalRegisterLoginLink = page.locator('#checkoutModal a[href="/login"]');
    this.subscriptionEmailInput = page.locator('#susbscribe_email');
    this.subscribeButton = page.locator('#subscribe');
    this.subscriptionSuccessMessage = page.locator('#success-subscribe');
  }

  async getCartItemsCount(): Promise<number> {
    return await this.cartRows.count();
  }

  async isCartEmpty(): Promise<boolean> {
    return (await this.getCartItemsCount()) === 0;
  }

  /** Total of the first line item (each row has its own total cell). */
  async getTotalPrice(): Promise<string> {
    try {
      await this.totalPrice.first().waitFor({ timeout: 5000 });
      return (await this.getText(this.totalPrice.first())).trim();
    } catch {
      return '';
    }
  }

  async getQuantities(): Promise<string[]> {
    const quantities = await this.page.locator('#cart_info_table .cart_quantity button').allTextContents();
    return quantities.map(q => q.trim());
  }

  async getProductNames(): Promise<string[]> {
    const names = await this.page.locator('#cart_info_table .cart_description h4 a').allTextContents();
    return names.map(n => n.trim());
  }

  async proceedToCheckout(): Promise<CheckoutPage> {
    await this.clickElement(this.proceedToCheckoutButton);
    return new CheckoutPage(this.page);
  }

  /** Guest checkout shows a "Register / Login" modal instead of the checkout page. */
  async clickRegisterLoginInCheckoutModal(): Promise<LoginPage> {
    await this.clickElement(this.checkoutModalRegisterLoginLink);
    return new LoginPage(this.page);
  }

  async removeFirstItem() {
    const before = await this.getCartItemsCount();
    await this.clickElement(this.deleteFirstItemButton);
    // Removal is an AJAX call followed by a DOM update — wait for the row to disappear
    await this.page.waitForFunction(
      expected => document.querySelectorAll('#cart_info_table tbody tr').length === expected,
      before - 1,
      { timeout: 10000 }
    );
  }

  async deleteItem() {
    await this.removeFirstItem();
  }

  async getFirstProductName(): Promise<string> {
    try {
      await this.firstProductName.waitFor({ timeout: 5000 });
      return (await this.getText(this.firstProductName)).trim();
    } catch {
      return '';
    }
  }

  async getFirstProductPrice(): Promise<string> {
    try {
      await this.firstProductPrice.waitFor({ timeout: 5000 });
      return (await this.getText(this.firstProductPrice)).trim();
    } catch {
      return '';
    }
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
}
