import { test, expect } from '@playwright/test';

test.describe('TC38 - Register Step 2 Empty Validation E2E', () => {
    test('should show validation error and remain on step 2 when contact details are empty', async ({ page }) => {
        await page.goto('/register');

        await page.locator('input[name="fullName"]').fill('Test User');
        await page.locator('input[name="email"]').fill('testuser@example.com');
        await page.locator('input[name="password"]').fill('Password123');

        await page
            .locator('input[type="password"]')
            .nth(1)
            .fill('Password123');

        await page.getByRole('button', { name: 'Next' }).click();

        await expect(page.getByText('Step 2 of 4')).toBeVisible();

        await page.getByRole('button', { name: 'Next' }).click();

        await expect(page.getByRole('alert')).toHaveText(
            'Phone number is required.'
        );

        await expect(page.getByText('Step 2 of 4')).toBeVisible();

        await expect(page).toHaveURL(/\/register$/);
    });
});
