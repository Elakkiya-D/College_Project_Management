## College Management System (MERN) — v2 API (Department/Faculty/Course)

This repo currently contains a legacy API and a new clean API layer under **`/api/v2`**.

The v2 layer uses strict naming:
- **department**
- **faculty**
- **course**

### Backend (Node/Express)

#### 1) Configure environment

Create `backend/.env` from `backend/.env.example`.

Minimum required:

- `mongo`: your MongoDB connection string
- `JWT_SECRET`: a strong secret (min 32 chars)

Example local Mongo:

```
mongo=mongodb://127.0.0.1:27017/college_management
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=7d
PORT=5000
```

If you see `bad auth : authentication failed`, your `mongo` string credentials are wrong. Use either a local Mongo URL (no auth), or correct Atlas username/password and database in the connection string.

#### 2) Install + run

```
cd backend
npm install
npm run start
```

Backend runs on `http://localhost:5000`.

### v2 API Endpoints (Sample)

Base URL: `http://localhost:5000/api/v2`

#### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me` (Bearer token)

#### Department (ADMIN)

- `GET /departments`
- `POST /departments`
- `PUT /departments/:id`
- `DELETE /departments/:id`

#### Faculty (ADMIN)

- `GET /faculty`
- `GET /faculty/:id`
- `PUT /faculty/:id`
- `DELETE /faculty/:id`

#### Course (ADMIN)

- `GET /courses`
- `POST /courses`
- `PUT /courses/:id`
- `DELETE /courses/:id`

#### Student (ADMIN)

- `GET /students`
- `GET /students/:id`
- `PUT /students/:id`
- `DELETE /students/:id`

#### Attendance (FACULTY)

- `POST /attendance/sessions`
- `GET /attendance/students/:studentId/summary`

#### Results (FACULTY)

- `POST /results`
- `GET /results/students/:studentId`

### Sample Requests (copy/paste)

#### Create ADMIN user

```bash
curl -X POST http://localhost:5000/api/v2/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Admin\",\"email\":\"admin@example.com\",\"password\":\"Pass@12345\",\"role\":\"ADMIN\"}"
```

#### Login

```bash
curl -X POST http://localhost:5000/api/v2/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"Pass@12345\"}"
```

Copy the returned `token` and use as:
`Authorization: Bearer <token>`

#### Create a Department

```bash
curl -X POST http://localhost:5000/api/v2/departments ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer <token>" ^
  -d "{\"name\":\"Computer & IT\",\"code\":\"CIT\",\"description\":\"Computing and IT programs\"}"
```

### v2 Schema Locations

Backend v2 schemas are in:

- `backend/models/v2/Department.js`
- `backend/models/v2/User.js`
- `backend/models/v2/Faculty.js`
- `backend/models/v2/Course.js`
- `backend/models/v2/Student.js`
- `backend/models/v2/AttendanceSession.js`
- `backend/models/v2/Result.js`

