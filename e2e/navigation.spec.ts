import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@example.com')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/')
  })

  test('navigates to dashboard', async ({ page }) => {
    await page.getByRole('link', { name: /dashboard/i }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })

  test('navigates to webtoons', async ({ page }) => {
    await page.getByRole('link', { name: /webtoons/i }).click()
    await expect(page).toHaveURL('/webtoons')
    await expect(page.getByRole('heading', { name: /webtoons/i })).toBeVisible()
  })

  test('navigates to episodes', async ({ page }) => {
    await page.getByRole('link', { name: /episodes/i }).click()
    await expect(page).toHaveURL('/episodes')
    await expect(page.getByRole('heading', { name: /episodes/i })).toBeVisible()
  })

  test('navigates to users', async ({ page }) => {
    await page.getByRole('link', { name: /users/i }).click()
    await expect(page).toHaveURL('/users')
    await expect(page.getByRole('heading', { name: /users/i })).toBeVisible()
  })

  test('navigates to comments', async ({ page }) => {
    await page.getByRole('link', { name: /comments/i }).click()
    await expect(page).toHaveURL('/comments')
    await expect(page.getByRole('heading', { name: /comments/i })).toBeVisible()
  })

  test('navigates to analytics', async ({ page }) => {
    await page.getByRole('link', { name: /analytics/i }).click()
    await expect(page).toHaveURL('/analytics')
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible()
  })

  test('navigates to settings', async ({ page }) => {
    await page.getByRole('link', { name: /settings/i }).click()
    await expect(page).toHaveURL('/settings')
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible()
  })

  test('sidebar is visible on desktop', async ({ page }) => {
    const sidebar = page.getByRole('navigation', { name: /sidebar/i })
    await expect(sidebar).toBeVisible()
  })
})
