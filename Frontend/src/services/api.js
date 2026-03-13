import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Service
export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Student Service
export const studentService = {
  getProfile: (studentId) =>
    api.get(`/students/${studentId}`),
  updateProfile: (studentId, data) =>
    api.post(`/students/${studentId}/profile`, data),
  getEnrollments: (studentId) =>
    api.get(`/students/${studentId}/enrollments`),
  enrollCourse: (courseId) =>
    api.post('/enrollment', { courseId }),
  getAttendance: (studentId) =>
    api.get(`/students/${studentId}/attendance`),
};

// Course Service
export const courseService = {
  getAllCourses: () =>
    api.get('/courses'),
  searchCourses: (query) =>
    api.get(`/courses/search?q=${query}`),
  getCourseDetails: (courseId) =>
    api.get(`/courses/${courseId}/details`),
  getCourseContent: (enrollmentId) =>
    api.get(`/enrollment/${enrollmentId}/content`),
  getEnrollmentDetails: (enrollmentId) =>
    api.get(`/enrollment/${enrollmentId}`),
  getEnrollmentContent: (enrollmentId) =>
    api.get(`/enrollment/${enrollmentId}/content`),
  getCourseQuizzes: (courseId) =>
    api.get(`/courses/${courseId}/quizzes`),
  getQuizDetails: (quizId) =>
    api.get(`/quiz/${quizId}`),
  getQuizQuestions: (quizId) =>
    api.get(`/quiz/${quizId}/questions`),
  submitQuiz: (quizId, answers) =>
    api.post(`/quiz/${quizId}/submit`, answers),
};

// Quiz Service
export const quizService = {
  getQuiz: (quizId) =>
    api.get(`/quiz/${quizId}`),
  getQuizQuestions: (quizId) =>
    api.get(`/quiz/${quizId}/questions`),
  submitQuiz: (quizId, answers) =>
    api.post(`/quiz/${quizId}/submit`, answers),
  getQuizResults: (studentId) =>
    api.get(`/students/${studentId}/quiz-results`),
};

export default api;
