# Backend Source Code

The backend API implementation for Learnova LMS.

See [Backend README](../../../README.md) for architecture and API documentation.


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
