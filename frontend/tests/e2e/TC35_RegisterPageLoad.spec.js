import { test, expect } from '@playwright/test';

test.describe('TC35 - Register Page Load E2E', () => {
    test('should load the register page successfully', async ({ page }) => {
        await page.goto('/register');

        await expect(page).toHaveURL(/\/register$/);

        await expect(
            page.getByRole('heading', { name: 'Create Account' })
        ).toBeVisible();

        await expect(
            page.getByText('Step 1 of 4')
        ).toBeVisible();

        await expect(
            page.getByRole('button', { name: 'Back' })
        ).toBeDisabled();

        await expect(
            page.getByRole('button', { name: 'Next' })
        ).toBeVisible();

        await expect(
            page.getByRole('link', { name: 'Back to Home' })
        ).toBeVisible();
    });
});
