# WedPlanAI

> **AI-powered wedding planning platform** — manage every detail of your wedding with a Wedding Task Planner, live calendar, Wedding Ceremony Planner, guest RSVP tracking, vendor budgets, and a beautiful public showcase website.

Built with **Next.js 16**, **PostgreSQL**, **Drizzle ORM**, and **Better Auth**. Deployed via **Docker Compose**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗂️ **Wedding Task Planner** | Drag-and-drop task management across Backlog, To-Do, In Progress, and Done — pre-seeded for your wedding tradition. Dynamic per-category follow-up question checklist |
| 📅 **Calendar** | Month-view calendar showing all ceremonies and task due dates at a glance, with a ceremony/task filter bar |
| ⏱️ **Wedding Ceremony Planner** | Chronological timeline of ceremonies with precise timings — date, dress code, food served, checklist, and assignee per ceremony |
| 👥 **Guest RSVP Management** | Track every guest with unique login codes for self-service RSVP, bulk CSV import, ceremony-level guest invitations, `invited_ceremonies` CSV column, and personal invitation links that copy a formatted message or open native OS Share sheet |
| 💰 **Vendor & Budget Tracker** | Manage vendors with contract values, paid amounts, outstanding balances, dynamic currency by country, vendor-ceremony linking, and downloadable Budget & Vendors CSV Report |
| 🍴 **Catering Menu Planner** | Design food & beverage menus for ceremonies. Link them directly to catering tasks and view them right from your day-of timeline planner |
| 🌐 **Build Showcase Page** | Auto-generated public wedding page with live builder, countdown, Wedding Program (filtered by guest's invited ceremonies via personal link), Gift Registry, and RSVP form |
| 👥 **Manage Your Team** | Admin controls for user roles, permissions, and inviting planners to collaborate |
| 🎉 **Guided Onboarding** | Interactive walkthrough tour of sample wedding and 7-step wizard to set up your first event |
| 👤 **Personas** | Wedding Planner mode (manage multiple couples with client role + onboarding links) and DIY (Plan My Wedding) |
| ⚙️ **Categories Admin** | Visual checklist question builder for task follow-up questions — pre-seeded with standard categories, fully editable |
| 🌟 **Traditions Admin** | Manage wedding traditions at `/dashboard/admin/traditions` — pre-seeded with standard traditions (Hindu, Muslim, Sikh, Christian, Secular), fully editable |

### Database Auto-Seeding at Startup
The platform has built-in self-healing and auto-seeding logic registered in `src/instrumentation.ts` that runs on container startup. If default traditions or categories are missing from the database, it automatically seeds them so that the admin can view, modify, or enhance them immediately.

### Wedding Traditions Supported
Hindu · Muslim · Sikh · Christian · Secular (and custom traditions)


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
│   ├── actions/            # Server Actions (guests, vendors, weddings, auth, calendar)
│   ├── api/                # Route handlers
│   │   ├── auth/           # Better Auth API handler
│   │   └── v1/             # REST API v1 (columns, guests, ceremonies, tasks, vendors, wedding)
│   ├── calendar/           # Public calendar view
│   ├── dashboard/          # Authenticated dashboard pages
│   │   ├── admin/          # Admin-only pages (appearance, api-keys, users)
│   │   ├── calendar/       # Calendar view
│   │   ├── docs/           # Documentation
│   │   ├── wedding-ceremony-planner/ # Wedding Ceremony Planner
│   │   ├── guests/         # Guest RSVP Manager
│   │   ├── wedding-task-planner/ # Wedding Task Planner
│   │   ├── profile/        # User profile
│   │   ├── settings/       # Workspace settings
│   │   ├── showcase/       # Build Showcase Page builder
│   │   ├── users/          # Manage Your Team (admin only)
│   │   └── vendors/        # Vendor & budget tracker
│   ├── guests/             # Public guest RSVP page
│   ├── login/              # Login page
│   ├── wedding-task-planner/     # Public wedding task planner
│   ├── signup/             # Signup page
│   ├── vendors/            # Public vendor page
│   ├── wedding/[id]/       # Public wedding showcase page
│   ├── wizard/             # Wedding setup wizard (7 steps)
│   └── page.tsx            # Landing page (public)
├── components/
│   ├── calendar/           # Calendar, timeline, coordinator components
│   ├── dashboard/          # Dashboard shell, sidebar, walkthrough, cards
│   ├── guests/             # Guest list, CSV upload components
│   ├── kanban/             # Wedding Task Planner (Kanban) board
│   ├── theme/              # Theme/appearance utilities
│   ├── ui/                 # shadcn/ui base components (Button, Card, Dialog, etc.)
│   ├── vendors/            # Vendor manager components
│   └── wedding/            # Public wedding page (countdown, RSVP form)
├── db/
│   ├── client.ts           # Database client
│   ├── migrate.ts          # Migration runner
│   ├── schema.ts           # Drizzle database schema
│   ├── reset.ts            # Database reset script
│   └── migrations/         # Auto-generated SQL migrations (0001–0008)
└── lib/                    # Utilities
    ├── auth-client.ts      # Better Auth client
    ├── auth-server.ts      # Better Auth server helpers
    ├── auth.ts             # Better Auth config
    ├── format.ts           # Date, time, and currency formatters
    ├── seed-sample-wedding.ts  # Sample wedding seeder
    └── wedding-helper.ts   # Active wedding and column helpers
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

## 🔌 REST API v1 Reference

WedPlanAI exposes a fully-functional REST API v1 for programmatic access and integrations (e.g. Model Context Protocol / MCP implementation).

### Authentication

All API requests require an API key passed in the `Authorization` header. You can generate and manage API keys under **App Administration > API Keys** in the dashboard.

```http
Authorization: Bearer wpa_your_api_key_here
```

API keys are scoped per-wedding. All requests and responses are in JSON format. The base URL is `/api/v1/`.

### Endpoints Overview

| Resource | Path | Methods | Description |
|---|---|---|---|
| **Wedding** | `/api/v1/wedding` | `GET`, `PUT` | Manage active wedding info |
| **Columns** | `/api/v1/columns` | `GET`, `POST` | Manage Kanban task columns |
| **Columns (ID)** | `/api/v1/columns/:id` | `PUT`, `DELETE` | Update/delete specific Kanban column |
| **Tasks** | `/api/v1/tasks` | `GET`, `POST` | Manage wedding planning tasks |
| **Tasks (ID)** | `/api/v1/tasks/:id` | `PUT`, `DELETE` | Update/delete specific task |
| **Ceremonies** | `/api/v1/ceremonies` | `GET`, `POST` | Manage timeline ceremonies |
| **Ceremonies (ID)** | `/api/v1/ceremonies/:id` | `PUT`, `DELETE` | Update/delete specific ceremony |
| **Guests** | `/api/v1/guests` | `GET`, `POST` | Manage guests & RSVP statuses |
| **Guests (ID)** | `/api/v1/guests/:id` | `PUT`, `DELETE` | Update/delete specific guest |
| **Vendors** | `/api/v1/vendors` | `GET`, `POST` | Manage vendor contracts & payments |
| **Vendors (ID)** | `/api/v1/vendors/:id` | `PUT`, `DELETE` | Update/delete specific vendor |

---

### Endpoint Details & Examples

#### 1. Wedding Info
* **GET `/api/v1/wedding`**
  - **Description:** Retrieve details of the active wedding.
  - **Response (200 OK):**
    ```json
    {
      "id": "78096f83-e18e-4a6f-b258-7e23114d59ff",
      "partnerA": "Rahul",
      "partnerB": "Priya",
      "weddingDate": "2025-12-25T00:00:00.000Z",
      "budget": 50000,
      "guestCount": 150,
      "location": "Umaid Bhawan Palace, Jodhpur",
      "country": "India",
      "tradition": "hindu"
    }
    ```

* **PUT `/api/v1/wedding`**
  - **Description:** Update wedding metadata.
  - **Request Body:**
    ```json
    {
      "partnerA": "Rahul",
      "partnerB": "Priya",
      "weddingDate": "2025-12-26T00:00:00.000Z",
      "budget": 55000
    }
    ```
  - **Response (200 OK):** Updated wedding object.

#### 2. Wedding Tasks
* **GET `/api/v1/tasks`**
  - **Description:** Get all tasks.
  - **Response (200 OK):** Array of tasks.

* **POST `/api/v1/tasks`**
  - **Description:** Create a new planning task.
  - **Request Body:**
    ```json
    {
      "title": "Book mehndi artist",
      "description": "Book a premium mehndi artist for the bride.",
      "category": "catering",
      "columnId": "column-uuid-here",
      "dueDate": "2025-11-20T00:00:00Z"
    }
    ```

* **PUT `/api/v1/tasks/:id`**
  - **Description:** Edit a task. Any subset of fields can be updated.

* **DELETE `/api/v1/tasks/:id`**
  - **Description:** Delete a task.

#### 3. Wedding Ceremonies
* **GET `/api/v1/ceremonies`**
  - **Description:** Get all ceremonies.
  - **Response (200 OK):** Array of ceremonies.

* **POST `/api/v1/ceremonies`**
  - **Description:** Create a new ceremony.
  - **Request Body:**
    ```json
    {
      "name": "Sangeet",
      "description": "Dance and music night",
      "startTime": "2025-12-24T18:00:00Z",
      "endTime": "2025-12-24T22:00:00Z",
      "location": "Banquet Lawn",
      "foodServed": true
    }
    ```

* **PUT/DELETE `/api/v1/ceremonies/:id`**
  - **Description:** Update or delete a ceremony.

#### 4. Guests & RSVP
* **GET `/api/v1/guests`**
  - **Description:** List guests, unique invitation codes, and invited ceremony assignments.

* **POST `/api/v1/guests`**
  - **Description:** Create a guest.
  - **Request Body:**
    ```json
    {
      "name": "Aarav Sharma",
      "email": "aarav@example.com",
      "phone": "+919876543210",
      "rsvpStatus": "pending",
      "plusOneCount": 1,
      "dietaryRestrictions": "Vegetarian"
    }
    ```

* **PUT/DELETE `/api/v1/guests/:id`**
  - **Description:** Update or delete a guest.

#### 5. Vendors & Contracts
* **GET `/api/v1/vendors`**
  - **Description:** List all vendors and payment progress.

* **POST `/api/v1/vendors`**
  - **Description:** Create a vendor entry.
  - **Request Body:**
    ```json
    {
      "name": "Gourmet Catering Co",
      "category": "catering",
      "contractAmount": 15000,
      "paidAmount": 5000,
      "currency": "INR"
    }
    ```

* **PUT/DELETE `/api/v1/vendors/:id`**
  - **Description:** Update or delete a vendor.

#### 6. Kanban Columns
* **GET `/api/v1/columns`**
  - **Description:** List all Kanban columns.

* **POST `/api/v1/columns`**
  - **Description:** Create a column (e.g. `To-Do`, `In Progress`).
  - **Request Body:**
    ```json
    {
      "title": "Priority Tasks",
      "position": 1
    }
    ```

* **PUT/DELETE `/api/v1/columns/:id`**
  - **Description:** Update or delete a column.

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
