---
title: "Flow 2 — Internal User Onboarding"
excerpt: Invite an org user, assign an org role, then grant portal access with a portal role.
hidden: false
---

**Who runs this**: the Org Super Admin (or any user with `org.users.manage`).

**What it covers**: invite a user → assign an org role → add them to a portal with a portal role.

---

### 1. Invite a user to the org

```http
POST /org/users
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Ana Lima",
  "email": "ana@prefeitura.gov.br"
}
```

```json
{
  "id": "u5v6w7...",
  "name": "Ana Lima",
  "email": "ana@prefeitura.gov.br",
  "email_verified": false,
  "status": "active",
  "org_roles": [],
  "portal_roles": [],
  "created_at": "2026-09-21T14:10:00Z"
}
```

An invitation email is sent to Ana with a link to set her password. If email delivery fails, the request returns `503` and no user is created.

Ana accepts by clicking the link in the email, which calls:

```http
POST /auth/accept-invite
Content-Type: application/json

{
  "token": "<token from email>",
  "password": "newpassword123",
  "name": "Ana Lima"
}
```

---

### 2. Assign an org-level role

Org roles control what Ana can do at the organisation level (manage users, settings, etc.).

First, list available org roles:

```http
GET /org/roles
Authorization: Bearer <access_token>
```

To see only portal-level roles:

```http
GET /org/roles?level=portal
Authorization: Bearer <access_token>
```

Then assign the role:

```http
POST /org/users/u5v6w7.../roles
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "role_id": "<role-id>"
}
```

Returns `204 No Content` on success.

---

### 3. Add her to a portal

Portal access is separate from org access. First get the available portal-level roles:

```http
GET /org/roles?level=portal
Authorization: Bearer <access_token>
```

```json
[
  {
    "id": "role-abc...",
    "name": "Portal Manager",
    "level": "portal",
    "permissions": ["portal.requests:read", "portal.requests:update", "portal.request_types:manage", "portal.users:manage", "portal.settings:manage"],
    "is_default": false,
    "created_at": "2026-09-21T14:01:00Z"
  }
]
```

Then assign Ana to the portal with a role:

```http
POST /org/portals/p9q8r7.../users
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "user_id": "u5v6w7...",
  "role_id": "role-abc..."
}
```

Returns `204 No Content`. Ana can now access this portal and act according to her portal role's permissions.

To see what permissions are available for portal roles:

```http
GET /org/portals/permissions
Authorization: Bearer <access_token>
```

---

### Permission enforcement

Portal routes enforce permissions automatically:

| Action | Required permission |
|---|---|
| Update portal settings | `portal.settings:manage` |
| Assign/remove portal users | `portal.users:manage` |
| Manage request types | `portal.request_types:manage` |
| View requests | `portal.requests:read` |
| Update requests | `portal.requests:update` |

Org super admins and users with `org.users.manage` or `org.portals.manage` bypass all portal permission checks.

---

**Next**: [Flow 3 — Client Submitting a Request](./flow-3-citizen-submitting-a-request)
