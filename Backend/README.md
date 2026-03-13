# Learnova LMS - Backend

Spring Boot 3.4.4 REST API for Learning Management System with JWT authentication and role-based access control.

## Quick Start

### Prerequisites
- Java 21 JDK
- PostgreSQL 12+ (or use free cloud option)
- Maven 3.9+

### Setup

**Option 1: Free Cloud PostgreSQL (Recommended)**
1. Sign up at one of these (all have free tier):
   - https://neon.tech/ (easiest)
   - https://supabase.com/
   - https://railway.app/
   - https://render.com/

2. Create a project and get:
   - Host (e.g., `ep-cool-name.us-west-2.neon.tech`)
   - Database name (e.g., `neondb`)
   - Username (e.g., `neondb_owner`)
   - Password (generated for you)

**Option 2: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Create database
createdb learnova

# Create user
psql -c "CREATE USER learnova_user WITH PASSWORD 'your_password';"
psql -c "ALTER ROLE learnova_user WITH CREATEDB;"
```

### Build & Run

```bash
# Build JAR
./mvnw clean package -DskipTests

# Set environment variables
export DB_URL=jdbc:postgresql://your-host:5432/learnova?sslmode=require
export DB_USERNAME=your_username
export DB_PASSWORD=your_password
export JWT_SECRET=$(openssl rand -base64 256)
export JWT_EXPIRATION_MS=86400000

# Run application
java -Xmx2g -Xms1g -jar target/Learnova-0.0.1-SNAPSHOT.jar
```

App runs on `http://localhost:8080`

## Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| `DB_URL` | Yes | `jdbc:postgresql://ep-cool-name.us-west-2.neon.tech:5432/learnova?sslmode=require` |
| `DB_USERNAME` | Yes | `neondb_owner` |
| `DB_PASSWORD` | Yes | `your_secure_password` |
| `JWT_SECRET` | Yes | `your-long-random-secret-key-min-256-bits` |
| `JWT_EXPIRATION_MS` | No | `86400000` (24 hours) |

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password

### Student Endpoints (13)
- `GET /api/students/{id}` - Get student profile
- `GET /api/students/{id}/enrollments` - List enrollments
- `POST /api/enrollment` - Enroll in course
- `GET /api/quiz/{quizId}` - Get quiz details
- `POST /api/quiz/{quizId}/submit` - Submit quiz answers
- `GET /api/students/{id}/quiz-results` - Get quiz results

### Course Endpoints (8)
- `GET /api/courses` - List all courses
- `GET /api/courses/search` - Search courses
- `GET /api/courses/{id}` - Get course details
- `GET /api/courses/{courseId}/content` - Get course materials

### Instructor Endpoints (20)
- `POST /api/instructor/course` - Create course
- `PUT /api/instructor/course/{courseId}` - Update course
- `POST /api/instructor/{courseId}/content/video` - Upload video
- `POST /api/instructor/{courseId}/quiz` - Create quiz
- `GET /api/instructor/quiz/{quizId}/statistics` - Get quiz stats

### Admin Endpoints (21)
- `GET /api/admin/instructors` - List instructors
- `GET /api/admin/students` - List students
- `POST /api/admin/course/assign` - Assign course to instructor
- `GET /api/admin/analytics/system` - System analytics

## Database Schema

11 entities with proper relationships:
- User (Student, Instructor)
- Course, Enrollment
- CourseContent (Video, PDF)
- Quiz, QuizQuestion, StudentAnswer
- Attendance

Auto-created on first run via Hibernate DDL.

## Security

- JWT token authentication
- Role-based access (ADMIN, INSTRUCTOR, STUDENT)
- Password hashing (BCrypt)
- SQL injection prevention
- CSRF protection

## Technology Stack

- Spring Boot 3.4.4
- Spring Security 6.2
- Spring Data JPA + Hibernate 6.6.11
- PostgreSQL 12+
- JJWT 0.12.6 (JWT)
- Maven build
