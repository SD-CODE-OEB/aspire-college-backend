# Auth API Reference

Base URL: `/api/auth`

All auth endpoints accept and return JSON. Send requests with the header `Content-Type: application/json`. Successful login and refresh operations set `accessToken` (15 min) and `refreshToken` (7 days) cookies that are `httpOnly`, `SameSite=lax` in development (`none` in production), and `Secure` in production. Most authenticated endpoints, including `/me` and `/refresh`, rely on those cookies being present on the request.

---

## POST `/register`

Create a new user account. This endpoint **does not** issue tokens—follow up with `/login`.

### Request Body

- `username` (string, required)
- `email` (string, required)
- `password` (string, required, plain text; hashed on the server)

### Success Response — 201

```json
{
  "data": {
    "userId": 12,
    "username": "jane.doe",
    "email": "jane@example.com",
    "password": "$argon2id$...", // hashed password, ignore on the client
    "createdAt": "2025-09-30T10:15:00.000Z",
    "updatedAt": "2025-09-30T10:15:00.000Z"
  },
  "message": "User registered successfully!!",
  "success": true
}
```

### Failure Cases

- Duplicate email or username → 500 with message `"user already exists!!"`
- Validation issues (missing fields) surface as 400-level errors via the global handler (see **Error Handling**)

---

## POST `/login`

Authenticate a user. On success, the server sets fresh `accessToken` and `refreshToken` cookies and returns the user record along with the refresh token value (useful for native clients; for web, rely on the cookies).

### Request Body

- `email` (string, required)
- `password` (string, required)

### Success Response — 200

```json
{
  "data": {
    "user": {
      "userId": 12,
      "username": "jane.doe",
      "email": "jane@example.com",
      "password": "$argon2id$...",
      "createdAt": "2025-09-30T10:15:00.000Z",
      "updatedAt": "2025-09-30T10:15:00.000Z"
    },
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "user login successful!!",
  "success": true
}
```

Cookies set:

- `accessToken` — expires in 15 minutes
- `refreshToken` — expires in 7 days

Send both cookies with subsequent requests (`withCredentials: true` in Axios/fetch).

### Failure Cases

- Unknown email → 404 with message `"Incorrect email, user not found!!"`
- Wrong password → 400 with message `"incorrect password!!"`

---

## POST `/logout`

Invalidates the current session. If a refresh token cookie is present, it is revoked in storage and both auth cookies are cleared.

### Requirements

- Should be called while the browser still holds the auth cookies.

### Success Response — 200

```json
{
  "message": "Logged out successfully"
}
```

### Failure Cases

- Unexpected errors return 500 with message `"Logout failed"`

---

## GET `/me`

Returns the authenticated user profile.

### Requirements

- Include the `accessToken` cookie (sent automatically by the browser if still valid).

### Success Response — 200

```json
{
  "data": {
    "userId": 12,
    "username": "jane.doe",
    "email": "jane@example.com"
  },
  "message": "User retrieved successfully",
  "success": true
}
```

### Failure Cases

- Missing/expired `accessToken` → 401 with message `"Please login to continue"` or `"Session expired, please refresh"`
- User not found → 401 with message `"User not found"`

---

## GET `/refresh`

Rotates tokens when the access token expires. The endpoint validates the refresh token, issues new cookies, and returns a lightweight user payload.

### Requirements

- `refreshToken` cookie must be present and valid.

### Success Response — 200

```json
{
  "user": [
    {
      "userId": 12,
      "username": "jane.doe",
      "email": "jane@example.com"
    }
  ],
  "message": "Token refreshed successfully",
  "success": true
}
```

> The `user` array always contains a single object; pick `user[0]` on the client.

### Failure Cases

- Missing refresh token → 401 with message `"No refresh token found"`
- Expired/invalid token → 401 with message `"Invalid or expired refresh token"` or `"Please login again"`

---

## Error Handling

All errors propagate through a shared handler. The JSON structure is:

```json
{
  "success": false,
  "message": "Readable description of what went wrong"
}
```

Status codes align with the scenario (e.g., 400 validation, 401 unauthorized, 404 not found, 500 server/database issues). On the frontend:

- Branch on `response.status` to decide whether to prompt for re-auth (401), show form errors (400), or display a generic failure (500).
- The `message` field is the user-facing copy supplied by the backend; surface it directly or map it to friendly text as needed.
- Cookies are cleared automatically on logout and refresh failures. After any 401 response, redirect to the login screen and clear local user state.

Keep requests simple: include JSON payloads, enable credentials in HTTP clients, and respect the cookie-based session flow.
