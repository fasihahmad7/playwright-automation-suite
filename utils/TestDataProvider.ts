import { faker } from '@faker-js/faker';

export interface UserData {
  name: string;
  email: string;
  password: string;
  title: string;
  day: string;
  month: string;
  year: string;
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

export class TestDataProvider {
  static generateRandomEmail(): string {
    // Timestamp + random suffix so parallel workers never collide on the same email
    const unique = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
    return `test${unique}@example.com`;
  }

  static generateRandomName(): string {
    const timestamp = Date.now();
    return `TestUser${timestamp}`;
  }

  static generateUserData() {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: this.generateRandomEmail(),
      password: 'Password123!',
      company: faker.company.name(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipcode: faker.location.zipCode(),
      mobileNumber: faker.string.numeric(10)
    };
  }

  static getLoginTestData() {
    return [
      { email: 'testuser@example.com', password: 'password123', shouldSucceed: true },
      { email: 'invalid@email.com', password: 'wrongpassword', shouldSucceed: false },
      { email: '', password: 'password', shouldSucceed: false },
      { email: 'email@test.com', password: '', shouldSucceed: false }
    ];
  }

  static getSearchTestData() {
    return [
      { searchTerm: 'dress', shouldHaveResults: true },
      { searchTerm: 'tshirt', shouldHaveResults: true },
      { searchTerm: 'jeans', shouldHaveResults: true },
      { searchTerm: 'top', shouldHaveResults: true },
      { searchTerm: 'xyz123nonexistent', shouldHaveResults: false }
    ];
  }

  static getContactTestData() {
    return [
      {
        name: 'John Doe',
        email: 'test@email.com',
        subject: 'Test Subject',
        message: 'This is a test message'
      },
      {
        name: 'Jane Smith',
        email: 'another@email.com',
        subject: 'Another Subject',
        message: 'Another test message'
      }
    ];
  }

  static getRegistrationTestData() {
    return {
      title: 'Mr',
      password: 'password123',
      day: '15',
      month: '6',
      year: '1990',
      firstName: 'John',
      lastName: 'Doe',
      company: 'Test Company',
      address: '123 Test Street',
      address2: 'Apt 1',
      country: 'United States',
      state: 'California',
      city: 'Test City',
      zipcode: '12345',
      mobileNumber: '1234567890'
    };
  }

  /** A complete, unique user — same data is used for API creation and UI verification. */
  static generateUser(): UserData {
    const data = this.getRegistrationTestData();
    return {
      ...data,
      name: this.generateRandomName(),
      email: this.generateRandomEmail()
    };
  }

  /** Dummy card accepted by the practice site's fake payment page. */
  static getCardDetails() {
    return {
      nameOnCard: 'John Doe',
      cardNumber: '4111111111111111',
      cvc: '123',
      expiryMonth: '12',
      expiryYear: '2030'
    };
  }
}
