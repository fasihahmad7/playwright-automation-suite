import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ContactUsPage extends BasePage {
  readonly nameField: Locator;
  readonly emailField: Locator;
  readonly subjectField: Locator;
  readonly messageField: Locator;
  readonly fileUpload: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly getInTouchText: Locator;
  readonly homeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameField = page.locator('[data-qa="name"]');
    this.emailField = page.locator('[data-qa="email"]');
    this.subjectField = page.locator('[data-qa="subject"]');
    this.messageField = page.locator('[data-qa="message"]');
    this.fileUpload = page.locator('input[name="upload_file"]');
    this.submitButton = page.locator('[data-qa="submit-button"]');
    this.successMessage = page.locator('.status.alert.alert-success');
    this.getInTouchText = page.locator('text=GET IN TOUCH');
    this.homeButton = page.locator('#form-section a.btn-success');
  }

  async isGetInTouchVisible(): Promise<boolean> {
    try {
      await this.getInTouchText.waitFor({ timeout: 10000 });
      return await this.getInTouchText.isVisible();
    } catch {
      return false;
    }
  }

  async fillContactForm(name: string, email: string, subject: string, message: string) {
    await this.fillElement(this.nameField, name);
    await this.fillElement(this.emailField, email);
    await this.fillElement(this.subjectField, subject);
    await this.fillElement(this.messageField, message);
  }

  async submitForm() {
    // Dialog handler must be registered before the action that may trigger it
    this.page.once('dialog', async dialog => {
      await dialog.accept();
    });
    await this.clickElement(this.submitButton);
  }

  async isSuccessMessageDisplayed(): Promise<boolean> {
    try {
      await this.successMessage.waitFor({ timeout: 10000 });
      return await this.successMessage.isVisible();
    } catch {
      return false;
    }
  }

  async isSuccessMessageVisible(): Promise<boolean> {
    return await this.isSuccessMessageDisplayed();
  }

  async getSuccessMessage(): Promise<string> {
    if (await this.isSuccessMessageDisplayed()) {
      return await this.getText(this.successMessage);
    }
    return '';
  }

  async clickHome() {
    await this.clickElement(this.homeButton);
    await this.page.waitForURL(url => new URL(url).pathname === '/');
  }

  async uploadFile(filePath: string) {
    await this.fileUpload.setInputFiles(filePath);
  }
}