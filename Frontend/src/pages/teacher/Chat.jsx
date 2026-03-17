import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Send, MessageCircle, Users, Radio, User, ChevronLeft } from 'lucide-react'
import { dashboardApi, chatApi } from '../../api/index'
import { coursesApi } from '../../api/courses'
import { useAsync } from '../../hooks/index'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/common/Avatar'
import { SectionLoader } from '../../components/common/Spinner'
import { EmptyState } from '../../components/common/EmptyState'
import Badge from '../../components/common/Badge'

// Poll every 5 seconds instead of 3 to reduce request spam
const POLL = 5000

function ChatWindow({ courseId, courseName, recipientId, recipientName, broadcast, onBack }) {
  const { user } = useAuth()
  const channelId = broadcast ? String(courseId) : `${courseId}__${recipientId}`
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [lastTs, setLastTs] = useState(null)
  const bottomRef = useRef(null)
  const pollRef = useRef(null)
  const lastTsRef = useRef(null)  // Use ref to avoid recreating poll callback

  const load = useCallback(async () => {
    try {
      const res = await chatApi.getMessages(channelId)
      const msgs = res.data?.messages || []
      setMessages(msgs)
      if (msgs.length) {
        const ts = msgs[msgs.length - 1].timestamp
        setLastTs(ts)
        lastTsRef.current = ts
      }
    } catch {}
  }, [channelId])

  // Poll callback doesn't depend on lastTs — uses ref instead
  const poll = useCallback(async () => {
    try {
      const res = await chatApi.getMessages(channelId, lastTsRef.current)
      const more = res.data?.messages || []
      if (more.length) {
        setMessages(prev => {
          const seen = new Set(prev.map(m => String(m.id)))
          const fresh = more.filter(m => !seen.has(String(m.id)))
          return fresh.length ? [...prev, ...fresh] : prev
        })
        const ts = more[more.length - 1].timestamp
        setLastTs(ts)
        lastTsRef.current = ts
      }
    } catch {}
  }, [channelId])

  useEffect(() => {
    load()
  }, [load])

  // Interval only depends on poll, which is stable
  useEffect(() => {
    pollRef.current = setInterval(poll, POLL)
    return () => clearInterval(pollRef.current)
  }, [poll])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    setSending(true)
    try {
      const res = await chatApi.send(channelId, t)
      const msg = res.data
      if (!msg || !msg.id) {
        setSending(false)
        return
      }
      setMessages(prev => {
        const seen = new Set(prev.map(m => String(m.id)))
        return seen.has(String(msg.id)) ? prev : [...prev, msg]
      })
      setLastTs(msg.timestamp)
      setText('')
    } catch (err) {
      // Silent fail for UX
    }
    setSending(false)
  }

  const fmt = ts => { try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } catch { return '' } }

  return (
    <div className="card flex flex-col overflow-hidden" style={{ height: '600px' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-brand-500 text-white flex-shrink-0">
        <button onClick={onBack} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          {broadcast
            ? <Radio size={18} />
            : <Avatar name={recipientName} size="sm" />
          }
          <div>
            <p className="text-sm font-semibold">{broadcast ? 'Broadcast to All Students' : recipientName}</p>
            <p className="text-xs opacity-75">{courseName}</p>
          </div>
        </div>
        {broadcast && <Badge variant="warning" size="sm" className="ml-auto">Broadcast</Badge>}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {!messages.length && (
          <div className="text-center py-12">
            <MessageCircle size={32} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No messages yet.</p>
            <p className="text-xs text-gray-300 mt-1">Start the conversation!</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = String(msg.sender_id) === String(user?.id)
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              {!isMe && <Avatar name={msg.sender_name} size="sm" />}
              <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && (
                  <span className="text-xs text-gray-400 mb-1 ml-1">{msg.sender_name}</span>
                )}
                <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-white text-ink rounded-bl-sm shadow-sm'}`}>
                  {msg.text}
                </div>
                <span className="text-xs text-gray-300 mt-1 mx-1">{fmt(msg.timestamp)}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 flex-shrink-0 bg-white">
        <input value={text} onChange={e => setText(e.target.value)}
          placeholder={broadcast ? "Type broadcast message…" : `Message ${recipientName}…`}
          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        <button type="submit" disabled={!text.trim() || sending}
          className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 disabled:opacity-40 active:scale-95 transition-all">
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TeacherChat() {
  const [selected, setSelected] = useState(null) // { courseId, courseName, recipientId, recipientName, broadcast }
  const [activeCourse, setActiveCourse] = useState(null)

  const { data, loading } = useAsync(() => dashboardApi.getInstructorDashboard())
  const courses = data?.courses || []

  if (selected) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="page-header">
          <h1 className="page-title">Student Chat</h1>
          <p className="page-subtitle">Private messages and broadcasts.</p>
        </div>
        <ChatWindow {...selected} onBack={() => setSelected(null)} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <h1 className="page-title">Student Chat</h1>
        <p className="page-subtitle">Send private messages or broadcast to all students in a course.</p>
      </div>

      {loading ? <SectionLoader rows={3} />
      : !courses.length ? (
        <EmptyState icon={MessageCircle} title="No courses yet"
          description="Create a course first to chat with students." />
      ) : (
        <div className="space-y-6">
          {courses.map(course => (
            <CourseStudentList
              key={course.id}
              course={course}
              onSelect={(s) => setSelected(s)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CourseStudentList({ course, onSelect }) {
  const { data, loading } = useAsync(() => coursesApi.getEnrollments(course.id), [course.id])
  const students = (data?.content || []).filter(e => e.status !== 'DROPPED')

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-surface-muted border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
            <MessageCircle size={16} className="text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-ink text-sm">{course.title}</p>
            <p className="text-xs text-gray-400">{students.length} student{students.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {students.length > 0 && (
          <button
            onClick={() => onSelect({ courseId: course.id, courseName: course.title, broadcast: true })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 text-xs font-semibold rounded-xl hover:bg-amber-100 transition-colors">
            <Radio size={12} /> Broadcast to All
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-4"><SectionLoader rows={2} /></div>
      ) : !students.length ? (
        <div className="p-6 text-center">
          <p className="text-sm text-gray-400">No students enrolled yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {students.map(enrollment => {
            const s = enrollment.student
            return (
              <button key={enrollment.id}
                onClick={() => onSelect({
                  courseId: course.id, courseName: course.title,
                  recipientId: s?.id, recipientName: s?.name, broadcast: false,
                })}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-surface-muted transition text-left">
                <Avatar name={s?.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{s?.name}</p>
                  <p className="text-xs text-gray-400">{s?.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={enrollment.status === 'ACTIVE' ? 'success' : 'info'} size="sm">
                    {enrollment.status}
                  </Badge>
                  <MessageCircle size={16} className="text-brand-400" />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
