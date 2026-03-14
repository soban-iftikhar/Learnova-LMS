import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useToast } from '../../components/common/Toast'

export default function EditCourse() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: 'Java Basics',
    description: 'Learn Java fundamentals and OOP concepts',
    category_id: '1',
    image_url: 'https://example.com/java.jpg',
    status: 'ACTIVE'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      // In real app: await coursesApi.updateCourse(courseId, formData)
      toast.success('Course updated successfully!')
      navigate('/teacher/courses')
    } catch (error) {
      toast.error('Failed to update course')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink mb-2">Edit Course</h1>
      <p className="text-gray-500 mb-8">Update course details and content.</p>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Course Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Java Basics"
            required
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what students will learn..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              >
                <option value="1">Programming</option>
                <option value="2">Web Development</option>
                <option value="3">Design</option>
                <option value="4">Business</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <Input
            label="Image URL"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              Save Changes
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/teacher/courses')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
