---
title: "Flow 3 — Client Submitting a Request"
excerpt: Sign up on a portal, verify email, sign in, and submit a request.
hidden: false
---

**Who runs this**: a client accessing the portal.

**What it covers**: sign up → verify email → sign in → browse request types → submit a request.

> **Note**: clients have one account per org. The same email and password works on any portal under the same org. When signing in at a specific portal URL, the session is scoped to that portal.

---

### 1. Browse available request types (no login required)

Request types are public — clients can see what services are available before signing up.

```http
GET /citizen/{org_slug}/{portal_slug}/request-types
```

```json
[
  {
    "id": "rt1rt2...",
    "portal_id": "p9q8r7...",
    "name": "Licença de Instalação",
    "description": "Solicitação de licença para instalação de estabelecimento",
    "created_at": "2026-09-21T14:01:00Z"
  }
]
```

---

### 2. Sign up

The client registers using the org slug and portal slug from the URL.

```http
POST /citizen/{org_slug}/{portal_slug}/auth/sign-up
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@empresa.com.br",
  "password": "minhasenha456"
}
```

```json
{
  "citizen": {
    "id": "c1d2e3...",
    "org_id": "o1o2o3...",
    "name": "João Silva",
    "email": "joao@empresa.com.br",
    "email_verified": false,
    "status": "active",
    "created_at": "2026-09-21T14:20:00Z"
  },
  "message": "Account created. Please check your email to verify your account."
}
```

A verification email is sent immediately. If email delivery fails, the request returns `503` and no account is created.

---

### 3. Verify email

The email contains a link to:
```
/{org_slug}/{portal_slug}/verify-email?token=...
```

The frontend reads the `token` from the query string and calls:

```http
POST /citizen/{org_slug}/{portal_slug}/auth/verify-email
Content-Type: application/json

{
  "token": "<token from email link>"
}
```

```json
{
  "message": "Email verified. You can now sign in."
}
```

---

### 4. Sign in

```http
POST /citizen/{org_slug}/{portal_slug}/auth/sign-in
Content-Type: application/json

{
  "email": "joao@empresa.com.br",
  "password": "minhasenha456"
}
```

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "550e8400...",
  "token_type": "bearer",
  "citizen": {
    "id": "c1d2e3...",
    "org_id": "o1o2o3...",
    "name": "João Silva",
    "email": "joao@empresa.com.br",
    "email_verified": true,
    "status": "active",
    "created_at": "2026-09-21T14:20:00Z"
  }
}
```

Store the `access_token` — every subsequent request needs `Authorization: Bearer <access_token>`.

To get the current client's profile at any time:

```http
GET /citizen/{org_slug}/{portal_slug}/auth/me
Authorization: Bearer <access_token>
```

When the access token expires, use the refresh token:

```http
POST /citizen/{org_slug}/{portal_slug}/auth/refresh
Content-Type: application/json

{ "refresh_token": "<refresh_token>" }
```

---

### 5. Submit a request

```http
POST /citizen/{org_slug}/{portal_slug}/requests
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "request_type_id": "rt1rt2...",
  "title": "Solicitação de Licença - Galpão Industrial"
}
```

```json
{
  "id": "req123...",
  "portal_id": "p9q8r7...",
  "request_type_id": "rt1rt2...",
  "request_type_name": "Licença de Instalação",
  "citizen_id": "c1d2e3...",
  "title": "Solicitação de Licença - Galpão Industrial",
  "status": "open",
  "created_at": "2026-09-21T14:25:00Z"
}
```

João can check on his requests at any time:

```http
GET /citizen/{org_slug}/{portal_slug}/requests
Authorization: Bearer <access_token>
```

Or fetch a specific one:

```http
GET /citizen/{org_slug}/{portal_slug}/requests/req123...
Authorization: Bearer <access_token>
```

---

**Next**: [Flow 4 — Processing a Request](./flow-4-processing-a-request)
