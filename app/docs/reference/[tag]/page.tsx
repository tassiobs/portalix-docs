import { getOpenApiSpec } from '@/lib/openapi'
import { EndpointRef } from '@/components/EndpointRef'
import { notFound } from 'next/navigation'

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
  const endpoints: { method: string; path: string; summary: string }[] = []

  for (const [path, methods] of Object.entries(spec.paths as Record<string, any>)) {
    for (const [method, op] of Object.entries(methods as Record<string, any>)) {
      if (matchedTags.includes(op.tags?.[0])) {
        endpoints.push({ method, path, summary: op.summary ?? '' })
      }
    }
  }

  return (
    <div>
      <h1 className="capitalize">{tag}</h1>
      {endpoints.map((e) => (
        <EndpointRef
          key={`${e.method}-${e.path}`}
          method={e.method}
          path={e.path}
          description={e.summary}
        />
      ))}
    </div>
  )
}
