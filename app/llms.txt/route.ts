import { NextRequest, NextResponse } from 'next/server'
import { getOpenApiSpec } from '@/lib/openapi'

export async function GET(req: NextRequest) {
  const spec = getOpenApiSpec()
  const base = new URL(req.url).origin
  const version = spec.info?.version ?? ''
  const apiBase = spec.servers?.[0]?.url ?? ''

  const content = `# Portalu API

> Multi-tenant platform for service-provider organisations to create citizen-facing portals for request management. Orgs set up portals, define request types with custom fields and workflows; citizens sign up, submit requests, and track them.

Version: ${version}
API Base URL: ${apiBase}

## Guides

- [Introduction](${base}/content/guides/introduction.md): Platform overview, key capabilities, and intended audience
- [Concepts](${base}/content/guides/concepts.md): Domain model — org, portal, citizen, request type, field, workflow, task
- [Getting Started](${base}/content/guides/getting-started.md): Self-serve onboarding — create org, portal, request types, go live
- [Building the Citizen UI](${base}/content/guides/citizen-ui.md): Screen-by-screen guide mapping each UI screen to API calls

## API Reference

- [OpenAPI Spec](${base}/openapi.json): Full OpenAPI ${spec.openapi ?? '3.1'} specification (machine-readable)
- [Full LLM context](${base}/llms-full.txt): All guides + complete endpoint list in a single file

## Optional

- [API Reference](${base}/docs/reference): Human-readable endpoint browser
`

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
