import { test, expect } from '@playwright/test'

test.describe('Timeline Homepage', () => {
  test('timeline renders', async ({ page }) => {
    await page.goto('/')
    const timeline = page.locator('[data-testid="timeline"]')
    await expect(timeline).toBeVisible()
  })

  test('selecting a TimelineNode card shows its Access Log link in the detail panel', async ({ page }) => {
    await page.goto('/')
    const nodes = page.locator('[data-testid="timeline-node"]')
    const count = await nodes.count()
    expect(count).toBeGreaterThanOrEqual(1)

    await nodes.first().click()
    const accessLink = page.locator('[data-testid="access-log-link"]')
    await expect(accessLink).toBeVisible()
    await expect(accessLink).toContainText('Access Full Log')
  })

  test('roundup node is visible', async ({ page }) => {
    await page.goto('/')
    // Roundups only exist for past, fully-logged years — 2023 has one.
    await page.getByRole('button', { name: '2023', exact: true }).click()
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

test.describe('Timeline Search', () => {
  test('searching filters cards to matching titles', async ({ page }) => {
    await page.goto('/')
    const search = page.locator('[data-testid="search-input"]')
    await search.fill('witcher')

    const nodes = page.locator('[data-testid="timeline-node"]')
    const count = await nodes.count()
    expect(count).toBeGreaterThanOrEqual(1)

    for (let i = 0; i < count; i++) {
      await expect(nodes.nth(i)).toContainText(/witcher/i)
    }
  })

  test('searching with no matches shows empty state', async ({ page }) => {
    await page.goto('/')
    const search = page.locator('[data-testid="search-input"]')
    await search.fill('zzzznonexistentgamezzzz')

    const empty = page.locator('[data-testid="search-empty"]')
    await expect(empty).toBeVisible()
    await expect(page.locator('[data-testid="timeline-node"]')).toHaveCount(0)
  })

  test('clearing search restores year view', async ({ page }) => {
    await page.goto('/')
    const search = page.locator('[data-testid="search-input"]')
    await search.fill('witcher')
    await page.locator('[data-testid="search-clear"]').click()
    await expect(search).toHaveValue('')
  })

  test('searching matches genre', async ({ page }) => {
    await page.goto('/')
    const search = page.locator('[data-testid="search-input"]')
    await search.fill('jrpg')

    const nodes = page.locator('[data-testid="timeline-node"]')
    const count = await nodes.count()
    expect(count).toBeGreaterThanOrEqual(1)
    await expect(nodes.first()).toContainText(/jrpg/i)
  })
})

test.describe('Timeline Filters', () => {
  test('genre filter narrows results to that genre', async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-testid="filter-genre"]').selectOption('RPG')

    const nodes = page.locator('[data-testid="timeline-node"]')
    const count = await nodes.count()
    expect(count).toBeGreaterThanOrEqual(1)
    for (let i = 0; i < count; i++) {
      await expect(nodes.nth(i)).toContainText('RPG')
    }
  })

  test('award filter shows only GOTY picks', async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-testid="filter-award"]').selectOption('GOTY')

    const nodes = page.locator('[data-testid="timeline-node"], [data-testid="year-wrapup-node"]')
    const count = await nodes.count()
    expect(count).toBeGreaterThanOrEqual(1)
    for (let i = 0; i < count; i++) {
      await expect(nodes.nth(i)).toContainText('GOTY')
    }
  })

  test('reset button clears active filters', async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-testid="filter-award"]').selectOption('GOTY')
    await expect(page.locator('[data-testid="filter-clear"]')).toBeVisible()
    await page.locator('[data-testid="filter-clear"]').click()
    await expect(page.locator('[data-testid="filter-clear"]')).toHaveCount(0)
    await expect(page.locator('[data-testid="filter-award"]')).toHaveValue('ALL')
  })
})

test.describe('Random Log Button', () => {
  test('clicking random selects a log and shows its detail', async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-testid="random-log-button"]').click()
    await expect(page.locator('[data-testid="access-log-link"]')).toBeVisible()
  })
})
