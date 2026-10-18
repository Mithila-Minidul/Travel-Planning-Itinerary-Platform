import { test, expect } from '@playwright/test';

test.describe('TC40 - Invalid Login Error E2E', () => {
    test('should display an error when login fails', async ({ page }) => {
        await page.route('**/api/**', async (route) => {
            const request = route.request();

            if (request.method() === 'POST') {
                await route.fulfill({
                    status: 401,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        message: 'Invalid email or password. Please try again.',
                    }),
                });
                return;
            }

            await route.continue();
        });

        await page.goto('/login');

        await page.locator('input[type="email"]').fill(
            'invalid@example.com'
        );

        await page.locator('input[type="password"]').fill(
            'WrongPassword123'
        );

        await page.getByRole('button', { name: 'Login' }).click();

        await expect(page).toHaveURL(/\/login$/);

        await expect(
            page.getByText(/invalid email or password/i)
        ).toBeVisible();

        await expect(
            page.getByRole('button', { name: 'Login' })
        ).toBeEnabled();
    });
});
