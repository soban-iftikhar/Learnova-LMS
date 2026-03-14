# Learnova LMS Backend API Documentation

**Version:** 1.0  
**Base URL:** `http://localhost:8080/api`  
**Last Updated:** March 2026

---

## Table of Contents
1. [Authentication](#authentication)
2. [Authorization & Roles](#authorization--roles)
3. [API Endpoints](#api-endpoints)
4. [DTOs & Request/Response Models](#dtos--requestresponse-models)
5. [Error Handling](#error-handling)
6. [Examples](#examples)

---

## Authentication

### JWT Token Flow

1. **Login/Register** → Receive `access_token` and `refresh_token`
2. **Store Token** → Save in localStorage or sessionStorage
3. **Send in Header** → Add to all subsequent requests:
   ```
   Authorization: Bearer <access_token>
   ```
4. **Token Refresh** → If expired, use `refresh_token` to get new `access_token`

### Login Endpoint
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "STUDENT"
  }
}
```

### Refresh Token Endpoint
```
POST /auth/refresh
Content-Type: application/json
Authorization: Bearer <refresh_token>

Response (200 OK):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

---

## Authorization & Roles

### Role-Based Access Control (RBAC)

#### User Roles
| Role | Description | Permissions |
|------|-------------|-------------|
| **ADMIN** | System administrator | Full system access, user management, course management, analytics |
| **INSTRUCTOR** | Course creator/teacher | Create courses, manage own courses, grade students, view analytics |
| **STUDENT** | Course enrollee | Enroll courses, submit assignments, take quizzes, view progress |
| **GUEST** | Unauthenticated user | View public courses only |

#### Permission Matrix

| Resource | ADMIN | INSTRUCTOR | STUDENT |
|----------|-------|-----------|---------|
| Users (CRUD) | ✅ | ❌ | ❌ |
| Courses (Create) | ✅ | ✅ | ❌ |
| Courses (Edit Own) | ✅ | ✅ | ❌ |
| Courses (Edit All) | ✅ | ❌ | ❌ |
| Courses (Delete) | ✅ | ✅ (own) | ❌ |
| Enroll | ✅ | ❌ | ✅ |
| Submit Assignments | ✅ | ❌ | ✅ |
| Grade Assignments | ✅ | ✅ (own course) | ❌ |
| View Analytics | ✅ | ✅ (own course) | ✅ (own) |
| View All Analytics | ✅ | ❌ | ❌ |
| Manage Categories | ✅ | ❌ | ❌ |

---

## API Endpoints

### Authentication Endpoints

#### Register (Sign Up)
```
POST /auth/register
Content-Type: application/json

Request:
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role": "STUDENT"  // or INSTRUCTOR
}

Response (201 Created):
{
  "id": 5,
  "email": "newuser@example.com",
  "name": "New User",
  "role": "STUDENT",
  "created_at": "2026-03-15T10:30:00Z"
}

Error (400 Bad Request):
{
  "error": "Email already exists",
  "timestamp": "2026-03-15T10:30:00Z"
}
```

#### Login
```
POST /auth/login
(See above)
```

#### Refresh Token
```
POST /auth/refresh
(See above)
```

#### Logout
```
POST /auth/logout
Authorization: Bearer <access_token>

Response (200 OK):
{
  "message": "Logged out successfully"
}
```

#### Get Current User
```
GET /auth/me
Authorization: Bearer <access_token>

Response (200 OK):
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "STUDENT",
  "created_at": "2026-01-15T08:00:00Z"
}
```

### Course Endpoints

#### Get All Courses
```
GET /courses
Query Parameters:
  - page: int (default: 1)
  - size: int (default: 10)
  - category: string (filter by category id)
  - search: string (search by title/description)
  - status: string (ACTIVE, ARCHIVED, DRAFT)

Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "title": "Java Basics",
      "description": "Learn Java fundamentals",
      "category": {
        "id": 1,
        "name": "Programming"
      },
      "instructor": {
        "id": 2,
        "name": "Jane Smith"
      },
      "students_count": 45,
      "rating": 4.5,
      "image_url": "https://...",
      "status": "ACTIVE",
      "created_at": "2026-01-10T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "size": 10,
    "total_elements": 50,
    "total_pages": 5
  }
}
```

#### Get Course by ID
```
GET /courses/{id}
Authorization: Bearer <access_token>

Response (200 OK):
{
  "id": 1,
  "title": "Java Basics",
  "description": "Learn Java fundamentals",
  "category": {
    "id": 1,
    "name": "Programming"
  },
  "instructor": {
    "id": 2,
    "name": "Jane Smith"
  },
  "content": [
    {
      "id": 1,
      "title": "Module 1: Basics",
      "order": 1,
      "lessons": [
        {
          "id": 1,
          "title": "What is Java?",
          "description": "...",
          "video_url": "https://..."
        }
      ]
    }
  ],
  "students_count": 45,
  "rating": 4.5,
  "status": "ACTIVE",
  "created_at": "2026-01-10T00:00:00Z"
}
```

#### Create Course (INSTRUCTOR/ADMIN)
```
POST /courses
Authorization: Bearer <access_token>
Content-Type: application/json

Request:
{
  "title": "React Advanced",
  "description": "Advanced React patterns and performance",
  "category_id": 1,
  "image_url": "https://...",
  "status": "DRAFT"
}

Response (201 Created):
{
  "id": 51,
  "title": "React Advanced",
  "description": "Advanced React patterns and performance",
  "category_id": 1,
  "instructor_id": 2,
  "status": "DRAFT",
  "created_at": "2026-03-15T10:30:00Z"
}
```

#### Update Course (INSTRUCTOR/ADMIN)
```
PUT /courses/{id}
Authorization: Bearer <access_token>
Content-Type: application/json

Request:
{
  "title": "React Advanced Mastery",
  "description": "Updated description...",
  "status": "ACTIVE"
}

Response (200 OK):
{
  "id": 51,
  "title": "React Advanced Mastery",
  "description": "Updated description...",
  "status": "ACTIVE",
  "updated_at": "2026-03-15T11:00:00Z"
}
```

#### Delete Course (INSTRUCTOR/ADMIN)
```
DELETE /courses/{id}
Authorization: Bearer <access_token>

Response (204 No Content)
```

#### Get Course Content
```
GET /courses/{id}/content
Authorization: Bearer <access_token>

Response (200 OK):
{
  "modules": [
    {
      "id": 1,
      "title": "Module 1: Basics",
      "order": 1,
      "lessons": [
        {
          "id": 1,
          "title": "What is React?",
          "description": "...",
          "video_url": "https://...",
          "duration": 15,
          "order": 1
        }
      ]
    }
  ]
}
```

### Enrollment Endpoints

#### Enroll in Course (STUDENT)
```
POST /enrollments
Authorization: Bearer <access_token>
Content-Type: application/json

Request:
{
  "course_id": 1
}

Response (201 Created):
{
  "id": 100,
  "student_id": 5,
  "course_id": 1,
  "enrollment_date": "2026-03-15T10:30:00Z",
  "status": "ACTIVE",
  "progress": 0
}
```

#### Get Student Enrollments
```
GET /enrollments/my-courses
Authorization: Bearer <access_token>
Query Parameters:
  - page: int
  - size: int
  - status: ACTIVE, COMPLETED, SUSPENDED

Response (200 OK):
{
  "content": [
    {
      "id": 100,
      "course": {
        "id": 1,
        "title": "Java Basics",
        "instructor": "Jane Smith"
      },
      "progress": 45,
      "status": "ACTIVE",
      "enrollment_date": "2026-03-15T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### Get Course Enrollments (INSTRUCTOR/ADMIN)
```
GET /courses/{courseId}/enrollments
Authorization: Bearer <access_token>
Query Parameters:
  - page: int
  - size: int
  - status: ACTIVE, COMPLETED, SUSPENDED

Response (200 OK):
{
  "content": [
    {
      "id": 100,
      "student": {
        "id": 5,
        "name": "Student Name",
        "email": "student@example.com"
      },
      "progress": 45,
      "status": "ACTIVE",
      "enrollment_date": "2026-03-15T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### Unenroll from Course
```
DELETE /enrollments/{enrollmentId}
Authorization: Bearer <access_token>

Response (204 No Content)
```

### Assignment Endpoints

#### Get Course Assignments
```
GET /courses/{courseId}/assignments
Authorization: Bearer <access_token>

Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "title": "Assignment 1: Variables",
      "description": "Create a program using variables",
      "due_date": "2026-04-10T23:59:00Z",
      "total_points": 100,
      "order": 1
    }
  ]
}
```

#### Submit Assignment (STUDENT)
```
POST /assignments/{assignmentId}/submit
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
  - file: <file> (PDF, DOC, ZIP, etc.)
  - submission_text: string (optional)

Response (201 Created):
{
  "id": 50,
  "assignment_id": 1,
  "student_id": 5,
  "submission_date": "2026-03-15T10:30:00Z",
  "status": "SUBMITTED",
  "file_url": "https://..."
}
```

#### Grade Assignment (INSTRUCTOR)
```
PUT /assignments/{assignmentId}/submissions/{submissionId}/grade
Authorization: Bearer <access_token>
Content-Type: application/json

Request:
{
  "points_earned": 85,
  "feedback": "Good work! Minor improvements needed in error handling.",
  "status": "GRADED"
}

Response (200 OK):
{
  "id": 50,
  "assignment_id": 1,
  "student_id": 5,
  "points_earned": 85,
  "feedback": "Good work! Minor improvements needed in error handling.",
  "status": "GRADED",
  "graded_date": "2026-03-15T11:00:00Z"
}
```

### Quiz/Assessment Endpoints

#### Get Course Quizzes
```
GET /courses/{courseId}/quizzes
Authorization: Bearer <access_token>

Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "title": "Module 1 Quiz",
      "description": "Test your knowledge of Module 1",
      "question_count": 10,
      "time_limit": 30,
      "pass_percentage": 70,
      "status": "ACTIVE"
    }
  ]
}
```

#### Start Quiz (STUDENT)
```
POST /quizzes/{quizId}/start
Authorization: Bearer <access_token>

Response (201 Created):
{
  "attempt_id": 100,
  "quiz_id": 1,
  "student_id": 5,
  "started_at": "2026-03-15T10:30:00Z",
  "questions": [
    {
      "id": 1,
      "question": "What is React?",
      "options": ["A library", "A framework", "Both", "Neither"],
      "type": "MULTIPLE_CHOICE"
    }
  ]
}
```

#### Submit Quiz (STUDENT)
```
POST /quizzes/{quizId}/submit
Authorization: Bearer <access_token>
Content-Type: application/json

Request:
{
  "attempt_id": 100,
  "answers": [
    {
      "question_id": 1,
      "answer": "A library"
    },
    {
      "question_id": 2,
      "answer": "2"
    }
  ]
}

Response (200 OK):
{
  "attempt_id": 100,
  "score": 850,
  "percentage": 85,
  "passed": true,
  "feedback": "Great job! You passed the quiz.",
  "submitted_at": "2026-03-15T10:45:00Z"
}
```

### Attendance Endpoints

#### Mark Attendance (INSTRUCTOR)
```
POST /attendance/mark
Authorization: Bearer <access_token>
Content-Type: application/json

Request:
{
  "course_id": 1,
  "date": "2026-03-15",
  "records": [
    {
      "student_id": 5,
      "status": "PRESENT"
    },
    {
      "student_id": 6,
      "status": "ABSENT"
    }
  ]
}

Response (201 Created):
{
  "id": 1,
  "course_id": 1,
  "date": "2026-03-15",
  "records_count": 2,
  "created_at": "2026-03-15T10:30:00Z"
}
```

#### Get Attendance Records
```
GET /courses/{courseId}/attendance
Authorization: Bearer <access_token>
Query Parameters:
  - student_id: int (filter by student)
  - start_date: string (YYYY-MM-DD)
  - end_date: string (YYYY-MM-DD)

Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "student": {
        "id": 5,
        "name": "Student Name"
      },
      "date": "2026-03-15",
      "status": "PRESENT"
    }
  ]
}
```

### Dashboard & Analytics Endpoints

#### Student Dashboard
```
GET /dashboard/student
Authorization: Bearer <access_token>

Response (200 OK):
{
  "enrolled_courses": 5,
  "in_progress": 3,
  "completed": 2,
  "average_grade": 82.5,
  "recent_courses": [
    {
      "id": 1,
      "title": "Java Basics",
      "progress": 75,
      "latest_activity": "2026-03-15T09:30:00Z"
    }
  ],
  "upcoming_deadlines": [
    {
      "id": 50,
      "title": "Assignment 1",
      "course": "Java Basics",
      "due_date": "2026-03-20T23:59:00Z"
    }
  ]
}
```

#### Instructor Dashboard
```
GET /dashboard/instructor
Authorization: Bearer <access_token>

Response (200 OK):
{
  "total_courses": 5,
  "total_students": 150,
  "total_enrollments": 180,
  "average_rating": 4.6,
  "courses": [
    {
      "id": 1,
      "title": "Java Basics",
      "students": 45,
      "rating": 4.5,
      "status": "ACTIVE"
    }
  ],
  "recent_submissions": [
    {
      "id": 50,
      "student": "Student Name",
      "assignment": "Assignment 1",
      "submitted_at": "2026-03-15T10:30:00Z",
      "status": "PENDING_REVIEW"
    }
  ]
}
```

#### Admin Dashboard
```
GET /dashboard/admin
Authorization: Bearer <access_token>

Response (200 OK):
{
  "total_users": 500,
  "total_courses": 50,
  "total_enrollments": 2500,
  "user_breakdown": {
    "students": 400,
    "instructors": 50,
    "admins": 5
  },
  "recent_activities": [
    {
      "user": "User Name",
      "action": "Created Course",
      "timestamp": "2026-03-15T10:30:00Z"
    }
  ],
  "course_statistics": {
    "most_popular": { "id": 1, "title": "...", "students": 100 },
    "least_popular": { "id": 2, "title": "...", "students": 5 }
  }
}
```

#### Course Analytics (INSTRUCTOR)
```
GET /courses/{courseId}/analytics
Authorization: Bearer <access_token>
Query Parameters:
  - start_date: string (YYYY-MM-DD)
  - end_date: string (YYYY-MM-DD)

Response (200 OK):
{
  "course_id": 1,
  "title": "Java Basics",
  "total_students": 45,
  "active_students": 40,
  "completion_rate": 60,
  "average_score": 78.5,
  "engagement_rate": 85,
  "student_performance": [
    {
      "student_id": 5,
      "name": "Student Name",
      "progress": 75,
      "quiz_average": 82,
      "assignment_average": 80,
      "attendance_percentage": 90
    }
  ],
  "module_engagement": [
    {
      "module_id": 1,
      "title": "Module 1",
      "completion_rate": 95,
      "average_time_spent": 120
    }
  ]
}
```

#### Engagement Report
```
GET /analytics/engagement
Authorization: Bearer <access_token>
Query Parameters:
  - course_id: int (optional)
  - start_date: string (YYYY-MM-DD)
  - end_date: string (YYYY-MM-DD)

Response (200 OK):
{
  "total_active_users": 350,
  "total_sessions": 2100,
  "average_session_duration": 45,
  "daily_activity": [
    {
      "date": "2026-03-15",
      "active_users": 120,
      "sessions": 250
    }
  ]
}
```

### User Management Endpoints (ADMIN)

#### Get All Users
```
GET /admin/users
Authorization: Bearer <access_token>
Query Parameters:
  - page: int
  - size: int
  - role: STUDENT, INSTRUCTOR, ADMIN
  - status: ACTIVE, SUSPENDED, DELETED

Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "STUDENT",
      "status": "ACTIVE",
      "created_at": "2026-01-10T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### Get User by ID
```
GET /admin/users/{userId}
Authorization: Bearer <access_token>

Response (200 OK):
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "STUDENT",
  "status": "ACTIVE",
  "created_at": "2026-01-10T00:00:00Z",
  "last_login": "2026-03-15T09:00:00Z"
}
```

#### Update User (ADMIN)
```
PUT /admin/users/{userId}
Authorization: Bearer <access_token>
Content-Type: application/json

Request:
{
  "name": "John Doe Updated",
  "role": "INSTRUCTOR",
  "status": "ACTIVE"
}

Response (200 OK):
{
  "id": 1,
  "name": "John Doe Updated",
  "email": "john@example.com",
  "role": "INSTRUCTOR",
  "status": "ACTIVE",
  "updated_at": "2026-03-15T10:30:00Z"
}
```

#### Delete User (ADMIN)
```
DELETE /admin/users/{userId}
Authorization: Bearer <access_token>

Response (204 No Content)
```

#### Suspend/Reactivate User (ADMIN)
```
PUT /admin/users/{userId}/status
Authorization: Bearer <access_token>
Content-Type: application/json

Request:
{
  "status": "SUSPENDED"  // or ACTIVE
}

Response (200 OK):
{
  "id": 1,
  "status": "SUSPENDED",
  "updated_at": "2026-03-15T10:30:00Z"
}
```

### Category Endpoints

#### Get All Categories
```
GET /categories
Query Parameters:
  - page: int
  - size: int

Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "name": "Programming",
      "description": "Programming languages and concepts",
      "course_count": 15,
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### Create Category (ADMIN)
```
POST /categories
Authorization: Bearer <access_token>
Content-Type: application/json

Request:
{
  "name": "Web Development",
  "description": "Front-end and back-end web development"
}

Response (201 Created):
{
  "id": 10,
  "name": "Web Development",
  "description": "Front-end and back-end web development",
  "created_at": "2026-03-15T10:30:00Z"
}
```

#### Update Category (ADMIN)
```
PUT /categories/{categoryId}
Authorization: Bearer <access_token>
Content-Type: application/json

Request:
{
  "name": "Web Development & Design",
  "description": "Full-stack web development and UI/UX design"
}

Response (200 OK):
{
  "id": 10,
  "name": "Web Development & Design",
  "description": "Full-stack web development and UI/UX design",
  "updated_at": "2026-03-15T10:30:00Z"
}
```

#### Delete Category (ADMIN)
```
DELETE /categories/{categoryId}
Authorization: Bearer <access_token>

Response (204 No Content)
```

---

## DTOs & Request/Response Models

### User DTO
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "STUDENT",
  "created_at": "2026-01-10T00:00:00Z"
}
```

### Course DTO
```json
{
  "id": 1,
  "title": "Java Basics",
  "description": "Learn Java fundamentals",
  "category": {
    "id": 1,
    "name": "Programming"
  },
  "instructor": {
    "id": 2,
    "name": "Jane Smith"
  },
  "students_count": 45,
  "rating": 4.5,
  "image_url": "https://...",
  "status": "ACTIVE",
  "created_at": "2026-01-10T00:00:00Z"
}
```

### Enrollment DTO
```json
{
  "id": 100,
  "student": {
    "id": 5,
    "name": "Student Name"
  },
  "course": {
    "id": 1,
    "title": "Java Basics"
  },
  "progress": 45,
  "status": "ACTIVE",
  "enrollment_date": "2026-03-15T10:30:00Z"
}
```

### Assignment Submission DTO
```json
{
  "id": 50,
  "assignment_id": 1,
  "student_id": 5,
  "submission_date": "2026-03-15T10:30:00Z",
  "status": "SUBMITTED",
  "file_url": "https://...",
  "points_earned": 85,
  "feedback": "Good work!",
  "graded_date": "2026-03-15T11:00:00Z"
}
```

### Quiz Attempt DTO
```json
{
  "attempt_id": 100,
  "quiz_id": 1,
  "student_id": 5,
  "started_at": "2026-03-15T10:30:00Z",
  "submitted_at": "2026-03-15T10:45:00Z",
  "score": 850,
  "percentage": 85,
  "passed": true,
  "feedback": "Great job!"
}
```

### Attendance Record DTO
```json
{
  "id": 1,
  "course_id": 1,
  "student_id": 5,
  "date": "2026-03-15",
  "status": "PRESENT"
}
```

### Course Statistics DTO
```json
{
  "course_id": 1,
  "title": "Java Basics",
  "total_students": 45,
  "active_students": 40,
  "completion_rate": 60,
  "average_score": 78.5,
  "engagement_rate": 85
}
```

---

## Error Handling

### Common HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Successful delete/update with no response body |
| 400 | Bad Request | Invalid input parameters |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., email duplicate) |
| 500 | Server Error | Internal server error |

### Error Response Format
```json
{
  "error": "Error message description",
  "message": "Detailed explanation",
  "timestamp": "2026-03-15T10:30:00Z",
  "status": 400
}
```

### Common Errors

#### Authentication Errors
```json
// Missing token
{
  "error": "Unauthorized",
  "message": "Authorization header is missing",
  "status": 401
}

// Invalid token
{
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "status": 401
}
```

#### Authorization Errors
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to perform this action",
  "status": 403
}
```

#### Validation Errors
```json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  },
  "status": 400
}
```

---

## Examples

### Complete Student Login Flow

1. **Register**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "name": "John Student",
    "role": "STUDENT"
  }'
```

2. **Login**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

Response: Save the `access_token`

3. **View Available Courses**
```bash
curl -X GET "http://localhost:8080/api/courses?page=1&size=10" \
  -H "Authorization: Bearer <access_token>"
```

4. **Enroll in Course**
```bash
curl -X POST http://localhost:8080/api/enrollments \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": 1
  }'
```

5. **View Student Dashboard**
```bash
curl -X GET http://localhost:8080/api/dashboard/student \
  -H "Authorization: Bearer <access_token>"
```

6. **Submit Assignment**
```bash
curl -X POST http://localhost:8080/api/assignments/1/submit \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@assignment.pdf"
```

### Complete Instructor Flow

1. **Login as Instructor**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@example.com",
    "password": "password123"
  }'
```

2. **Create Course**
```bash
curl -X POST http://localhost:8080/api/courses \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced React",
    "description": "Learn advanced React patterns",
    "category_id": 1,
    "status": "DRAFT"
  }'
```

3. **View Course Enrollments**
```bash
curl -X GET "http://localhost:8080/api/courses/1/enrollments?page=1&size=20" \
  -H "Authorization: Bearer <access_token>"
```

4. **Grade Assignment**
```bash
curl -X PUT http://localhost:8080/api/assignments/1/submissions/50/grade \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "points_earned": 85,
    "feedback": "Excellent work!",
    "status": "GRADED"
  }'
```

5. **View Course Analytics**
```bash
curl -X GET "http://localhost:8080/api/courses/1/analytics?start_date=2026-03-01&end_date=2026-03-31" \
  -H "Authorization: Bearer <access_token>"
```

---

## Best Practices for Frontend Integration

### 1. Token Management
- Store tokens in `localStorage` or `sessionStorage`
- Implement automatic token refresh on expiration
- Clear tokens on logout

### 2. Error Handling
- Check response status codes before processing data
- Display user-friendly error messages
- Log errors for debugging

### 3. Loading States
- Show loading indicators during API calls
- Disable buttons/inputs while loading
- Implement timeouts for long-running requests

### 4. Data Validation
- Validate user input before sending to API
- Use form validation libraries
- Show field-level error messages

### 5. Pagination
- Implement lazy loading or pagination UI
- Store page state in component
- Handle empty states gracefully

### 6. Real-time Updates
- Implement polling for frequently updated data
- Consider WebSocket for real-time features
- Cache data appropriately

---

**Questions or Issues?** Contact the backend development team or check the GitHub repository for more details.
