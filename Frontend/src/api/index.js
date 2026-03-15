import apiClient from './client'

// ─── Enrollments ──────────────────────────────────────────────────────────────
export const enrollmentsApi = {
  enroll:       (courseId) => apiClient.post('/enrollments', { course_id: courseId }),
  getMyCourses: (params = {}) => apiClient.get('/enrollments/my-courses', { params }),
  unenroll:     (enrollmentId) => apiClient.delete(`/enrollments/${enrollmentId}`),
}

// ─── Assignments ──────────────────────────────────────────────────────────────
export const assignmentsApi = {
  submit: (assignmentId, formData) =>
    apiClient.post(`/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  grade: (assignmentId, submissionId, data) =>
    apiClient.put(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, data),
}

// ─── Quizzes ──────────────────────────────────────────────────────────────────
export const quizzesApi = {
  start:  (quizId) => apiClient.post(`/quizzes/${quizId}/start`),
  submit: (quizId, data) => apiClient.post(`/quizzes/${quizId}/submit`, data),
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
