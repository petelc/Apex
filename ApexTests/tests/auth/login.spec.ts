import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? 'admin@acme.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'SecureAdminPass123!';

test.describe('Authentication', () => {
  test('redirects unauthenticated user from protected route to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page renders correctly', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('successful login navigates to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(page).toHaveURL(/\/dashboard/);
    // JWT stored in localStorage
    const token = await page.evaluate(() => localStorage.getItem('apex_token'));
    expect(token).not.toBeNull();
  });

  test('shows error alert on invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(ADMIN_EMAIL, 'wrong-password-123!');
    await loginPage.assertErrorVisible();
    // Should remain on login page
    await loginPage.assertOnLoginPage();
  });

  test('shows error alert on unknown email', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('nobody@unknown.example', 'password');
    await loginPage.assertErrorVisible();
  });

  test('logout clears session and redirects to login', async ({ page }) => {
    // Start by logging in
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(page).toHaveURL(/\/dashboard/);

    // Click user avatar / profile button to open menu
    const avatarButton = page
      .getByRole('button', { name: /account|avatar|profile|admin/i })
      .first();
    await avatarButton.click();

    // Click Logout in the menu
    await page.getByRole('menuitem', { name: /logout|sign out/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);

    // localStorage cleared
    const token = await page.evaluate(() => localStorage.getItem('apex_token'));
    expect(token).toBeNull();
  });

  test('forgot password page is accessible', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send|reset/i })).toBeVisible();
  });
});
