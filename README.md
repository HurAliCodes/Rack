# AI Digital Wardrobe 👕🤖

AI Digital Wardrobe is a web application that helps users digitally organize their clothing collection and manage their wardrobe.

The project is being developed in phases, starting with the backend and core wardrobe functionality, followed by AI-powered features and the frontend.

---

## 🚧 Project Status

**Current Phase:** Phase 5 — Advanced Clothing Data & Image Management

### Completed

* Backend project setup
* PostgreSQL + Prisma
* Docker development environment
* Authentication
* JWT access tokens
* Refresh tokens
* Email verification
* Forgot/reset password
* Protected routes
* User profile
* Profile avatar upload
* Cloudinary image storage
* Clothing item CRUD
* Clothing image upload
* Clothing image management
* Favorites
* Archive/restore
* Search
* Filtering
* Sorting
* Pagination
* Ownership protection

### Upcoming

* Improved clothing metadata
* Improved clothing categories/types
* Advanced clothing attributes
* Outfit system
* AI clothing analysis
* AI outfit recommendations
* Advanced AI stylist
* Premium features
* Admin system
* Frontend
* Production deployment

---

# Tech Stack

## Backend

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* Prisma ORM
* Zod
* JWT
* bcrypt
* Multer
* Cloudinary
* Vitest
* Supertest

## Frontend

The frontend is planned/built separately using:

* React
* TypeScript
* Tailwind CSS
* React Router
* TanStack Query

## Infrastructure

* Docker
* Docker Compose
* PostgreSQL
* Cloudinary

---

# Project Structure

```text
AI-Digital-Wardrobe/
│
├── backend/
│   ├── docker/
│   ├── docs/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── infrastructure/
│   │   │   ├── cache/
│   │   │   ├── database/
│   │   │   ├── email/
│   │   │   ├── logger/
│   │   │   └── storage/
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── profile/
│   │   │   ├── wardrobe/
│   │   │   └── clothingImage/
│   │   │
│   │   ├── routes/
│   │   ├── shared/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── tests/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── prisma.config.ts
│   └── tsconfig.json
│
├── frontend/
│   └── ...
│
└── README.md
```

---

# Requirements

Before running the project, install:

* Node.js
* npm
* Docker Desktop
* Git

You will also need a Cloudinary account for image uploads.

---

# 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Then:

```bash
cd AI-Digital-Wardrobe
```

---

# 2. Backend Setup

Go into the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

# 3. Environment Variables

Create your environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

Then open `.env` and configure your values.

Example:

```env
NODE_ENV=development

PORT=5000

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_digital_wardrobe"

JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

EMAIL_HOST="your-email-host"
EMAIL_PORT=587
EMAIL_USER="your-email"
EMAIL_PASSWORD="your-email-password"
EMAIL_FROM="your-email"
```

> Use the actual variables from your `.env.example` if they differ.

**Never commit `.env` to GitHub.**

---

# 4. Start PostgreSQL with Docker

From the backend directory, start Docker services:

```bash
docker compose up -d
```

Check running containers:

```bash
docker compose ps
```

To stop them:

```bash
docker compose down
```

To stop and remove the database volume:

```bash
docker compose down -v
```

> `docker compose down -v` deletes the local PostgreSQL data. Use it carefully.

---

# 5. Prisma Setup

Generate the Prisma Client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

If the project already contains the required migrations and you only want to apply them:

```bash
npx prisma migrate deploy
```

---

# 6. Start the Backend

Development mode:

```bash
npm run dev
```

The backend should normally be available at:

```text
http://localhost:5000
```

Health check:

```text
GET /health
```

Example:

```text
http://localhost:5000/health
```

---

# 7. Backend Commands

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Build TypeScript

```bash
npm run build
```

### Start production build

```bash
npm start
```

### Run tests

```bash
npm test
```

### Run tests once

```bash
npm test -- --run
```

### Prisma generate

```bash
npx prisma generate
```

### Create migration

```bash
npx prisma migrate dev --name your_migration_name
```

### Apply migrations

```bash
npx prisma migrate deploy
```

### Open Prisma Studio

```bash
npx prisma studio
```

---

# 8. Backend API

Base URL:

```text
http://localhost:5000/api/v1
```

## Authentication

```text
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/me
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/verify-email
```

## Profile

