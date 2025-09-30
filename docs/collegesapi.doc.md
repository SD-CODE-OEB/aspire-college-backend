# Colleges API Reference

Base URL: `/api/colleges`

All endpoints respond with JSON. No authentication is required for the current endpoints, so a standard fetch/Axios call is enough.

---

## GET `/`

Retrieve the list of colleges along with their offered courses. Each item represents a pairing of a college and one of its courses. Expect repeated `collegeId` values when a college offers multiple courses.

### Request

- Method: `GET`
- URL: `/api/colleges/`
- Headers: none required
- Body: not allowed

### Success Response — 200

```json
{
  "data": [
    {
      "collegeId": 1,
      "collegeName": "Springfield University",
      "location": "Springfield, IL",
      "course": "Computer Science",
      "fee": "45000.00"
    },
    {
      "collegeId": 1,
      "collegeName": "Springfield University",
      "location": "Springfield, IL",
      "course": "Business Administration",
      "fee": "42000.00"
    }
  ],
  "message": "Colleges fetched successfully",
  "status": "success"
}
```

> Note: `fee` is returned as a string because it comes from a Postgres decimal column. Convert it to a number on the client if you need numeric operations.

### Failure Cases

- No colleges in the database → 404 with message `"No colleges found"`
- Any other unhandled error → 500 with the server-provided message

---

## Error Handling

Errors from this module still pass through the shared error handler. The frontend will consistently receive:

```json
{
  "success": false,
  "message": "Readable description of what went wrong"
}
```

Use the HTTP status code to drive UI decisions (e.g., `404` to show an empty-state illustration, `500` for a retry prompt). No cookies or credentials are required for these calls.
