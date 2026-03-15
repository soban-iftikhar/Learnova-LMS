import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Send, MessageCircle, X, Minimize2 } from 'lucide-react'
import { chatApi } from '../../api/index'
import { useAuth } from '../../context/AuthContext'
import Avatar from './Avatar'

const POLL_INTERVAL = 3000 // 3 seconds

export default function CourseChat({ courseId, courseName, instructorName }) {
  const { user } = useAuth()
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState([])
  const [text, setText]         = useState('')
  const [sending, setSending]   = useState(false)
  const [lastTimestamp, setLastTimestamp] = useState(null)
  const bottomRef = useRef(null)
  const pollRef   = useRef(null)

  // Initial load
  const loadMessages = useCallback(async () => {
    try {
      const res = await chatApi.getMessages(courseId)
      setMessages(res.data?.messages || [])
      const msgs = res.data?.messages || []
      if (msgs.length) setLastTimestamp(msgs[msgs.length - 1].timestamp)
    } catch {}
  }, [courseId])

  // Poll for new messages
  const pollMessages = useCallback(async () => {
    if (!open) return
    try {
      const res = await chatApi.getMessages(courseId, lastTimestamp)
      const newMsgs = res.data?.messages || []
      if (newMsgs.length) {
        setMessages(prev => [...prev, ...newMsgs])
        setLastTimestamp(newMsgs[newMsgs.length - 1].timestamp)
      }
    } catch {}
  }, [courseId, lastTimestamp, open])

  // Load on open
  useEffect(() => {
    if (open) loadMessages()
  }, [open, loadMessages])

  // Start/stop polling when chat is open
  useEffect(() => {
    if (open) {
      pollRef.current = setInterval(pollMessages, POLL_INTERVAL)
    } else {
      clearInterval(pollRef.current)
    }
    return () => clearInterval(pollRef.current)
  }, [open, pollMessages])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const handleSend = async (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setSending(true)
    try {
      const res = await chatApi.send(courseId, trimmed)
      setMessages(prev => [...prev, res.data])
      setLastTimestamp(res.data.timestamp)
      setText('')
    } catch {}
    setSending(false)
  }

  const formatTime = (ts) => {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch { return '' }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-brand-500 text-white shadow-lg hover:bg-brand-600 active:scale-95 transition-all flex items-center justify-center"
          title="Open course chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ height: '420px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-brand-500 text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              <div>
                <p className="text-sm font-semibold leading-tight line-clamp-1">{courseName}</p>
                <p className="text-xs opacity-75">Chat with {instructorName || 'Instructor'}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!messages.length && (
              <div className="text-center py-8">
                <MessageCircle size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No messages yet.</p>
                <p className="text-xs text-gray-300">Start the conversation!</p>
              </div>
            )}
            {messages.map(msg => {
              const isMe = msg.sender_id === user?.id
              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                  {!isMe && (
                    <div className="w-7 h-7 rounded-full flex-shrink-0">
                      <Avatar name={msg.sender_name} size="sm" />
                    </div>
                  )}
                  <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isMe && (
                      <span className="text-xs text-gray-400 mb-1 ml-1">
                        {msg.sender_name}
                        {msg.sender_role === 'INSTRUCTOR' && (
                          <span className="ml-1 text-brand-500 font-medium">· Teacher</span>
                        )}
                      </span>
                    )}
                    <div className={`px-3 py-2 rounded-2xl text-sm ${
                      isMe
                        ? 'bg-brand-500 text-white rounded-br-sm'
                        : 'bg-gray-100 text-ink rounded-bl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-xs text-gray-300 mt-1 mx-1">{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend}
            className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 flex-shrink-0">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            />
            <button type="submit" disabled={!text.trim() || sending}
              className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all flex-shrink-0">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
