import React, { useState } from 'react'
import { Mail, MessageSquare, MapPin, Phone, Send, Clock, CheckCircle2 } from 'lucide-react'
import Input from '../components/common/Input'
import Button from '../components/common/Button'

const FAQS = [
  { q: 'How do I enroll in a course?', a: 'Simply sign up, browse our course catalog, and click "Enroll". Most courses are free to start.' },
  { q: 'Can I access courses on mobile?', a: 'Yes! Learnova is fully responsive and works seamlessly on all devices.' },
  { q: 'Do I get a certificate?', a: 'Yes, you receive a digital certificate upon successfully completing a course.' },
]

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate sending
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
  }

  const setField = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-ink to-ink-soft text-white py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium mb-5">
            Get In Touch
          </span>
          <h1 className="text-4xl font-bold mb-4">We'd love to hear from you</h1>
          <p className="text-white/60 text-lg">
            Have a question, feedback, or just want to say hi? Our team is here to help.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: Contact info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-ink mb-5">Contact Info</h2>
              <div className="space-y-4">
                {[
                  { icon: Mail,    label: 'Email',   value: 'hello@learnova.io' },
                  { icon: Phone,   label: 'Phone',   value: '+1 (555) 000-1234' },
                  { icon: MapPin,  label: 'Address', value: '123 Learning Lane, San Francisco, CA' },
                  { icon: Clock,   label: 'Hours',   value: 'Mon–Fri, 9am–6pm PST' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={16} className="text-brand-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-medium text-ink">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social */}
            <div>
              <p className="text-sm font-semibold text-ink mb-3">Follow Us</p>
              <div className="flex gap-2">
                {['Twitter', 'LinkedIn', 'GitHub'].map(s => (
                  <button key={s} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Response time */}
            <div className="card p-4 bg-brand-50 border-brand-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                <span className="text-xs font-semibold text-brand-700">Typical Response Time</span>
              </div>
              <p className="text-sm text-brand-600">We usually reply within 24 hours.</p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} className="text-brand-500" />
                  </div>
                  <h3 className="text-xl font-bold text-ink mb-2">Message Sent!</h3>
                  <p className="text-gray-400 max-w-xs">
                    Thanks for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                    className="mt-6 text-sm text-brand-500 hover:text-brand-600 font-medium"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-ink mb-6">Send us a message</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input
                        label="Your name"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={setField('name')}
                        required
                      />
                      <Input
                        label="Email address"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={setField('email')}
                        required
                      />
                    </div>
                    <Input
                      label="Subject"
                      placeholder="What's this about?"
                      value={form.subject}
                      onChange={setField('subject')}
                      required
                    />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-ink-muted">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Tell us more…"
                        value={form.message}
                        onChange={setField('message')}
                        required
                        className="w-full px-4 py-3 bg-surface-muted border border-gray-200 rounded-xl text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all duration-200 resize-none"
                      />
                    </div>
                    <Button type="submit" loading={loading} size="lg" rightIcon={<Send size={16} />}>
                      Send Message
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3 block">FAQ</span>
            <h2 className="text-2xl font-bold text-ink">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-muted transition-colors"
                >
                  <span className="text-sm font-semibold text-ink">{faq.q}</span>
                  <MessageSquare size={16} className={`flex-shrink-0 ml-4 transition-colors ${openFaq === i ? 'text-brand-500' : 'text-gray-300'}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 border-t border-gray-50">
                    <p className="text-sm text-gray-500 pt-3 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
