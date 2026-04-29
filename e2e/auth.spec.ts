import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('displays login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /admin login/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('login with valid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('admin@example.com')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })

  test('shows loading state during login', async ({ page }) => {
    await page.getByLabel(/email/i).fill('admin@example.com')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByRole('button', { name: /signing in/i })).toBeVisible()
  })

  test('logout successfully', async ({ page }) => {
    await page.getByLabel(/email/i).fill('admin@example.com')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL('/')

    await page.getByRole('button', { name: /admin/i }).click()
    await page.getByRole('button', { name: /logout/i }).click()

    await expect(page).toHaveURL('/login')
  })
})
