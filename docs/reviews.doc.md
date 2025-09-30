# Reviews API Reference

Base URL: `/api/reviews`

All review endpoints require authentication. Make sure the browser carries the `accessToken` cookie from the auth flow (set `withCredentials: true` in Axios/fetch). Requests and responses are JSON.

---

## GET `/`

Return the current user's reviews together with the related college name and location.

### Request

- Method: `GET`
- URL: `/api/reviews/`
- Headers: none required beyond the default auth cookies
- Body: not allowed

### Success Response — 200

```json
{
  "data": [
    {
      "reviewId": 18,
      "userId": 12,
      "rating": 4,
      "comment": "Great faculty and campus life",
      "collegeName": "Springfield University",
      "location": "Springfield, IL"
    }
  ],
  "success": true,
  "message": "User reviews fetched successfully",
  "timestamp": "2025-09-30T10:30:00.000Z"
}
```

### Failure Cases

- Missing or expired `accessToken` cookie → 401 with message `"Please login to continue"` or `"Session expired, please refresh"`
- No reviews stored for the user → 404 with message `"No reviews found for this user"`
- Any unexpected error is surfaced via the shared handler (see **Error Handling**)

---

## POST `/`

Create a new review for the authenticated user. The database enforces one review per user/college pair.

### Request Body

- `collegeId` (number, required)
- `rating` (number, required — expected 1–5)
- `comment` (string, required)

### Success Response — 201

```json
{
  "data": {
    "reviewId": 42,
    "collegeId": 3,
    "rating": 5,
    "comment": "Hands-on labs and supportive professors",
    "userId": 12,
    "createdAt": "2025-09-30T10:32:00.000Z"
  },
  "success": true,
  "message": "Review created successfully",
  "timestamp": "2025-09-30T10:32:00.000Z"
}
```

### Failure Cases

- Missing `collegeId`, `rating`, or `comment` → 400 with message `"collegeId, rating and comment are required"`
- Duplicate review for the same college/user (unique DB constraint) → 500 with the database error message
- Auth token missing/expired → 401 (same messages as the GET endpoint)

---

## Error Handling

Errors pass through the same global handler used by other modules. The response shape is always:

```json
{
  "success": false,
  "message": "Readable description of what went wrong"
}
```

Use the HTTP status code to decide whether to prompt for login (401), show validation feedback (400), warn about missing data (404), or display a retry option (500). Cookies are managed by the auth flow; after a 401, clear any cached user state and redirect to sign-in.
