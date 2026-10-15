import { test, expect } from '@playwright/test';

test.describe('TC34 - Login to Register Navigation E2E', () => {
    test('should navigate from login page to register page', async ({ page }) => {
        await page.goto('/login');

        await expect(page).toHaveURL(/\/login$/);

        await page.getByRole('link', {
            name: 'Register',
        }).click();

        await expect(page).toHaveURL(/\/register$/);
    });
});
