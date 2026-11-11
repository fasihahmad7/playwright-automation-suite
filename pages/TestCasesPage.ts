import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class TestCasesPage extends BasePage {
  readonly pageTitle: Locator;
  readonly testCasesContent: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.title.text-center');
    this.testCasesContent = page.locator('.test-cases');
  }

  async isTestCasesPageVisible(): Promise<boolean> {
    try {
      await this.pageTitle.waitFor({ timeout: 10000 });
      const currentUrl = await this.getCurrentUrl();
      const titleText = await this.getText(this.pageTitle);
      return currentUrl.includes('test_cases') && titleText.toUpperCase().includes('TEST CASES');
    } catch {
      return false;
    }
  }
}