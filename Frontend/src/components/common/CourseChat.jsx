import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Send, MessageCircle, X } from 'lucide-react'
import { chatApi } from '../../api/index'
import { useAuth } from '../../context/AuthContext'
import Avatar from './Avatar'

const POLL = 3000

/**
 * Student private chat with teacher.
 * Channel: courseId__studentId  (private)
 * Also listens on courseId (broadcast from teacher)
 */
export default function CourseChat({ courseId, courseName, instructorName }) {
  const { user } = useAuth()
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState([])
  const [text, setText]         = useState('')
  const [sending, setSending]   = useState(false)
  const [lastTs, setLastTs]     = useState(null)
  const bottomRef = useRef(null)
  const pollRef   = useRef(null)

  // Private channel student ↔ teacher
  const privateChannel    = `${courseId}__${user?.id}`
  // Broadcast channel from teacher
  const broadcastChannel  = String(courseId)

  const loadAndMerge = useCallback(async () => {
    try {
      const [privRes, bcastRes] = await Promise.all([
        chatApi.getMessages(privateChannel),
        chatApi.getMessages(broadcastChannel),
      ])
      const priv  = privRes.data?.messages  || []
      const bcast = bcastRes.data?.messages || []
      // Merge and sort by timestamp, deduplicate by id+channel
      const merged = [...priv.map(m => ({ ...m, _ch: 'private' })),
                      ...bcast.map(m => ({ ...m, _ch: 'broadcast' }))]
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      setMessages(merged)
      const latest = merged[merged.length - 1]
      if (latest) setLastTs(latest.timestamp)
    } catch {}
  }, [privateChannel, broadcastChannel])

  const pollNew = useCallback(async () => {
    if (!open) return
    try {
      const [privRes, bcastRes] = await Promise.all([
        chatApi.getMessages(privateChannel, lastTs),
        chatApi.getMessages(broadcastChannel, lastTs),
      ])
      const fresh = [
        ...(privRes.data?.messages  || []).map(m => ({ ...m, _ch: 'private' })),
        ...(bcastRes.data?.messages || []).map(m => ({ ...m, _ch: 'broadcast' })),
      ].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      if (fresh.length) {
        setMessages(prev => {
          const seen = new Set(prev.map(m => `${m._ch}:${m.id}`))
          const add  = fresh.filter(m => !seen.has(`${m._ch}:${m.id}`))
          return add.length ? [...prev, ...add] : prev
        })
        setLastTs(fresh[fresh.length - 1].timestamp)
      }
    } catch {}
  }, [privateChannel, broadcastChannel, lastTs, open])

  useEffect(() => { if (open) loadAndMerge() }, [open, loadAndMerge])
  useEffect(() => {
    if (open) { pollRef.current = setInterval(pollNew, POLL) }
    else       { clearInterval(pollRef.current) }
    return () => clearInterval(pollRef.current)
  }, [open, pollNew])
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const handleSend = async (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    setSending(true)
    try {
      // Student always sends on private channel
      const res = await chatApi.send(privateChannel, t)
      const msg = { ...res.data, _ch: 'private' }
      setMessages(prev => {
        const seen = new Set(prev.map(m => `${m._ch}:${m.id}`))
        return seen.has(`${msg._ch}:${msg.id}`) ? prev : [...prev, msg]
      })
      setLastTs(msg.timestamp)
      setText('')
    } catch {}
    setSending(false)
  }

  const fmt = ts => { try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } catch { return '' } }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open && (
        <button onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-brand-500 text-white shadow-lg hover:bg-brand-600 active:scale-95 transition-all flex items-center justify-center"
          title="Chat with instructor">
          <MessageCircle size={24} />
        </button>
      )}

      {open && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ height: '460px' }}>
          <div className="flex items-center justify-between px-4 py-3 bg-brand-500 text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              <div>
                <p className="text-sm font-semibold line-clamp-1">{courseName}</p>
                <p className="text-xs opacity-75">Chat with {instructorName || 'Instructor'}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {!messages.length && (
              <div className="text-center py-8">
                <MessageCircle size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No messages yet.</p>
              </div>
            )}
            {messages.map((msg, idx) => {
              const isMe = String(msg.sender_id) === String(user?.id)
              const isBroadcast = msg._ch === 'broadcast' && !isMe
              return (
                <div key={`${msg._ch}:${msg.id}:${idx}`} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                  {!isMe && <Avatar name={msg.sender_name} size="sm" />}
                  <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && (
                      <span className="text-xs text-gray-400 mb-1 ml-1">
                        {msg.sender_name}
                        {msg.sender_role === 'INSTRUCTOR' && <span className="ml-1 text-brand-500 font-medium">· Teacher</span>}
                        {isBroadcast && <span className="ml-1 text-amber-500 font-medium">· Broadcast</span>}
                      </span>
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

          <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 flex-shrink-0 bg-white">
            <input value={text} onChange={e => setText(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <button type="submit" disabled={!text.trim() || sending}
              className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 disabled:opacity-40 active:scale-95 transition-all">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
