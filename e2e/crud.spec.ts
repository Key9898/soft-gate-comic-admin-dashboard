import { test, expect } from '@playwright/test'

test.describe('CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@example.com')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/')
  })

  test('open add webtoon modal', async ({ page }) => {
    await page.goto('/webtoons')
    await page.getByRole('button', { name: /add webtoon/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByLabel(/title/i)).toBeVisible()
  })

  test('open add episode modal', async ({ page }) => {
    await page.goto('/episodes')
    await page.getByRole('button', { name: /add episode/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByLabel(/title/i)).toBeVisible()
  })

  test('view user details', async ({ page }) => {
    await page.goto('/users')
    await page.getByRole('button', { name: /view/i }).first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('view comment details', async ({ page }) => {
    await page.goto('/comments')
    await page.getByRole('button', { name: /view/i }).first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('dashboard displays statistics', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/total users/i)).toBeVisible()
    await expect(page.getByText(/total webtoons/i)).toBeVisible()
    await expect(page.getByText(/total episodes/i)).toBeVisible()
    await expect(page.getByText(/total views/i)).toBeVisible()
  })

  test('analytics displays charts', async ({ page }) => {
    await page.goto('/analytics')
    await expect(page.getByText(/revenue trend/i)).toBeVisible()
    await expect(page.getByText(/user growth/i)).toBeVisible()
    await expect(page.getByText(/genre distribution/i)).toBeVisible()
  })

  test('close modal with escape key', async ({ page }) => {
    await page.goto('/webtoons')
    await page.getByRole('button', { name: /add webtoon/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
})
