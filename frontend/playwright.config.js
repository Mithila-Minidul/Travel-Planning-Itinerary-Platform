import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',

    timeout: 30000,

    use: {
        baseURL: 'http://localhost:4000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    webServer: {
        command: 'npm run dev -- --host 127.0.0.1 --port 4000',
        url: 'http://127.0.0.1:4000',
        reuseExistingServer: true,
        timeout: 120000,
    },
});