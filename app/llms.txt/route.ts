import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import { getOpenApiSpec } from '@/lib/openapi'

function readGuide(slug: string): string {
  const filePath = path.join(process.cwd(), 'content/guides', `${slug}.md`)
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : ''
}

function endpointSummary(spec: ReturnType<typeof getOpenApiSpec>): string {
  const lines: string[] = []
  const tagOrder = [
    'Auth', 'Sessions',
    'Org', 'Org Settings', 'Org Users', 'Org Roles', 'Org Permissions', 'Org Invitations',
    'Portals', 'Portal Users', 'Request Types', 'Request Type Fields', 'Workflows', 'Portal Requests', 'Tasks', 'Task Comments',
    'Requests',
    'Citizen', 'Citizen Auth', 'Citizen Request Types', 'Citizen Requests',
  ]

  // Group operations by tag
  const byTag: Record<string, { method: string; path: string; summary: string; operationId: string }[]> = {}
  for (const [pathStr, methods] of Object.entries(spec.paths ?? {})) {
    for (const [method, op] of Object.entries(methods as Record<string, { tags?: string[]; summary?: string; operationId?: string }>)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue
      const tag = op.tags?.[0] ?? 'Other'
      if (!byTag[tag]) byTag[tag] = []
      byTag[tag].push({
        method: method.toUpperCase(),
        path: pathStr,
        summary: op.summary ?? '',
        operationId: op.operationId ?? '',
      })
    }
  }

  const orderedTags = [...tagOrder.filter(t => byTag[t]), ...Object.keys(byTag).filter(t => !tagOrder.includes(t))]

  for (const tag of orderedTags) {
    lines.push(`\n### ${tag}\n`)
    for (const op of byTag[tag]) {
      const summary = op.summary ? ` — ${op.summary}` : ''
      lines.push(`- ${op.method} ${op.path}${summary}`)
    }
  }

  return lines.join('\n')
}

export async function GET() {
  const spec = getOpenApiSpec()
  const baseUrl = spec.servers?.[0]?.url ?? 'https://portalu-production.up.railway.app'
  const version = spec.info?.version ?? ''

  const concepts = readGuide('concepts')
  const gettingStarted = readGuide('getting-started')
  const citizenUi = readGuide('citizen-ui')

  const content = `# Portalu API — LLM Context

> Portalu is a multi-tenant API platform that lets service-provider organisations (government agencies, IT departments, etc.) create citizen-facing portals for service request management. Each organisation has one or more portals; citizens sign up per portal and submit requests; internal org users process those requests through configurable workflows.

Version: ${version}
Base URL: ${baseUrl}
OpenAPI spec: ${baseUrl}/openapi.json

---

## Authentication

Two separate auth systems:

**Org Users** (internal staff) — authenticate via \`/api/v1/auth/*\`. Receive a JWT access token and refresh token. Include access token as \`Authorization: Bearer <token>\` on all requests.

**Citizens** (end users) — authenticate via \`/api/v1/citizen/{org_slug}/{portal_slug}/auth/*\`. Same token model, scoped to a specific portal.

Access tokens expire. Use the \`/refresh\` endpoint with the refresh token to get a new access token.

---

${concepts}

---

${gettingStarted}

---

${citizenUi}

---

## All Endpoints
${endpointSummary(spec)}
`

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
