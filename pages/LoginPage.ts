import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { MyAccountPage } from './MyAccountPage';
import { RegistrationPage } from './RegistrationPage';

export class LoginPage extends BasePage {
  readonly loginToAccountText: Locator;
  readonly loginEmailField: Locator;
  readonly loginPasswordField: Locator;
  readonly loginButton: Locator;
  readonly loginErrorMessage: Locator;
  readonly newUserSignupText: Locator;
  readonly signupNameField: Locator;
  readonly signupEmailField: Locator;
  readonly signupButton: Locator;
  readonly signupErrorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.loginToAccountText = page.locator('.login-form h2');
    this.loginEmailField = page.locator('[data-qa="login-email"]');
    this.loginPasswordField = page.locator('[data-qa="login-password"]');
    this.loginButton = page.locator('[data-qa="login-button"]');
    this.loginErrorMessage = page.locator('.login-form form p');
    this.newUserSignupText = page.locator('.signup-form h2');
    this.signupNameField = page.locator('[data-qa="signup-name"]');
    this.signupEmailField = page.locator('[data-qa="signup-email"]');
    this.signupButton = page.locator('[data-qa="signup-button"]');
    this.signupErrorMessage = page.locator('.signup-form form p');
  }

  async isLoginToAccountVisible(): Promise<boolean> {
    try {
      await this.loginToAccountText.waitFor({ timeout: 10000 });
      const text = await this.getText(this.loginToAccountText);
      return text.includes('Login to your account');
    } catch {
      return false;
    }
  }

  async isLoginToYourAccountVisible(): Promise<boolean> {
    return await this.isLoginToAccountVisible();
  }

  async isNewUserSignupVisible(): Promise<boolean> {
    try {
      await this.newUserSignupText.waitFor({ timeout: 10000 });
      const text = await this.getText(this.newUserSignupText);
      return text.includes('New User Signup!');
    } catch {
      return false;
    }
  }

  async loginUser(email: string, password: string): Promise<MyAccountPage> {
    await this.fillElement(this.loginEmailField, email);
    await this.fillElement(this.loginPasswordField, password);
    await this.clickElement(this.loginButton);
    return new MyAccountPage(this.page);
  }

  async fillLoginForm(email: string, password: string) {
    await this.fillElement(this.loginEmailField, email);
    await this.fillElement(this.loginPasswordField, password);
  }

  async clickLoginButton() {
    await this.clickElement(this.loginButton);
  }

  async fillSignupForm(name: string, email: string) {
    await this.fillElement(this.signupNameField, name);
    await this.fillElement(this.signupEmailField, email);
  }

  async clickSignupButton() {
    await this.clickElement(this.signupButton);
  }

  async isLoginErrorVisible(): Promise<boolean> {
    return await this.isLoginErrorMessageVisible();
  }

  async isEmailExistsErrorVisible(): Promise<boolean> {
    return await this.isSignupErrorMessageVisible();
  }

  async signupNewUser(name: string, email: string): Promise<RegistrationPage> {
    await this.fillElement(this.signupNameField, name);
    await this.fillElement(this.signupEmailField, email);
    await this.clickElement(this.signupButton);
    return new RegistrationPage(this.page);
  }

  async isLoginErrorMessageVisible(): Promise<boolean> {
    try {
      await this.loginErrorMessage.waitFor({ timeout: 5000 });
      return await this.loginErrorMessage.isVisible();
    } catch {
      return false;
    }
  }

  async isSignupErrorMessageVisible(): Promise<boolean> {
    try {
      await this.signupErrorMessage.waitFor({ timeout: 5000 });
      return await this.signupErrorMessage.isVisible();
    } catch {
      return false;
    }
  }

  async getLoginErrorMessage(): Promise<string> {
    if (await this.isLoginErrorMessageVisible()) {
      return await this.getText(this.loginErrorMessage);
    }
    return '';
  }

  async getSignupErrorMessage(): Promise<string> {
    if (await this.isSignupErrorMessageVisible()) {
      return await this.getText(this.signupErrorMessage);
    }
    return '';
  }
}