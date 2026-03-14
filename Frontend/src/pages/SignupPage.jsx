import React from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, BookOpen, ArrowRight } from 'lucide-react'
import Logo from '../components/common/Logo'
import Button from '../components/common/Button'

const SignupPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-100 px-4 sm:px-6 lg:px-12 py-4">
        <Logo />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-4xl font-bold text-ink mb-4">Start Your Learning Journey</h1>
          <p className="text-gray-500 text-lg mb-12">Choose your path and join thousands of students and teachers on Learnova.</p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Student Card */}
            <Link to="/signup/student" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 shadow-sm border border-blue-100 hover:shadow-lg transition-all h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <GraduationCap size={32} className="text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-ink mb-3">Student</h2>
                  <p className="text-gray-600 mb-4">Explore thousands of courses from expert instructors and learn at your own pace.</p>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li>✓ Access to full course library</li>
                    <li>✓ Learn from industry experts</li>
                    <li>✓ Track your progress</li>
                    <li>✓ Get certified</li>
                  </ul>
                </div>
                <Button className="w-full mt-8 bg-blue-600 hover:bg-blue-700">
                  Sign up as Student
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </Link>

            {/* Instructor Card */}
            <Link to="/signup/teacher" className="group">
              <div className="bg-gradient-to-br from-brand-50 to-orange-50 rounded-2xl p-8 shadow-sm border border-brand-100 hover:shadow-lg transition-all h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 rounded-xl bg-brand-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <BookOpen size={32} className="text-brand-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-ink mb-3">Instructor</h2>
                  <p className="text-gray-600 mb-4">Share your expertise and build a professional presence by creating courses.</p>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li>✓ Create and publish courses</li>
                    <li>✓ Reach global audience</li>
                    <li>✓ Earn from your expertise</li>
                    <li>✓ Build your portfolio</li>
                  </ul>
                </div>
                <Button className="w-full mt-8 bg-brand-600 hover:bg-brand-700">
                  Become an Instructor
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </Link>
          </div>

          <p className="text-gray-500">
            Already have an account? <Link to="/login" className="text-brand-600 hover:text-brand-700 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
