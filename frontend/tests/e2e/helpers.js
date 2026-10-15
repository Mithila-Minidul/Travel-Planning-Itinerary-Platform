import { expect } from '@playwright/test';

export const step = (page, number) => expect(page.getByText(`Step ${number} of 4`)).toBeVisible();
export const next = (page) => page.getByRole('button', { name: 'Next' }).click();
export const back = (page) => page.getByRole('button', { name: 'Back', exact: true }).click();
export const sampleImage = { name: 'profile.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==', 'base64') };
export async function account(page, overrides = {}) {
  await page.goto('/register');
  const data = { fullName: 'Test Traveler', email: 'traveler@example.com', password: 'SecurePass123', confirm: 'SecurePass123', ...overrides };
  await page.locator('[name="fullName"]').fill(data.fullName);
  await page.locator('[name="email"]').fill(data.email);
  await page.locator('[name="password"]').fill(data.password);
  await page.locator('input[type="password"]').nth(1).fill(data.confirm);
}
export async function contact(page, options = {}) {
  await account(page, options);
  await next(page); await step(page, 2);
  await page.locator('[name="phoneNumber"]').fill(options.phone ?? '0771234567');
  if (options.photo !== false) await page.locator('input[type="file"]').setInputFiles(options.image ?? sampleImage);
}
export async function role(page, options = {}) {
  await contact(page, options);
  await next(page); await step(page, 3);
  await page.locator('select[name="role"]').selectOption(options.role ?? 'LocalGuide');
  if ((options.role ?? 'LocalGuide') === 'TravelAgent') {
    await page.locator('[name="agencyName"]').fill(options.agencyName ?? 'Example Tours');
    await page.locator('[name="agentLicenseNumber"]').fill(options.agentLicenseNumber ?? 'TA-12345');
  } else {
    await page.locator('[name="guideBio"]').fill(options.guideBio ?? 'Experienced local guide');
    await page.locator('[name="guideCity"]').fill(options.guideCity ?? 'Kandy');
    await page.locator('[name="licenseNumber"]').fill(options.licenseNumber ?? 'LG-12345');
    await page.locator('[name="yearsOfExperience"]').fill(String(options.years ?? 3));
  }
}
export async function review(page, options = {}) { await role(page, options); await next(page); await step(page, 4); }
export async function mockAuth(
    page,
    {
      loginStatus = 200,
      loginBody = {
        token: 'e2e-token',
        id: 'e2e-user',
        role: 'Admin',
        fullName: 'E2E Admin',
      },
      meStatus = 200,
      meBody = {
        id: 'e2e-user',
        role: 'Admin',
        fullName: 'E2E Admin',
      },
    } = {}
) {

    await page.route(
        url =>
            url.pathname.startsWith('/api/') &&
            !url.pathname.startsWith('/api/Auth/'),
        route => {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([]),
            });
        }
    );

  await page.route('**/api/Auth/login', route =>
      route.fulfill({
        status: loginStatus,
        contentType: 'application/json',
        body: JSON.stringify(loginBody),
      })
  );

  await page.route('**/api/Auth/me', route =>
      route.fulfill({
        status: meStatus,
        contentType: 'application/json',
        body: JSON.stringify(meBody),
      })
  );
}
export async function mockRegistration(page, { uploadStatus = 200, uploadBody = { url: 'https://example.test/avatar.png' }, registerStatus = 200, registerBody = { id: 'new-user' } } = {}) {
  await page.route('**/api/Image/upload/profile-photos', route => route.fulfill({ status: uploadStatus, contentType: 'application/json', body: JSON.stringify(uploadBody) }));
  await page.route('**/api/Auth/register', route => route.fulfill({ status: registerStatus, contentType: 'application/json', body: JSON.stringify(registerBody) }));
}
