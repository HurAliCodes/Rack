# RACK Backend

Production-ready backend for the **RACK (AI Digital Wardrobe)** application.

---

# Tech Stack

* Node.js 22 LTS
* TypeScript
* Express.js
* PostgreSQL
* Prisma ORM
* Redis
* Docker
* JWT Authentication
* Zod Validation
* Pino Logger
* Swagger (Coming Soon)

---

# Prerequisites

Before starting, make sure you have the following installed:

* Node.js 22 LTS
* npm
* Docker Desktop
* Git

Verify your installation:

```bash
node -v
npm -v
docker --version
git --version
```

---

# Clone the Repository

```bash
git clone <repository-url>
cd RACK
```

---

# Start Docker Services

From the project root:

```bash
docker compose up -d
```

Verify the containers are running:

```bash
docker ps
```

You should see:

* rack-postgres
* rack-redis

---

# Backend Setup

Go to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the `backend` directory.

Example:

```env
PORT=5000

NODE_ENV=development

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rack"

JWT_SECRET="CHANGE_ME"

JWT_REFRESH_SECRET="CHANGE_ME_TOO"

REDIS_URL="redis://localhost:6379"
```

---

# Generate Prisma Client

```bash
npm run prisma:generate
```

---

# Run the Development Server

```bash
npm run dev
```

The server should start on:

```
http://localhost:5000
```

---

# Health Check

Open your browser or Postman:

```
GET http://localhost:5000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "message": "RACK API Running"
}
```

---

# Available Scripts

Start development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Run production build:

```bash
npm start
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

Create a migration:

```bash
npm run prisma:migrate
```

Open Prisma Studio:

```bash
npm run prisma:studio
```

Run tests:

```bash
npm test
```

Run ESLint:

```bash
npm run lint
```

---

# Project Structure

```text
backend/
│
├── prisma/
│
├── src/
│   ├── config/
│   ├── infrastructure/
│   │   ├── database/
│   │   ├── cache/
│   │   ├── logger/
│   │   └── storage/
│   │
│   ├── modules/
│   ├── routes/
│   ├── shared/
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── middleware/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── app.ts
│   └── server.ts
│
├── tests/
├── .env.example
├── package.json
└── tsconfig.json
```

---

# Troubleshooting

### PostgreSQL connection error

Make sure Docker containers are running:

```bash
docker ps
```

If not:

```bash
docker compose up -d
```

---

### Port 5000 already in use

Either stop the application using port `5000` or change the `PORT` value in `.env`.

---

### Prisma Client not found

Run:

```bash
npm run prisma:generate
```

---

### Fresh Start

If you need to reset the local environment:

```bash
docker compose down -v
docker compose up -d
npm install
npm run prisma:generate
npm run dev
```

---

# Current Status

✅ Backend foundation completed

* Docker
* PostgreSQL
* Redis
* Express
* TypeScript
* Prisma
* Environment configuration
* Versioned API routing
* Global error handling

The next milestone is implementing the Authentication module.
