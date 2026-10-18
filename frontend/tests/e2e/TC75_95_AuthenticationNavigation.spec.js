import { test, expect } from '@playwright/test';
import { mockAuth } from './helpers.js';

const login = async (
    page,
    email = 'admin@example.com',
    password = 'ValidPassword123'
) => {

  page.on('console', (message) => {
    console.log('BROWSER CONSOLE:', message.type(), message.text());
  });

  page.on('pageerror', (error) => {
    console.log('REACT ERROR:', error.message);
  });

  page.on('requestfailed', (request) => {
    console.log(
        'FAILED REQUEST:',
        request.url(),
        request.failure()?.errorText
    );
  });

  await page.goto('/login');

  console.log('Current URL:', page.url());

  console.log(
      'Email input count:',
      await page.locator('input[type="email"]').count()
  );

  console.log(
      'Page content:',
      (await page.locator('body').innerText()).slice(0, 500)
  );

  await page.screenshot({
    path: 'login-debug.png',
    fullPage: true,
  });

  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  await page.getByRole('button', {
    name: 'Login',
    exact: true,
  }).click();
};

test.describe('Authentication, session and browser navigation E2E', () => {
  test('TC75: login screen has required email/password inputs', async ({page}) => { await page.goto('/login'); await expect(page.locator('input[type="email"]')).toHaveAttribute('required',''); await expect(page.locator('input[type="password"]')).toHaveAttribute('required',''); });
  test('TC76: successful login navigates to dashboard and persists token', async ({page}) => { await mockAuth(page); await login(page); await expect(page).toHaveURL(/\/dashboard$/); await expect.poll(()=>page.evaluate(()=>localStorage.getItem('token'))).toBe('e2e-token'); });
  test('TC77: login API receives entered credentials', async ({page}) => { let body; await mockAuth(page); await page.route('**/api/Auth/login',async route=>{body=route.request().postDataJSON(); await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({token:'e2e-token',id:'1',role:'Admin'})});}); await login(page,'case@example.com','MyPassword123'); await expect(page).toHaveURL(/\/dashboard$/); expect(body).toEqual({email:'case@example.com',password:'MyPassword123'}); });
  test('TC78: invalid login leaves user on login without token', async ({page}) => { await mockAuth(page,{loginStatus:401,loginBody:{message:'Incorrect credentials'}}); await login(page); await expect(page.getByText('Incorrect credentials')).toBeVisible(); await expect(page).toHaveURL(/\/login$/); expect(await page.evaluate(()=>localStorage.getItem('token'))).toBeNull(); });
  test('TC79: retry after failed login can succeed', async ({page}) => { let attempts=0; await mockAuth(page); await page.route('**/api/Auth/login',async route=>{attempts++; await route.fulfill({status:attempts===1?401:200,contentType:'application/json',body:JSON.stringify(attempts===1?{message:'Try again'}:{token:'e2e-token',role:'Admin',id:'1'})});}); await login(page); await expect(page.getByText('Try again')).toBeVisible(); await page.getByRole('button',{name:'Login'}).click(); await expect(page).toHaveURL(/\/dashboard$/); expect(attempts).toBe(2); });
  test('TC80: login button is disabled during pending authentication', async ({page}) => { await mockAuth(page); await page.route('**/api/Auth/login',async route=>{await new Promise(r=>setTimeout(r,1200)); await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({token:'e2e-token',role:'Admin',id:'1'})});}); await page.goto('/login'); await page.locator('input[type="email"]').fill('admin@example.com'); await page.locator('input[type="password"]').fill('ValidPassword123'); await page.getByRole('button',{name:'Login'}).click(); await expect(page.getByRole('button',{name:'Logging in...'})).toBeDisabled(); });
  test('TC81: repeated rejected login keeps the user on login without persisting a token', async ({page}) => { await mockAuth(page,{loginStatus:401,loginBody:{message:'Wrong credentials'}}); await login(page); await expect(page.getByText('Wrong credentials')).toBeVisible(); await page.getByRole('button',{name:'Login'}).click(); await expect(page.getByText('Wrong credentials')).toBeVisible(); await expect(page).toHaveURL(/\/login$/); expect(await page.evaluate(()=>localStorage.getItem('token'))).toBeNull(); });
  test('TC82: unauthenticated dashboard visit redirects to login', async ({page}) => { await page.goto('/dashboard'); await expect(page).toHaveURL(/\/login$/); });
  test('TC83: unauthenticated destinations visit redirects to login', async ({page}) => { await page.goto('/destinations'); await expect(page).toHaveURL(/\/login$/); });
  test('TC84: unauthenticated bookings detail visit redirects to login', async ({page}) => { await page.goto('/bookings/123'); await expect(page).toHaveURL(/\/login$/); });
  test('TC85: unauthenticated experience editor visit redirects to login', async ({page}) => { await page.goto('/experiences/123/edit'); await expect(page).toHaveURL(/\/login$/); });
  test('TC86: authenticated user visiting landing redirects to dashboard', async ({page}) => { await mockAuth(page); await page.addInitScript(()=>localStorage.setItem('token','e2e-token')); await page.goto('/'); await expect(page).toHaveURL(/\/dashboard$/); });
  test('TC87: authenticated session persists after page reload when /me succeeds', async ({page}) => { await mockAuth(page); await login(page); await expect(page).toHaveURL(/\/dashboard$/); await page.reload(); await expect(page).toHaveURL(/\/dashboard$/); await expect.poll(()=>page.evaluate(()=>localStorage.getItem('token'))).toBe('e2e-token'); });
  test('TC88: invalid stored token is removed on initial session check', async ({page}) => { await mockAuth(page,{meStatus:403,meBody:{message:'Invalid session'}}); await page.addInitScript(()=>localStorage.setItem('token','expired-token')); await page.goto('/dashboard'); await expect(page).toHaveURL(/\/login$/); await expect.poll(()=>page.evaluate(()=>localStorage.getItem('token'))).toBeNull(); });
  test('TC89: admin is allowed to open destinations after login', async ({page}) => { await mockAuth(page); await login(page); await page.goto('/destinations'); await expect(page).toHaveURL(/\/destinations$/); });
  test('TC90: LocalGuide cannot open admin destinations', async ({page}) => { await mockAuth(page,{loginBody:{token:'e2e-token',id:'1',role:'LocalGuide'},meBody:{id:'1',role:'LocalGuide'}}); await login(page); await page.goto('/destinations'); await expect(page).not.toHaveURL(/\/destinations$/); });
  test('TC91: TravelAgent cannot open admin payment dashboard', async ({page}) => { await mockAuth(page,{loginBody:{token:'e2e-token',id:'1',role:'TravelAgent'},meBody:{id:'1',role:'TravelAgent'}}); await login(page); await page.goto('/payments'); await expect(page).not.toHaveURL(/\/payments$/); });
  test('TC92: LocalGuide can open own experiences page', async ({page}) => { await mockAuth(page,{loginBody:{token:'e2e-token',id:'1',role:'LocalGuide'},meBody:{id:'1',role:'LocalGuide'}}); await login(page); await page.goto('/my-experiences'); await expect(page).toHaveURL(/\/my-experiences$/); });
  test('TC93: Traveler cannot open AI review queue', async ({page}) => { await mockAuth(page,{loginBody:{token:'e2e-token',id:'1',role:'Traveler'},meBody:{id:'1',role:'Traveler'}}); await login(page); await page.goto('/ai-review'); await expect(page).not.toHaveURL(/\/ai-review$/); });
  test('TC94: TravelAgent can open AI review queue', async ({page}) => { await mockAuth(page,{loginBody:{token:'e2e-token',id:'1',role:'TravelAgent'},meBody:{id:'1',role:'TravelAgent'}}); await login(page); await page.goto('/ai-review'); await expect(page).toHaveURL(/\/ai-review$/); });
  test('TC95: browser back after visiting registration returns to login', async ({page}) => { await page.goto('/login'); await page.getByRole('link',{name:'Register'}).click(); await expect(page).toHaveURL(/\/register$/); await page.goBack(); await expect(page).toHaveURL(/\/login$/); });
});
