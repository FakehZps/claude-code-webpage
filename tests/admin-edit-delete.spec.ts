import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { test, expect, type Page } from '@playwright/test'

const DEV_PASSWORD = 'devpassword123'
const GAMES_JSON_PATH = path.join(process.cwd(), 'content', 'games.json')
const LOGS_DIR = path.join(process.cwd(), 'content', 'logs')

const TINY_PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

async function login(page: Page) {
  await page.goto('/login')
  await page.locator('[data-testid="login-password-input"]').fill(DEV_PASSWORD)
  await page.locator('[data-testid="login-submit-button"]').click()
  await expect(page).toHaveURL('/admin/new')
}

async function createFixture(
  page: Page,
  overrides: Record<string, unknown>
): Promise<{ slug: string; mode: string }> {
  const res = await page.request.post('/api/entries', {
    data: {
      title: 'Playwright Test Fixture',
      platform: 'PC',
      genre: 'Action',
      completionDate: '2026-08-12',
      rating: 7,
      excerpt: 'fixture entry',
      ...overrides,
    },
  })
  expect(res.ok()).toBe(true)
  return res.json()
}

function readGamesEntry(slug: string) {
  const games = JSON.parse(fs.readFileSync(GAMES_JSON_PATH, 'utf-8'))
  return games.find((g: { slug: string }) => g.slug === slug)
}

function mdxPathFor(slug: string) {
  return path.join(LOGS_DIR, `${slug}.mdx`)
}

