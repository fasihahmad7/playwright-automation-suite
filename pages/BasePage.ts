import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(url: string) {
    // Relative URLs are resolved against `baseURL` in playwright.config.ts.
    // 'domcontentloaded' is reliable and fast; each test waits for its own specific
    // elements, so waiting for all network activity (networkidle) just adds flakiness
    // on live sites that continuously fire analytics/tracking requests.
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async waitForElement(locator: Locator, timeout: number = 60000) {
    await locator.waitFor({ timeout });
  }

  async clickElement(locator: Locator) {
    await locator.waitFor({ timeout: 30000 });
    await locator.click();
  }

  async fillElement(locator: Locator, text: string) {
    await locator.waitFor({ timeout: 30000 });
    await locator.fill(text);
  }

  async getText(locator: Locator): Promise<string> {
    return await locator.textContent() || '';
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  async scrollToElement(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
  }

  async scrollToTop() {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('load');
  }

  async handleAlert(action: 'accept' | 'dismiss' = 'accept') {
    this.page.on('dialog', async dialog => {
      if (action === 'accept') {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }
}