import { test, expect } from '@playwright/test'

const DEV_PASSWORD = 'devpassword123'

test.describe('Logout', () => {
  test('clears the session and redirects further visits to /login', async ({
    page,
  }) => {
    await page.goto('/login')
    await page
      .locator('[data-testid="login-password-input"]')
      .fill(DEV_PASSWORD)
    await page.locator('[data-testid="login-submit-button"]').click()
    await expect(page).toHaveURL('/admin/new')

    await page.locator('[data-testid="logout-button"]').click()
    await expect(page).toHaveURL('/login')

    await page.goto('/admin/new')
    await expect(page).toHaveURL(/\/login\?from=%2Fadmin%2Fnew/)
  })
})
