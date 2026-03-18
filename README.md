# Learnova LMS

A modern Learning Management System (LMS) platform for managing courses, students, and instructors. Built with a Spring Boot backend and React frontend.

## 🎯 Features

- **Course Management**: Create, update, and manage courses
- **Student Enrollment**: Browse and enroll in courses
- **Quizzes & Assignments**: Take assessments and submit work
- **Real-time Chat**: Communication between students and instructors
- **Dashboard Analytics**: Track progress and engagement
- **Role-Based Access**: Student, Instructor, and Admin roles
- **Secure Authentication**: JWT-based authentication with refresh tokens
- **OAuth2 Login**: Google and GitHub integration
- **Responsive Design**: Mobile-friendly interface

## 📁 Project Structure

```
Learnova-LMS/
├── Backend/              # Spring Boot REST API
├── Frontend/             # React web application
└── README.md             # This file
```

## 🚀 Quick Start

### Backend Setup

```bash
cd Backend
export DB_URL=jdbc:postgresql://host:port/db?sslmode=require
export DB_USERNAME=username
export DB_PASSWORD=password
export JWT_SECRET=your_secret_key
export ADMIN_EMAIL=admin@learnova.io
export ADMIN_PASSWORD=admin123

./mvnw clean package -DskipTests
java -jar target/Learnova-0.0.1-SNAPSHOT.jar
```

API runs at `http://localhost:8080`

### Frontend Setup

```bash
cd Frontend
npm install
VITE_API_URL=http://localhost:8080/api npm run dev
```

Frontend runs at `http://localhost:5173`

## 🛠 Tech Stack

### Backend
- Java 21
- Spring Boot 3.4.4
- PostgreSQL
- Spring Security
- JWT Authentication

### Frontend
- React 18
- Vite 5.4
- Tailwind CSS
- Axios
- React Router

## 📱 User Roles

| Role | Access | Capabilities |
|------|--------|--------------|
| **Student** | Student portal | Browse courses, enroll, submit assignments, take quizzes |
| **Instructor** | Teacher dashboard | Create courses, manage content, view student progress |
| **Admin** | Admin panel | Manage users, courses, view analytics |

## 🔐 Default Credentials

```
Admin:      admin@learnova.io / admin123
Student:    student@learnova.io / password123
Instructor: teacher@learnova.io / password123
```

## 📚 API Documentation

Key endpoints:

- `/api/auth/*` - Authentication (register, login, refresh)
- `/api/courses` - Course management
- `/api/enrollments` - Enrollment management
- `/api/dashboard/*` - User dashboards
- `/api/quizzes` - Quiz management
- `/api/chat/*` - Real-time messaging

## 🌐 Deployment

- **Backend**: Deployed on Render at `https://learnova-56ae.onrender.com`
- **Frontend**: Deployed on Vercel at `https://learnova-lms-delta.vercel.app`

## 📖 Documentation

- [Backend README](./Backend/README.md)
- [Frontend README](./Frontend/README.md)

## 📝 License

This project is open source and available under the MIT License.
