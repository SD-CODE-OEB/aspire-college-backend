# Render Deployment Guide

This guide explains how to deploy the Aspire College Backend to Render.

## Prerequisites

- A [Render account](https://render.com) (free tier available)
- This repository pushed to GitHub
- A PostgreSQL database (can be created on Render)

## Deployment Options

### Option 1: Blueprint Deployment (Recommended)

The repository includes a `render.yaml` file that automates the deployment process.

1. **Push to GitHub**: Ensure your repository is on GitHub
2. **Create Blueprint on Render**:
   - Log in to [Render Dashboard](https://dashboard.render.com)
   - Click **New** → **Blueprint**
   - Connect your GitHub account if not already connected
   - Select your repository
   - Render will automatically detect `render.yaml`
   - Click **Apply**

3. **Set Environment Variables**:
   After the blueprint is created, you'll need to add:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure random string (generate with: `openssl rand -base64 32`)

### Option 2: Manual Web Service Setup

1. **Create Web Service**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **New** → **Web Service**
   - Connect your GitHub repository
   
2. **Configure Service**:
   - **Name**: `aspire-college-backend` (or your preference)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Build Command**: `yarn install && yarn build`
   - **Start Command**: `yarn start`

3. **Add Environment Variables**:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure random string

## Database Setup

### Create PostgreSQL Database on Render

1. From Render Dashboard, click **New** → **PostgreSQL**
2. Configure:
   - **Name**: `aspire-college-db` (or your preference)
   - **Database**: `aspire_college` (or your preference)
   - **User**: Will be auto-generated
   - **Region**: Same as your web service
   - **Plan**: Free or paid tier

3. After creation, copy the **Internal Database URL**
4. Use this as the `DATABASE_URL` in your web service environment variables

### Using External Database

If you have a PostgreSQL database elsewhere (e.g., Neon, Supabase, AWS RDS):
- Simply use its connection string as `DATABASE_URL`
- Ensure the database is accessible from Render's IP ranges

## Post-Deployment

### 1. Run Database Migrations

After deployment, you may need to run migrations. You can:

**Option A**: Add to build command (automatic)
```bash
buildCommand: yarn install && yarn build && npx drizzle-kit push
```

**Option B**: Run manually via Render Shell
- Go to your web service
- Click **Shell** tab
- Run: `npx drizzle-kit push`

### 2. Seed Database (Optional)

If you need to seed the database:
```bash
# Via Render Shell
yarn tsx src/db/seed.ts
```

### 3. Verify Deployment

- Visit: `https://your-service-name.onrender.com/health`
- You should see:
  ```json
  {
    "success": true,
    "status": "healthy",
    "timestamp": "2025-09-30T...",
    "database": "connected"
  }
  ```

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgres://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for JWT token signing | Yes | Random 32+ character string |
| `PORT` | Server port | No | Auto-set by Render |
| `NODE_ENV` | Environment mode | Recommended | `production` |

## Troubleshooting

### Build Fails

- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility (requires Node ≥20.x)

### Database Connection Fails

- Verify `DATABASE_URL` is correctly set
- Check if database is in same region (use Internal URL)
- Ensure database is running and accessible

### App Crashes After Deploy

- Check runtime logs in Render dashboard
- Verify all environment variables are set
- Ensure database migrations have been run

### Health Check Fails

- Verify service is running: Check **Events** tab
- Check logs for error messages
- Ensure `0.0.0.0` binding (already configured)

## Performance Tips

1. **Use Render's Internal URLs**: For database connections within Render
2. **Enable Auto-Deploy**: Connect GitHub to auto-deploy on push
3. **Set Health Check Path**: Configure `/health` as health check endpoint
4. **Use Persistent Disk**: If you need file storage (not typically needed)

## Monitoring

- **Logs**: Available in Render Dashboard under **Logs** tab
- **Metrics**: View CPU, Memory, and Request metrics
- **Alerts**: Configure in Render Dashboard settings

## Cost Considerations

- **Free Tier**: Includes 750 hours/month (enough for 1 service)
- **Paid Plans**: Start at $7/month for always-on services
- **Database**: Free tier available with 256MB storage

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Node.js Guide](https://render.com/docs/deploy-node-express-app)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
