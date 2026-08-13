export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildReviewSlug(title: string): string {
  return `${slugify(title)}-review`
}

export function resolveUniqueSlug(
  baseSlug: string,
  existingSlugs: Set<string>
): string {
  if (!existingSlugs.has(baseSlug)) return baseSlug

  let n = 2
  while (existingSlugs.has(`${baseSlug}-${n}`)) {
    n += 1
  }
  return `${baseSlug}-${n}`
}
