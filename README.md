# Learnova 🎓

Learnova is a lightweight and secure **Learning Management System (LMS)** designed for students and instructors to manage courses efficiently. Built with **Spring Boot**, **Spring Security** and **JWT Authentication**, this backend project provides RESTful APIs for core LMS functionalities like user registration, login, and course management.

---

## Tech Stack

- **Java 21**
- **Spring Boot 3.4**
- **Spring Data JPA**
- **Spring Security**
- **JWT (JSON Web Token)**
- **MySQL**
- **Postman** (for testing)
- **OAuth2 (Google & GitHub Login)**

---

## Key Features

- ✅ Student & Instructor **Sign Up / Login**
- ✅ Secure **JWT-based authentication**
- ✅ **Role-Based Access Control** (RBAC)
- ✅ Course CRUD (Create, Read, Update, Delete)
- ✅ **OAuth2** Login via Google & GitHub
- ✅ Passwords stored using **BCrypt**
- ✅ CSRF disabled for API use
- ✅ Custom Exception Handling
- ✅ Tested with **Postman**

---

## Project Structure

```bash
learnova/
├── config/            # Spring Security config
├── controller/        # REST API controllers
├── dtos/              # Request/Response DTOs
├── model/             # Entity classes
├── repository/        # JPA repositories
├── service/           # Business logic
└── LearnovaApplication.java



