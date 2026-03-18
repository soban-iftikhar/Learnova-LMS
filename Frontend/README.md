# Learnova LMS - Frontend

Modern, responsive web interface for the Learnova Learning Management System built with React and Vite.

## Tech Stack

- **React 18**
- **Vite 5.4**
- **Tailwind CSS**
- **Axios**
- **Lucide React** (Icons)
- **React Router**

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
cd Frontend
npm install
```

### Development

```bash
npm run dev
```

Server runs at `http://localhost:5173`

### Build

```bash
npm run build
```

## Environment Variables

Create `.env.local`:

```bash
VITE_API_URL=https://your-backend-url/api
```

For local development:
```bash
VITE_API_URL=http://localhost:8080/api
```

## Project Structure

```
Frontend/
├── src/
│   ├── api/              # API clients (Axios instances)
│   ├── components/       # Reusable React components
│   │   ├── common/       # Common components (Button, Input, Modal, etc.)
│   │   └── layout/       # Layout components (Navbar, Sidebar, etc.)
│   ├── context/          # React Context (Auth, Theme)
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   │   ├── admin/        # Admin dashboard pages
│   │   ├── student/      # Student pages
│   │   └── teacher/      # Teacher pages
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── index.html            # HTML template
└── vite.config.js        # Vite configuration
```

## User Roles

- **Student**: Browse courses, enroll, submit assignments, take quizzes
- **Instructor**: Create and manage courses, student communications
- **Admin**: Manage users, courses, and system settings

## Deployment

Deployed on Vercel. Environment variables are automatically set during build.

## Default Credentials

- **Admin**: admin@learnova.io / admin123
- **Test Student**: student@learnova.io / password123
- **Test Instructor**: teacher@learnova.io / password123
