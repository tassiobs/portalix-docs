# Building the Admin UI

This guide maps each internal staff screen to the API calls that back it. Org users (staff, reviewers, admins) use this surface to manage portals, process requests, and handle tasks.

All endpoints require `Authorization: Bearer <access_token>` from the org user auth flow (`POST /api/v1/auth/sign-in`).

---

## Screen 1 — Sign In

```http
POST /api/v1/auth/sign-in
Content-Type: application/json

{
  "email": "jane@springfield.gov",
  "password": "s3cur3pass!"
}
```

Store `access_token` and `refresh_token`. When the access token expires, refresh silently:

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{ "refresh_token": "<refresh_token>" }
```

See the [Error Handling](./error-handling) guide for how to detect expiry and trigger this flow automatically.

---

## Screen 2 — Portal List

The home screen after sign-in. List all portals the user has access to.

```http
GET /api/v1/org/portals
Authorization: Bearer <token>
```

Each portal has `id`, `name`, `slug`, `description`, and `domain`. Use the `id` as the key for all subsequent portal-scoped calls.

---

## Screen 3 — Request Queue

The core admin screen. Shows requests submitted to a portal, with filtering.

```http
GET /api/v1/org/portals/{portal_id}/requests
Authorization: Bearer <token>
```

**Supported query filters:**

| Parameter | Type | Description |
|---|---|---|
| `status` | string | `open`, `in_progress`, `closed`, `rejected` |
| `request_type_id` | UUID | Filter to a specific service type |
| `assigned_to_me` | boolean | Only show requests where I have an active task |
| `from_date` | string | Submissions on or after this date (ISO 8601) |
| `to_date` | string | Submissions on or before this date (ISO 8601) |

**Recommended default view:** `?assigned_to_me=true` for staff with limited permissions, or `?status=open` for admins who have `portal.requests:read_all`.

Use `assigned_to_me=true` as the default for most staff — they only see what's relevant to them without needing elevated permissions.

---

## Screen 4 — Request Detail

Full view of a single request including submitted field values, status, and tasks.

```http
GET /api/v1/org/portals/{portal_id}/requests/{request_id}
Authorization: Bearer <token>
```

The response includes `field_values` (the citizen's answers) and basic request metadata. Fetch tasks separately for the workflow panel:

```http
GET /api/v1/org/portals/{portal_id}/requests/{request_id}/tasks
Authorization: Bearer <token>
```

Each task includes its `status`, `assigned_to_user_id`, `deadline`, `outcome`, and `comments`.

### Update request status or title

```http
PATCH /api/v1/org/portals/{portal_id}/requests/{request_id}
Authorization: Bearer <token>
Content-Type: application/json

{ "status": "in_progress" }
```

Valid status values: `open`, `in_progress`, `closed`, `rejected`.

---

## Screen 5 — Task Detail

Staff process a request by completing its tasks in order.

### Reassign a task

```http
PATCH /api/v1/org/portals/{portal_id}/requests/{request_id}/tasks/{task_id}
Authorization: Bearer <token>
Content-Type: application/json

{ "assigned_to_user_id": "<user_id>" }
```

### Add a comment

```http
POST /api/v1/org/portals/{portal_id}/requests/{request_id}/tasks/{task_id}/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "body": "Documents verified. Proceeding to approval.",
  "file_url": "https://storage.example.com/permit-docs.pdf",
  "file_name": "permit-docs.pdf"
}
```

### Complete a task

```http
POST /api/v1/org/portals/{portal_id}/requests/{request_id}/tasks/{task_id}/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "outcome": "approved",
  "notes": "All documents verified and approved."
}
```

Valid outcomes: `approved`, `rejected`, `clarification_requested`.

Completing a task activates the next task in the workflow (based on `depends_on`). If no tasks remain, the request can be closed.

---

## Screen 6 — Portal Settings

Manage the portal's name, slug, and domain. Requires `portal.settings:manage`.

```http
PATCH /api/v1/org/portals/{portal_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Permits & Licenses",
  "description": "Updated description.",
  "domain": "permits.springfield.gov"
}
```

---

## Screen 7 — Team Management

### List org users

```http
GET /api/v1/org/users
Authorization: Bearer <token>
```

### Invite a new team member

```http
POST /api/v1/org/invitations
Authorization: Bearer <token>
Content-Type: application/json

{ "email": "newstaff@springfield.gov" }
```

The invitee receives an email with a link to accept and set their password via `POST /api/v1/auth/accept-invite`.

### Assign a user to a portal with a role

```http
POST /api/v1/org/portals/{portal_id}/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": "<user_id>",
  "role_id": "<role_id>"
}
```

### Remove a user from a portal

```http
DELETE /api/v1/org/portals/{portal_id}/users/{user_id}
Authorization: Bearer <token>
```

---

## Screen 8 — Request Type Management

Manage the services citizens can apply for. Requires `portal.request_types:manage`.

### List request types

```http
GET /api/v1/org/portals/{portal_id}/request-types
Authorization: Bearer <token>
```

### Create a request type

```http
POST /api/v1/org/portals/{portal_id}/request-types
Authorization: Bearer <token>
Content-Type: application/json

{ "name": "Building Permit", "description": "Apply for a construction permit." }
```

### Add a field

```http
POST /api/v1/org/portals/{portal_id}/request-types/{rt_id}/fields
Authorization: Bearer <token>
Content-Type: application/json

{
  "label": "Property Type",
  "field_type": "select",
  "required": true,
  "order": 0,
  "options": ["Residential", "Commercial", "Industrial"]
}
```

### Configure a workflow

```http
PUT /api/v1/org/portals/{portal_id}/request-types/{rt_id}/workflow
Authorization: Bearer <token>
Content-Type: application/json

{
  "tasks": [
    {
      "key": "review",
      "name": "Initial Review",
      "assignee_role": "reviewer",
      "deadline_offset_hours": 48
    },
    {
      "key": "approval",
      "name": "Final Approval",
      "assignee_role": "approver",
      "depends_on": ["review"]
    }
  ]
}
```
