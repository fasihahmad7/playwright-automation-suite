import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { MyAccountPage } from './MyAccountPage';

export class RegistrationPage extends BasePage {
  readonly enterAccountInfoText: Locator;
  readonly mrRadioButton: Locator;
  readonly mrsRadioButton: Locator;
  readonly passwordField: Locator;
  readonly dayDropdown: Locator;
  readonly monthDropdown: Locator;
  readonly yearDropdown: Locator;
  readonly newsletterCheckbox: Locator;
  readonly specialOffersCheckbox: Locator;
  readonly firstNameField: Locator;
  readonly lastNameField: Locator;
  readonly companyField: Locator;
  readonly addressField: Locator;
  readonly address2Field: Locator;
  readonly countryDropdown: Locator;
  readonly stateField: Locator;
  readonly cityField: Locator;
  readonly zipcodeField: Locator;
  readonly mobileNumberField: Locator;
  readonly createAccountButton: Locator;

  constructor(page: Page) {
    super(page);
    // Two '.title.text-center b' headers exist on this page; pick the right one explicitly
    this.enterAccountInfoText = page.locator('.title.text-center b').filter({ hasText: /enter account information/i });
    this.mrRadioButton = page.locator('#id_gender1');
    this.mrsRadioButton = page.locator('#id_gender2');
    this.passwordField = page.locator('[data-qa="password"]');
    this.dayDropdown = page.locator('[data-qa="days"]');
    this.monthDropdown = page.locator('[data-qa="months"]');
    this.yearDropdown = page.locator('[data-qa="years"]');
    this.newsletterCheckbox = page.locator('#newsletter');
    this.specialOffersCheckbox = page.locator('#optin');
    this.firstNameField = page.locator('[data-qa="first_name"]');
    this.lastNameField = page.locator('[data-qa="last_name"]');
    this.companyField = page.locator('[data-qa="company"]');
    this.addressField = page.locator('[data-qa="address"]');
    this.address2Field = page.locator('[data-qa="address2"]');
    this.countryDropdown = page.locator('[data-qa="country"]');
    this.stateField = page.locator('[data-qa="state"]');
    this.cityField = page.locator('[data-qa="city"]');
    this.zipcodeField = page.locator('[data-qa="zipcode"]');
    this.mobileNumberField = page.locator('[data-qa="mobile_number"]');
    this.createAccountButton = page.locator('[data-qa="create-account"]');
  }

  async isEnterAccountInformationVisible(): Promise<boolean> {
    try {
      await this.enterAccountInfoText.waitFor({ timeout: 10000 });
      return await this.enterAccountInfoText.isVisible();
    } catch {
      return false;
    }
  }

  async fillRegistrationForm(
    title: string,
    password: string,
    day: string,
    month: string,
    year: string,
    firstName: string,
    lastName: string,
    company: string,
    address: string,
    address2: string,
    country: string,
    state: string,
    city: string,
    zipcode: string,
    mobileNumber: string
  ): Promise<MyAccountPage> {
    // Select title
    if (title.toLowerCase() === 'mr') {
      await this.clickElement(this.mrRadioButton);
    } else {
      await this.clickElement(this.mrsRadioButton);
    }

    // Fill password
    await this.fillElement(this.passwordField, password);

    // Select date of birth
    await this.dayDropdown.selectOption(day);
    await this.monthDropdown.selectOption(month);
    await this.yearDropdown.selectOption(year);

    // Check newsletter and offers
    await this.newsletterCheckbox.check();
    await this.specialOffersCheckbox.check();

    // Fill address information
    await this.fillElement(this.firstNameField, firstName);
    await this.fillElement(this.lastNameField, lastName);
    await this.fillElement(this.companyField, company);
    await this.fillElement(this.addressField, address);
    await this.fillElement(this.address2Field, address2);

    // Select country
    await this.countryDropdown.selectOption(country);

    await this.fillElement(this.stateField, state);
    await this.fillElement(this.cityField, city);
    await this.fillElement(this.zipcodeField, zipcode);
    await this.fillElement(this.mobileNumberField, mobileNumber);

    // Submit form
    await this.clickElement(this.createAccountButton);
    return new MyAccountPage(this.page);
  }
}