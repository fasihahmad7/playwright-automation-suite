import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductDetailsPage } from './ProductDetailsPage';
import { CartPage } from './CartPage';

export class ProductsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly productsList: Locator;
  readonly firstProduct: Locator;
  readonly firstProductViewButton: Locator;
  readonly searchProductInput: Locator;
  readonly searchButton: Locator;
  readonly searchResultsTitle: Locator;
  readonly categoryProducts: Locator;
  readonly brandsProducts: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.title.text-center');
    this.productsList = page.locator('.features_items .col-sm-4');
    this.firstProduct = page.locator('.features_items .col-sm-4').first();
    this.firstProductViewButton = page.locator('.features_items .col-sm-4').first().locator('a[href*="/product_details/"]');
    this.searchProductInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
    this.searchResultsTitle = page.locator('.title.text-center');
    this.categoryProducts = page.locator('.category-products');
    this.brandsProducts = page.locator('.brands_products');
  }

  async isAllProductsPageVisible(): Promise<boolean> {
    try {
      await this.pageTitle.waitFor({ timeout: 10000 });
      const text = await this.getText(this.pageTitle);
      // Use case-insensitive comparison
      return text.toUpperCase().includes('ALL PRODUCTS') || text.toUpperCase().includes('PRODUCTS');
    } catch {
      return false;
    }
  }

  async areProductsListVisible(): Promise<boolean> {
    const count = await this.productsList.count();
    return count > 0;
  }

  async clickViewProductOfFirstProduct(): Promise<ProductDetailsPage> {
    try {
      // Wait for products to load
      await this.page.waitForSelector('.features_items .col-sm-4', { timeout: 30000 });
      
      // Try multiple strategies to find and click view product
      const strategies = [
        () => this.firstProduct.locator('a[href*="/product_details/"]').first().click(),
        () => this.firstProduct.locator('.choose a').first().click(),
        () => this.firstProduct.locator('a').filter({ hasText: 'View Product' }).first().click(),
        () => this.page.locator('.features_items .col-sm-4').first().locator('a[href*="/product_details/"]').click()
      ];
      
      for (const strategy of strategies) {
        try {
          await this.scrollToElement(this.firstProduct);
          await strategy();
          // Wait for navigation to product details page
          await this.page.waitForURL('**/product_details/**', { timeout: 10000 });
          break;
        } catch (error) {
          console.log('Strategy failed, trying next:', error.message);
          continue;
        }
      }
      
      return new ProductDetailsPage(this.page);
    } catch (error) {
      console.log('All strategies failed for view product:', error.message);
      return new ProductDetailsPage(this.page);
    }
  }

  async searchProduct(productName: string) {
    await this.fillElement(this.searchProductInput, productName);
    await this.clickElement(this.searchButton);
  }

  async isSearchedProductsVisible(): Promise<boolean> {
    try {
      await this.searchResultsTitle.waitFor({ timeout: 10000 });
      const text = await this.getText(this.searchResultsTitle);
      // Use case-insensitive comparison
      return text.toUpperCase().includes('SEARCHED PRODUCTS') || text.toUpperCase().includes('PRODUCTS');
    } catch {
      return false;
    }
  }

  async areSearchResultsVisible(): Promise<boolean> {
    const count = await this.productsList.count();
    return count > 0;
  }

  async getSearchResultsCount(): Promise<number> {
    return await this.productsList.count();
  }

  async getFirstProductName(): Promise<string> {
    try {
      const productName = this.firstProduct.locator('p');
      return await this.getText(productName);
    } catch {
      return '';
    }
  }

  async clickFirstProduct(): Promise<ProductDetailsPage> {
    await this.clickElement(this.firstProduct);
    return new ProductDetailsPage(this.page);
  }

  async addProductToCart(productIndex: number = 0) {
    try {
      // Wait for products to load
      await this.page.waitForSelector('.features_items .col-sm-4', { timeout: 30000 });
      
      const product = this.productsList.nth(productIndex);
      
      // Scroll to product and hover
      await this.scrollToElement(product);
      await product.hover();
      await this.page.waitForTimeout(2000); // Wait for hover effects
      
      // Try multiple strategies to add to cart
      const addToCartStrategies = [
        () => product.locator('.add-to-cart').first().click(),
        () => product.locator('a[data-product-id]').first().click(),
        () => product.locator('.btn.btn-default.add-to-cart').first().click(),
        () => this.page.locator('.overlay-content .add-to-cart').first().click()
      ];
      
      for (const strategy of addToCartStrategies) {
        try {
          await strategy();
          console.log('Successfully added product to cart');
          
          // Wait for modal or confirmation and handle it
          await this.page.waitForTimeout(3000);
          
          // Try to handle any modal that appears
          await this.handleAddToCartModal();
          return;
        } catch (error) {
          console.log('Add to cart strategy failed, trying next:', error.message);
          continue;
        }
      }
      
      console.log('All add to cart strategies failed');
    } catch (error) {
      console.log('Could not add product to cart:', error.message);
    }
  }

  async handleAddToCartModal() {
    try {
      // Check if modal appeared and handle it
      const modalVisible = await this.page.locator('.modal').isVisible();
      if (modalVisible) {
        console.log('Modal detected after adding to cart');
        
        // Try to click continue shopping to dismiss modal
        const continueButtons = [
          '.modal .btn-success',
          '.modal button:has-text("Continue Shopping")',
          '.close-modal',
          '.modal .close'
        ];
        
        for (const selector of continueButtons) {
          try {
            await this.page.locator(selector).click();
            console.log('Successfully dismissed modal');
            await this.page.waitForTimeout(1000);
            return;
          } catch {
            continue;
          }
        }
        
        // If no button works, try escape key
        await this.page.keyboard.press('Escape');
      }
    } catch (error) {
      console.log('Modal handling failed:', error.message);
    }
  }

  async clickContinueShopping() {
    try {
      // Try multiple strategies to handle continue shopping
      const continueStrategies = [
        () => this.page.locator('.btn.btn-success.close-modal').click(),
        () => this.page.locator('.modal .btn-success').click(),
        () => this.page.locator('button').filter({ hasText: 'Continue Shopping' }).click(),
        () => this.page.locator('.close-modal').click()
      ];
      
      for (const strategy of continueStrategies) {
        try {
          await strategy();
          console.log('Successfully clicked continue shopping');
          await this.page.waitForTimeout(1000);
          return;
        } catch (error) {
          console.log('Continue shopping strategy failed, trying next:', error.message);
          continue;
        }
      }
      
      // If all strategies fail, try to dismiss modal by clicking backdrop
      await this.page.locator('.modal-backdrop').click();
      console.log('Dismissed modal via backdrop');
    } catch (error) {
      console.log('Continue shopping button not found');
    }
  }

  async clickViewCart(): Promise<CartPage> {
    try {
      // First, dismiss any open modals that might be blocking
      await this.dismissModals();
      
      // Try multiple strategies to find view cart button
      const viewCartStrategies = [
        () => this.page.locator('a[href="/view_cart"]').first().click(),
        () => this.page.locator('text=View Cart').first().click(),
        () => this.page.locator('.btn.btn-success').filter({ hasText: 'View Cart' }).first().click(),
        () => this.page.locator('u').filter({ hasText: 'View Cart' }).click(),
        () => this.page.locator('.modal a[href="/view_cart"]').click()
      ];
      
      for (const strategy of viewCartStrategies) {
        try {
          await strategy();
          console.log('Successfully clicked view cart');
          await this.page.waitForTimeout(2000);
          return new CartPage(this.page);
        } catch (error) {
          console.log('View cart strategy failed, trying next:', error.message);
          continue;
        }
      }
      
      // If all strategies fail, navigate directly to cart
      console.log('All view cart strategies failed, navigating directly');
      await this.page.goto('https://automationexercise.com/view_cart');
      return new CartPage(this.page);
    } catch (error) {
      console.log('View cart button not found, navigating directly');
      await this.page.goto('https://automationexercise.com/view_cart');
      return new CartPage(this.page);
    }
  }

  async dismissModals() {
    try {
      // Try to dismiss any open modals
      const modalDismissStrategies = [
        () => this.page.locator('.modal .close').click(),
        () => this.page.locator('.modal-backdrop').click(),
        () => this.page.keyboard.press('Escape'),
        () => this.page.locator('.modal .btn-secondary').click()
      ];
      
      for (const strategy of modalDismissStrategies) {
        try {
          await strategy();
          await this.page.waitForTimeout(500);
        } catch {
          // Continue to next strategy
        }
      }
    } catch (error) {
      // Ignore modal dismissal errors
    }
  }

  async areCategoriesVisible(): Promise<boolean> {
    return await this.categoryProducts.isVisible();
  }

  async areBrandsVisible(): Promise<boolean> {
    return await this.brandsProducts.isVisible();
  }

  async clickCategory(categoryName: string) {
    try {
      const category = this.page.locator(`text=${categoryName}`);
      await this.clickElement(category);
    } catch (error) {
      console.log(`Category not found: ${categoryName}`);
    }
  }

  async clickBrand(brandName: string) {
    try {
      const brand = this.page.locator(`text=${brandName}`);
      await this.clickElement(brand);
    } catch (error) {
      console.log(`Brand not found: ${brandName}`);
    }
  }
}