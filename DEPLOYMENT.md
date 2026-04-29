# Lumina Deployment Guide

This document provides instructions for deploying the Lumina API and Web applications to a production environment.

## Architecture Overview
- **API**: FeathersJS (Node.js) application.
- **Web**: Next.js application.
- **Database**: MySQL.

---

## 1. Prerequisites
- Node.js (v20 or later)
- MySQL Server
- Process Manager (e.g., `pm2`) recommended for self-hosting.

---

## 2. API Deployment (Backend)

### Step 1: Environment Configuration
Create a `.env` file in the `api/` directory based on `.env.example`.
```env
PORT=3032
HOSTNAME=0.0.0.0
CORS_ORIGINS=https://your-web-domain.com
FEATHERS_SECRET=your-secure-random-secret
MYSQL_HOST=your-mysql-host
MYSQL_USER=your-user
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=lumina_db
```

### Step 2: Build & Migrate
Run the following commands in the `api/` directory:
```bash
npm install
npm run compile
npm run migrate # Run database migrations
```

### Step 3: Start Production Server
Using PM2:
```bash
pm2 start dist/index.js --name "lumina-api"
```

---

## 3. Web Deployment (Frontend)

### Step 1: Environment Configuration
Create a `.env.production` file in the `web/` directory.
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Step 2: Build
Run the following commands in the `web/` directory:
```bash
npm install
npm run build
```

### Step 3: Start Production Server
If self-hosting:
```bash
pm2 start "npm run start" --name "lumina-web"
```
*Note: If deploying to Vercel, simply connect your repository and configure the environment variables in the Vercel dashboard.*

---

## 4. Post-Deployment Verification
1. Verify the API is running by visiting `https://api.yourdomain.com/health`.
2. Check that the Web app can fetch data from the API (ensure CORS is correctly set in the API's `.env`).
3. If using AI features, ensure that the background jobs (schedulers) are active (they start automatically with the API).

---

## 5. Security Checklist
- [ ] Change the `FEATHERS_SECRET` to a unique, long string.
- [ ] Ensure `CORS_ORIGINS` does not contain `*` in production.
- [ ] Use HTTPS for both API and Web applications.
- [ ] Ensure MySQL is not publicly accessible (use a firewall or private network).
