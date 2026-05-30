import { test, expect } from '@playwright/test'

test.describe('Timeline Homepage', () => {
  test('timeline renders', async ({ page }) => {
    await page.goto('/')
    const timeline = page.locator('[data-testid="timeline"]')
    await expect(timeline).toBeVisible()
  })

  test('TimelineNode cards are visible with Access Log links', async ({ page }) => {
    await page.goto('/')
    const nodes = page.locator('[data-testid="timeline-node"]')
    const count = await nodes.count()
    expect(count).toBeGreaterThanOrEqual(1)

    for (let i = 0; i < count; i++) {
      const node = nodes.nth(i)
      const accessLink = node.locator('[data-testid="access-log-link"]')
      await expect(accessLink).toBeVisible()
      await expect(accessLink).toContainText('Access Log')
    }
  })

  test('roundup node is visible', async ({ page }) => {
    await page.goto('/')
    const roundupNode = page.locator('[data-testid="year-wrapup-node"]')
    await expect(roundupNode).toBeVisible()
  })

  test('nodes are sorted newer first', async ({ page }) => {
    await page.goto('/')
    const articles = page.locator('article[data-testid="timeline-node"][data-date]')
    const count = await articles.count()
    expect(count).toBeGreaterThanOrEqual(2)

    const dates: number[] = []
    for (let i = 0; i < count; i++) {
      const dateStr = await articles.nth(i).getAttribute('data-date')
      if (dateStr) dates.push(new Date(dateStr).getTime())
    }

    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1])
    }
  })

  test('Access Log link navigates to log page', async ({ page }) => {
    await page.goto('/')
    const firstLink = page.locator('[data-testid="access-log-link"]').first()
    await firstLink.click()
    await expect(page).toHaveURL(/\/logs\//)
  })
})
