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

## Deployment on Render

This repository is configured for easy deployment on [Render](https://render.com).

### Prerequisites

1. A [Render account](https://render.com)
2. A PostgreSQL database (you can create one on Render)

### Deployment Steps

#### Option 1: Using render.yaml (Recommended)

1. Fork or push this repository to GitHub
2. Go to your Render dashboard
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` file
6. Set the following environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure random string for JWT signing

#### Option 2: Manual Setup

1. Go to your Render dashboard
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: aspire-college-backend (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `yarn install && yarn build`
   - **Start Command**: `yarn start`
5. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure random string
   - `NODE_ENV`: production

### Database Setup on Render

1. Create a PostgreSQL database on Render:
   - Go to Dashboard → "New" → "PostgreSQL"
   - Choose a name and region
   - Select the free tier or a paid plan
2. Copy the "Internal Database URL" 
3. Use it as the `DATABASE_URL` environment variable in your web service

### Post-Deployment

After deployment, you can:
- Access the health check endpoint: `https://your-app.onrender.com/health`
- Run database migrations if needed (set up as a one-time job or include in build command)

### Important Notes

- The server automatically uses the `PORT` environment variable provided by Render
- Ensure your PostgreSQL database is accessible from your Render service
- For production, use strong values for `JWT_SECRET`
- The app uses Neon serverless driver which works well with serverless platforms
