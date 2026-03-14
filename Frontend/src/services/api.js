const API_BASE = import.meta.env.VITE_API_BASE_URL

function getAuthHeader() {
  const token = localStorage.getItem('authToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Student APIs
export const studentAPI = {
  getCourses: async () => {
    const response = await fetch(`${API_BASE}/course/getAllCourses`, {
      headers: getAuthHeader(),
    })
    if (!response.ok) throw new Error('Failed to fetch courses')
    return response.json()
  },

  getEnrollments: async (studentId) => {
    const response = await fetch(`${API_BASE}/enrollment/student/${studentId}`, {
      headers: getAuthHeader(),
    })
    if (!response.ok) throw new Error('Failed to fetch enrollments')
    return response.json()
  },

  enrollCourse: async (studentId, courseId) => {
    const response = await fetch(`${API_BASE}/enrollment/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ studentId, courseId }),
    })
    if (!response.ok) throw new Error('Failed to enroll')
    return response.json()
  },

  unenrollCourse: async (studentId, courseId) => {
    const response = await fetch(`${API_BASE}/enrollment/unroll/${studentId}/${courseId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    })
    if (!response.ok) throw new Error('Failed to unenroll')
    return response.text()
  },

  getProfile: async (studentId) => {
    const response = await fetch(`${API_BASE}/student/searchStudent/${studentId}`, {
      headers: getAuthHeader(),
    })
    if (!response.ok) throw new Error('Failed to fetch profile')
    return response.json()
  },
}

// Course APIs
export const courseAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/course/getAllCourses`, {
      headers: getAuthHeader(),
    })
    if (!response.ok) throw new Error('Failed to fetch courses')
    return response.json()
  },

  getById: async (courseId) => {
    const response = await fetch(`${API_BASE}/course/searchCourseById/${courseId}`, {
      headers: getAuthHeader(),
    })
    if (!response.ok) throw new Error('Failed to fetch course')
    return response.json()
  },

  getDetails: async (courseId) => {
    const response = await fetch(`${API_BASE}/course/${courseId}/details`, {
      headers: getAuthHeader(),
    })
    if (!response.ok) throw new Error('Failed to fetch course details')
    return response.json()
  },

  getMaterials: async (courseId) => {
    const response = await fetch(`${API_BASE}/student/courses/${courseId}/content`, {
      headers: getAuthHeader(),
    })
    if (!response.ok) throw new Error('Failed to fetch materials')
    return response.json()
  },

  search: async (query) => {
    const response = await fetch(`${API_BASE}/course/search?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeader(),
    })
    if (!response.ok) throw new Error('Failed to search courses')
    return response.json()
  },
}

// Quiz APIs
export const quizAPI = {
  getQuizzes: async (courseId) => {
    const response = await fetch(`${API_BASE}/student/courses/${courseId}/quizzes`, {
      headers: getAuthHeader(),
    })
    if (!response.ok) throw new Error('Failed to fetch quizzes')
    return response.json()
  },

  getQuizDetails: async (quizId) => {
    const response = await fetch(`${API_BASE}/student/quizzes/${quizId}`, {
      headers: getAuthHeader(),
    })
    if (!response.ok) throw new Error('Failed to fetch quiz')
    return response.json()
  },

  submitAnswers: async (quizId, studentId, answers) => {
    const response = await fetch(
      `${API_BASE}/student/quizzes/${quizId}/submit?studentId=${studentId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(answers),
      }
    )
    if (!response.ok) throw new Error('Failed to submit quiz')
    return response.json()
  },
}
