import { test, expect } from '@playwright/test'

// Must match SITE_PASSWORD in .env.local for local dev runs.
const DEV_PASSWORD = 'devpassword123'

test.describe('Login', () => {
  test('unauthenticated visit to /admin/new redirects to /login', async ({
    page,
  }) => {
    await page.goto('/admin/new')
    await expect(page).toHaveURL(/\/login\?from=%2Fadmin%2Fnew/)
  })

  test('wrong password shows an error', async ({ page }) => {
    await page.goto('/login')
    await page.locator('[data-testid="login-password-input"]').fill('wrong')
    await page.locator('[data-testid="login-submit-button"]').click()
    await expect(page.locator('[data-testid="login-error"]')).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('correct password redirects to /admin/new', async ({ page }) => {
    await page.goto('/login')
    await page
      .locator('[data-testid="login-password-input"]')
      .fill(DEV_PASSWORD)
    await page.locator('[data-testid="login-submit-button"]').click()
    await expect(page).toHaveURL('/admin/new')
    await expect(page.locator('[data-testid="entry-form"]')).toBeVisible()
  })

  test('correct password redirects to the original ?from target', async ({
    page,
  }) => {
    await page.goto('/admin/new')
    await expect(page).toHaveURL(/\/login\?from=/)
    await page
      .locator('[data-testid="login-password-input"]')
      .fill(DEV_PASSWORD)
    await page.locator('[data-testid="login-submit-button"]').click()
    await expect(page).toHaveURL('/admin/new')
  })
})
