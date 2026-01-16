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
  }

  async isGetInTouchVisible(): Promise<boolean> {
    try {
      await this.getInTouchText.waitFor({ timeout: 10000 });
      return await this.getInTouchText.isVisible();
    } catch {
      // Alternative check - look for the text in page content
      const pageContent = await this.page.content();
      return pageContent.includes('GET IN TOUCH');
    }
  }

  async fillContactForm(name: string, email: string, subject: string, message: string) {
    await this.fillElement(this.nameField, name);
    await this.fillElement(this.emailField, email);
    await this.fillElement(this.subjectField, subject);
    await this.fillElement(this.messageField, message);
  }

  async submitForm() {
    await this.clickElement(this.submitButton);
    
    // Handle alert if present
    try {
      await this.page.waitForTimeout(1000);
      this.page.on('dialog', async dialog => {
        await dialog.accept();
      });
    } catch (error) {
      // Alert might not be present
    }
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

  async uploadFile(filePath: string) {
    await this.fileUpload.setInputFiles(filePath);
  }
}