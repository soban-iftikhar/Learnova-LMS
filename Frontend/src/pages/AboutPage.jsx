import React from 'react'
import { BookOpen, Users, Award, Zap, Globe, Heart, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const STATS = [
  { label: 'Active Learners', value: '10,000+' },
  { label: 'Expert Instructors', value: '50+' },
  { label: 'Courses Available', value: '200+' },
  { label: 'Countries Reached', value: '30+' },
]

const VALUES = [
  { icon: BookOpen, title: 'Learn Without Limits', desc: 'Access world-class education anytime, anywhere. Our platform is designed to fit your schedule and learning style.' },
  { icon: Users,    title: 'Community-Driven',    desc: 'Join a thriving community of learners and instructors who collaborate, share knowledge, and grow together.' },
  { icon: Award,    title: 'Quality Content',     desc: 'Every course is crafted by vetted industry professionals and reviewed to ensure the highest learning outcomes.' },
  { icon: Zap,      title: 'Accelerated Growth',  desc: 'Our adaptive learning paths and intelligent progress tracking help you achieve your goals faster.' },
  { icon: Globe,    title: 'Global Reach',        desc: 'Learnova connects learners and instructors across the globe, fostering diverse perspectives.' },
  { icon: Heart,    title: 'Student-First',       desc: 'Everything we build is designed with the student experience in mind. Your success is our mission.' },
]

const TEAM = [
  { name: 'Sarah Chen',      role: 'CEO & Co-founder',     initials: 'SC', color: 'bg-brand-100 text-brand-700' },
  { name: 'Marcus Johnson',  role: 'CTO & Co-founder',     initials: 'MJ', color: 'bg-violet-100 text-violet-700' },
  { name: 'Amara Osei',      role: 'Head of Curriculum',   initials: 'AO', color: 'bg-amber-100 text-amber-700' },
  { name: 'Diego Ramirez',   role: 'Lead Instructor',      initials: 'DR', color: 'bg-sky-100 text-sky-700' },
]

const AboutPage = () => (
  <div className="animate-fade-in">
    {/* Hero */}
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-400 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative z-10">
        <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-sm font-medium mb-6">
          Our Story
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
          Empowering Learners<br />Around the World
        </h1>
        <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
          Learnova was founded with a simple belief: quality education should be accessible to everyone.
          We're building the platform that makes lifelong learning a reality.
        </p>
      </div>
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white/5" />
    </section>

    {/* Stats */}
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ label, value }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-brand-600 mb-1">{value}</p>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Mission */}
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3 block">Our Mission</span>
          <h2 className="text-3xl font-bold text-ink mb-5 leading-tight">
            Education that opens doors for everyone
          </h2>
          <p className="text-gray-500 leading-relaxed mb-4">
            We started Learnova after seeing how traditional education models leave too many people behind —
            whether due to geography, cost, or rigid schedules. We knew there was a better way.
          </p>
          <p className="text-gray-500 leading-relaxed mb-6">
            Today, our platform serves tens of thousands of learners who are upskilling, switching careers,
            and pursuing passions they never had the chance to explore before.
          </p>
          <Link to="/contact" className="btn-primary inline-flex">
            Get In Touch <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { color: 'bg-brand-500', label: 'Courses launched in 2025', val: '120+' },
            { color: 'bg-violet-500', label: 'Average course rating', val: '4.8 ★' },
            { color: 'bg-sky-500', label: 'Student satisfaction', val: '97%' },
          ].map(({ color, label, val }) => (
            <div key={label} className="card p-5">
              <div className={`w-3 h-3 rounded-full ${color} mb-3`} />
              <p className="text-2xl font-bold text-ink mb-1">{val}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="bg-surface-muted py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3 block">What We Believe</span>
          <h2 className="text-3xl font-bold text-ink">Our Core Values</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 hover:shadow-card-hover transition-shadow duration-300">
              <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                <Icon size={20} className="text-brand-500" />
              </div>
              <h3 className="font-semibold text-ink mb-2">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Team */}
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <span className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3 block">The People</span>
        <h2 className="text-3xl font-bold text-ink">Meet the Team</h2>
        <p className="text-gray-400 mt-3 max-w-xl mx-auto text-sm">
          A passionate group of educators, engineers, and designers building the future of online learning.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {TEAM.map(({ name, role, initials, color }) => (
          <div key={name} className="card p-6 text-center hover:shadow-card-hover transition-shadow">
            <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-xl font-bold mx-auto mb-4`}>
              {initials}
            </div>
            <p className="font-semibold text-ink">{name}</p>
            <p className="text-xs text-gray-400 mt-1">{role}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="bg-ink text-white py-16">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to start learning?</h2>
        <p className="text-white/60 mb-8">Join thousands of students already growing with Learnova.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/signup" className="btn-primary text-base px-8 py-3 rounded-xl">
            Get Started Free
          </Link>
          <Link to="/contact" className="btn-outline text-base px-8 py-3 rounded-xl border-white/20 text-white hover:bg-white/10 hover:border-white/40">
            Talk to Us
          </Link>
        </div>
      </div>
    </section>
  </div>
)

export default AboutPage