test.describe('Admin edit/delete', () => {
  test.afterEach(async () => {
    execSync('git checkout -- "content/games.json"', { cwd: process.cwd() })
    for (const f of fs.readdirSync(LOGS_DIR)) {
      if (f.startsWith('playwright-test-')) {
        fs.unlinkSync(path.join(LOGS_DIR, f))
      }
    }
    // Give Next dev's file watcher time to settle after these content writes
    // before the next test loads a page — otherwise a Fast Refresh reload can
    // land mid-navigation and interrupt it.
    await new Promise((resolve) => setTimeout(resolve, 500))
  })

  test('dashboard renders and search narrows results', async ({ page }) => {
    await login(page)
    const { slug } = await createFixture(page, {
      title: 'Playwright Test Dashboard Search',
    })

    await page.goto('/admin')
    await expect(
      page.locator(`[data-testid="admin-entry-row-${slug}"]`)
    ).toBeVisible()

    await page.locator('[data-testid="admin-search-input"]').fill('zzz-no-match-zzz')
    await expect(page.locator('[data-testid="admin-entries-empty"]')).toBeVisible()

    await page.locator('[data-testid="admin-search-input"]').fill('Dashboard Search')
    await expect(
      page.locator(`[data-testid="admin-entry-row-${slug}"]`)
    ).toBeVisible()
  })

  test('editing a json-backed entry updates it in place', async ({ page }) => {
    await login(page)
    const { slug } = await createFixture(page, {
      title: 'Playwright Test Json Edit',
    })

    await page.goto(`/admin/edit/${slug}`)
    await page.locator('[data-testid="entry-excerpt-textarea"]').fill('edited comment')
    await page.locator('[data-testid="entry-rating-input"]').fill('9')
    await page.locator('[data-testid="entry-submit-button"]').click()
    await expect(page).toHaveURL('/admin')

    const entry = readGamesEntry(slug)
    expect(entry).toBeTruthy()
    expect(entry.excerpt).toBe('edited comment')
    expect(entry.rating).toBe(9)
    expect(entry.hasFullReview).toBe(false)
  })

  test('editing an mdx-backed entry updates it in place', async ({ page }) => {
    await login(page)
    const { slug } = await createFixture(page, {
      title: 'Playwright Test Mdx Edit',
      reviewBody: '## Original\n\nOriginal body.',
    })

    await page.goto(`/admin/edit/${slug}`)
    await page.locator('[data-testid="entry-excerpt-textarea"]').fill('edited excerpt')
    await page.locator('[data-testid="entry-submit-button"]').click()
    await expect(page).toHaveURL('/admin')

    const contents = fs.readFileSync(mdxPathFor(slug), 'utf-8')
    expect(contents).toContain('edited excerpt')
    expect(contents).toContain('Original body')
  })

  test('adding a review body converts a quick log to a full review', async ({
    page,
  }) => {
    await login(page)
    const { slug } = await createFixture(page, {
      title: 'Playwright Test Json To Mdx',
    })

    await page.goto(`/admin/edit/${slug}`)
    await page
      .locator('[data-testid="entry-review-body-textarea"]')
      .fill('## Now full\n\nConverted.')
    await page.locator('[data-testid="entry-submit-button"]').click()
    await expect(page).toHaveURL('/admin')

    expect(fs.existsSync(mdxPathFor(slug))).toBe(true)
    expect(readGamesEntry(slug)).toBeUndefined()
  })

  test('clearing the review body converts a full review to a quick log', async ({
    page,
  }) => {
    await login(page)
    const { slug } = await createFixture(page, {
      title: 'Playwright Test Mdx To Json',
      reviewBody: '## Full\n\nBody.',
    })

    await page.goto(`/admin/edit/${slug}`)
    await page.locator('[data-testid="entry-review-body-textarea"]').fill('')
    await page.locator('[data-testid="entry-submit-button"]').click()
    await expect(page).toHaveURL('/admin')

    expect(fs.existsSync(mdxPathFor(slug))).toBe(false)
    const entry = readGamesEntry(slug)
    expect(entry).toBeTruthy()
    expect(entry.hasFullReview).toBe(false)
  })

  test('cover image is preserved when not re-uploaded on edit', async ({
    page,
  }) => {
    await login(page)
    const { slug } = await createFixture(page, {
      title: 'Playwright Test Cover Preserved',
      coverImage: { filename: 'cover.png', dataUrl: TINY_PNG_DATA_URL },
    })

    const before = readGamesEntry(slug)
    expect(before.coverImage).toBe(`/images/${slug}.png`)
    expect(fs.existsSync(path.join(process.cwd(), 'public', 'images', `${slug}.png`))).toBe(true)

    await page.goto(`/admin/edit/${slug}`)
    await page.locator('[data-testid="entry-excerpt-textarea"]').fill('cover should stay')
    await page.locator('[data-testid="entry-submit-button"]').click()
    await expect(page).toHaveURL('/admin')

    const after = readGamesEntry(slug)
    expect(after.coverImage).toBe(`/images/${slug}.png`)

    fs.unlinkSync(path.join(process.cwd(), 'public', 'images', `${slug}.png`))
  })

  test('delete removes the entry when confirmed', async ({ page }) => {
    await login(page)
    const { slug } = await createFixture(page, {
      title: 'Playwright Test Delete Confirm',
    })

    await page.goto('/admin')
    page.once('dialog', (dialog) => dialog.accept())
    await page.locator(`[data-testid="admin-entry-delete-button-${slug}"]`).click()

    await expect(
      page.locator(`[data-testid="admin-entry-row-${slug}"]`)
    ).not.toBeVisible()
    expect(readGamesEntry(slug)).toBeUndefined()
  })

  test('delete leaves the entry untouched when dismissed', async ({ page }) => {
    await login(page)
    const { slug } = await createFixture(page, {
      title: 'Playwright Test Delete Dismiss',
    })

    await page.goto('/admin')
    page.once('dialog', (dialog) => dialog.dismiss())
    await page.locator(`[data-testid="admin-entry-delete-button-${slug}"]`).click()

    await expect(
      page.locator(`[data-testid="admin-entry-row-${slug}"]`)
    ).toBeVisible()
    expect(readGamesEntry(slug)).toBeTruthy()
  })

  test('deleting from the edit page redirects to /admin', async ({ page }) => {
    await login(page)
    const { slug } = await createFixture(page, {
      title: 'Playwright Test Delete From Edit',
    })

    await page.goto(`/admin/edit/${slug}`)
    page.once('dialog', (dialog) => dialog.accept())
    await page.locator('[data-testid="entry-delete-button"]').click()

    await expect(page).toHaveURL('/admin')
    expect(readGamesEntry(slug)).toBeUndefined()
  })

  test('editing a nonexistent slug 404s', async ({ page }) => {
    await login(page)
    const res = await page.goto('/admin/edit/does-not-exist-xyz')
    expect(res?.status()).toBe(404)
  })
})
