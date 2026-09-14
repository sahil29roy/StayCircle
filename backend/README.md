# StayCircle — Backend (Part 1 & Part 2)

> **PG Discovery, Vacancy & Roommate Matching Platform**

---

## 1. Tech Stack & Architecture

- **Runtime**: Node.js with TypeScript (strict mode)
- **Framework**: Express.js
- **Database**: PostgreSQL with raw SQL through `pg` (no ORMs)
- **Security**: Helmet, CORS, Express Rate Limiting, bcrypt (12 rounds), JWT
- **Validation**: Zod (environment variables, query params, request bodies)
- **Tooling**: `tsx` (development), `tsc` (production build)

### Layered Architecture
```
HTTP Request
     ↓
Route & Middlewares (Helmet, CORS, RateLimit, Authenticate, Authorize)
     ↓
Zod Request Validator
     ↓
Controller (HTTP status codes & JSON serialization)
     ↓
Service (Business logic, atomic transactions, row locking)
     ↓
Repository (Parameterized raw SQL `$1, $2, ...`)
     ↓
PostgreSQL
```

---

## 2. Directory Structure

```
backend/
├── db/
│   └── migrations/
│       ├── 001_create_users.sql
│       ├── 002_create_students.sql
│       ├── 003_create_owners.sql
│       ├── 004_create_pgs.sql
│       ├── 005_create_amenities.sql
│       ├── 006_create_pg_amenities.sql
│       ├── 007_create_pg_images.sql
│       ├── 008_create_rooms.sql
│       ├── 009_create_room_members.sql
│       ├── 010_extend_student_preferences.sql
│       └── 011_create_join_requests.sql
├── src/
│   ├── config/
│   │   ├── db.ts           # PostgreSQL Pool & connection testing
│   │   └── env.ts          # Zod-validated environment config
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── pg.controller.ts
│   │   ├── room.controller.ts
│   │   ├── student.controller.ts
│   │   └── joinRequest.controller.ts
│   ├── middleware/
│   │   ├── authenticate.ts # JWT verification
│   │   ├── authorize.ts    # Role-based access control (RBAC)
│   │   ├── errorHandler.ts # Central error handler
│   │   └── notFound.ts     # 404 handler
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   ├── pg.repository.ts
│   │   ├── room.repository.ts
│   │   ├── student.repository.ts
│   │   └── joinRequest.repository.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── health.routes.ts
│   │   ├── pg.routes.ts
│   │   ├── room.routes.ts
│   │   ├── student.routes.ts
│   │   └── joinRequest.routes.ts
│   ├── scripts/
│   │   └── migrate.ts      # Transactional SQL migration runner
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── pg.service.ts
│   │   ├── room.service.ts
│   │   ├── student.service.ts
│   │   ├── matching.service.ts    # Deterministic roommate matching engine
│   │   └── joinRequest.service.ts # Request lifecycle & concurrency protection
│   ├── types/
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── pg.ts
│   │   ├── room.ts
│   │   ├── student.ts
│   │   └── joinRequest.ts
│   ├── utils/
│   │   ├── appError.ts
│   │   ├── asyncHandler.ts
│   │   ├── jwt.ts
│   │   └── password.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── pg.validator.ts
│   │   ├── room.validator.ts
│   │   ├── student.validator.ts
│   │   └── joinRequest.validator.ts
│   ├── app.ts              # Express application configuration
│   └── server.ts           # Server bootstrap & graceful shutdown
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 3. Database Schema & Relationships

```
 users (id UUID)
   ├── 1:1 → students (user_id UUID)
   │           ├── 1:M → room_members (student_id UUID) [UNIQUE WHERE status = 'ACTIVE']
   │           └── 1:M → join_requests (student_id UUID) [UNIQUE WHERE status = 'PENDING']
   │
   └── 1:1 → owners (user_id UUID)
               └── 1:M → pgs (owner_id UUID)
                           ├── M:N (pg_amenities) → amenities (id UUID)
                           ├── 1:M → pg_images (pg_id UUID)
                           └── 1:M → rooms (pg_id UUID)
                                       ├── 1:M → room_members (room_id UUID)
                                       └── 1:M → join_requests (room_id UUID)
