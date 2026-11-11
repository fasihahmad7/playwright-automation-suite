import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { PaymentPage } from './PaymentPage';

export class CheckoutPage extends BasePage {
  readonly addressDetailsHeading: Locator;
  readonly reviewOrderHeading: Locator;
  readonly deliveryAddress: Locator;
  readonly billingAddress: Locator;
  readonly orderRows: Locator;
  readonly commentField: Locator;
  readonly placeOrderButton: Locator;

  constructor(page: Page) {
    super(page);
    this.addressDetailsHeading = page.locator('.step-one h2').filter({ hasText: 'Address Details' });
    this.reviewOrderHeading = page.locator('.step-one h2').filter({ hasText: 'Review Your Order' });
    this.deliveryAddress = page.locator('#address_delivery');
    this.billingAddress = page.locator('#address_invoice');
    this.orderRows = page.locator('#cart_info tbody tr[id^="product-"]');
    this.commentField = page.locator('textarea[name="message"]');
    this.placeOrderButton = page.locator('a[href="/payment"]');
  }

  async waitForLoaded() {
    await this.page.waitForURL('**/checkout');
    await this.addressDetailsHeading.waitFor();
  }

  async getDeliveryAddressText(): Promise<string> {
    return (await this.getText(this.deliveryAddress)).replace(/\s+/g, ' ').trim();
  }

  async getBillingAddressText(): Promise<string> {
    return (await this.getText(this.billingAddress)).replace(/\s+/g, ' ').trim();
  }

  async placeOrder(comment: string): Promise<PaymentPage> {
    await this.fillElement(this.commentField, comment);
    await this.clickElement(this.placeOrderButton);
    await this.page.waitForURL('**/payment');
    return new PaymentPage(this.page);
  }
}
