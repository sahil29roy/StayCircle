# StayCircle — Backend (Part 1)

> **PG Discovery, Vacancy & Roommate Matching Platform**
> Foundation, Authentication, Role Authorization, and PostgreSQL Setup

---

## 1. Stack & Architecture

- **Runtime**: Node.js (v24+) with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with raw SQL queries via `pg` (no ORMs)
- **Authentication**: JWT (JSON Web Tokens) & bcrypt (12 salt rounds)
- **Validation**: Zod (environment variables and request schemas)
- **Security**: Helmet, CORS, and Express Rate Limiting
- **Development Tooling**: `tsx` (fast watcher and TypeScript execution)

### Request Flow
```
HTTP Request → Helmet/CORS/RateLimit → Route → Zod Validator → Controller → Service → Repository (Raw SQL / Transactions) → PostgreSQL
```

---

## 2. Directory Structure

```
backend/
├── db/
│   └── migrations/
│       ├── 001_create_users.sql
│       ├── 002_create_students.sql
│       └── 003_create_owners.sql
├── src/
│   ├── config/
│   │   ├── db.ts           # PostgreSQL Pool & connection testing
│   │   └── env.ts          # Zod-validated environment configuration
│   ├── controllers/
│   │   └── auth.controller.ts
│   ├── middleware/
│   │   ├── authenticate.ts # JWT verification middleware
│   │   ├── authorize.ts    # Role-based access control (RBAC)
│   │   ├── errorHandler.ts # Centralized error handler
│   │   └── notFound.ts     # 404 handler
│   ├── repositories/
│   │   └── user.repository.ts # Raw SQL queries & parameterized inserts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── health.routes.ts
│   ├── scripts/
│   │   └── migrate.ts      # SQL migration runner
│   ├── services/
│   │   └── auth.service.ts # Business logic & atomic transactions
│   ├── types/
│   │   ├── auth.ts
│   │   └── user.ts
│   ├── utils/
│   │   ├── appError.ts     # Custom AppError with status codes
│   │   ├── asyncHandler.ts # Async route wrapper
│   │   ├── jwt.ts          # Token signing and verification
│   │   └── password.ts     # Bcrypt password hashing
│   ├── validators/
│   │   └── auth.validator.ts # Zod registration & login schemas
│   ├── app.ts              # Express application assembly
│   └── server.ts           # HTTP server and database boot
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 3. Environment Configuration

Copy `.env.example` to `.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=staycircle
DB_USER=postgres
DB_PASSWORD=your_password

# Authentication (JWT)
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=7d

# Security & Rate Limiting
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## 4. Setup & Commands

### Installation
```bash
npm install
```

### Run Database Migrations
Runs all unapplied SQL migrations inside transactions:
```bash
npm run migrate
```

### Development Server
Starts the server with hot-reloading using `tsx`:
```bash
npm run dev
```

### Production Build & Start
Compile TypeScript to `dist/` and run:
```bash
npm run build
npm start
```

---

## 5. API Endpoints

### Health Checks
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status | No |
| `GET` | `/api/health/db` | PostgreSQL connectivity status | No |

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register as `STUDENT` or `OWNER` | No |
| `POST` | `/api/auth/login` | Log in and receive JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (`Bearer <token>`) |
| `POST` | `/api/auth/logout` | Client-side logout guidance | No |

---

## 6. Authentication & Transaction Flow

1. **Student Registration (`POST /api/auth/register`)**:
   ```json
   {
     "name": "Rahul Kumar",
     "email": "rahul@example.com",
     "phone": "9876543210",
     "password": "StrongPassword123",
     "role": "STUDENT",
     "gender": "MALE",
     "college": "ABC College",
     "course": "B.Tech",
     "year": 3
   }
   ```
2. **Owner Registration (`POST /api/auth/register`)**:
   ```json
   {
     "name": "Rajesh Sharma",
     "email": "rajesh@example.com",
     "phone": "9876543211",
     "password": "StrongPassword123",
     "role": "OWNER"
   }
   ```
3. **Atomic Execution**:
   - `BEGIN`
   - Insert into `users` table
   - Insert into `students` or `owners` table with foreign key `user_id`
   - `COMMIT` (or `ROLLBACK` on any error)
4. **Login (`POST /api/auth/login`)**:
   - Verifies bcrypt password hash against stored hash.
   - Signs JWT payload containing `{ userId, role }`.
5. **Protected Access (`GET /api/auth/me`)**:
   - Requires `Authorization: Bearer <token>`.
   - Returns safe user details along with the associated `profile` object (no `password_hash` exposed).
