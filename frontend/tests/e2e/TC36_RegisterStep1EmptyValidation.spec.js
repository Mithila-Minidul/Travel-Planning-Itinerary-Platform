import { test, expect } from '@playwright/test';

test.describe('TC36 - Register Step 1 Empty Validation E2E', () => {
    test('should show validation error and remain on step 1 when required data is empty', async ({ page }) => {
        await page.goto('/register');

        await expect(page.getByText('Step 1 of 4')).toBeVisible();

        await page.getByRole('button', { name: 'Next' }).click();

        await expect(page.getByRole('alert')).toHaveText(
            'Full name is required.'
        );

        await expect(page.getByText('Step 1 of 4')).toBeVisible();

        await expect(page).toHaveURL(/\/register$/);
    });
});
