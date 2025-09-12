# Backend TypeScript Template

A minimal TypeScript Express API template with PostgreSQL and Drizzle ORM.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express 5
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Auth**: JWT + Argon2

## Project Structure

```
src/
├── server.ts              # Express app entry point
├── controllers/           # Route handlers
│   └── user.controller.ts
├── db/                   # Database configuration
│   ├── index.ts          # Database connection
│   └── schema.ts         # Drizzle table schemas
├── middlewares/          # Express middlewares
│   ├── AppError.ts       # Custom error class
│   ├── asyncHandler.ts   # Async wrapper
│   ├── error.ts          # Error handler
│   └── index.ts
├── routes/               # API routes
│   └── user.route.ts
└── services/             # Business logic
    └── user.service.ts

drizzle/                  # Generated migrations
├── meta/
└── *.sql

drizzle.config.ts         # Drizzle configuration
```

## File Naming Conventions

- **Controllers**: `*.controller.ts` - Handle HTTP requests/responses
- **Services**: `*.service.ts` - Business logic and data operations
- **Routes**: `*.route.ts` - Express route definitions
- **Middlewares**: `*.ts` - Express middleware functions
- **Schemas**: `schema.ts` - Drizzle table definitions

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgres://username:password@localhost:5432/database_name
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
```

## Quick Start

```bash
# Install dependencies
npm install

# Run database migrations
npx drizzle-kit push

# Start development server
npm run dev
```
