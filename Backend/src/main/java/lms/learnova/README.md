# Learnova LMS — Backend Fix Notes

## What Was Changed & Why

### 1. New `AuthController` (`/api/auth/*`)
| Endpoint | Before | After |
|---|---|---|
| Register | `POST /student/registerStudent` | `POST /api/auth/register` (role field selects student/instructor) |
| Login | `POST /student/login` → returns raw JWT string | `POST /api/auth/login` → returns `{ access_token, refresh_token, user }` |
| Refresh | ❌ Missing | `POST /api/auth/refresh` with `Authorization: Bearer <refresh_token>` |
| Logout | ❌ Missing | `POST /api/auth/logout` |
| Get me | ❌ Missing | `GET /api/auth/me` |

### 2. New `CoursesApiController` (`/api/courses/*`)
Replaces the old `/course/getAllCourses`, `/course/addCourse` etc. with the REST-style routes expected by the frontend.
Response shapes now include `category: { id, name }` and `instructor: { id, name }` objects instead of flat strings.

### 3. New `EnrollmentsApiController` (`/api/enrollments/*`)
- `POST /api/enrollments` now accepts `{ course_id }` and resolves the student from the JWT automatically
- `GET /api/enrollments/my-courses` returns paginated enrollments with nested course object

### 4. New `DashboardApiController` (`/api/dashboard/*`)
- `GET /api/dashboard/student` — was completely missing
- `GET /api/dashboard/instructor`
- `GET /api/dashboard/admin`

### 5. New `QuizzesApiController`
- `GET /api/courses/{id}/quizzes`
- `POST /api/quizzes/{id}/start`
- `POST /api/quizzes/{id}/submit`

### 6. New `AssignmentsApiController`
- `GET /api/courses/{id}/assignments`
- `POST /api/assignments/{id}/submit` (multipart)
- `PUT /api/assignments/{id}/submissions/{sid}/grade`

### 7. New `CategoriesApiController` + `AdminApiController` + `AnalyticsApiController`
All new, matching frontend docs exactly.

### 8. `SecurityConfig` — CORS & public routes
- Added `http://localhost:3000` (Vite default) to allowed origins
- Permitted `/auth/*` endpoints publicly
- Removed OAuth2 login config (not wired to Google yet)

### 9. `JWTService` — refresh token
Added `generateRefreshToken()` with a separate 7-day TTL.

### 10. `CourseContentDTO` — expanded fields
Added `videoUrl`, `durationMinutes`, `isAssignment`, `dueDate`, `orderIndex` so the frontend content views work.

### 11. `application.properties` (new file)
Sets `server.servlet.context-path=/api` so every controller is automatically under `/api`.

---

## How to Run

### Backend (Spring Boot)
```bash
# Prerequisites: Java 21+, PostgreSQL running on port 5432

# 1. Create database
psql -U postgres -c "CREATE DATABASE learnova;"

# 2. Copy application.properties to src/main/resources/
#    (edit DB credentials if needed)

# 3. Build & run
./mvnw spring-boot:run
# → Listening on http://localhost:8080/api
```

### Frontend (Vite + React)
```bash
cd learnova-frontend
npm install
npm run dev
# → http://localhost:3000
# Proxy: /api/* → http://localhost:8080/api/*
```

---

## File Placement Guide

Place the new/changed files in your Spring Boot project like this:

```
src/main/
├── java/lms/learnova/
│   ├── Config/
│   │   └── SecurityConfig.java          ← REPLACED
│   ├── Controller/
│   │   ├── AuthController.java          ← NEW
│   │   ├── CoursesApiController.java    ← NEW
│   │   ├── EnrollmentsApiController.java← NEW
│   │   ├── DashboardApiController.java  ← NEW
│   │   ├── QuizzesApiController.java    ← NEW
│   │   ├── AssignmentsApiController.java← NEW
│   │   ├── CategoriesApiController.java ← NEW
│   │   ├── AdminApiController.java      ← NEW
│   │   ├── AnalyticsApiController.java  ← NEW
│   │   └── (old controllers unchanged — kept for compat)
│   ├── DTOs/
│   │   ├── RegisterRequest.java         ← NEW
│   │   ├── LoginRequest.java            ← NEW
│   │   ├── LoginResponse.java           ← NEW
│   │   ├── UserResponse.java            ← NEW
│   │   ├── CourseContentDTO.java        ← EXPANDED
│   │   └── EngagementReportDTO.java     ← PATCHED
│   └── Service/
│       ├── JWTService.java              ← UPDATED (refresh token)
│       └── CourseContentService.java    ← UPDATED (full DTO mapping)
└── resources/
    └── application.properties          ← NEW
```

---

## API Quick Reference (aligned with frontend)

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/register` | No | Register student or instructor |
| POST | `/api/auth/login` | No | Login → tokens + user |
| POST | `/api/auth/refresh` | Refresh token | Get new access token |
| POST | `/api/auth/logout` | Yes | Clear session |
| GET | `/api/auth/me` | Yes | Current user info |
| GET | `/api/courses` | No | Paginated course list |
| GET | `/api/courses/{id}` | Yes | Course detail + modules |
| GET | `/api/courses/{id}/content` | Yes | Course modules/lessons |
| POST | `/api/enrollments` | Yes (STUDENT) | Enroll `{ course_id }` |
| GET | `/api/enrollments/my-courses` | Yes | My enrolled courses |
| DELETE | `/api/enrollments/{id}` | Yes | Unenroll |
| GET | `/api/dashboard/student` | Yes | Student dashboard stats |
| GET | `/api/courses/{id}/assignments` | Yes | Course assignments |
| POST | `/api/assignments/{id}/submit` | Yes | Submit (multipart) |
| GET | `/api/courses/{id}/quizzes` | Yes | Course quizzes |
| POST | `/api/quizzes/{id}/start` | Yes | Start quiz attempt |
| POST | `/api/quizzes/{id}/submit` | Yes | Submit quiz answers |
| GET | `/api/categories` | No | All categories |
| GET | `/api/admin/users` | Yes (ADMIN) | All users |
