import { test, expect } from '@playwright/test'

test.describe('Stats Dashboard', () => {
  test('stats page renders KPI tiles and charts', async ({ page }) => {
    await page.goto('/stats')
    const tiles = page.locator('[data-testid="stat-tile"]')
    await expect(tiles).toHaveCount(4)

    await expect(page.locator('[data-testid="stats-year-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="stats-rating-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="stats-platform-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="stats-genre-chart"]')).toBeVisible()
  })

  test('games logged tile matches homepage counter', async ({ page }) => {
    await page.goto('/')
    const homeText = await page.locator('body').innerText()
    const match = homeText.match(/(\d+)\s*GAMES LOGGED/)
    expect(match).not.toBeNull()
    const homeCount = match![1]

    await page.goto('/stats')
    const statsCount = await page.locator('[data-testid="stat-tile"]').first().innerText()
    expect(statsCount).toContain(homeCount)
  })

  test('nav link navigates to stats page', async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-testid="nav-stats-link"]').click()
    await expect(page).toHaveURL('/stats')
  })
})
