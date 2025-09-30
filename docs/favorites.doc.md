# Favorites API Reference

Base URL: `/api/favorites`

All endpoints require authentication. Include the `accessToken` cookie issued during login (`withCredentials: true` for browser requests). Responses are JSON and typically return the updated list of favorites after each mutation.

---

## GET `/`

Fetch the current user's favorite colleges. Each entry includes college details and the owning user's info.

### Request

- Method: `GET`
- URL: `/api/favorites/`
- Headers: no extra headers required
- Body: not allowed

### Success Response — 200

```json
{
  "data": [
    {
      "collegeId": 3,
      "collegeName": "Springfield University",
      "location": "Springfield, IL",
      "userId": 12,
      "username": "jane.doe"
    }
  ],
  "success": true,
  "message": "User favorites fetched successfully",
  "timestamp": "2025-09-30T10:40:00.000Z"
}
```

### Failure Cases

- Missing/expired auth cookie → 401 with messages like `"Please login to continue"`
- Database errors bubble up as 500 responses with the server message

---

## POST `/`

Add a college to the authenticated user's favorites. The backend returns the refreshed favorites list so the UI can re-render immediately.

### Request Body

- `collegeId` (number, required)

### Success Response — 201

```json
{
  "data": [
    {
      "collegeId": 3,
      "collegeName": "Springfield University",
      "location": "Springfield, IL",
      "userId": 12,
      "username": "jane.doe"
    }
  ],
  "success": true,
  "message": "Favorite added successfully",
  "timestamp": "2025-09-30T10:41:00.000Z"
}
```

### Failure Cases

- Missing `collegeId` → 400 with message `"userId and collegeId are required"`
- Duplicate favorite (same user/college) triggers a database constraint and returns 500 with the DB error message
- Auth issues → 401 as above

---

## DELETE `/:cid`

Remove the specified college from the user's favorites. The response includes the remaining favorites.

### Path Parameter

- `cid` — the numeric `collegeId` to remove

### Success Response — 200

```json
{
  "data": [
    {
      "collegeId": 4,
      "collegeName": "Capital City College",
      "location": "Capital City",
      "userId": 12,
      "username": "jane.doe"
    }
  ],
  "success": true,
  "message": "Favorite removed successfully",
  "timestamp": "2025-09-30T10:42:00.000Z"
}
```

### Failure Cases

- Missing `cid` or invalid number → 400 with message `"Favorite ID is required"`
- Database errors → 500 with underlying message
- Auth issues → 401 as above

---

## Error Handling

All favorites endpoints use the shared error middleware, which responds with:

```json
{
  "success": false,
  "message": "Readable description of what went wrong"
}
```

The HTTP status code distinguishes validation problems (400), missing auth (401), and server issues (500). After any 401, clear cached favorites and redirect to login. For 500s, surface a retry prompt. The backend always returns the full favorites list in success responses, so you can replace client state directly with `data`.
