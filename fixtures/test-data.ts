import type { RegistrationData } from '../pages/auth.page';

export const catalogData = {
  searchTerm: 'Pliers',
  expectedProduct: 'Combination Pliers',
  outOfStockProduct: 'Long Nose Pliers',
  category: 'Hammer',
  categoryProduct: 'Thor Hammer',
};

export const checkoutData = {
  products: [
    { name: 'Combination Pliers', quantity: 2 },
    { name: 'Pliers',             quantity: 1 },
  ],
  guest: {
    email: () => `qa.toolshop.${Date.now()}@example.com`,
    firstName: 'QA',
    lastName: 'Test',
  },
  billing: {
    country: 'FR',
    postalCode: '75001',
    houseNumber: '1',
    stateOverride: 'Ile-de-France',
  },
  paymentMethod: 'cash-on-delivery',
};

export function createRegistrationData(): RegistrationData {
  const uniqueValue = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;

  return {
    firstName: 'Thibaud',
    lastName: 'Descoins',
    dateOfBirth: '1990-01-01',
    houseNumber: '1',
    street: 'Teststraat 1',
    postalCode: '2511AA',
    city: 'The Hague',
    state: 'South Holland',
    country: 'NL',
    phone: '0612345678',
    email: `thibaud.${uniqueValue}@example.com`,
    password: 'StudyCase123!',
  };
}
