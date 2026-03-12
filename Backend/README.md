# Learnova LMS - Backend

Spring Boot 3.4.4 REST API for Learning Management System with JWT authentication and role-based access control.

## Quick Start

### Prerequisites
- Java 21 JDK
- MySQL 8.0+
- Maven 3.9+

### Build & Run

```bash
# Build JAR
./mvnw clean package -DskipTests

# Run application
export DB_URL=jdbc:mysql://your-mysql-host:3306/learnova?useSSL=true&serverTimezone=UTC
export DB_USERNAME=learnova_user
export DB_PASSWORD=your_password
export JWT_SECRET=your-long-random-secret-key-min-256-bits
export JWT_EXPIRATION_MS=86400000

java -Xmx2g -Xms1g -jar target/Learnova-0.0.1-SNAPSHOT.jar
```

App runs on `http://localhost:8080`

## Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| `DB_URL` | Yes | `jdbc:mysql://localhost:3306/learnova?useSSL=true&serverTimezone=UTC` |
| `DB_USERNAME` | Yes | `learnova_user` |
| `DB_PASSWORD` | Yes | `secure_password` |
| `JWT_SECRET` | Yes | `long-random-key-256-bits-or-more` |
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
- MySQL 8.0
- JJWT 0.12.6 (JWT)
- Maven build
