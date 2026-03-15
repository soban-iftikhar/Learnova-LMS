import apiClient from './client'

// ─── Enrollments ──────────────────────────────────────────────────────────────
export const enrollmentsApi = {
  enroll:       (courseId) => apiClient.post('/enrollments', { course_id: courseId }),
  getMyCourses: (params = {}) => apiClient.get('/enrollments/my-courses', { params }),
  unenroll:     (enrollmentId) => apiClient.delete(`/enrollments/${enrollmentId}`),
}

// ─── Videos ───────────────────────────────────────────────────────────────────
export const videosApi = {
  getAll:  (courseId) => apiClient.get(`/courses/${courseId}/videos`),
  create:  (courseId, data) => apiClient.post(`/courses/${courseId}/videos`, data),
  update:  (courseId, videoId, data) => apiClient.put(`/courses/${courseId}/videos/${videoId}`, data),
  delete:  (courseId, videoId) => apiClient.delete(`/courses/${courseId}/videos/${videoId}`),
}

// ─── Assignments ──────────────────────────────────────────────────────────────
export const assignmentsApi = {
  getAll: (courseId) => apiClient.get(`/courses/${courseId}/assignments`),
  create: (courseId, data) => apiClient.post(`/courses/${courseId}/assignments`, data),
  submit: (assignmentId, formData) =>
    apiClient.post(`/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  grade: (assignmentId, submissionId, data) =>
    apiClient.put(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, data),
}

// ─── Quizzes (student) ────────────────────────────────────────────────────────
export const quizzesApi = {
  getAll:  (courseId) => apiClient.get(`/courses/${courseId}/quizzes`),
  start:   (quizId)   => apiClient.post(`/quizzes/${quizId}/start`),
  submit:  (quizId, data) => apiClient.post(`/quizzes/${quizId}/submit`, data),
}

// ─── Quiz Management (teacher) ────────────────────────────────────────────────
export const quizManagementApi = {
  create:          (courseId, data)           => apiClient.post(`/courses/${courseId}/quizzes`, data),
  update:          (quizId, data)             => apiClient.put(`/quizzes/${quizId}`, data),
  delete:          (quizId)                   => apiClient.delete(`/quizzes/${quizId}`),
  togglePublish:   (quizId, published)        => apiClient.put(`/quizzes/${quizId}/publish`, { published }),
  getQuestions:    (quizId)                   => apiClient.get(`/quizzes/${quizId}/questions`),
  addQuestion:     (quizId, data)             => apiClient.post(`/quizzes/${quizId}/questions`, data),
  updateQuestion:  (quizId, questionId, data) => apiClient.put(`/quizzes/${quizId}/questions/${questionId}`, data),
  deleteQuestion:  (quizId, questionId)       => apiClient.delete(`/quizzes/${quizId}/questions/${questionId}`),
}

// ─── Ratings ──────────────────────────────────────────────────────────────────
export const ratingsApi = {
  submit: (courseId, data) => apiClient.post(`/courses/${courseId}/rate`, data),
  get:    (courseId)       => apiClient.get(`/courses/${courseId}/rating`),
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStudentDashboard:    () => apiClient.get('/dashboard/student'),
  getInstructorDashboard: () => apiClient.get('/dashboard/instructor'),
  getAdminDashboard:      () => apiClient.get('/dashboard/admin'),
}

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll:  (params = {}) => apiClient.get('/categories', { params }),
  create:  (data) => apiClient.post('/categories', data),
  update:  (id, data) => apiClient.put(`/categories/${id}`, data),
  delete:  (id) => apiClient.delete(`/categories/${id}`),
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  getUsers:         (params = {}) => apiClient.get('/admin/users', { params }),
  getUserById:      (id) => apiClient.get(`/admin/users/${id}`),
  updateUser:       (id, data) => apiClient.put(`/admin/users/${id}`, data),
  deleteUser:       (id) => apiClient.delete(`/admin/users/${id}`),
  updateUserStatus: (id, status) => apiClient.put(`/admin/users/${id}/status`, { status }),
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getEngagement:      (params = {}) => apiClient.get('/analytics/engagement', { params }),
  getCourseAnalytics: (courseId, params = {}) =>
    apiClient.get(`/courses/${courseId}/analytics`, { params }),
}

// ─── Re-export courses ────────────────────────────────────────────────────────
export { coursesApi } from './courses'
