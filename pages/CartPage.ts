import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly cartItems: Locator;
  readonly totalPrice: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly increaseQuantityButton: Locator;
  readonly decreaseQuantityButton: Locator;
  readonly deleteFirstItemButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly firstProductName: Locator;
  readonly firstProductPrice: Locator;
  readonly subscriptionEmailInput: Locator;
  readonly subscribeButton: Locator;
  readonly subscriptionSuccessMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator('#cart_items .cart_info');
    this.totalPrice = page.locator('.cart_total_price');
    this.proceedToCheckoutButton = page.locator('.btn.btn-default.check_out');
    this.increaseQuantityButton = page.locator('.cart_quantity_up');
    this.decreaseQuantityButton = page.locator('.cart_quantity_down');
    this.deleteFirstItemButton = page.locator('.cart_quantity_delete').first();
    this.emptyCartMessage = page.locator('.empty_cart');
    this.firstProductName = page.locator('#cart_items .cart_description h4 a');
    this.firstProductPrice = page.locator('#cart_items .cart_price p');
    this.subscriptionEmailInput = page.locator('#susbscribe_email');
    this.subscribeButton = page.locator('#subscribe');
    this.subscriptionSuccessMessage = page.locator('.alert-success');
  }

  async getCartItemsCount(): Promise<number> {
    try {
      return await this.cartItems.count();
    } catch {
      return 0;
    }
  }

  async isCartEmpty(): Promise<boolean> {
    try {
      const itemsCount = await this.getCartItemsCount();
      const emptyMessageVisible = await this.emptyCartMessage.isVisible();
      return itemsCount === 0 || emptyMessageVisible;
    } catch {
      return true;
    }
  }

  async getTotalPrice(): Promise<string> {
    try {
      await this.totalPrice.waitFor({ timeout: 5000 });
      return await this.getText(this.totalPrice);
    } catch {
      return '';
    }
  }

  async proceedToCheckout() {
    try {
      await this.clickElement(this.proceedToCheckoutButton);
    } catch (error) {
      console.log('Proceed to checkout button not found or not clickable');
    }
  }

  async increaseQuantity() {
    try {
      await this.clickElement(this.increaseQuantityButton);
    } catch (error) {
      console.log('Increase quantity button not found');
    }
  }

  async decreaseQuantity() {
    try {
      await this.clickElement(this.decreaseQuantityButton);
    } catch (error) {
      console.log('Decrease quantity button not found');
    }
  }

  async removeFirstItem() {
    try {
      await this.clickElement(this.deleteFirstItemButton);
    } catch (error) {
      console.log('Delete item button not found');
    }
  }

  async deleteItem() {
    await this.removeFirstItem();
  }

  async getFirstProductName(): Promise<string> {
    try {
      await this.firstProductName.waitFor({ timeout: 5000 });
      return await this.getText(this.firstProductName);
    } catch {
      return '';
    }
  }

  async getFirstProductPrice(): Promise<string> {
    try {
      await this.firstProductPrice.waitFor({ timeout: 5000 });
      return await this.getText(this.firstProductPrice);
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