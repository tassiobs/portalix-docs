# Getting Started

Welcome to the **Portalu API** docs. This guide walks you through authenticating and making your first request.

## Base URL

All API requests are made to:

```
https://portalu-production.up.railway.app
```

## Authentication

The API uses **Bearer token** authentication. After signing in, include the access token in every request:

```
Authorization: Bearer <access_token>
```

{% callout type="tip" title="Token Refresh" %}
Access tokens expire. Use the `/api/v1/auth/refresh` endpoint to get a new one using your refresh token.
{% /callout %}

## Your First Request

### 1. Sign Up

```http
POST /api/v1/auth/sign-up
Content-Type: application/json

{
  "org_name": "Acme Corp",
  "email": "you@acme.com",
  "password": "yourpassword"
}
```

### 2. Sign In

```http
POST /api/v1/auth/sign-in
Content-Type: application/json

{
  "email": "you@acme.com",
  "password": "yourpassword"
}
```

You'll receive an `access_token` and `refresh_token` in the response.

{% callout type="note" %}
Keep your refresh token secure — it can be used to generate new access tokens.
{% /callout %}
