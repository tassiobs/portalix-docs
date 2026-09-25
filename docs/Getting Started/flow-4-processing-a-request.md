---
title: "Flow 4 — Processing a Request"
excerpt: List open requests on a portal and update a request status.
hidden: false
---

**Who runs this**: an internal user (Ana) with portal access.

**What it covers**: list open requests → view a request → update its status.

> **Prerequisite**: Ana must have been assigned to this portal with a role that includes `portal.requests:read` and `portal.requests:update`. See [Flow 2](./flow-2-internal-user-onboarding).

---

### 1. List requests on the portal

```http
GET /org/portals/p9q8r7.../requests
Authorization: Bearer <ana-token>
```

```json
[
  {
    "id": "req123...",
    "portal_id": "p9q8r7...",
    "request_type_id": "rt1rt2...",
    "citizen_id": "c1d2e3...",
    "title": "Solicitação de Licença - Galpão Industrial",
    "status": "open",
    "created_at": "2026-09-21T14:25:00Z"
  }
]
```

---

### 2. Update a request

Ana reviews the submission and moves it to the next status.

```http
PATCH /org/portals/p9q8r7.../requests/req123...
Authorization: Bearer <ana-token>
Content-Type: application/json

{
  "status": "in_progress"
}
```

```json
{
  "id": "req123...",
  "portal_id": "p9q8r7...",
  "request_type_id": "rt1rt2...",
  "citizen_id": "c1d2e3...",
  "title": "Solicitação de Licença - Galpão Industrial",
  "status": "in_progress",
  "created_at": "2026-09-21T14:25:00Z"
}
```

`status` is a free string — use whatever values fit your workflow (e.g. `open`, `in_review`, `approved`, `rejected`, `completed`). The client sees this value on their dashboard.

You can also update the `title` in the same call:

```http
PATCH /org/portals/p9q8r7.../requests/req123...
Authorization: Bearer <ana-token>
Content-Type: application/json

{
  "status": "completed",
  "title": "Solicitação de Licença - Galpão Industrial (Aprovada)"
}
```

---

## What's Next

- **Roles** — create custom org or portal roles with specific permissions: `POST /org/roles`
- **Org Settings** — configure lockout policies: `GET /org/settings`
- **Full API reference** — every endpoint: see the API Reference section
