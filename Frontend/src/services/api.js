import axios from 'axios';

const API_URL = 'http://localhost:8080';

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
    api.post('/student/login', { email, password }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Student Service
export const studentService = {
  getProfile: (studentId) =>
    api.get(`/student/searchStudent/${studentId}`),
  updateProfile: (studentId, data) =>
    api.post(`/student/updateStudent/${studentId}`, data),
  getEnrollments: (studentId) =>
    api.get(`/student/getEnrollment/${studentId}`),
  enrollCourse: (courseId) =>
    api.post('/enrollment/enroll', { courseId }),
  getAttendance: (studentId) =>
    api.get(`/student/attendance/${studentId}`),
};

// Course Service
export const courseService = {
  getAllCourses: () =>
    api.get('/course/getCourses'),
  searchCourses: (query) =>
    api.get(`/course/search?q=${query}`),
  getCourseDetails: (courseId) =>
    api.get(`/course/${courseId}`),
  getCourseContent: (enrollmentId) =>
    api.get(`/enrollment/content/${enrollmentId}`),
  getEnrollmentDetails: (enrollmentId) =>
    api.get(`/enrollment/getEnrollment/${enrollmentId}`),
  getEnrollmentContent: (enrollmentId) =>
    api.get(`/enrollment/content/${enrollmentId}`),
  getCourseQuizzes: (courseId) =>
    api.get(`/course/${courseId}/quizzes`),
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
