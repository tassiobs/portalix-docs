import { getOpenApiSpec } from '@/lib/openapi'
import { EndpointRef } from '@/components/EndpointRef'

export default function ReferencePage() {
  const spec = getOpenApiSpec()
  const tags: Record<string, { method: string; path: string; summary: string }[]> = {}

  for (const [path, methods] of Object.entries(spec.paths as Record<string, any>)) {
    for (const [method, op] of Object.entries(methods as Record<string, any>)) {
      const tag = op.tags?.[0] ?? 'Other'
      if (!tags[tag]) tags[tag] = []
      tags[tag].push({ method, path, summary: op.summary ?? '' })
    }
  }

  return (
    <div>
      <h1>API Reference</h1>
      <p className="text-gray-600">
        Version <strong>{spec.info.version}</strong> · Base URL:{' '}
        <code>{spec.servers?.[0]?.url}</code>
      </p>
      {Object.entries(tags).map(([tag, endpoints]) => (
        <section key={tag} className="mt-8">
          <h2>{tag}</h2>
          {endpoints.map((e) => (
            <EndpointRef
              key={`${e.method}-${e.path}`}
              method={e.method}
              path={e.path}
              description={e.summary}
            />
          ))}
        </section>
      ))}
    </div>
  )
}
