# WedPlanAI

> **AI-powered wedding planning platform** — manage every detail of your wedding with a Wedding Task Planner, live calendar, Wedding Ceremony Planner, guest RSVP tracking, vendor budgets, and a beautiful public showcase website.

Built with **Next.js 16**, **PostgreSQL**, **Drizzle ORM**, and **Better Auth**. Deployed via **Docker Compose**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗂️ **Wedding Task Planner** | Drag-and-drop task management across Backlog, To-Do, In Progress, and Done — pre-seeded for your wedding tradition |
| 📅 **Calendar & Ceremony Planner** | Month-view calendar and ceremony timeline for all ceremonies and events |
| 👥 **Guest RSVP Management** | Track every guest with unique login codes for self-service RSVP |
| 💰 **Vendor & Budget Tracker** | Manage vendors with contract values, paid amounts, and dynamic currency by country |
| 🌐 **Build Showcase Page** | Auto-generated public wedding page with an interactive live builder, countdown, itinerary, and RSVP form |
| 👩‍💼 **Multi-User Collaboration** | Role-based access — admins invite planners and coordinators |
| 👥 **Manage Your Team** | Admin controls for user roles, permissions, and team access |
| 🎉 **Guided Onboarding** | Interactive walkthrough tour and wizard to set up your first wedding event |

