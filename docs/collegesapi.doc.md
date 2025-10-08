# Colleges API Reference

Base URL: `/api/colleges`

All endpoints respond with JSON. **Authentication is required** for all endpoints - include a valid JWT token in the `Authorization` header as `Bearer <token>`.

---

## Quick Reference

| Method | Endpoint   | Description                                  | Auth Required |
| ------ | ---------- | -------------------------------------------- | ------------- |
| GET    | `/`        | Fetch all colleges (without courses)         | ✅            |
| GET    | `/courses` | Fetch all colleges with their courses        | ✅            |
| POST   | `/`        | Create a new college (with optional courses) | ✅            |
| POST   | `/courses` | Add a course to an existing college          | ✅            |

---

## GET `/`

Retrieve the list of all colleges without their courses. Returns basic college information only.

### Request

- Method: `GET`
- URL: `/api/colleges/`
- Headers:
  - `Authorization: Bearer <token>` (required)
- Body: not allowed

### Success Response — 200

```json
{
  "data": [
    {
      "collegeId": 1,
      "collegeName": "Springfield University",
      "location": "Springfield, IL",
      "createdAt": "2025-10-07T10:00:00.000Z"
    },
    {
      "collegeId": 2,
      "collegeName": "Tech Institute",
      "location": "Boston, MA",
      "createdAt": "2025-10-07T11:00:00.000Z"
    }
  ],
  "message": "Colleges fetched successfully",
  "status": "success"
}
```

### Failure Cases

- Missing or invalid token → 401 Unauthorized
- No colleges in the database → 404 with message `"No colleges found"`
- Any other unhandled error → 500 with the server-provided message

### Usage Example

```javascript
// Fetch all colleges (without courses)
const response = await fetch("http://localhost:3000/api/colleges/", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
});

const result = await response.json();
console.log(result.data); // Array of college objects
```

---

## GET `/courses`

Retrieve the list of all colleges along with their offered courses. Each item represents a pairing of a college and one of its courses. Expect repeated `collegeId` values when a college offers multiple courses. This endpoint uses an INNER JOIN, so only colleges that have courses will be returned.

### Request

- Method: `GET`
- URL: `/api/colleges/courses`
- Headers:
  - `Authorization: Bearer <token>` (required)
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
    },
    {
      "collegeId": 2,
      "collegeName": "Tech Institute",
      "location": "Boston, MA",
      "course": "Data Science",
      "fee": "50000.00"
    }
  ],
  "message": "Colleges with Courses fetched successfully",
  "status": "success"
}
```

> **Important Notes:**
>
> - `fee` is returned as a string because it comes from a Postgres decimal column. Convert it to a number on the client if you need numeric operations.
> - This endpoint uses INNER JOIN, so colleges without any courses will NOT be included in the response.
> - Use `GET /` if you need to fetch all colleges regardless of whether they have courses.

### Failure Cases

- Missing or invalid token → 401 Unauthorized
- No colleges with courses in the database → 404 with message `"No colleges found"`
- Any other unhandled error → 500 with the server-provided message

### Usage Example

```javascript
// Fetch all colleges with their courses
const response = await fetch("http://localhost:3000/api/colleges/courses", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
});

const result = await response.json();
console.log(result.data); // Array of college-course pairings
```

---

## POST `/`

Create a new college with optional courses. You can create a college without any courses, or with one or more courses in a single request. **Smart duplicate handling**: If a college with the same name already exists, courses will be added to the existing college instead of creating a duplicate.

### Request

- Method: `POST`
- URL: `/api/colleges/`
- Headers:
  - `Authorization: Bearer <token>` (required)
  - `Content-Type: application/json` (required)
- Body: JSON object

### Request Body Schema

```typescript
{
  collegeName: string;    // Required - Name of the college (max 255 chars)
  location: string;       // Required - Location of the college (max 255 chars)
  courses?: Array<{       // Optional - Array of courses to add
    courseName: string;   // Required if courses array is provided (max 255 chars)
    fee: string | number; // Required if courses array is provided (decimal format)
  }>;
}
```

### Success Response — 201

#### When creating without courses (new college):

```json
{
  "data": {
    "collegeId": 5,
    "collegeName": "Tech Institute",
    "location": "Boston, MA",
    "createdAt": "2025-10-08T12:00:00.000Z"
  },
  "message": "College created successfully without courses",
  "status": "success"
}
```

#### When creating with courses (new college):

```json
{
  "data": {
    "collegeId": 6,
    "collegeName": "Innovation University",
    "location": "San Francisco, CA",
    "createdAt": "2025-10-08T12:00:00.000Z",
    "courses": [
      { "courseName": "Data Science", "fee": 50000 },
      { "courseName": "Machine Learning", "fee": 55000 }
    ]
  },
  "message": "College created successfully with course",
  "status": "success"
}
```

#### When college name already exists (adds courses to existing college):

```json
{
  "data": {
    "message": "Course added to existing college"
  },
  "message": "Course added to existing college",
  "status": "success"
}
```

### Failure Cases

- Missing or invalid token → 401 Unauthorized
- Missing `collegeName` or `location` → 400 ValidationError: "collegeName and location are required"
- Duplicate course name for the same college → 500 with unique constraint error
- Any other unhandled error → 500 with the server-provided message

### Important Behavior

- **Case-insensitive duplicate checking**: College names are checked case-insensitively (e.g., "Tech Institute" and "tech institute" are considered the same)
- **Smart handling**: If a college with the same name exists, the endpoint will add the provided courses to that existing college instead of throwing an error
- **Input trimming**: College names and locations are automatically trimmed of leading/trailing whitespace

### Usage Examples

#### Create college without courses:

```javascript
const response = await fetch("http://localhost:3000/api/colleges/", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    collegeName: "Tech Institute",
    location: "Boston, MA",
  }),
});

