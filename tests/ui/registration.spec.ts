import { test } from '@playwright/test';
import { AuthPage } from '../../pages/auth.page';
import { createRegistrationData } from '../../fixtures/test-data';

test.describe('Account registration', () => {
  test('user can create an account', async ({ page }) => {
    const authPage = new AuthPage(page);
    const registrationData = createRegistrationData();

    await test.step('Open the registration page', async () => {
      await authPage.openRegistration();
    });

    await test.step('Submit valid registration data', async () => {
      await authPage.register(registrationData);
    });

    await test.step('Verify registration completed', async () => {
      await authPage.expectRegistrationCompleted();
    });
  });
});
