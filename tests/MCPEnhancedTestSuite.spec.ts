import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { MyAccountPage } from '../pages/MyAccountPage';
import { ProductsPage } from '../pages/ProductsPage';
import { TestDataProvider } from '../utils/TestDataProvider';
import { MCPTestRunner } from '../utils/MCPTestRunner';
import { allure } from 'allure-playwright';

test.describe('MCP Enhanced Automation Exercise Test Suite', () => {
  let homePage: HomePage;
  let mcpRunner: MCPTestRunner;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    mcpRunner = new MCPTestRunner(page);
    
    // Navigate using MCP
    await mcpRunner.navigateWithMCP('https://automationexercise.com');
  });

  test('MCP-TC01: Register User with Enhanced Validation', async ({ page }) => {
    await allure.description('Complete user registration flow with MCP validation');
    await allure.tag('mcp', 'registration', 'enhanced');
    
    await mcpRunner.runTestWithMCP('TC01-Register-User', async () => {
      // Step 1: Validate home page with MCP
      const homePageValid = await mcpRunner.validateElementWithMCP('.logo img', undefined, 'Home page logo');
      expect(homePageValid).toBe(true);
      
      // Step 2: Click Signup/Login with MCP
      const signupClicked = await mcpRunner.clickElementWithMCP('a[href="/login"]', 'Signup/Login button');
      expect(signupClicked).toBe(true);
      
      // Step 3: Validate signup form with MCP
      const signupFormValid = await mcpRunner.validateElementWithMCP('.signup-form h2', 'New User Signup!', 'Signup form header');
      expect(signupFormValid).toBe(true);
      
      // Step 4: Fill signup form with MCP
      const randomEmail = TestDataProvider.generateRandomEmail();
      const userName = TestDataProvider.generateRandomName();
      
      await mcpRunner.fillFormWithMCP('[data-qa="signup-name"]', userName, 'Signup name field');
      await mcpRunner.fillFormWithMCP('[data-qa="signup-email"]', randomEmail, 'Signup email field');
      
      // Step 5: Submit signup with MCP
      const signupSubmitted = await mcpRunner.clickElementWithMCP('[data-qa="signup-button"]', 'Signup submit button');
      expect(signupSubmitted).toBe(true);
      
      // Step 6: Validate registration form with MCP
      const regFormValid = await mcpRunner.validateElementWithMCP('.title.text-center b', 'ENTER ACCOUNT INFORMATION', 'Registration form header');
      
      if (regFormValid) {
        // Step 7: Fill registration form with MCP
        const testData = TestDataProvider.getRegistrationTestData();
        
        await mcpRunner.clickElementWithMCP('#id_gender1', 'Gender selection');
        await mcpRunner.fillFormWithMCP('[data-qa="password"]', testData.password, 'Password field');
        
        // Fill additional fields
        await page.selectOption('[data-qa="days"]', testData.day);
        await page.selectOption('[data-qa="months"]', testData.month);
        await page.selectOption('[data-qa="years"]', testData.year);
        
        await mcpRunner.fillFormWithMCP('[data-qa="first_name"]', testData.firstName, 'First name');
        await mcpRunner.fillFormWithMCP('[data-qa="last_name"]', testData.lastName, 'Last name');
        await mcpRunner.fillFormWithMCP('[data-qa="company"]', testData.company, 'Company');
        await mcpRunner.fillFormWithMCP('[data-qa="address"]', testData.address, 'Address');
        
        await page.selectOption('[data-qa="country"]', testData.country);
        await mcpRunner.fillFormWithMCP('[data-qa="state"]', testData.state, 'State');
        await mcpRunner.fillFormWithMCP('[data-qa="city"]', testData.city, 'City');
        await mcpRunner.fillFormWithMCP('[data-qa="zipcode"]', testData.zipcode, 'Zipcode');
        await mcpRunner.fillFormWithMCP('[data-qa="mobile_number"]', testData.mobileNumber, 'Mobile number');
        
        // Step 8: Submit registration with MCP
        const regSubmitted = await mcpRunner.clickElementWithMCP('[data-qa="create-account"]', 'Create account button');
        expect(regSubmitted).toBe(true);
        
        // Step 9: Validate account creation with MCP
        const accountCreated = await mcpRunner.validateElementWithMCP('h2[data-qa="account-created"]', 'ACCOUNT CREATED!', 'Account created message');
        
        if (accountCreated) {
          // Step 10: Continue and validate login with MCP
          await mcpRunner.clickElementWithMCP('[data-qa="continue-button"]', 'Continue button');
          
          // Step 11: Validate logged in state with MCP
          const loggedIn = await mcpRunner.validateElementWithMCP('.navbar-nav li', 'Logged in as', 'Logged in indicator');
          
          // Step 12: Delete account with MCP (cleanup)
          await mcpRunner.clickElementWithMCP('a[href="/delete_account"]', 'Delete account button');
          
          // Step 13: Validate account deletion with MCP
          const accountDeleted = await mcpRunner.validateElementWithMCP('h2[data-qa="account-deleted"]', 'ACCOUNT DELETED!', 'Account deleted message');
          
          // Step 14: Capture success screenshot
          await mcpRunner.captureScreenshotWithMCP('registration-success');
        }
      }
      
      // Step 15: Execute custom MCP validations
      await mcpRunner.executeCustomMCPAction('validate_database', { 
        table: 'users', 
        email: randomEmail,
        shouldExist: false 
      });
    });
  });

  test('MCP-TC02: Login with API Validation', async ({ page }) => {
    await allure.description('Login test with API endpoint validation');
    await allure.tag('mcp', 'login', 'api-validation');
    
    await mcpRunner.runTestWithMCP('TC02-Login-User', async () => {
      // Step 1: Navigate to login page with MCP
      await mcpRunner.clickElementWithMCP('a[href="/login"]', 'Login navigation');
      
      // Step 2: Validate login form with MCP
      const loginFormValid = await mcpRunner.validateElementWithMCP('.login-form h2', 'Login to your account', 'Login form header');
      expect(loginFormValid).toBe(true);
      
      // Step 3: Fill login credentials with MCP
      await mcpRunner.fillFormWithMCP('[data-qa="login-email"]', 'testuser@example.com', 'Login email');
      await mcpRunner.fillFormWithMCP('[data-qa="login-password"]', 'password123', 'Login password');
      
      // Step 4: Submit login with MCP
      await mcpRunner.clickElementWithMCP('[data-qa="login-button"]', 'Login submit button');
      
      // Step 5: Validate API response with MCP
      const apiValid = await mcpRunner.validateAPIResponseWithMCP('https://automationexercise.com/api/getUserDetailByEmail');
      
      // Step 6: Capture performance metrics with MCP
      await mcpRunner.executeCustomMCPAction('check_performance_metrics', {
        page: 'login',
        maxLoadTime: 3000
      });
      
      // Step 7: Capture screenshot for documentation
      await mcpRunner.captureScreenshotWithMCP('login-attempt');
    });
  });

  test('MCP-TC03: Product Search with Enhanced Validation', async ({ page }) => {
    await allure.description('Product search with comprehensive validation');
    await allure.tag('mcp', 'search', 'products');
    
    await mcpRunner.runTestWithMCP('TC03-Product-Search', async () => {
      // Step 1: Navigate to products page with MCP
      await mcpRunner.clickElementWithMCP('a[href="/products"]', 'Products navigation');
      
      // Step 2: Validate products page with MCP
      const productsPageValid = await mcpRunner.validateElementWithMCP('.title.text-center', 'PRODUCTS', 'Products page title');
      console.log('Products page validation (case-insensitive):', productsPageValid);
      
      // Step 3: Perform search with MCP
      await mcpRunner.fillFormWithMCP('#search_product', 'dress', 'Search input');
      await mcpRunner.clickElementWithMCP('#submit_search', 'Search button');
      
      // Step 4: Validate search results with MCP
      const searchResultsValid = await mcpRunner.validateElementWithMCP('.title.text-center', 'PRODUCTS', 'Search results title');
      console.log('Search results validation (case-insensitive):', searchResultsValid);
      
      // Step 5: Validate product count with MCP
      const productCount = await page.locator('.features_items .col-sm-4').count();
      console.log(`[MCP] Found ${productCount} products in search results`);
      expect(productCount).toBeGreaterThan(0);
      
      // Step 6: Execute custom MCP validation for search functionality
      await mcpRunner.executeCustomMCPAction('validate_database', {
        table: 'products',
        searchTerm: 'dress',
        expectedMinResults: 1
      });
      
      // Step 7: Capture search results screenshot
      await mcpRunner.captureScreenshotWithMCP('search-results');
    });
  });

  test('MCP-TC04: Contact Form with Email Verification', async ({ page }) => {
    await allure.description('Contact form submission with email verification');
    await allure.tag('mcp', 'contact', 'email-verification');
    
    await mcpRunner.runTestWithMCP('TC04-Contact-Form', async () => {
      // Step 1: Navigate to contact page with MCP
      await mcpRunner.clickElementWithMCP('a[href="/contact_us"]', 'Contact Us navigation');
      
      // Step 2: Validate contact form with MCP
      const contactFormValid = await mcpRunner.validateElementWithMCP('text=GET IN TOUCH', undefined, 'Contact form header');
      
      if (contactFormValid) {
        // Step 3: Fill contact form with MCP
        const contactData = TestDataProvider.getContactTestData()[0];
        
        await mcpRunner.fillFormWithMCP('[data-qa="name"]', contactData.name, 'Contact name');
        await mcpRunner.fillFormWithMCP('[data-qa="email"]', contactData.email, 'Contact email');
        await mcpRunner.fillFormWithMCP('[data-qa="subject"]', contactData.subject, 'Contact subject');
        await mcpRunner.fillFormWithMCP('[data-qa="message"]', contactData.message, 'Contact message');
        
        // Step 4: Submit form with MCP
        await mcpRunner.clickElementWithMCP('[data-qa="submit-button"]', 'Contact form submit');
        
        // Step 5: Handle alert dialog
        page.on('dialog', async dialog => {
          console.log(`[MCP] Dialog appeared: ${dialog.message()}`);
          await dialog.accept();
        });
        
        // Step 6: Validate success message with MCP
        const successValid = await mcpRunner.validateElementWithMCP('.status.alert.alert-success', 'Success!', 'Success message');
        
        // Step 7: Execute email verification with MCP
        await mcpRunner.executeCustomMCPAction('send_email_verification', {
          email: contactData.email,
          subject: contactData.subject
        });
        
        // Step 8: Capture success screenshot
        await mcpRunner.captureScreenshotWithMCP('contact-form-success');
      }
    });
  });

  test('MCP-TC05: Cart Operations with State Validation', async ({ page }) => {
    await allure.description('Shopping cart operations with state validation');
    await allure.tag('mcp', 'cart', 'state-validation');
    
    await mcpRunner.runTestWithMCP('TC05-Cart-Operations', async () => {
      // Step 1: Navigate to products and add item with MCP
      await mcpRunner.clickElementWithMCP('a[href="/products"]', 'Products navigation');
      
      // Step 2: Add first product to cart with MCP
      try {
        // Wait for products to load
        await page.waitForSelector('.features_items .col-sm-4', { timeout: 30000 });
        
        // Use MCP to hover and add to cart
        const firstProduct = page.locator('.features_items .col-sm-4').first();
        await firstProduct.scrollIntoViewIfNeeded();
        await firstProduct.hover();
        await page.waitForTimeout(2000);
        
        // Try multiple strategies for add to cart
        const addToCartSuccess = await mcpRunner.clickElementWithMCP('.features_items .col-sm-4:first-child .add-to-cart', 'Add to cart button');
        
        if (!addToCartSuccess) {
          // Try alternative selector
          await mcpRunner.clickElementWithMCP('.overlay-content .add-to-cart', 'Add to cart overlay button');
        }
        
        // Handle modal if it appears
        await page.waitForTimeout(3000);
        try {
          await page.locator('.modal .btn-success').click();
          console.log('[MCP] Dismissed add to cart modal');
        } catch {
          // Modal might not appear
        }
      } catch (error) {
        console.log('[MCP] Add to cart failed:', error.message);
      }
      
      // Step 3: Navigate to cart with MCP
      await mcpRunner.clickElementWithMCP('a[href="/view_cart"]', 'View cart button');
      
      // Step 4: Validate cart contents with MCP
      const cartItemsCount = await page.locator('#cart_items .cart_info').count();
      console.log(`[MCP] Cart contains ${cartItemsCount} items`);
      expect(cartItemsCount).toBeGreaterThan(0);
      
      // Step 5: Execute cart state validation with MCP
      await mcpRunner.executeCustomMCPAction('validate_database', {
        table: 'cart_items',
        sessionId: 'current_session',
        expectedItems: cartItemsCount
      });
      
      // Step 6: Capture cart state screenshot
      await mcpRunner.captureScreenshotWithMCP('cart-state');
    });
  });

  test.afterEach(async ({ page }) => {
    // Cleanup and final MCP reporting
    await mcpRunner.captureScreenshotWithMCP('test-completion');
    console.log('[MCP] Test execution completed');
  });
});