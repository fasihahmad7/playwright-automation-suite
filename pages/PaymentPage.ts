import { Page, Locator, Download } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CardDetails {
  nameOnCard: string;
  cardNumber: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
}

export class PaymentPage extends BasePage {
  readonly nameOnCardField: Locator;
  readonly cardNumberField: Locator;
  readonly cvcField: Locator;
  readonly expiryMonthField: Locator;
  readonly expiryYearField: Locator;
  readonly payButton: Locator;
  readonly orderPlacedHeading: Locator;
  readonly orderConfirmedMessage: Locator;
  readonly downloadInvoiceButton: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameOnCardField = page.locator('[data-qa="name-on-card"]');
    this.cardNumberField = page.locator('[data-qa="card-number"]');
    this.cvcField = page.locator('[data-qa="cvc"]');
    this.expiryMonthField = page.locator('[data-qa="expiry-month"]');
    this.expiryYearField = page.locator('[data-qa="expiry-year"]');
    this.payButton = page.locator('[data-qa="pay-button"]');
    this.orderPlacedHeading = page.locator('[data-qa="order-placed"]');
    this.orderConfirmedMessage = page.locator('#form p').filter({ hasText: 'Congratulations' });
    this.downloadInvoiceButton = page.locator('a[href^="/download_invoice"]');
    this.continueButton = page.locator('[data-qa="continue-button"]');
  }

  async payAndConfirm(card: CardDetails) {
    await this.fillElement(this.nameOnCardField, card.nameOnCard);
    await this.fillElement(this.cardNumberField, card.cardNumber);
    await this.fillElement(this.cvcField, card.cvc);
    await this.fillElement(this.expiryMonthField, card.expiryMonth);
    await this.fillElement(this.expiryYearField, card.expiryYear);
    await this.clickElement(this.payButton);
    await this.page.waitForURL('**/payment_done/**');
  }

  async downloadInvoice(): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.clickElement(this.downloadInvoiceButton)
    ]);
    return download;
  }

  async clickContinue() {
    await this.clickElement(this.continueButton);
  }
}
