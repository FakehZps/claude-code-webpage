import { notFound } from 'next/navigation'
import { locateEntry } from '@/lib/entries'
import EntryForm from '@/components/admin/EntryForm'
import LogoutButton from '@/components/admin/LogoutButton'

export default async function EditEntryPage({
  params,
}: {
  params: { slug: string }
}) {
  const located = await locateEntry(params.slug)
  if (!located) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-orbitron text-2xl font-black text-white neon-text-cyan">
          [ EDIT_LOG_ENTRY ]
        </h1>
        <LogoutButton />
      </div>
      <EntryForm
        mode="edit"
        slug={params.slug}
        initialData={{
          title: located.frontmatter.title,
          platform: located.frontmatter.platform ?? '',
          genre: located.frontmatter.genre ?? '',
          completionDate:
            located.frontmatter.completionDate ?? located.frontmatter.date,
          rating: located.frontmatter.rating ?? 0,
          excerpt: located.frontmatter.excerpt,
          reviewBody: located.reviewBody || undefined,
          coverImagePath: located.frontmatter.coverImage || undefined,
        }}
      />
    </div>
  )
}
