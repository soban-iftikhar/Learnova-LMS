import apiClient from './client'

// ─── Profile ──────────────────────────────────────────────────────────────────
export const profileApi = {
  get:    ()     => apiClient.get('/profile/me'),
  update: (data) => apiClient.put('/profile/me', data),
}

// ─── Enrollments ──────────────────────────────────────────────────────────────
export const enrollmentsApi = {
  enroll:       (courseId)    => apiClient.post('/enrollments', { course_id: courseId }),
  getMyCourses: (params = {}) => apiClient.get('/enrollments/my-courses', { params }),
  unenroll:     (enrollmentId)=> apiClient.delete(`/enrollments/${enrollmentId}`),
}

// ─── Videos ───────────────────────────────────────────────────────────────────
export const videosApi = {
  getAll:  (courseId)              => apiClient.get(`/courses/${courseId}/videos`),
  create:  (courseId, data)        => apiClient.post(`/courses/${courseId}/videos`, data),
  update:  (courseId, videoId, data) => apiClient.put(`/courses/${courseId}/videos/${videoId}`, data),
  delete:  (courseId, videoId)     => apiClient.delete(`/courses/${courseId}/videos/${videoId}`),
}

// ─── Assignments ──────────────────────────────────────────────────────────────
export const assignmentsApi = {
  getAll:               (courseId)       => apiClient.get(`/courses/${courseId}/assignments`),
  create:               (courseId, data) => apiClient.post(`/courses/${courseId}/assignments`, data),
  // Student: submit an assignment (multipart form)
  submit: (assignmentId, formData) =>
    apiClient.post(`/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  // Teacher: get all submissions for one assignment
  getSubmissions: (assignmentId) =>
    apiClient.get(`/assignments/${assignmentId}/submissions`),
  // Teacher: get all submissions across a whole course
  getCourseSubmissions: (courseId) =>
    apiClient.get(`/courses/${courseId}/submissions`),
  // Student: get their own submissions
  mySubmissions: () => apiClient.get('/submissions/my'),
  // Teacher: grade a submission
  grade: (assignmentId, submissionId, data) =>
    apiClient.put(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, data),
}

// ─── Quizzes (student-facing) ─────────────────────────────────────────────────
export const quizzesApi = {
  getAll:  (courseId)      => apiClient.get(`/courses/${courseId}/quizzes`),
  start:   (quizId)        => apiClient.post(`/quizzes/${quizId}/start`),
  submit:  (quizId, data)  => apiClient.post(`/quizzes/${quizId}/submit`, data),
}

// ─── Quiz Management (teacher) ────────────────────────────────────────────────
export const quizManagementApi = {
  // Teacher: list ALL quizzes (draft + published) for a course
  listForCourse:   (courseId)                   => apiClient.get(`/courses/${courseId}/quizzes/manage`),
  create:          (courseId, data)             => apiClient.post(`/courses/${courseId}/quizzes`, data),
  update:          (quizId, data)               => apiClient.put(`/quizzes/${quizId}`, data),
  delete:          (quizId)                     => apiClient.delete(`/quizzes/${quizId}`),
  togglePublish:   (quizId, published)          => apiClient.put(`/quizzes/${quizId}/publish`, { published }),
  getQuestions:    (quizId)                     => apiClient.get(`/quizzes/${quizId}/questions`),
  addQuestion:     (quizId, data)               => apiClient.post(`/quizzes/${quizId}/questions`, data),
  updateQuestion:  (quizId, questionId, data)   => apiClient.put(`/quizzes/${quizId}/questions/${questionId}`, data),
  deleteQuestion:  (quizId, questionId)         => apiClient.delete(`/quizzes/${quizId}/questions/${questionId}`),
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

// ─── Attendance ───────────────────────────────────────────────────────────────
export const attendanceApi = {
  mark:              (data)     => apiClient.post('/attendance/mark', data),
  getStudentSummary: ()         => apiClient.get('/attendance/student'),
  getCourse:         (courseId) => apiClient.get(`/attendance/course/${courseId}`),
}

// ─── Chat (polling-based real-time) ───────────────────────────────────────────
export const chatApi = {
  getMessages: (courseId, since) =>
    apiClient.get(`/chat/${courseId}/messages`, { params: since ? { since } : {} }),
  send: (courseId, text) =>
    apiClient.post(`/chat/${courseId}/messages`, { text }),
}

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll:  (params = {}) => apiClient.get('/categories', { params }),
  create:  (data)        => apiClient.post('/categories', data),
  update:  (id, data)    => apiClient.put(`/categories/${id}`, data),
  delete:  (id)          => apiClient.delete(`/categories/${id}`),
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  getUsers:         (params = {}) => apiClient.get('/admin/users', { params }),
  getUserById:      (id)          => apiClient.get(`/admin/users/${id}`),
  updateUser:       (id, data)    => apiClient.put(`/admin/users/${id}`, data),
  deleteUser:       (id)          => apiClient.delete(`/admin/users/${id}`),
  updateUserStatus: (id, status)  => apiClient.put(`/admin/users/${id}/status`, { status }),
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getEngagement:      (params = {}) => apiClient.get('/analytics/engagement', { params }),
  getCourseAnalytics: (courseId, params = {}) =>
    apiClient.get(`/courses/${courseId}/analytics`, { params }),
}

// ─── Re-export courses ────────────────────────────────────────────────────────
export { coursesApi } from './courses'