### Wedding Traditions Supported
Hindu · Muslim · Sikh · Christian · Secular (and more)

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | [Next.js 16](https://nextjs.org/) (App Router, Server Components) |
| UI | [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) |
| Database | [PostgreSQL 17](https://www.postgresql.org/) + [pgvector](https://github.com/pgvector/pgvector) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| Auth | [Better Auth](https://www.better-auth.com/) |
| Runtime | [Node.js 22](https://nodejs.org/) (LTS) |
| Container | [Docker](https://www.docker.com/) + Docker Compose |

---

## 🚀 Deployment with Coolify (Recommended)

### Prerequisites
- A VPS with [Coolify](https://coolify.io/) installed
- This repository connected to your Coolify instance
- A domain name pointed to your VPS

### Step 1: Connect the Repository in Coolify

1. In Coolify, click **New Resource → Application**
2. Select **Docker Compose** as the build type
3. Connect your GitHub repository (`Savazar01/WedplanAI`)
4. Set the **Docker Compose file** to `docker-compose.yml`

### Step 2: Set Environment Variables in Coolify

In Coolify's **Environment Variables** section, set the following:

```env
# Generate a strong secret: openssl rand -base64 32
BETTER_AUTH_SECRET=your_min_32_char_random_secret

# Your public domain (with https://)
BETTER_AUTH_URL=https://your-domain.com
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-domain.com

# Database credentials
# IMPORTANT: DATABASE_URL must contain the exact same password set in POSTGRES_PASSWORD.
# Avoid hardcoding passwords across files. Always make sure the password in the connection string
# matches the actual POSTGRES_PASSWORD set below.
DATABASE_URL=postgresql://postgres:your_db_password@db:5432/wedding_planner
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=wedding_planner
```

> **Important:** `BETTER_AUTH_SECRET` is **required**. The app will fail to start without it.  
> Generate one with: `openssl rand -base64 32`

### Step 3: Configure Networking in Coolify

- Set the **exposed port** to `3044`
- Add your **custom domain** and enable **HTTPS** (Coolify handles Let's Encrypt automatically)

### Step 4: Deploy

Click **Deploy**. Coolify will:
1. Build the Docker image from the `Dockerfile`
2. Start the PostgreSQL container
3. Start the Next.js web container
4. Run database migrations automatically on first start

### Step 5: Create Your Admin Account

Once deployed, visit `https://your-domain.com` and click **Get Started Free** to create the first admin account.

---

## 💻 Local Development

### Prerequisites
- [Node.js 22+](https://nodejs.org/) (LTS)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Clone the repository

```bash
git clone https://github.com/Savazar01/WedplanAI.git
cd WedplanAI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5611/wedding_planner"
BETTER_AUTH_SECRET="any-random-string-at-least-32-chars-long"
BETTER_AUTH_URL="http://localhost:3044"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3044"
NODE_ENV="development"
```

### 4. Start the database

```bash
docker compose up db -d
```

### 5. Run database migrations

```bash
npm run db:migrate
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3044](http://localhost:3044) in your browser. (The app is configured to run on port `3044` in development).

---

## 🐳 Running with Docker Compose (Full Stack)

To run the entire stack (Next.js app + PostgreSQL database) inside Docker containers locally:

### 1. Create a `.env` file
Copy `.env.example` to `.env` (Docker Compose reads `.env` by default, not `.env.local`):
```bash
cp .env.example .env
```

### 2. Configure environment variables
Open the newly created `.env` file and set the required variables:
```env
BETTER_AUTH_SECRET="any-random-string-at-least-32-chars-long"
BETTER_AUTH_URL="http://localhost:3044"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3044"
```

> **Important:** **Do not** define `DATABASE_URL` in this `.env` file when running via Docker Compose. The `docker-compose.yml` file will automatically configure it to connect to the internal database container (`db:5432`) correctly. If `DATABASE_URL` is set to `localhost:5611` in `.env`, the web container will fail to connect.

### 3. Build and start services
Run the following command:
```bash
docker compose up --build -d
```

The application will be built and will be available at [http://localhost:3044](http://localhost:3044).

### Stop / Reset

```bash
# Stop all services
docker compose down

# Stop and remove all persistent database data (full reset)
docker compose down -v
```

---

## 🗄️ Database Management

```bash
# Generate migration (after schema changes)
npm run db:generate

# Apply migrations
npm run db:migrate

# Open Drizzle Studio (DB browser)
npm run db:studio

# Full reset (drops + recreates all tables)
npm run db:reset
```

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── actions/            # Server Actions (guests, vendors, weddings, auth)
│   ├── api/auth/           # Better Auth API handler
│   ├── dashboard/          # Authenticated dashboard pages
│   │   │   ├── calendar/       # Calendar view
│   │   ├── event-itinerary/# Ceremony planner / timeline
│   │   ├── guests/         # Guest management
│   │   ├── planning-board/ # Wedding Task Planner
│   │   ├── settings/       # Workspace settings
│   │   ├── showcase/       # Showcase builder
│   │   ├── users/          # Manage Your Team (admin only)
│   │   └── vendors/        # Vendor & budget tracker
│   ├── login/              # Login page
│   ├── planning-board/     # Public planning board
│   ├── signup/             # Signup page
│   ├── wedding/[id]/       # Public wedding showcase page
│   ├── wizard/             # Wedding setup wizard
│   └── page.tsx            # Landing page (public)
├── components/
│   ├── dashboard/          # Dashboard shell, sidebar, wedding switcher
│   ├── kanban/             # Wedding Task Planner (Kanban) components
│   └── ui/                 # shadcn/ui base components
├── db/
│   ├── schema.ts           # Drizzle database schema
│   └── migrations/         # Auto-generated SQL migrations
└── lib/                    # Utilities (auth, seed, helpers)
```

---

## 🔐 Security Notes

- **Never commit** `.env` or `.env.local` files — they are excluded by `.gitignore`
- Always set a strong `BETTER_AUTH_SECRET` in production (minimum 32 characters)
- The default PostgreSQL password in `docker-compose.yml` should be overridden via environment variables in production
- HTTPS is strongly recommended — use Coolify's built-in Let's Encrypt integration

---

## 📝 Environment Variables Reference

### Localhost Environment (Local Dev & Docker Compose)

| Variable | Required | Default / Example | Description / Instructions |
|---|---|---|---|
| `DATABASE_URL` | ✅ | `postgresql://postgres:postgres`<br>`@localhost:5611/`<br>`wedding_planner` | Connection string for PostgreSQL database. **IMPORTANT:** Only define this in `.env.local` for local machine development. **Omit/comment out** when running the full stack with `docker compose up` so the containers can resolve the internal address `db:5432` correctly. |
| `BETTER_AUTH_SECRET` | ✅ | `savazar_wedding_`<br>`secret_auth_`<br>`32_characters` | Any random string at least 32 characters long. Used by Better Auth to encrypt cookies and session data. |
| `BETTER_AUTH_URL` | ✅ | `http://localhost:3044` | Server-side URL of the application. Required by Better Auth for authentication redirect callbacks. |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | ✅ | `http://localhost:3044` | Client-side/browser URL of the application. Required by the auth client to perform API calls. |
| `NODE_ENV` | — | `development` | Defines the environment type (set to `development` locally). |
| `POSTGRES_USER` | — | `postgres` | PostgreSQL username (defaults to `postgres`). |
| `POSTGRES_PASSWORD` | — | `postgres` | PostgreSQL password (defaults to `postgres`). **IMPORTANT:** Ensure this matches the password specified in `DATABASE_URL`. |
| `POSTGRES_DB` | — | `wedding_planner` | PostgreSQL database name (defaults to `wedding_planner`). |

### VPS Coolify Deployment

| Variable | Required | Example | Description / Instructions |
|---|---|---|---|
| `DATABASE_URL` | ✅ | `postgresql://postgres:your_password`<br>`@db:5432/`<br>`wedding_planner` | Connection string for PostgreSQL database. Uses `db` as host to connect to the linked container. **IMPORTANT:** The password in this URL must match `POSTGRES_PASSWORD` exactly. |
| `BETTER_AUTH_SECRET` | ✅ | `your_min_32_char_`<br>`random_secret` | A secure, random 32+ character key. Generate using: `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | ✅ | `https://your-domain.com` | Server-side URL of the application. Set to your custom domain. |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | ✅ | `https://your-domain.com` | Client-side/browser URL of the application. Set to your custom domain. |
| `NODE_ENV` | — | `production` | Defines the environment type (set to `production` for optimization and secure cookie strictness). |
| `POSTGRES_USER` | — | `postgres` | PostgreSQL database username (or custom user). |
| `POSTGRES_PASSWORD` | — | `your_custom_password` | PostgreSQL database password. **IMPORTANT:** Ensure this matches the password specified in `DATABASE_URL` to avoid connection issues. |
| `POSTGRES_DB` | — | `wedding_planner` | PostgreSQL database name. |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

Copyright © 2024 [Savazar](https://savazar.com). All rights reserved.

---

<p align="center">
  Built with ❤️ for extraordinary weddings
  <br/>
  <a href="https://savazar.com">savazar.com</a>
</p>
