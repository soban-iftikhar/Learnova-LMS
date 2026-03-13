import React from 'react';
import { BookOpen, Users, Award, Globe } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <BookOpen size={40} />,
      title: 'Rich Course Content',
      description:
        'Access high-quality educational materials including videos, PDFs, and interactive content.',
    },
    {
      icon: <Users size={40} />,
      title: 'Expert Instructors',
      description:
        'Learn from experienced educators dedicated to your success and growth.',
    },
    {
      icon: <Award size={40} />,
      title: 'Earn Certificates',
      description:
        'Receive certificates upon completion to showcase your achievements.',
    },
    {
      icon: <Globe size={40} />,
      title: 'Global Community',
      description: 'Join a diverse community of learners from around the world.',
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">About Learnova</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Empowering learners worldwide with accessible, high-quality
            education.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                At Learnova, we believe that quality education should be
                accessible to everyone, everywhere. Our mission is to provide a
                comprehensive learning platform that empowers students and
                professionals to achieve their educational and career goals.
              </p>
              <p className="text-lg text-gray-700">
                We combine cutting-edge technology with expert teaching to
                create an engaging and effective learning experience for all our
                users.
              </p>
            </div>
            <div className="bg-blue-100 rounded-lg h-64 flex items-center justify-center">
              <BookOpen size={128} className="text-blue-600 opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">
            Why Choose Learnova?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition"
              >
                <div className="text-blue-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">10,000+</div>
              <p className="text-blue-100 text-lg">Active Students</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <p className="text-blue-100 text-lg">Expert Courses</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">95%</div>
              <p className="text-blue-100 text-lg">Student Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">
            Our Team
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
            Our dedicated team is committed to providing the best learning
            experience possible. We combine expertise in education, technology,
            and user experience design.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Founder & CEO',
                bio: 'Educational technologist with 10+ years of experience',
              },
              {
                name: 'David Lee',
                role: 'Head of Curriculum',
                bio: 'Expert instructor specializing in STEM education',
              },
              {
                name: 'Emily Chen',
                role: 'CTO',
                bio: 'Full-stack developer passionate about learning platforms',
              },
            ].map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-8 text-center"
              >
                <div className="w-24 h-24 bg-blue-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users size={56} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-semibold mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of students already learning on Learnova
          </p>
          <a
            href="/courses"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Explore Courses
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;
