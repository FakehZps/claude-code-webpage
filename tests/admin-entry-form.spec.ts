import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { test, expect } from '@playwright/test'

const DEV_PASSWORD = 'devpassword123'
const GAMES_JSON_PATH = path.join(process.cwd(), 'content', 'games.json')
const QUICKLOG_TITLE = 'Playwright Test Quicklog Entry'
const FULLREVIEW_TITLE = 'Playwright Test Fullreview Entry'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.locator('[data-testid="login-password-input"]').fill(DEV_PASSWORD)
  await page.locator('[data-testid="login-submit-button"]').click()
  await expect(page).toHaveURL('/admin/new')
}

test.describe('Admin entry form', () => {
  test.afterEach(async () => {
    // Local-fs persist mode writes directly into the working tree during these
    // tests — revert/clean up so the suite never leaves real content behind.
    execSync('git checkout -- "content/games.json"', { cwd: process.cwd() })
    for (const f of fs.readdirSync(path.join(process.cwd(), 'content', 'logs'))) {
      if (f.startsWith('playwright-test-')) {
        fs.unlinkSync(path.join(process.cwd(), 'content', 'logs', f))
      }
    }
    // Give Next dev's file watcher time to settle after these content writes
    // before the next test loads a page — otherwise a Fast Refresh reload can
    // land mid-navigation and interrupt it.
    await new Promise((resolve) => setTimeout(resolve, 500))
  })

  test('quick log submit (no review body) appends to games.json', async ({
    page,
  }) => {
    await login(page)

    await page.locator('[data-testid="entry-title-input"]').fill(QUICKLOG_TITLE)
    await page.locator('[data-testid="entry-platform-select"]').selectOption('PC')
    await page.locator('[data-testid="entry-genre-select"]').selectOption('Action')
    await page.locator('[data-testid="entry-date-input"]').fill('2026-08-12')
    await page.locator('[data-testid="entry-rating-input"]').fill('7.5')
    await page.locator('[data-testid="entry-excerpt-textarea"]').fill('a test entry')
    await page.locator('[data-testid="entry-submit-button"]').click()

    await expect(page.locator('[data-testid="entry-success-message"]')).toBeVisible()

    const games = JSON.parse(fs.readFileSync(GAMES_JSON_PATH, 'utf-8'))
    const created = games.find((g: { title: string }) => g.title === QUICKLOG_TITLE)
    expect(created).toBeTruthy()
    expect(created.hasFullReview).toBe(false)
  })

  test('full review submit creates a new MDX file', async ({ page }) => {
    await login(page)

    await page.locator('[data-testid="entry-title-input"]').fill(FULLREVIEW_TITLE)
    await page.locator('[data-testid="entry-platform-select"]').selectOption('Switch')
    await page.locator('[data-testid="entry-genre-select"]').selectOption('Platformer')
    await page.locator('[data-testid="entry-date-input"]').fill('2026-08-12')
    await page.locator('[data-testid="entry-rating-input"]').fill('8')
    await page.locator('[data-testid="entry-excerpt-textarea"]').fill('a test entry')
    await page
      .locator('[data-testid="entry-review-body-textarea"]')
      .fill('## Test\n\nThis is a Playwright test review body.')
    await page.locator('[data-testid="entry-submit-button"]').click()

    await expect(page.locator('[data-testid="entry-success-message"]')).toBeVisible()

    const mdxPath = path.join(
      process.cwd(),
      'content',
      'logs',
      'playwright-test-fullreview-entry-review.mdx'
    )
    expect(fs.existsSync(mdxPath)).toBe(true)
  })

  test('missing required fields show inline validation errors', async ({
    page,
  }) => {
    await login(page)

    await page.locator('[data-testid="entry-submit-button"]').click()

    await expect(page.locator('[data-testid="entry-success-message"]')).not.toBeVisible()
    await expect(page.locator('text=Title is required')).toBeVisible()
  })
})
