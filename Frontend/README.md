# Learnova Frontend - Student LMS Application

A complete, responsive React-based frontend for the Learnova Learning Management System.

## Features

- ✅ Complete student pages: Dashboard, Courses, Course Details, Quiz, Profile, About, Contact
- 🔐 JWT authentication with protected routes
- 🎨 Responsive design for all devices
- 🔗 Full backend API integration
- ⚡ Built with React + Vite + Tailwind CSS

## Quick Start

```bash
npm install        # Install dependencies
npm run dev        # Start development server
npm run build      # Build for production
```

## Routes

- `/login` - Login (public)
- `/dashboard` - Student dashboard (protected)
- `/courses` - Course discovery (protected)
- `/course/:id` - Course details (protected)
- `/quiz/:id` - Quiz interface (protected)
- `/profile` - Student profile (protected)
- `/about` - About page (public)
- `/contact` - Contact page (public)

## Demo Credentials

Email: `student@test.com`
Password: `student123`

## API Base URL

The frontend connects to: `http://localhost:8080/api`

Edit `src/services/api.js` to change the endpoint.

## Build Output

```
dist/index.html              0.45 kB
dist/assets/index.css        0.00 kB
dist/assets/index.js       323.76 kB (gzip: 99.33 kB)
```

## Learn More

Start backend with: `cd Backend && bash run.sh`
Start frontend with: `npm run dev`
