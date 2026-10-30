import { getOpenApiSpec } from '@/lib/openapi'
import { slugifyOperationId } from '@/lib/schema'
import { MethodBadge } from '@/components/MethodBadge'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const tagMap: Record<string, string[]> = {
  auth: ['Auth', 'Sessions'],
  org: ['Org', 'Org Settings', 'Org Users', 'Org Roles', 'Org Permissions', 'Org Invitations'],
  portals: ['portals'],
  requests: ['Requests'],
  citizen: ['citizen'],
}

export async function generateStaticParams() {
  return Object.keys(tagMap).map((tag) => ({ tag }))
}

export default async function ReferenceTagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const matchedTags = tagMap[tag]
  if (!matchedTags) notFound()

  const spec = getOpenApiSpec()
  const endpoints: { method: string; path: string; summary: string; operationId: string }[] = []

  for (const [path, methods] of Object.entries(spec.paths as Record<string, any>)) {
    for (const [method, op] of Object.entries(methods as Record<string, any>)) {
      if (matchedTags.includes(op.tags?.[0])) {
        endpoints.push({
          method,
          path,
          summary: op.summary ?? '',
          operationId: slugifyOperationId(op.operationId ?? ''),
        })
      }
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold capitalize mb-6">{tag}</h1>
      <div className="space-y-2">
        {endpoints.map((e) => (
          <Link
            key={`${e.method}-${e.path}`}
            href={`/docs/reference/${tag}/${e.operationId}`}
            className="flex items-start gap-3 p-3 border rounded hover:bg-gray-50 transition-colors no-underline"
          >
            <MethodBadge method={e.method} />
            <div>
              <span className="font-mono text-sm text-gray-900">{e.path}</span>
              {e.summary && <p className="text-gray-500 text-xs mt-0.5">{e.summary}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