```text
GET    /profile
PATCH  /profile
PATCH  /profile/avatar
DELETE /profile/avatar
```

## Wardrobe

```text
POST   /wardrobe/items
GET    /wardrobe/items
GET    /wardrobe/items/:id
PATCH  /wardrobe/items/:id
DELETE /wardrobe/items/:id

PATCH  /wardrobe/items/:id/favorite
PATCH  /wardrobe/items/:id/archive
PATCH  /wardrobe/items/:id/restore
```

## Clothing Images

```text
POST   /wardrobe/items/:id/images
GET    /wardrobe/items/:id/images
DELETE /wardrobe/images/:id
PATCH  /wardrobe/images/:id/cover
```

---

# 9. Wardrobe API Examples

Get wardrobe items:

```http
GET /api/v1/wardrobe/items
```

Pagination:

```http
GET /api/v1/wardrobe/items?page=1&limit=20
```

Search:

```http
GET /api/v1/wardrobe/items?search=black
```

Filter by category:

```http
GET /api/v1/wardrobe/items?category=TSHIRT
```

Filter by color:

```http
GET /api/v1/wardrobe/items?color=Black
```

Favorites:

```http
GET /api/v1/wardrobe/items?favorite=true
```

Sorting:

```http
GET /api/v1/wardrobe/items?sort=newest
```

Multiple filters:

```http
GET /api/v1/wardrobe/items?category=TSHIRT&color=Black&favorite=true&sort=newest
```

---

# 10. Running the Frontend

If the frontend exists in the `frontend` directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

The exact port may change depending on the frontend configuration.

---

# 11. Running Backend + Frontend Together

Open two terminals.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Make sure PostgreSQL is running:

```bash
docker compose up -d
```

---

# 12. Recommended Startup Order

For local development:

### Step 1 — Start Docker

```bash
cd backend
docker compose up -d
```

### Step 2 — Generate Prisma Client

```bash
npx prisma generate
```

### Step 3 — Apply database migrations

```bash
npx prisma migrate dev
```

### Step 4 — Start backend

```bash
npm run dev
```

### Step 5 — Start frontend

In another terminal:

```bash
cd frontend
npm run dev
```

---

# 13. Git Commands

Check changes:

```bash
git status
```

Add changes:

```bash
git add .
```

Commit:

```bash
git commit -m "your commit message"
```

Push:

```bash
git push
```

Pull latest changes:

```bash
git pull
```

---

# 14. Important Security Notes

Do **not** commit:

```text
.env
```

or any files containing:

* Database passwords
* JWT secrets
* Cloudinary API secrets
* Email passwords
* API keys
* Other private credentials

Make sure `.gitignore` includes:

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
coverage/
```

---

# 15. Development Workflow

The project is being developed incrementally.

Each phase should generally follow:

```text
Database / Prisma
        ↓
Types
        ↓
Repository
        ↓
Service
        ↓
Validation
        ↓
Controller
        ↓
Routes
        ↓
Testing
        ↓
Postman verification
```

The backend follows a **module-based architecture without classes**.

Each module generally contains:

```text
module/
├── constants.ts
├── controller.ts
├── index.ts
├── repository.ts
├── routes.ts
├── service.ts
├── types.ts
└── validation.ts
```

---

# 16. Roadmap

```text
Phase 0   Backend Setup                         ✅
Phase 1   Authentication                        ✅
Phase 2   User Profile                          ✅
Phase 3   Digital Wardrobe                      ✅
Phase 4   Search / Filters / Sorting             ✅
Phase 4.6 Testing Foundation                    🔄

Phase 5   Advanced Clothing Data & Images       🔄
Phase 6   Outfit System
Phase 7   AI Clothing Analysis
Phase 8   AI Outfit Recommendations
Phase 9   Advanced AI Features
Phase 10  Premium / Advanced AI
Phase 11  Admin System
Phase 12  Frontend
Phase 13  Production & Deployment
```

---

# 17. Current Development Focus

The current implementation starts at:

```text
Phase 5.1 — Improve Clothing Metadata
```

The project should continue one feature at a time rather than implementing all future AI functionality at once.

---

## License

License information will be added later.

```

You can paste that directly into the repository as **`README.md`**. It deliberately describes the **current state** rather than pretending the future frontend/AI features are already implemented.
```
