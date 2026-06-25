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
| 💰 **Vendor & Budget Tracker** | Manage vendors with contract values, paid amounts, outstanding balances, dynamic currency by country (displayed in wizard and dashboard), vendor-ceremony linking, and downloadable Budget & Vendors CSV Report |
| 🍴 **Catering Menu Planner** | Design food & beverage menus for ceremonies. Link them directly to catering tasks and view them right from your day-of timeline planner |
| 🌐 **Build Showcase Page** | Auto-generated public wedding page with live builder, countdown, Wedding Program (filtered by guest's invited ceremonies via personal link), Gift Registry, RSVP form, and internal preview mode using a secure hash-based preview code |
| 👥 **Manage Your Team** | Admin controls for user roles, permissions, and inviting planners to collaborate |
| 🗄️ **Archive & Delete Weddings** | Archive weddings to a collapsed section (view-only, excluded from sidebar switcher), restore or permanently delete with cascade confirmation |
| 🎉 **Guided Onboarding** | Interactive walkthrough tour of sample wedding (detected via isSample flag) and 7-step wizard to set up your first event — includes multi-location venue support with auto-formatted address fields and country-based currency display |
| 👤 **Personas** | Wedding Planner mode (manage multiple couples with client role + onboarding links) and DIY (Plan My Wedding) |
| ⚙️ **Categories Admin** | Visual checklist question builder for task follow-up questions — pre-seeded with standard categories, fully editable. Full REST API at `/api/v1/categories` |
| 🌟 **Traditions Admin** | Manage wedding traditions at `/dashboard/admin/traditions` — pre-seeded with standard traditions (Hindu, Muslim, Sikh, Christian, Secular), fully editable. Full REST API at `/api/v1/traditions` |

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
│   │   └── v1/             # REST API v1 (wedding, ceremonies, tasks, columns, guests, guest-rsvps, vendors, catering-menus, traditions, categories)
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
│   ├── dashboard/          # Dashboard shell, sidebar, walkthrough, cards, WeddingActions
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
│   └── migrations/         # Auto-generated SQL migrations (0001–0013)
└── lib/                    # Utilities
    ├── auth-client.ts      # Better Auth client
    ├── auth-server.ts      # Better Auth server helpers
    ├── auth.ts             # Better Auth config
    ├── format.ts           # Date, time, and currency formatters
    ├── preview.ts          # HMAC-based preview code generation for showcase
    ├── seed-sample-wedding.ts  # Sample wedding seeder (isSample=true)
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

All API requests require an API key passed in the `x-api-key` header. You can generate and manage API keys under **App Administration > API Keys** in the dashboard.

```http
x-api-key: wpa_your_api_key_here
```

API keys are scoped per-wedding. All requests and responses are in JSON format. The base URL is `/api/v1/`.

> **Note:** The auth header is `x-api-key` (not `Authorization: Bearer`). The legacy `Bearer` format is not supported.

### Endpoints Overview

| Group | Resource | Path | Methods | Description |
|---|---|---|---|---|
| **Wedding Management** | Wedding | `/api/v1/wedding` | `GET`, `POST`, `PUT` | Create, read, and update wedding info |
| **Wedding Ceremony Planner** | Ceremonies | `/api/v1/ceremonies` | `GET`, `POST` | Manage timeline ceremonies |
| | Ceremonies (ID) | `/api/v1/ceremonies/:id` | `PUT`, `DELETE` | Update/delete specific ceremony |
| **Wedding Task Planner** | Columns | `/api/v1/columns` | `GET`, `POST` | Manage Kanban task columns |
| | Columns (ID) | `/api/v1/columns/:id` | `PUT`, `DELETE` | Update/delete specific Kanban column |
| | Tasks | `/api/v1/tasks` | `GET`, `POST` | Manage wedding planning tasks |
| | Tasks (ID) | `/api/v1/tasks/:id` | `PUT`, `DELETE` | Update/delete specific task |
| **Catering Menu Planner** | Catering Menus | `/api/v1/catering-menus` | `GET`, `POST` | Manage catering menus per ceremony |
| | Catering Menus (ID) | `/api/v1/catering-menus/:id` | `PUT`, `DELETE` | Update/delete specific catering menu |
| **Guest RSVP Management** | Guests | `/api/v1/guests` | `GET`, `POST` | Manage guests & RSVP statuses |
| | Guests (ID) | `/api/v1/guests/:id` | `PUT`, `DELETE` | Update/delete specific guest |
| | Guest RSVPs | `/api/v1/guest-rsvps` | `GET`, `POST` | Per-ceremony RSVP responses |
| | Guest RSVPs (ID) | `/api/v1/guest-rsvps/:id` | `PUT`, `DELETE` | Update/delete per-ceremony RSVP |
| **Vendor & Budget Tracker** | Vendors | `/api/v1/vendors` | `GET`, `POST` | Manage vendor contracts & payments |
| | Vendors (ID) | `/api/v1/vendors/:id` | `PUT`, `DELETE` | Update/delete specific vendor |
| **Traditions (Global Config)** | Traditions | `/api/v1/traditions` | `GET`, `POST` | List/create wedding traditions |
| | Traditions (ID) | `/api/v1/traditions/:id` | `PUT`, `DELETE` | Update/delete specific tradition |
| **Categories (Global Config)** | Categories | `/api/v1/categories` | `GET`, `POST` | List/create task categories |
| | Categories (ID) | `/api/v1/categories/:id` | `PUT`, `DELETE` | Update/delete specific category |

> **Note:** User Management is managed via the dashboard UI (Manage Your Team) and Better Auth server actions — no REST API endpoints are exposed for user CRUD at this time.

---

### Endpoint Details & Examples

#### 1. Wedding Management

* **GET `/api/v1/wedding`**
  - **Description:** Retrieve details of the active wedding (all fields).
  - **Response (200 OK):** Full wedding object including partner names, date, budget, guest count, location details, address fields, theme settings, and all showcase fields.

* **POST `/api/v1/wedding`**
  - **Description:** Create a new wedding. Auto-seeds default Kanban columns, tradition-based ceremonies, catering menus for food-served ceremonies, and planning tasks. The new wedding is created under the same user account that owns the API key.
  - **Request Body:**
    ```json
    {
      "partnerA": "Rahul",
      "partnerB": "Priya",
      "tradition": "hindu",
      "weddingDate": "2026-12-25T00:00:00.000Z",
      "location": "Umaid Bhawan Palace, Jodhpur",
      "budget": 50000,
      "guestCount": 150,
      "locationName": "Umaid Bhawan",
      "street": "Circuit House Rd",
      "city": "Jodhpur",
      "state": "Rajasthan",
      "country": "India",
      "pincode": "342006",
      "description": "Our dream wedding"
    }
    ```
  - **Accepted fields:** `partnerA` (required), `partnerB` (required), `tradition` (required), `weddingDate` (required, ISO 8601), `location` (required), `budget` (default 1000000), `guestCount` (default 150), `locationName`, `street`, `city`, `state`, `country` (default "India"), `pincode`, `description`.
  - **Response (201 Created):** Full wedding object.

* **PUT `/api/v1/wedding`**
  - **Description:** Update any wedding metadata field including address, theme, and showcase settings.
  - **Accepted fields:** `partnerA`, `partnerB`, `weddingDate`, `tradition`, `location`, `locationName`, `street`, `city`, `state`, `country`, `pincode`, `budget`, `guestCount`, `description`, `themeFont`, `themePrimary`, `themeSecondary`, `themeBackground`, `themeDarkPrimary`, `themeDarkSecondary`, `themeDarkBackground`, `logoUrl`, `logoData`, `showcaseFont`, `showcaseTitleFont`, `showcasePrimary`, `showcaseSecondary`, `showcaseBackground`, `showcaseHeroUrl`, `showcaseHeroData`, `showcaseWelcomeText`, `showcaseDetails`, `showcaseSubtitle`, `showcaseTitle`, `showcaseDescription`, `showcaseRsvpTitle`, `showcaseRsvpDescription`, `showcaseGiftUrl`, `showcaseGiftTitle`, `showcaseGiftDescription`.
  - **Response (200 OK):** Updated wedding object.

#### 2. Wedding Ceremony Planner

* **GET `/api/v1/ceremonies`**
  - **Description:** Get all ceremonies for the wedding.
  - **Response (200 OK):** Array of ceremony objects with all fields.

* **POST `/api/v1/ceremonies`**
  - **Description:** Create a new ceremony.
  - **Request Body:**
    ```json
    {
      "name": "Sangeet",
      "description": "Dance and music night",
      "startTime": "2026-12-24T18:00:00Z",
      "endTime": "2026-12-24T22:00:00Z",
      "location": "Banquet Lawn",
      "isFoodServed": false,
      "dressCode": "Traditional",
      "extraChecklist": "[{\"item\":\"Confirm DJ booking\"}]",
      "assignedUserId": "user-uuid-here"
    }
    ```
  - **Accepted fields:** `name` (required), `startTime` (required, ISO 8601), `endTime` (required, ISO 8601), `location` (required), `description`, `isFoodServed` (boolean), `dressCode`, `extraChecklist` (JSON string), `assignedUserId`.
  - **Response (201 Created):** Full ceremony object.

* **PUT `/api/v1/ceremonies/:id`**
  - **Description:** Update a ceremony. Any subset of fields.
  - **Accepted fields:** Same as POST above.

* **DELETE `/api/v1/ceremonies/:id`**
  - **Description:** Delete a ceremony.

#### 3. Wedding Task Planner

##### 3a. Kanban Columns
* **GET `/api/v1/columns`**
  - **Description:** List all Kanban columns.
  - **Response (200 OK):** Array of column objects.

* **POST `/api/v1/columns`**
  - **Description:** Create a column (e.g. `To-Do`, `In Progress`).
  - **Request Body:**
    ```json
    {
      "name": "Priority Tasks",
      "color": "#6771ab",
      "position": 1
    }
    ```
  - **Accepted fields:** `name` (required), `color`, `position`.

* **PUT `/api/v1/columns/:id`**
  - **Description:** Update a column. Any subset of fields.
  - **Accepted fields:** `name`, `color`, `position`.

* **DELETE `/api/v1/columns/:id`**
  - **Description:** Delete a column. Returns 400 error if tasks still reference this column.

##### 3b. Tasks
* **GET `/api/v1/tasks`**
  - **Description:** Get all tasks with all fields (including ceremony, assignee, and catering menu links).
  - **Response (200 OK):** Array of task objects.

* **POST `/api/v1/tasks`**
  - **Description:** Create a new planning task.
  - **Request Body:**
    ```json
    {
      "title": "Book mehndi artist",
      "description": "Book a premium mehndi artist for the bride.",
      "category": "ceremonies",
      "columnId": "column-uuid-here",
      "dueDate": "2026-11-20T00:00:00Z",
      "status": "todo",
      "position": 0,
      "ceremonyId": "ceremony-uuid-here",
      "assignedUserId": "user-uuid-here",
      "categoryData": "{\"q1\":\"North Indian\"}",
      "cateringMenuId": "menu-uuid-here"
    }
    ```
  - **Accepted fields:** `title` (required), `category` (required), `description`, `dueDate`, `columnId`, `status`, `position`, `ceremonyId`, `assignedUserId`, `categoryData` (JSON string), `cateringMenuId`.

* **PUT `/api/v1/tasks/:id`**
  - **Description:** Edit a task. Any subset of fields.
  - **Accepted fields:** Same as POST above.

* **DELETE `/api/v1/tasks/:id`**
  - **Description:** Delete a task.

#### 4. Catering Menu Planner

* **GET `/api/v1/catering-menus`**
  - **Description:** List all catering menus for the wedding, joined with ceremony names.
  - **Response (200 OK):** Array of menu objects with ceremony name.

* **POST `/api/v1/catering-menus`**
  - **Description:** Create a catering menu for a ceremony.
  - **Request Body:**
    ```json
    {
      "ceremonyId": "ceremony-uuid-here",
      "cuisine": "Traditional Buffet",
      "guestCount": 150,
      "appetizers": "Assorted Starters",
      "mainCourses": "Signature Main Course Dishes",
      "desserts": "Traditional Desserts",
      "drinks": "Juices and Mocktails",
      "vendorId": "vendor-uuid-here",
      "notes": "Customize this menu"
    }
    ```
  - **Accepted fields:** `ceremonyId` (required), `cuisine`, `guestCount`, `appetizers`, `mainCourses`, `desserts`, `drinks`, `vendorId`, `notes`.
  - **Response (201 Created):** Full menu object.

* **PUT `/api/v1/catering-menus/:id`**
  - **Description:** Update a catering menu. Any subset of fields.
  - **Accepted fields:** `ceremonyId`, `cuisine`, `guestCount`, `appetizers`, `mainCourses`, `desserts`, `drinks`, `vendorId`, `notes`.

* **DELETE `/api/v1/catering-menus/:id`**
  - **Description:** Delete a catering menu.

#### 5. Guest RSVP Management

##### 5a. Guests
* **GET `/api/v1/guests`**
  - **Description:** List all guests with invitation codes and invited ceremonies.
  - **Response (200 OK):** Array of guest objects.

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
      "dietaryRestrictions": "Vegetarian",
      "invitedCeremonies": "all"
    }
    ```
  - **Accepted fields:** `name` (required), `email`, `phone`, `rsvpStatus` ("pending", "attending", "declined"), `plusOneCount`, `dietaryRestrictions`, `invitedCeremonies` ("all" or comma-separated ceremony IDs).

* **PUT `/api/v1/guests/:id`**
  - **Description:** Update a guest. Any subset of fields.
  - **Accepted fields:** Same as POST above.

* **DELETE `/api/v1/guests/:id`**
  - **Description:** Delete a guest.

##### 5b. Guest RSVPs (Per-Ceremony)
* **GET `/api/v1/guest-rsvps`**
  - **Description:** List all per-ceremony RSVPs for the wedding, joined with guest names and ceremony names.
  - **Response (200 OK):** Array of RSVP objects with guest and ceremony details.

* **POST `/api/v1/guest-rsvps`**
  - **Description:** Record a guest's RSVP for a specific ceremony.
  - **Request Body:**
    ```json
    {
      "guestId": "guest-uuid-here",
      "ceremonyId": "ceremony-uuid-here",
      "rsvpStatus": "attending",
      "guestCount": 2
    }
    ```
  - **Accepted fields:** `guestId` (required), `ceremonyId` (required), `rsvpStatus` (required, "attending" or "declined"), `guestCount`.

* **PUT `/api/v1/guest-rsvps/:id`**
  - **Description:** Update an RSVP. Any subset of fields.
  - **Accepted fields:** `rsvpStatus`, `guestCount`.

* **DELETE `/api/v1/guest-rsvps/:id`**
  - **Description:** Delete an RSVP entry.

#### 6. Vendor & Budget Tracker

* **GET `/api/v1/vendors`**
  - **Description:** List all vendors with payment progress and ceremony links.
  - **Response (200 OK):** Array of vendor objects.

* **POST `/api/v1/vendors`**
  - **Description:** Create a vendor entry.
  - **Request Body:**
    ```json
    {
      "name": "Gourmet Catering Co",
      "category": "catering",
      "contactPerson": "Ravi Kumar",
      "phone": "+919876543210",
      "email": "ravi@gourmet.com",
      "totalCost": 15000,
      "paidAmount": 5000,
      "paymentStatus": "partially_paid",
      "notes": "Payment due at event",
      "ceremonyId": "ceremony-uuid-here"
    }
    ```
  - **Accepted fields:** `name` (required), `category` (required), `contactPerson`, `phone`, `email`, `totalCost`, `paidAmount`, `paymentStatus` ("unpaid", "partially_paid", "paid"), `notes`, `ceremonyId`.

* **PUT `/api/v1/vendors/:id`**
  - **Description:** Update a vendor. Any subset of fields.
  - **Accepted fields:** Same as POST above.

* **DELETE `/api/v1/vendors/:id`**
  - **Description:** Delete a vendor.

#### 7. Wedding Traditions (Global Config)

* **GET `/api/v1/traditions`**
  - **Description:** List all wedding traditions configured on the platform (global — not per-wedding).
  - **Response (200 OK):**
    ```json
    [
      {
        "id": "uuid",
        "key": "hindu",
        "name": "Hindu",
        "description": "Traditional Hindu wedding with Vedic ceremonies",
        "seedTasks": "[{\"title\":\"Book priest\",\"category\":\"venue\"}]",
        "seedCeremonies": "[{\"name\":\"Mehendi\",\"offsetDays\":-2,\"startTime\":\"14:00\",\"endTime\":\"18:00\"}]",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      }
    ]
    ```

* **POST `/api/v1/traditions`**
  - **Description:** Create a new tradition.
  - **Request Body:**
    ```json
    {
      "key": "telugu_wedding",
      "name": "Telugu Wedding",
      "description": "Traditional Telugu Hindu wedding",
      "seedTasks": "[{\"title\":\"...\",\"category\":\"...\"}]",
      "seedCeremonies": "[{\"name\":\"...\",\"offsetDays\":-1,\"startTime\":\"09:00\",\"endTime\":\"12:00\"}]"
    }
    ```
  - **Accepted fields:** `key` (required, slugified), `name` (required), `description`, `seedTasks` (JSON string), `seedCeremonies` (JSON string).
  - **Note:** Duplicate `key` returns 409 Conflict.

* **PUT `/api/v1/traditions/:id`**
  - **Description:** Update a tradition. Any subset of fields.
  - **Note:** Duplicate `key` returns 409 Conflict.

* **DELETE `/api/v1/traditions/:id`**
  - **Description:** Delete a tradition permanently.

#### 8. Task Categories (Global Config)

* **GET `/api/v1/categories`**
  - **Description:** List all task categories (global — not per-wedding).
  - **Response (200 OK):**
    ```json
    [
      {
        "id": "uuid",
        "key": "catering",
        "name": "Catering",
        "followUpQuestions": "[{\"id\":\"q1\",\"label\":\"Cuisine type?\",\"type\":\"text\"}]",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      }
    ]
    ```

* **POST `/api/v1/categories`**
  - **Description:** Create a new task category.
  - **Request Body:**
    ```json
    {
      "key": "transportation",
      "name": "Transportation",
      "followUpQuestions": "[{\"id\":\"q1\",\"label\":\"Number of vehicles?\",\"type\":\"number\"}]"
    }
    ```
  - **Accepted fields:** `key` (required, slugified), `name` (required), `followUpQuestions` (JSON string).
  - **Note:** Duplicate `key` returns 409 Conflict.

* **PUT `/api/v1/categories/:id`**
  - **Description:** Update a category. Any subset of fields.
  - **Note:** Duplicate `key` returns 409 Conflict.

* **DELETE `/api/v1/categories/:id`**
  - **Description:** Delete a category permanently.

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
