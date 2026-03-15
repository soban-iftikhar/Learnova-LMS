import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Image } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useToast } from '../../components/common/Toast'
import { coursesApi } from '../../api/courses'
import { PageLoader } from '../../components/common/Spinner'
import { ErrorState } from '../../components/common/EmptyState'

const CATEGORIES = ['Programming', 'Web Development', 'Design', 'Data Science', 'Business', 'Mathematics', 'Science', 'Language']

export default function EditCourse() {
  const { courseId } = useParams()
  const navigate     = useNavigate()
  const toast        = useToast()
  const [loading, setLoading]     = useState(false)
  const [fetching, setFetching]   = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', category: '', image_url: '', status: 'ACTIVE' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    coursesApi.getById(courseId)
      .then(res => {
        const c = res.data
        setForm({
          title:       c.title        || '',
          description: c.description  || '',
          category:    c.category?.name || '',
          image_url:   c.image_url    || '',
          status:      c.status       || 'ACTIVE',
        })
      })
      .catch(err => setFetchError(err?.response?.data?.error || 'Failed to load course'))
      .finally(() => setFetching(false))
  }, [courseId])

  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title       = 'Course title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.category)           e.category    = 'Please select a category'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(er => ({ ...er, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      setLoading(true)
      await coursesApi.update(courseId, {
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        image_url:   form.image_url || null,
        status:      form.status,
      })
      toast.success('Course updated successfully!')
      navigate('/teacher/courses')
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to update course.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <PageLoader />
  if (fetchError) return <ErrorState message={fetchError} onRetry={() => window.location.reload()} />

  const inputClass = "w-full px-4 py-3 bg-surface-muted border rounded-xl text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
  const errorClass = (f) => errors[f] ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-brand-400'

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">Edit Course</h1>
        <p className="page-subtitle">Update your course details.</p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-muted">Course Title <span className="text-red-500">*</span></label>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="e.g., Introduction to Python"
              className={`${inputClass} ${errorClass('title')}`} />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-muted">Description <span className="text-red-500">*</span></label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Describe what students will learn…" rows={4}
              className={`${inputClass} ${errorClass('description')} resize-none`} />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-muted">Category <span className="text-red-500">*</span></label>
              <select name="category" value={form.category} onChange={handleChange}
                className={`${inputClass} ${errorClass('category')}`}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-muted">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className={`${inputClass} border-gray-200 focus:ring-brand-400`}>
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <Input label="Cover Image URL (optional)" name="image_url" value={form.image_url}
            onChange={handleChange} placeholder="https://example.com/cover.jpg"
            leftIcon={<Image size={16} />} />

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/teacher/courses')}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
