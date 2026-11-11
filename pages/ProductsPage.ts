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
  readonly cartModal: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.features_items .title.text-center');
    this.productsList = page.locator('.features_items .col-sm-4');
    this.firstProduct = this.productsList.first();
    this.firstProductViewButton = this.firstProduct.locator('a[href*="/product_details/"]');
    this.searchProductInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
    this.searchResultsTitle = page.locator('.features_items .title.text-center');
    this.categoryProducts = page.locator('.category-products');
    this.brandsProducts = page.locator('.brands_products');
    this.cartModal = page.locator('#cartModal');
  }

  async getTitleText(): Promise<string> {
    await this.pageTitle.waitFor({ timeout: 10000 });
    return (await this.getText(this.pageTitle)).trim();
  }

  async isAllProductsPageVisible(): Promise<boolean> {
    try {
      return (await this.getTitleText()).toUpperCase() === 'ALL PRODUCTS';
    } catch {
      return false;
    }
  }

  async areProductsListVisible(): Promise<boolean> {
    try {
      await this.firstProduct.waitFor({ timeout: 10000 });
      return (await this.productsList.count()) > 0;
    } catch {
      return false;
    }
  }

  async clickViewProductOfFirstProduct(): Promise<ProductDetailsPage> {
    await this.scrollToElement(this.firstProductViewButton);
    await this.clickElement(this.firstProductViewButton);
    await this.page.waitForURL('**/product_details/**');
    const details = new ProductDetailsPage(this.page);
    await details.waitForLoaded();
    return details;
  }

  async searchProduct(productName: string) {
    await this.fillElement(this.searchProductInput, productName);
    await this.clickElement(this.searchButton);
    await this.page.waitForURL('**/products?search=**');
  }

  async isSearchedProductsVisible(): Promise<boolean> {
    try {
      return (await this.getTitleText()).toUpperCase() === 'SEARCHED PRODUCTS';
    } catch {
      return false;
    }
  }

  async areSearchResultsVisible(): Promise<boolean> {
    return (await this.getSearchResultsCount()) > 0;
  }

  async getSearchResultsCount(): Promise<number> {
    return await this.productsList.count();
  }

  /** Names of every product currently listed (e.g. the search results). */
  async getProductNames(): Promise<string[]> {
    const names = await this.productsList.locator('.productinfo p').allTextContents();
    return names.map(n => n.trim());
  }

  async getFirstProductName(): Promise<string> {
    return (await this.getText(this.firstProduct.locator('.productinfo p'))).trim();
  }

  async clickFirstProduct(): Promise<ProductDetailsPage> {
    await this.clickElement(this.firstProduct);
    return new ProductDetailsPage(this.page);
  }

  /**
   * Add the product at `productIndex` to the cart and leave the "Added!" modal open,
   * so the caller can choose between Continue Shopping and View Cart.
   */
  async addProductToCart(productIndex: number = 0) {
    const product = this.productsList.nth(productIndex);
    await product.scrollIntoViewIfNeeded();
    await product.hover();
    await product.locator('.productinfo .add-to-cart').click();
    await this.cartModal.waitFor({ state: 'visible', timeout: 15000 });
  }

  async clickContinueShopping() {
    await this.cartModal.locator('.close-modal').click();
    await this.cartModal.waitFor({ state: 'hidden' });
  }

  /** Adds a product, then dismisses the modal so the next product can be added. */
  async addProductToCartAndContinue(productIndex: number = 0) {
    await this.addProductToCart(productIndex);
    await this.clickContinueShopping();
  }

  async clickViewCart(): Promise<CartPage> {
    // Prefer the modal's link if the "Added!" modal is open, otherwise the header link
    const viewCart = (await this.cartModal.isVisible())
      ? this.cartModal.locator('a[href="/view_cart"]')
      : this.page.locator('.shop-menu a[href="/view_cart"]');
    await this.clickElement(viewCart);
    await this.page.waitForURL('**/view_cart');
    return new CartPage(this.page);
  }

  async areCategoriesVisible(): Promise<boolean> {
    return await this.categoryProducts.isVisible();
  }

  async areBrandsVisible(): Promise<boolean> {
    return await this.brandsProducts.isVisible();
  }

  /** Expand a top-level category (Women / Men / Kids) in the left sidebar. */
  async expandCategory(categoryName: string) {
    await this.clickElement(this.categoryProducts.locator(`a[href="#${categoryName}"]`));
    await this.page.locator(`#${categoryName}`).waitFor({ state: 'visible' });
  }

  /** Click a sub-category link (e.g. Dress) inside an expanded category. */
  async clickSubCategory(categoryName: string, subCategory: string) {
    await this.clickElement(this.page.locator(`#${categoryName} a`).filter({ hasText: subCategory }));
    await this.page.waitForURL('**/category_products/**');
  }

  async clickBrand(brandName: string) {
    await this.clickElement(this.brandsProducts.locator(`a[href="/brand_products/${brandName}"]`));
    await this.page.waitForURL(`**/brand_products/${brandName}`);
  }
}
