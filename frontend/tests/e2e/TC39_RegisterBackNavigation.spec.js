import { test, expect } from '@playwright/test';

test.describe('TC39 - Register Back Navigation E2E', () => {
    test('should navigate from step 2 back to step 1', async ({ page }) => {
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

        await page.getByRole('button', { name: 'Back' }).click();

        await expect(page.getByText('Step 1 of 4')).toBeVisible();

        await expect(
            page.getByRole('button', { name: 'Back' })
        ).toBeDisabled();

        await expect(
            page.locator('input[name="fullName"]')
        ).toHaveValue('Test User');

        await expect(
            page.locator('input[name="email"]')
        ).toHaveValue('testuser@example.com');

        await expect(page).toHaveURL(/\/register$/);
    });
});
