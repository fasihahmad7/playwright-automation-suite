import { APIRequestContext, Page } from '@playwright/test';
import { UserData } from './TestDataProvider';

/**
 * Thin wrapper over the public automationexercise.com REST API.
 * Used to create/delete throwaway accounts so login and checkout tests
 * run against a real user without depending on a hard-coded account.
 */
export class ApiHelper {
  constructor(private readonly request: APIRequestContext) {}

  async createAccount(user: UserData) {
    const response = await this.request.post('/api/createAccount', {
      form: {
        name: user.name,
        email: user.email,
        password: user.password,
        title: user.title,
        birth_date: user.day,
        birth_month: user.month,
        birth_year: user.year,
        firstname: user.firstName,
        lastname: user.lastName,
        company: user.company,
        address1: user.address,
        address2: user.address2,
        country: user.country,
        zipcode: user.zipcode,
        state: user.state,
        city: user.city,
        mobile_number: user.mobileNumber
      }
    });
    // The API always returns HTTP 200; the real status is in the JSON body.
    const body = await response.json();
    if (body.responseCode !== 201) {
      throw new Error(`createAccount failed: ${JSON.stringify(body)}`);
    }
  }

  async deleteAccount(email: string, password: string) {
    try {
      await this.request.delete('/api/deleteAccount', { form: { email, password } });
    } catch {
      // Best-effort cleanup — the account may already be deleted via the UI.
    }
  }
}

/**
 * Block third-party ad and tracking requests. automationexercise.com serves
 * Google ads that occasionally overlay the page or slow navigation, which is
 * the main source of flakiness when testing against the live site.
 */
export async function blockAds(page: Page) {
  await page.route(
    /googlesyndication|doubleclick|googleadservices|adservice\.google|google-analytics|googletagmanager|fundingchoicesmessages/,
    route => route.abort()
  );
}