```

### Vacancy Calculation
Vacancy is **never stored** statically. It is calculated dynamically in SQL:
$$\text{vacant} = \max(0, \text{capacity} - \text{active\_members})$$
```sql
COUNT(CASE WHEN rm.status = 'ACTIVE' THEN 1 END)::int AS occupied,
GREATEST(0, r.capacity - COUNT(CASE WHEN rm.status = 'ACTIVE' THEN 1 END))::int AS vacant
```

---

## 4. Deterministic Roommate Compatibility Matching

Compatibility is calculated out of **100%** using explainable scoring without external AI dependencies:

| Preference Category | Max Weight | Evaluation Logic |
| :--- | :--- | :--- |
| **Budget Compatibility** | **25%** | Overlap in `[min, max]` gives 25%; proximity within ₹1500 gives 15%; ₹3500 gives 8%; else 0%. Baseline 18% if unset. |
| **Lifestyle & Smoking** | **25%** | Exact match / ANY gives 25%; Occasional with Smoker/Non-smoker gives 12%; Smoker vs Non-smoker gives 0%. |
| **Food Preference** | **15%** | Exact match / ANY gives 15%; Vegetarian/Non-vegetarian with Eggetarian gives 10%; Veg vs Non-veg gives 0%. |
| **Sleep Schedule** | **10%** | Exact match / Flexible / Normal gives 10%; Early Bird vs Night Owl gives 0%. |
| **Cleanliness** | **10%** | Exact match gives 10%; 1 step difference (High vs Moderate) gives 6%; High vs Low gives 0%. |
| **Room Sharing** | **10%** | Exact match / ANY gives 10%; different types gives 5%. |
| **AC Preference** | **5%** | Exact match / Not Required gives 5%; Preferred with Required gives 4%; Required vs Not Required gives 0%. |

---

## 5. API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | No | Register `STUDENT` or `OWNER` |
| `POST` | `/api/auth/login` | No | Login and obtain JWT |
| `GET` | `/api/auth/me` | Bearer Token | Authenticated user profile |
| `POST` | `/api/auth/logout` | No | Stateless client token removal |

### PG Discovery & Management (`/api/pgs`)
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/pgs` | Public | Search PGs with filters & pagination |
| `GET` | `/api/pgs/amenities` | Public | List all available amenities |
| `GET` | `/api/pgs/:id` | Public | PG details with rooms and amenities |
| `POST` | `/api/pgs` | `OWNER` | Create a new PG |
| `PATCH` | `/api/pgs/:id` | `OWNER` (Host) | Update PG details |
| `DELETE` | `/api/pgs/:id` | `OWNER` (Host) | Delete PG |

**Search Query Parameters for `GET /api/pgs`**:
- `city` (string)
- `minRent`, `maxRent` (numbers)
- `gender` (`MALE`, `FEMALE`, `UNISEX`)
- `food` (`true`, `false`)
- `amenity` (string, e.g. `WiFi`)
- `minVacancy` (number)
- `search` (keyword)
- `page`, `limit` (pagination)

### Room Management (`/api/rooms` and `/api/pgs/:pgId/rooms`)
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/pgs/:pgId/rooms` | Public | List all rooms for a PG |
| `POST` | `/api/pgs/:pgId/rooms` | `OWNER` (Host) | Create room for a PG |
| `GET` | `/api/rooms/:id` | Public | Room details & current occupants |
| `PATCH` | `/api/rooms/:id` | `OWNER` (Host) | Update room |
| `DELETE` | `/api/rooms/:id` | `OWNER` (Host) | Delete room |
| `POST` | `/api/rooms/:roomId/members` | `OWNER` (Host) | Assign student to room |
| `DELETE` | `/api/rooms/:roomId/members/:studentId` | `OWNER` (Host) | Remove member (`status = LEFT`) |

### Student Profile & Roommate Matching
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/students/me` | `STUDENT` | View personal profile & preferences |
| `PATCH` | `/api/students/me` | `STUDENT` | Update roommate preferences |
| `GET` | `/api/rooms/:roomId/matches` | `STUDENT` | Calculate compatibility with roommates |

### Join Requests (`/api`)
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/rooms/:roomId/requests` | `STUDENT` | Send join request for a room |
| `GET` | `/api/student/requests` | `STUDENT` | View own join requests |
| `GET` | `/api/owner/requests` | `OWNER` | View requests for owned PGs |
| `PATCH` | `/api/requests/:requestId` | `OWNER` (Host) | Accept or reject join request |

---

## 6. Commands to Run

From `StayCircle/backend/`:

```powershell
# 1. Run database migrations
npm run migrate

# 2. Start development server (with tsx watch)
npm run dev

# 3. Build for production
npm run build

# 4. Start production server
npm start
```
