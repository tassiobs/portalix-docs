# Self-Serve Onboarding

This guide walks through the complete setup flow for a new service provider — from creating an account to having a live citizen-facing portal ready to receive requests.

## Overview

The setup flow has four stages:

1. **Create your org** — sign up and get your access token
2. **Configure your portal** — create a portal with a slug and domain
3. **Define request types** — model the services citizens can request
4. **Go live** — citizens discover and use your portal

---

## Step 1 — Create your org

A single sign-up call creates both your user account and your organization.

```bash
curl -X POST https://api.portalu.io/api/v1/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "org_name": "City of Springfield",
    "name": "Jane Doe",
    "email": "jane@springfield.gov",
    "password": "s3cur3pass!"
  }'
```

Check your email and verify it before signing in:

```bash
curl -X POST https://api.portalu.io/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{ "token": "<token from email>" }'
```

Then sign in to get your access token:

```bash
curl -X POST https://api.portalu.io/api/v1/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@springfield.gov",
    "password": "s3cur3pass!"
  }'
```

The response includes `access_token` — include it as `Authorization: Bearer <token>` in all subsequent requests.

### Optional — set a custom org slug

The org slug appears in every citizen-facing URL (`/citizen/{org_slug}/...`). You can set it explicitly:

```bash
curl -X PATCH https://api.portalu.io/api/v1/org \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City of Springfield",
    "slug": "springfield"
  }'
```

Org slugs are globally unique. If the slug is taken, you'll receive a `409 Conflict`.

---

## Step 2 — Create a portal

A portal is the citizen-facing surface where users sign up and submit requests. You can have multiple portals per org — one per department, service line, or audience.

```bash
curl -X POST https://api.portalu.io/api/v1/org/portals \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Permits & Licenses",
    "slug": "permits",
    "description": "Apply for building permits and business licenses.",
    "domain": "permits.springfield.gov"
  }'
```

The `slug` is optional — it will be auto-generated from `name` if omitted. Portal slugs are unique within your org.

Once created, citizens can discover the portal at:

```
GET /citizen/springfield/permits
```

This endpoint is public (no auth required) and returns the portal's name, slug, and description — useful for building a landing page before the citizen signs up.

---

## Step 3 — Define request types

Request types are the services your portal offers. Each one has a name, optional description, and a set of custom fields.

```bash
curl -X POST https://api.portalu.io/api/v1/org/portals/{portal_id}/request-types \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Building Permit",
    "description": "Request a permit for construction or renovation."
  }'
```

Add fields to capture the information you need from citizens:

```bash
curl -X POST https://api.portalu.io/api/v1/org/portals/{portal_id}/request-types/{rt_id}/fields \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Project Description",
    "field_type": "textarea",
    "required": true,
    "order": 0
  }'
```

Supported field types: `text`, `textarea`, `number`, `date`, `select`.

### Optional — set up a workflow

If requests need to go through review steps, define a workflow:

```bash
curl -X PUT https://api.portalu.io/api/v1/org/portals/{portal_id}/request-types/{rt_id}/workflow \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tasks": [
      {
        "key": "initial_review",
        "name": "Initial Review",
        "assignee_role": "reviewer",
        "deadline_offset_hours": 48
      },
      {
        "key": "final_approval",
        "name": "Final Approval",
        "assignee_role": "approver",
        "depends_on": ["initial_review"]
      }
    ]
  }'
```

Tasks activate in dependency order. Each task can be assigned to a role or a specific user.

---

## Step 4 — Go live

With the portal and request types in place, your citizen-facing app can:

1. **Show the portal landing page** — call `GET /citizen/{org_slug}/{portal_slug}` to get the portal name and description (no auth needed)
2. **Let citizens sign up** — `POST /citizen/{org_slug}/{portal_slug}/auth/sign-up`
3. **Show available services** — `GET /citizen/{org_slug}/{portal_slug}/request-types`
4. **Accept submissions** — `POST /citizen/{org_slug}/{portal_slug}/requests`

Citizens track their submissions via `GET /citizen/{org_slug}/{portal_slug}/requests`.

---

## What's next

- Invite team members via `POST /org/invitations` and assign them to portals
- Configure org-level settings (lockout policy, MFA) via `PATCH /org/settings`
- Monitor and process requests in `GET /org/portals/{portal_id}/requests`
