import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartPage } from './CartPage';

export class ProductDetailsPage extends BasePage {
  readonly productName: Locator;
  readonly productCategory: Locator;
  readonly productPrice: Locator;
  readonly productAvailability: Locator;
  readonly productCondition: Locator;
  readonly productBrand: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly productImage: Locator;
  readonly writeReviewSection: Locator;
  readonly reviewerName: Locator;
  readonly reviewerEmail: Locator;
  readonly reviewText: Locator;
  readonly submitReviewButton: Locator;
  readonly reviewSuccessMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.productName = page.locator('.product-information h2');
    this.productCategory = page.locator('.product-information p').nth(2);
    this.productPrice = page.locator('.product-information span span');
    this.productAvailability = page.locator('.product-information p').nth(5);
    this.productCondition = page.locator('.product-information p').nth(6);
    this.productBrand = page.locator('.product-information p').nth(7);
    this.quantityInput = page.locator('#quantity');
    this.addToCartButton = page.locator('.btn.btn-default.cart');
    this.productImage = page.locator('.active > img');
    this.writeReviewSection = page.locator('#reviews h2');
    this.reviewerName = page.locator('#name');
    this.reviewerEmail = page.locator('#email');
    this.reviewText = page.locator('#review');
    this.submitReviewButton = page.locator('#button-review');
    this.reviewSuccessMessage = page.locator('.alert-success');
  }

  async isProductDetailVisible(): Promise<boolean> {
    try {
      await this.productName.waitFor({ timeout: 10000 });
      return (
        (await this.productName.isVisible()) &&
        (await this.productCategory.isVisible()) &&
        (await this.productPrice.isVisible()) &&
        (await this.productAvailability.isVisible()) &&
        (await this.productCondition.isVisible()) &&
        (await this.productBrand.isVisible())
      );
    } catch {
      return false;
    }
  }

  async getProductName(): Promise<string> {
    try {
      return await this.getText(this.productName);
    } catch {
      return '';
    }
  }

  async getProductCategory(): Promise<string> {
    try {
      return await this.getText(this.productCategory);
    } catch {
      return '';
    }
  }

  async getProductPrice(): Promise<string> {
    try {
      return await this.getText(this.productPrice);
    } catch {
      return '';
    }
  }

  async getProductAvailability(): Promise<string> {
    try {
      return await this.getText(this.productAvailability);
    } catch {
      return '';
    }
  }

  async getProductCondition(): Promise<string> {
    try {
      return await this.getText(this.productCondition);
    } catch {
      return '';
    }
  }

  async getProductBrand(): Promise<string> {
    try {
      return await this.getText(this.productBrand);
    } catch {
      return '';
    }
  }

  async setQuantity(quantity: string) {
    await this.quantityInput.clear();
    await this.fillElement(this.quantityInput, quantity);
  }

  async clickAddToCart() {
    await this.clickElement(this.addToCartButton);
  }

  async clickViewCart(): Promise<CartPage> {
    try {
      const viewCartButton = this.page.locator('a[href="/view_cart"]');
      await this.clickElement(viewCartButton);
      return new CartPage(this.page);
    } catch {
      return new CartPage(this.page);
    }
  }

  async isWriteReviewVisible(): Promise<boolean> {
    try {
      await this.scrollToElement(this.writeReviewSection);
      return await this.writeReviewSection.isVisible();
    } catch {
      return false;
    }
  }

  async writeReview(name: string, email: string, review: string) {
    await this.scrollToElement(this.writeReviewSection);
    await this.fillElement(this.reviewerName, name);
    await this.fillElement(this.reviewerEmail, email);
    await this.fillElement(this.reviewText, review);
    await this.clickElement(this.submitReviewButton);
  }

  async isReviewSuccessMessageVisible(): Promise<boolean> {
    try {
      await this.reviewSuccessMessage.waitFor({ timeout: 5000 });
      const text = await this.getText(this.reviewSuccessMessage);
      return text.includes('Thank you for your review');
    } catch {
      return false;
    }
  }
}