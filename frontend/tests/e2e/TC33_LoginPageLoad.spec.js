import { test, expect } from '@playwright/test';

test.describe('TC33 - Login Page E2E', () => {
    test('should load the login page successfully', async ({ page }) => {
        await page.goto('/login');

        await expect(page).toHaveURL(/\/login$/);

        await expect(
            page.getByRole('heading', {
                name: 'TripCraft',
            })
        ).toBeVisible();

        await expect(
            page.locator('input[type="email"]')
        ).toBeVisible();

        await expect(
            page.locator('input[type="password"]')
        ).toBeVisible();
        await expect(
            page.getByRole('button', {
                name: 'Login',
            })
        ).toBeVisible();

        await expect(
            page.getByRole('link', {
                name: 'Register',
            })
        ).toBeVisible();
    });
});
