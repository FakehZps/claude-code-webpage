import fs from 'fs'
import path from 'path'

export class PersistError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'PersistError'
    this.status = status
  }
}

interface ReadResult {
  content: string
  sha: string | null
}

interface CommitParams {
  path: string
  content: string
  encoding: 'utf-8' | 'base64'
  message: string
  sha?: string | null
}

interface DeleteParams {
  path: string
  message: string
  sha: string | null
}

function githubConfig() {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_REPO_OWNER
  const repo = process.env.GITHUB_REPO_NAME
  const branch = process.env.GITHUB_BRANCH || 'master'
  if (!token || !owner || !repo) return null
  return { token, owner, repo, branch }
}

function contentRoot(): string {
  return process.env.CONTENT_ROOT || process.cwd()
}

// ---------- local filesystem branch (used when GITHUB_TOKEN is unset) ----------

async function localReadFile(relPath: string): Promise<ReadResult | null> {
  const fullPath = path.join(contentRoot(), relPath)
  if (!fs.existsSync(fullPath)) return null
  return { content: fs.readFileSync(fullPath, 'utf-8'), sha: 'local' }
}

async function localListDirectory(relPath: string): Promise<string[]> {
  const fullPath = path.join(contentRoot(), relPath)
  if (!fs.existsSync(fullPath)) return []
  return fs.readdirSync(fullPath)
}

async function localCommitFile(params: CommitParams): Promise<{ sha: string }> {
  const fullPath = path.join(contentRoot(), params.path)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  const buffer =
    params.encoding === 'base64'
      ? Buffer.from(params.content, 'base64')
      : Buffer.from(params.content, 'utf-8')
  fs.writeFileSync(fullPath, buffer)
  return { sha: 'local' }
}

async function localDeleteFile(params: DeleteParams): Promise<void> {
  const fullPath = path.join(contentRoot(), params.path)
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
}

// ---------- GitHub Contents API branch (used when GITHUB_TOKEN is set) ----------

const GITHUB_API_BASE = 'https://api.github.com'

function githubHeaders(token: string, json = false) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (json) headers['Content-Type'] = 'application/json'
  return headers
}

async function githubReadFile(relPath: string): Promise<ReadResult | null> {
  const cfg = githubConfig()
  if (!cfg) throw new PersistError('GitHub is not configured', 500)

  const url = `${GITHUB_API_BASE}/repos/${cfg.owner}/${cfg.repo}/contents/${relPath}?ref=${cfg.branch}`
  const res = await fetch(url, { headers: githubHeaders(cfg.token) })

  if (res.status === 404) return null
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new PersistError(body.message ?? 'GitHub read failed', res.status)
  }

  const body = await res.json()
  const content = Buffer.from(body.content, 'base64').toString('utf-8')
  return { content, sha: body.sha }
}

async function githubListDirectory(relPath: string): Promise<string[]> {
  const cfg = githubConfig()
  if (!cfg) throw new PersistError('GitHub is not configured', 500)

  const url = `${GITHUB_API_BASE}/repos/${cfg.owner}/${cfg.repo}/contents/${relPath}?ref=${cfg.branch}`
  const res = await fetch(url, { headers: githubHeaders(cfg.token) })

  if (res.status === 404) return []
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new PersistError(body.message ?? 'GitHub read failed', res.status)
  }

  const body = (await res.json()) as Array<{ name: string; type: string }>
  return body.filter((entry) => entry.type === 'file').map((entry) => entry.name)
}

async function githubCommitFile(
  params: CommitParams,
  retried = false
): Promise<{ sha: string }> {
  const cfg = githubConfig()
  if (!cfg) throw new PersistError('GitHub is not configured', 500)

  const base64Content =
    params.encoding === 'base64'
      ? params.content
      : Buffer.from(params.content, 'utf-8').toString('base64')

  const url = `${GITHUB_API_BASE}/repos/${cfg.owner}/${cfg.repo}/contents/${params.path}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: githubHeaders(cfg.token, true),
    body: JSON.stringify({
      message: params.message,
      content: base64Content,
      branch: cfg.branch,
      ...(params.sha ? { sha: params.sha } : {}),
    }),
  })

  if (res.ok) {
    const body = await res.json()
    return { sha: body.content.sha }
  }

  const body = await res.json().catch(() => ({}))

  if (res.status === 409 && !retried) {
    // Stale sha (concurrent write) — refetch and retry once.
    const fresh = await githubReadFile(params.path)
    return githubCommitFile({ ...params, sha: fresh?.sha ?? null }, true)
  }

  if (res.status === 401) {
    throw new PersistError('GitHub token invalid or missing required scopes', 401)
  }
  if (res.status === 403) {
    throw new PersistError(
      'GitHub API rate-limited or insufficient permissions',
      403
    )
  }
  throw new PersistError(
    body.message ?? `GitHub write failed (${res.status})`,
    res.status
  )
}

async function githubDeleteFile(
  params: DeleteParams,
  retried = false
): Promise<void> {
  const cfg = githubConfig()
  if (!cfg) throw new PersistError('GitHub is not configured', 500)

  if (!params.sha) {
    throw new PersistError('sha is required to delete a file', 400)
  }

  const url = `${GITHUB_API_BASE}/repos/${cfg.owner}/${cfg.repo}/contents/${params.path}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: githubHeaders(cfg.token, true),
    body: JSON.stringify({
      message: params.message,
      sha: params.sha,
      branch: cfg.branch,
    }),
  })

  if (res.ok) return

  const body = await res.json().catch(() => ({}))

  if (res.status === 409 && !retried) {
    const fresh = await githubReadFile(params.path)
    if (!fresh) return // already gone
    return githubDeleteFile({ ...params, sha: fresh.sha }, true)
  }

  if (res.status === 401) {
    throw new PersistError('GitHub token invalid or missing required scopes', 401)
  }
  if (res.status === 403) {
    throw new PersistError(
      'GitHub API rate-limited or insufficient permissions',
      403
    )
  }
  throw new PersistError(
    body.message ?? `GitHub delete failed (${res.status})`,
    res.status
  )
}

// ---------- public API ----------

export async function readFile(relPath: string): Promise<ReadResult | null> {
  return githubConfig() ? githubReadFile(relPath) : localReadFile(relPath)
}

export async function listDirectory(relPath: string): Promise<string[]> {
  return githubConfig()
    ? githubListDirectory(relPath)
    : localListDirectory(relPath)
}

export async function commitFile(
  params: CommitParams
): Promise<{ sha: string }> {
  return githubConfig() ? githubCommitFile(params) : localCommitFile(params)
}

export async function deleteFile(params: DeleteParams): Promise<void> {
  return githubConfig() ? githubDeleteFile(params) : localDeleteFile(params)
}
