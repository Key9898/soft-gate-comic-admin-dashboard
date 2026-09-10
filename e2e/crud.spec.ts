import { test, expect } from '@playwright/test';
import { seedStaffAndLogin } from './helpers/staffAuth';

test.describe('CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await seedStaffAndLogin(page);
    await expect(page).toHaveURL('/');
  });

  test('open add webtoon editor', async ({ page }) => {
    await page.goto('/webtoons');
    await page.getByRole('button', { name: /add webtoon/i }).click();
    await expect(page).toHaveURL('/webtoons/new');
    await expect(page.getByRole('heading', { name: /add webtoon/i })).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('open add episode editor', async ({ page }) => {
    await page.goto('/episodes');
    await page.getByRole('button', { name: /add episode/i }).click();
    await expect(page).toHaveURL('/episodes/new');
    await expect(page.getByRole('heading', { name: /add episode/i })).toBeVisible();
    await expect(page.getByLabel(/title \(en\)/i)).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('view user details', async ({ page }) => {
    await page.goto('/users');
    await page.getByRole('button', { name: /view/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('view comment details', async ({ page }) => {
    await page.goto('/comments');
    await page.getByRole('button', { name: /view/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('dashboard displays statistics', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/total users/i)).toBeVisible();
    await expect(page.getByText(/total webtoons/i)).toBeVisible();
    await expect(page.getByText(/total episodes/i)).toBeVisible();
    await expect(page.getByText(/total views/i)).toBeVisible();
  });

  test('analytics displays charts', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page.getByText(/revenue trend/i)).toBeVisible();
    await expect(page.getByText(/user growth/i)).toBeVisible();
    await expect(page.getByText(/genre distribution/i)).toBeVisible();
  });
});
