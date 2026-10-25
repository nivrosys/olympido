# Olympido Backend API

The core backend platform for **Olympido** — a competitive academic Olympiad and contest platform (covering Physics, Mathematics, Chemistry, Informatics, and General Science).

Built with **NestJS**, **Prisma 6**, **PostgreSQL**, **Redis**, and **Socket.IO**.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **PostgreSQL**: `v15` or `v16`
- **Redis** *(Optional but recommended)*: `v7.x` (if Redis is not running, the application gracefully operates in high-speed fallback mode querying PostgreSQL directly).

---

### 2. Environment Configuration

In the `backend/` directory, ensure `.env` is configured:

```bash
cp .env.example .env
```

Key environment variables:
```env
PORT=4000
DATABASE_URL="postgresql://postgres:00000000@localhost:5432/olympido_dev?schema=public"

REDIS_HOST="localhost"
REDIS_PORT=6379

JWT_ACCESS_SECRET="olympido_jwt_access_super_secret_token_key_development_2026"
JWT_REFRESH_SECRET="olympido_jwt_refresh_super_secret_token_key_development_2026"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

FRONTEND_URL="http://localhost:3000"
```

> **Note on Port 4000**: Port `4000` is used by default because system proxy daemons like `nghttpx` often occupy port `3000`.

---

### 3. Install Dependencies & Generate Prisma Client

```bash
cd backend
npm install
npx prisma generate
```

---

### 4. Database Migration & Seeding

Run the database migrations and seed default platform users, organization, and a sample contest with 5 MCQ questions:

```bash
# Run PostgreSQL migrations
npx prisma migrate dev

# Seed database with sample accounts and contest
npm run seed   # or: npx prisma db seed
```

#### Pre-seeded Default Accounts:
| Role | Email | Username | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@olympido.com` | `admin` | `Admin@123456` |
| **Organizer** | `organizer@bdpho.org` | `bdpho_organizer` | `Organizer@123456` |
| **Student 1** | `arif@student.com` | `arif_rahman` | `Student@123456` |
| **Student 2** | `tasmia@student.com` | `tasmia_chowdhury` | `Student@123456` |

---

### 5. Running the Application

```bash
# Development with hot-reload
npm run start:dev

# Standard run
npm run start

# Production build and run
npm run build
npm run start:prod
```

When started:
- **API Base URL**: `http://localhost:4000/api/v1`
- **Interactive Swagger Docs**: `http://localhost:4000/api/docs`
- **Health Check**: `http://localhost:4000/api/v1/health`
- **WebSocket Gateway**: `ws://localhost:4000/ws`

---

### 6. Running with Docker Compose (Full Stack)

To run the complete production stack (Backend + PostgreSQL 16 + Redis 7 + MinIO S3 Object Storage) with a single command from the project root:

```bash
# From the repository root:
docker-compose up -d --build
```

Services will be accessible at:
- **NestJS API**: `http://localhost:4000/api/v1`
- **Swagger Docs**: `http://localhost:4000/api/docs`
- **MinIO S3 Console**: `http://localhost:9001` (User: `minioadmin` / Pass: `minioadmin`)
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`

To stop:
```bash
docker-compose down
```

---

### 7. Running Tests

```bash
# Unit tests (Auto-Grader, Rating Engine, Elo Formulas, App Controller)
npm test

# End-to-end integration tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

### 8. Key API Endpoints Overview

| Module | Method & Endpoint | Description |
| :--- | :--- | :--- |
| **Auth** | `POST /api/v1/auth/login` | Login with `emailOrUsername` and `password` |
| **Auth** | `POST /api/v1/auth/register/student` | Register student account |
| **Contests** | `GET /api/v1/contests` | List public scheduled and completed contests |
| **Contests** | `POST /api/v1/contests/:id/register` | Register for scheduled contest |
| **Live** | `PUT /api/v1/contests/:id/submit/:qId` | Real-time single answer auto-save |
| **Live** | `POST /api/v1/contests/:id/submit` | Full contest answers submission |
| **Results** | `POST /api/v1/contests/:id/finalize` | Finalize contest, calculate Elo ratings & Olympiad points |
| **Results** | `GET /api/v1/contests/:id/results` | Contest official ranking leaderboard |
| **Results** | `GET /api/v1/contests/:id/my-results` | Student scorecard with question explanations |
| **Verify** | `GET /api/v1/verify/scorecard/:hash` | Public cryptographic SHA-256 scorecard verification |
| **Leaderboards** | `GET /api/v1/leaderboards/all-time` | Global leaderboard by Rating or Points |
| **Leaderboards** | `GET /api/v1/leaderboards/weekly` | Weekly points leaderboard (optional category filter) |
| **Leaderboards** | `GET /api/v1/leaderboards/rank/:username` | Real-time multi-tier rank standings |
| **Social** | `POST /api/v1/posts` | Share contest scorecard or rating milestone |
| **Social** | `GET /api/v1/posts/feed` | Personalized chronological feed of followed peers |
| **Social** | `POST /api/v1/posts/:id/like` | Toggle like (with author notification) |
| **Social** | `POST /api/v1/posts/:id/comments` | Threaded discussion comments |
| **Notifications** | `GET /api/v1/notifications` | User notification history (with WS push) |

---

### 9. Real-Time WebSocket Gateway (`/ws`)

Connect client to `http://localhost:4000/ws` with JWT in handshake auth (`{ auth: { token: "<access_token>" } }`):

- **Join Contest Room**: Emit `contest:join` with `{ contestId: "<uuid>" }`
- **Leave Contest Room**: Emit `contest:leave` with `{ contestId: "<uuid>" }`
- **Client Receives**:
  - `contest:started`: Contest transitioned to LIVE
  - `contest:ended`: Contest duration expired
  - `contest:tick`: Time remaining synchronizer
  - `notification:new`: In-app notification pushed to user
  - `submission:ack`: Confirmation of received answer

---

### 10. Troubleshooting

- **Port in Use (`EADDRINUSE: 4000`)**:
  Kill any lingering background processes:
  ```bash
  fuser -k 4000/tcp
  ```
- **Redis Connection Closed Warnings**:
  The application is designed to be fully resilient. If Redis is down, it logs a warning and automatically falls back to querying PostgreSQL directly without crashing.
- **Database Connection Error**:
  Verify your PostgreSQL service is running and credentials in `.env` match:
  ```bash
  psql -U postgres -h localhost -d olympido_dev
  ```
