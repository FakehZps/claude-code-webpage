import { test, expect } from '@playwright/test'

test.describe('Awards Archive', () => {
  test('awards page renders with at least one year', async ({ page }) => {
    await page.goto('/awards')
    const years = page.locator('[data-testid="awards-year"]')
    const count = await years.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('every year shows at least a GOTY or WORST card', async ({ page }) => {
    await page.goto('/awards')
    const years = page.locator('[data-testid="awards-year"]')
    const count = await years.count()

    for (let i = 0; i < count; i++) {
      const year = years.nth(i)
      const goty = year.locator('[data-testid="goty-card"]')
      const worst = year.locator('[data-testid="worst-card"]')
      const gotyCount = await goty.count()
      const worstCount = await worst.count()
      expect(gotyCount + worstCount).toBeGreaterThanOrEqual(1)
    }
  })

  test('nav link navigates to awards page', async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-testid="nav-awards-link"]').click()
    await expect(page).toHaveURL('/awards')
  })
})
