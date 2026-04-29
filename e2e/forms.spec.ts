import { test, expect } from '@playwright/test'

test.describe('Form Submissions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@example.com')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/')
  })

  test('search webtoons', async ({ page }) => {
    await page.goto('/webtoons')
    await page.getByPlaceholder(/search webtoons/i).fill('Shadow')
    await expect(page.getByText(/shadow knight/i)).toBeVisible()
  })

  test('filter webtoons by status', async ({ page }) => {
    await page.goto('/webtoons')
    await page.getByRole('combobox').first().selectOption('ongoing')
    await expect(page.getByText(/ongoing/i).first()).toBeVisible()
  })

  test('search episodes', async ({ page }) => {
    await page.goto('/episodes')
    await page.getByPlaceholder(/search episodes/i).fill('Chapter')
    await expect(page.getByText(/chapter/i).first()).toBeVisible()
  })

  test('search users', async ({ page }) => {
    await page.goto('/users')
    await page.getByPlaceholder(/search users/i).fill('john')
    await expect(page.getByText(/john/i)).toBeVisible()
  })

  test('search comments', async ({ page }) => {
    await page.goto('/comments')
    await page.getByPlaceholder(/search comments/i).fill('great')
    await expect(page.getByText(/great/i)).toBeVisible()
  })

  test('toggle settings switches', async ({ page }) => {
    await page.goto('/settings')
    
    const firstToggle = page.getByRole('switch').first()
    const isChecked = await firstToggle.getAttribute('aria-checked')
    
    await firstToggle.click()
    
    const newChecked = await firstToggle.getAttribute('aria-checked')
    expect(newChecked).not.toBe(isChecked)
  })
})
