import { test, expect } from '@playwright/test';

test.describe('TC37 - Register Step 1 to Step 2 E2E', () => {
    test('should proceed to step 2 when valid account details are entered', async ({ page }) => {
        await page.goto('/register');

        await expect(page.getByText('Step 1 of 4')).toBeVisible();

        await page.locator('input[name="fullName"]').fill('Test User');

        await page
            .locator('input[name="email"]')
            .fill('testuser@example.com');

        await page
            .locator('input[name="password"]')
            .fill('Password123');

        await page
            .locator('input[type="password"]')
            .nth(1)
            .fill('Password123');

        await page.getByRole('button', { name: 'Next' }).click();

        await expect(page.getByText('Step 2 of 4')).toBeVisible();

        await expect(
            page.getByRole('button', { name: 'Back' })
        ).toBeEnabled();

        await expect(page).toHaveURL(/\/register$/);
    });
});
