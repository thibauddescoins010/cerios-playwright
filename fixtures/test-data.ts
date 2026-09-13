import type { RegistrationData } from '../pages/auth.page';

export const catalogData = {
  searchTerm: 'Pliers',
  expectedProduct: 'Combination Pliers',
  category: 'Hammer',
  categoryProduct: 'Thor Hammer',
};

export function createRegistrationData(): RegistrationData {
  const uniqueValue = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;

  return {
    firstName: 'Thibaud',
    lastName: 'Descoins',
    dateOfBirth: '1990-01-01',
    street: 'Teststraat 1',
    postalCode: '2511AA',
    city: 'The Hague',
    state: 'South Holland',
    country: 'Netherlands',
    phone: '0612345678',
    email: `thibaud.${uniqueValue}@example.com`,
    password: 'StudyCase123!',
  };
}