const result = await response.json();
console.log(result.data); // New college object
```

#### Create college with courses:

```javascript
const response = await fetch("http://localhost:3000/api/colleges/", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    collegeName: "Innovation University",
    location: "San Francisco, CA",
    courses: [
      { courseName: "Data Science", fee: "50000.00" },
      { courseName: "Machine Learning", fee: "55000.00" },
    ],
  }),
});

const result = await response.json();
console.log(result.data.college); // New college object
console.log(result.data.courses); // Array of created courses
```

---

## POST `/courses`

Add a new course to an existing college. The college must already exist in the database.

### Request

- Method: `POST`
- URL: `/api/colleges/courses`
- Headers:
  - `Authorization: Bearer <token>` (required)
  - `Content-Type: application/json` (required)
- Body: JSON object

### Request Body Schema

```typescript
{
  collegeId: number; // Required - ID of the existing college
  courseName: string; // Required - Name of the course (max 255 chars)
  fee: string | number; // Required - Course fee (decimal format)
}
```

### Success Response — 201

```json
{
  "data": {
    "courseId": 20,
    "courseName": "Artificial Intelligence",
    "fee": "60000.00",
    "collegeId": 6,
    "createdAt": "2025-10-08T12:00:00.000Z"
  },
  "message": "Course added to college successfully",
  "status": "success"
}
```

### Failure Cases

- Missing or invalid token → 401 Unauthorized
- Missing `collegeId`, `courseName`, or `fee` → 400 ValidationError: "collegeId, courseName and fee are required"
- College ID doesn't exist → 500 with foreign key constraint error
- Duplicate course name for the same college → 500 with unique constraint error (a college cannot have the same course twice)
- Any other unhandled error → 500 with the server-provided message

### Usage Example

```javascript
const response = await fetch("http://localhost:3000/api/colleges/courses", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    collegeId: 6,
    courseName: "Artificial Intelligence",
    fee: "60000.00",
  }),
});

const result = await response.json();
console.log(result.data); // New course object
```

> **Important Notes:**
>
> - Course names are automatically trimmed of leading/trailing whitespace
> - There is a unique constraint on `(courseName, collegeId)`, meaning you cannot add the same course name twice to the same college
> - Fee values are stored as DECIMAL(10, 2) - up to 10 digits total with 2 decimal places

---

## Error Handling

All errors from this module pass through the shared error handler. The frontend will consistently receive:

```json
{
  "success": false,
  "message": "Readable description of what went wrong"
}
```

### Common Error Responses:

- **401 Unauthorized**: Missing, invalid, or expired JWT token
- **400 Bad Request**: Validation errors (missing required fields)
- **404 Not Found**: No colleges found in database
- **500 Internal Server Error**: Database errors, constraint violations, or unexpected errors

Use the HTTP status code to drive UI decisions (e.g., `401` to redirect to login, `404` to show an empty-state illustration, `500` for a retry prompt).

---

## Database Schema Reference

### Colleges Table

- `collegeId`: Auto-incrementing primary key
- `collegeName`: VARCHAR(255), required
- `location`: VARCHAR(255), required
- `createdAt`: Timestamp, auto-generated

### Courses Table

- `courseId`: Auto-incrementing primary key
- `courseName`: VARCHAR(255), required
- `fee`: DECIMAL(10, 2), required
- `collegeId`: Foreign key to colleges table
- `createdAt`: Timestamp, auto-generated
- **Unique constraint**: `(courseName, collegeId)` - prevents duplicate courses per college
