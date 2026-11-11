import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { HomePage } from './HomePage';

export class MyAccountPage extends BasePage {
  readonly logoutButton: Locator;
  readonly deleteAccountButton: Locator;
  readonly accountCreatedMessage: Locator;
  readonly accountDeletedMessage: Locator;
  readonly continueButton: Locator;
  readonly loggedInAsText: Locator;

  constructor(page: Page) {
    super(page);
    this.logoutButton = page.locator('a[href="/logout"]');
    this.deleteAccountButton = page.locator('a[href="/delete_account"]');
    this.accountCreatedMessage = page.locator('h2[data-qa="account-created"]');
    this.accountDeletedMessage = page.locator('h2[data-qa="account-deleted"]');
    this.continueButton = page.locator('[data-qa="continue-button"]');
    this.loggedInAsText = page.locator('.navbar-nav li').filter({ hasText: 'Logged in as' });
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.loggedInAsText.waitFor({ timeout: 10000 });
      return await this.loggedInAsText.isVisible();
    } catch {
      return false;
    }
  }

  async isAccountCreated(): Promise<boolean> {
    try {
      await this.accountCreatedMessage.waitFor({ timeout: 10000 });
      const text = await this.getText(this.accountCreatedMessage);
      // Use case-insensitive comparison
      return text.toUpperCase().includes('ACCOUNT CREATED') || text.toUpperCase().includes('CREATED');
    } catch {
      return false;
    }
  }

  async isAccountDeleted(): Promise<boolean> {
    try {
      await this.accountDeletedMessage.waitFor({ timeout: 10000 });
      const text = await this.getText(this.accountDeletedMessage);
      // Use case-insensitive comparison
      return text.toUpperCase().includes('ACCOUNT DELETED') || text.toUpperCase().includes('DELETED');
    } catch {
      return false;
    }
  }

  async getLoggedInText(): Promise<string> {
    try {
      return (await this.getText(this.loggedInAsText)).trim();
    } catch {
      return '';
    }
  }

  async logout(): Promise<HomePage> {
    await this.clickElement(this.logoutButton);
    return new HomePage(this.page);
  }

  async deleteAccount() {
    await this.clickElement(this.deleteAccountButton);
  }

  async clickContinue() {
    await this.clickElement(this.continueButton);
  }

  async getWelcomeMessage(): Promise<string> {
    return await this.getLoggedInText();
  }

  async getAccountCreatedMessage(): Promise<string> {
    if (await this.isAccountCreated()) {
      return await this.getText(this.accountCreatedMessage);
    }
    return '';
  }

  async getAccountDeletedMessage(): Promise<string> {
    if (await this.isAccountDeleted()) {
      return await this.getText(this.accountDeletedMessage);
    }
    return '';
  }
}