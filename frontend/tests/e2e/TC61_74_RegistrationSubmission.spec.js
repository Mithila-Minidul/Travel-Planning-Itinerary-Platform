import { test, expect } from '@playwright/test';
import { review, mockRegistration, step, next } from './helpers.js';

test.describe('Registration submission - full UI/network journey', () => {
  test('TC61: LocalGuide uploads photo then sends role-specific registration payload', async ({ page }) => {
    let uploadSeen=false, body;
    await mockRegistration(page);
    await page.route('**/api/Image/upload/profile-photos', async route => { uploadSeen=true; await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({url:'https://example.test/avatar.png'})}); });
    await page.route('**/api/Auth/register', async route => { body=route.request().postDataJSON(); await route.fulfill({status:200,contentType:'application/json',body:'{}'}); });
    await review(page); await page.getByRole('button',{name:'Create Account'}).click(); await expect(page).toHaveURL(/\/login$/);
    expect(uploadSeen).toBe(true); expect(body).toMatchObject({fullName:'Test Traveler',email:'traveler@example.com',role:'LocalGuide',guideCity:'Kandy',licenseNumber:'LG-12345',yearsOfExperience:3,profileImageUrl:'https://example.test/avatar.png'});
    expect(body).not.toHaveProperty('agencyName');
  });
  test('TC62: TravelAgent sends agency-specific payload without guide fields', async ({ page }) => {
    let body; await mockRegistration(page); await page.route('**/api/Auth/register', async route => { body=route.request().postDataJSON(); await route.fulfill({status:200,contentType:'application/json',body:'{}'}); });
    await review(page,{role:'TravelAgent'}); await page.getByRole('button',{name:'Create Account'}).click(); await expect(page).toHaveURL(/\/login$/);
    expect(body).toMatchObject({role:'TravelAgent',agencyName:'Example Tours',agentLicenseNumber:'TA-12345'}); expect(body).not.toHaveProperty('guideBio');
  });
  test('TC63: photo upload failure prevents registration request', async ({ page }) => {
    let registrations=0; await mockRegistration(page,{uploadStatus:500,uploadBody:{message:'Upload unavailable'}});
    await page.route('**/api/Auth/register', async route => { registrations++; await route.fulfill({status:200,body:'{}'}); });
    await review(page); await page.getByRole('button',{name:'Create Account'}).click(); await expect(page.getByRole('alert')).toHaveText('Upload unavailable'); await step(page,4); expect(registrations).toBe(0);
  });
  test('TC64: registration API rejection remains on review and displays backend error', async ({ page }) => {
    await mockRegistration(page,{registerStatus:409,registerBody:{message:'Email already registered'}});
    await review(page); await page.getByRole('button',{name:'Create Account'}).click(); await expect(page.getByRole('alert')).toHaveText('Email already registered'); await step(page,4);
  });
  test('TC65: retry after registration rejection succeeds without reentering form', async ({ page }) => {
    let count=0; await mockRegistration(page);
    await page.route('**/api/Auth/register', async route => { count++; await route.fulfill({status:count===1?500:200,contentType:'application/json',body:JSON.stringify(count===1?{message:'Temporary failure'}:{id:'new'})}); });
    await review(page); await page.getByRole('button',{name:'Create Account'}).click(); await expect(page.getByRole('alert')).toHaveText('Temporary failure'); await page.getByRole('button',{name:'Create Account'}).click(); await expect(page).toHaveURL(/\/login$/); expect(count).toBe(2);
  });
  test('TC66: registration button is disabled while upload request is pending', async ({ page }) => {
    await mockRegistration(page);
    await page.route('**/api/Image/upload/profile-photos', async route => { await new Promise(resolve=>setTimeout(resolve,1200)); await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({url:'https://example.test/avatar.png'})}); });
    await review(page); await page.getByRole('button',{name:'Create Account'}).click(); await expect(page.getByRole('button',{name:'Registering...'})).toBeDisabled();
  });
  test('TC67: review back navigation enables correction before successful submit', async ({ page }) => {
    let body; await mockRegistration(page); await page.route('**/api/Auth/register', async route=>{body=route.request().postDataJSON(); await route.fulfill({status:200,body:'{}'});});
    await review(page); await page.getByRole('button',{name:'Back',exact:true}).click(); await page.locator('[name="guideCity"]').fill('Ella'); await next(page); await step(page,4); await expect(page.getByText('Ella')).toBeVisible(); await page.getByRole('button',{name:'Create Account'}).click(); await expect(page).toHaveURL(/\/login$/); expect(body.guideCity).toBe('Ella');
  });
  test('TC68: review shows phone and selected role before submission', async ({ page }) => { await review(page); await expect(page.getByText('0771234567')).toBeVisible(); await expect(page.getByText('LocalGuide')).toBeVisible(); });
  test('TC69: review shows TravelAgent role without guide-only fields', async ({ page }) => { await review(page,{role:'TravelAgent'}); await expect(page.getByText('TravelAgent')).toBeVisible(); await expect(page.getByText('Agency Name')).toBeVisible(); await expect(page.getByText('Bio', {exact:true})).toHaveCount(0); });
  test('TC70: file upload rejects non-image content before step two progression', async ({ page }) => { const {contact}=await import('./helpers.js'); await contact(page,{photo:false}); await page.locator('input[type="file"]').setInputFiles({name:'notes.txt',mimeType:'text/plain',buffer:Buffer.from('not an image')}); await expect(page.getByRole('alert')).toHaveText('Profile photo must be an image file.'); await next(page); await step(page,2); });
  test('TC71: oversized photo is rejected by client validation', async ({ page }) => { const {contact}=await import('./helpers.js'); await contact(page,{photo:false}); await page.locator('input[type="file"]').setInputFiles({name:'large.png',mimeType:'image/png',buffer:Buffer.alloc(2*1024*1024+1)}); await expect(page.getByRole('alert')).toHaveText('Profile photo must be smaller than 2MB.'); });
  test('TC72: changing from LocalGuide to TravelAgent removes guide-specific fields', async ({ page }) => { const {contact}=await import('./helpers.js'); await contact(page); await next(page); await page.locator('select[name="role"]').selectOption('TravelAgent'); await expect(page.locator('[name="guideCity"]')).toHaveCount(0); await expect(page.locator('[name="agentLicenseNumber"]')).toBeVisible(); });
  test('TC73: switching back from TravelAgent restores LocalGuide form', async ({ page }) => { const {contact}=await import('./helpers.js'); await contact(page); await next(page); await page.locator('select[name="role"]').selectOption('TravelAgent'); await page.locator('select[name="role"]').selectOption('LocalGuide'); await expect(page.locator('[name="guideCity"]')).toBeVisible(); await expect(page.locator('[name="agencyName"]')).toHaveCount(0); });
  test('TC74: invalid experience years with fractional value blocks review', async ({ page }) => { const {role}=await import('./helpers.js'); await role(page,{years:1.5}); await next(page); await expect(page.getByRole('alert')).toContainText('whole number'); await step(page,3); });
});
