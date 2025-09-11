---
title: Backend + PostgreSQL + Drizzle Setup Guide
description: End‑to‑end instructions for recreating and extending this TypeScript Express backend using PostgreSQL and Drizzle ORM.
---

# Backend + PostgreSQL + Drizzle Setup

This doc explains how to bootstrap a TypeScript Express API with PostgreSQL + Drizzle ORM exactly like this repo: dependencies, project structure, environment variables, database workflow, and common tasks.

## 1. Tech Stack Overview

| Area | Tool / Package | Purpose |
|------|----------------|---------|
Runtime| Node.js (TS via `ts-node`) | Execute TypeScript directly
Web    | `express` 5   | HTTP server & routing
Security| `helmet`, `cors`, `cookie-parser` | Headers hardening, CORS, cookie parsing
Auth / Crypto| `jsonwebtoken`, `argon2` | Token signing & password hashing
DB Client| `pg` | PostgreSQL driver / pooling
ORM | `drizzle-orm` | Type-safe queries & schema DSL
Migrations| `drizzle-kit` | Generate / push migrations
Env | `dotenv` | Load `.env` variables
Dev Tooling| `nodemon`, `ts-node`, `typescript` | Live reload & TS transpilation
Types | `@types/*` | Type definitions for TS

## 2. Prerequisites

1. Node.js LTS (≥ 20.x recommended) & npm / yarn / pnpm
2. PostgreSQL instance (local Docker or hosted). Example Docker command:
	 ```bash
	 docker run --name pg-dev -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=appdb -p 5432:5432 -d postgres:16
	 ```
3. A `.env` file at repo root.

## 3. Project Structure (Key Files)

```
drizzle.config.ts        # Drizzle CLI configuration
src/
	server.ts              # Express app bootstrap
	db/
		schema.ts            # Drizzle table schemas
		index.ts             # DB connection + drizzle instance
		insert.ts / fetch.ts / delete.ts  # Data helpers
	middlewares/
		error.ts             # Error handling middleware
	docs/
		drizzle-setup.mdx    # (this doc)
```

## 4. Environment Variables

Create `.env` (never commit secrets):
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/appdb
PORT=5000
JWT_SECRET=change_me_later
```

`DATABASE_URL` is required by both `drizzle.config.ts` and runtime DB connection. The code uses `dotenv/config` import so variables load early.

## 5. Install Dependencies

```bash
# using yarn (adjust if using npm/pnpm)
yarn install
```

Scripts (`package.json`):
* `yarn dev` → `nodemon --exec ts-node src/server.ts` (hot reload)
* `yarn start` → production-ish direct start

## 6. Drizzle Configuration

`drizzle.config.ts`:
```ts
export default defineConfig({
	out: "./drizzle",         // Generated SQL + meta
	schema: "./src/db/schema.ts", // Source of truth
	dialect: "postgresql",
	dbCredentials: { url: process.env.DATABASE_URL! }
});
```

## 7. Defining Schema

Example (`usersTable` in `schema.ts`):
```ts
export const usersTable = pgTable("users", {
	uid: serial("uid").primaryKey(),
	name: varchar("name", { length: 50 }).notNull(),
	email: varchar("email", { length: 100 }).notNull().unique(),
	createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```
Add more tables here; Drizzle infers TS types automatically (`$inferInsert`, `$inferSelect`).

## 8. Migration Workflow

Two common patterns:

### a) Generate SQL then apply
```bash
npx drizzle-kit generate   # reads schema.ts → creates SQL files under /drizzle
npx drizzle-kit push       # executes pending SQL migrations against DATABASE_URL
```

### b) Direct push (quick iteration)
```bash
npx drizzle-kit push
```

After schema changes always re-run the steps. Commit the generated `drizzle/` folder to version control for reproducibility.

## 9. Connecting & Querying

`src/db/index.ts` creates a pooled connection:
```ts
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const db = drizzle(pool);
```

Helpers (examples):
* Insert user: `db.insert(usersTable).values({...}).returning()`
* Select users: `db.select().from(usersTable)`
* Filter: use `eq(usersTable.email, email)` from `drizzle-orm`
* Delete: `db.delete(usersTable).where(eq(usersTable.email, email))`

## 10. Typical Dev Cycle

1. Modify `schema.ts`
2. `npx drizzle-kit generate`
3. Review generated SQL (ensure intended changes only)
4. `npx drizzle-kit push`
5. Run app: `yarn dev`
6. Call endpoints (e.g., `POST /users`, `GET /users`, `DELETE /users`)

## 11. Example API Usage

Create user:
```bash
curl -X POST http://localhost:5000/users \
	-H "Content-Type: application/json" \
	-d '{"name":"Ada","email":"ada@example.com"}'
```

List users:
```bash
curl http://localhost:5000/users
```

Delete user:
```bash
curl -X DELETE http://localhost:5000/users \
	-H "Content-Type: application/json" \
	-d '{"email":"ada@example.com"}'
```

## 12. Adding a New Table (Quick Recipe)

1. Open `schema.ts`, define table (e.g. `postsTable`).
2. Run `npx drizzle-kit generate`.
3. Inspect new migration file under `drizzle/`.
4. Run `npx drizzle-kit push`.
5. Create helper modules (e.g., `src/db/posts.ts`) or reuse existing pattern.
6. Add routes / controllers.

## 13. Auth & Security Notes

Packages already installed but not yet wired:
* `argon2` – hash passwords: `await argon2.hash(plain)` / `await argon2.verify(hash, plain)`
* `jsonwebtoken` – issue tokens: `jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m' })`
* `helmet` – add after JSON/body middleware: `app.use(helmet())`
* `cors` – configure origins: `app.use(cors({ origin: 'http://localhost:3000', credentials: true }))`

## 14. Error Handling

Current `errorHandler` returns a generic 500. Improve later by:
* Distinguishing operational vs programmer errors
* Returning structured JSON: `{ error: { message, code } }`
* Logging stack traces only in non-production

## 15. Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
`ECONNREFUSED` | DB not running | Start container / service
`relation "users" does not exist` | Forgot to run migrations | `npx drizzle-kit push`
Type error on query | Schema + code drift | Regenerate types (they are inline) & check imports
`DATABASE_URL` undefined | Missing `.env` or not loaded | Confirm file + `dotenv/config` import order

## 16. Recommended Next Enhancements

* Add request validation (e.g., Zod) before DB operations
* Centralize service layer (separate controllers from DB helpers)
* Implement structured logging (pino / Winston)
* Add integration tests (Vitest / Jest) + test DB schema
* Add migrations CI check (ensure `schema.ts` and `drizzle/` in sync)

## 17. Quick Command Reference

```bash
# Dev server (watch)
yarn dev

# Start (no watch)
yarn start

# Generate migrations from schema
npx drizzle-kit generate

# Apply (push) migrations
npx drizzle-kit push
```

## 18. Minimal Rebuild Steps (from scratch)

```bash
git clone <repo>
cd backend
cp .env.example .env   # create your env (add this file if not present)
yarn install
npx drizzle-kit push
yarn dev
```

---
If you follow these steps you can reliably recreate and extend this backend with confidence.

Happy building! 🚀
