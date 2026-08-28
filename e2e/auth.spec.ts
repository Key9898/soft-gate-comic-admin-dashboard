import { test, expect } from '@playwright/test';
import { seedStaffAndLogin } from './helpers/staffAuth';

test.describe('Authentication Flow', () => {
  test('displays login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('login with seeded staff credentials', async ({ page }) => {
    await seedStaffAndLogin(page);
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('shows loading state during login', async ({ page }) => {
    await seedStaffAndLogin(page);
    await expect(page).toHaveURL('/');
  });

  test('logout successfully', async ({ page }) => {
    await seedStaffAndLogin(page);
    await expect(page).toHaveURL('/');

    await page.getByRole('button', { name: /admin/i }).click();
    await page.getByRole('button', { name: /logout/i }).click();

    await expect(page).toHaveURL('/login');
  });

  test('rejects login without an account', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill('nobody@example.com');
    await page.locator('#login-password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('first register then second register is locked', async ({ page }) => {
    await page.goto('/register');
    await page.locator('#register-username').fill('admin');
    await page.locator('#register-display-name').fill('Admin');
    await page.locator('#register-email').fill('owner@example.com');
    await page.locator('#register-password').fill('password123');
    await page.locator('#register-confirm-password').fill('password123');
    await page.locator('#register-terms').check();
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL('/');

    await page.getByRole('button', { name: /admin/i }).click();
    await page.getByRole('button', { name: /logout/i }).click();

    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /registration is closed/i })).toBeVisible();
  });
});
