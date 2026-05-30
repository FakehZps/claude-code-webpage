import { test, expect } from '@playwright/test'

test.describe('Navigation & Blog Post Rendering', () => {
  test('navigates to log page and shows title', async ({ page }) => {
    await page.goto('/logs/cyberpunk-2077-review')
    const title = page.locator('[data-testid="log-title"]')
    await expect(title).toBeVisible()
    await expect(title).toContainText('Cyberpunk')
  })

  test('MDX body content renders', async ({ page }) => {
    await page.goto('/logs/cyberpunk-2077-review')
    const body = page.locator('[data-testid="mdx-body"]')
    await expect(body).toBeVisible()
    await expect(body).toContainText('Night City')
  })

  test('nav home link returns to homepage', async ({ page }) => {
    await page.goto('/logs/cyberpunk-2077-review')
    const homeLink = page.locator('[data-testid="nav-home-link"]')
    await expect(homeLink).toBeVisible()
    await homeLink.click()
    await expect(page).toHaveURL('/')
  })
})
