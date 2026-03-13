import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this to a backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
    
    // Reset success message after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12 mb-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-blue-100">
            We'd love to hear from you. Get in touch with us today!
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Mail size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Email</h3>
            </div>
            <p className="text-gray-600 mb-2">support@learnova.com</p>
            <p className="text-gray-600">hello@learnova.com</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Phone size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Phone</h3>
            </div>
            <p className="text-gray-600 mb-2">+1 (555) 123-4567</p>
            <p className="text-gray-600 text-sm text-gray-500">
              Mon-Fri, 9am-6pm EST
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <MapPin size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Address</h3>
            </div>
            <p className="text-gray-600">123 Education Street</p>
            <p className="text-gray-600">Learning City, LC 12345</p>
          </div>
        </div>

        {/* Contact Form and Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Send us a Message
            </h2>

            {submitted && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                ✓ Thank you for your message! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="How can we help?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  placeholder="Your message here..."
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Send Message
              </button>
            </form>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  What is Learnova?
                </h3>
                <p className="text-gray-600">
                  Learnova is an online learning management system that provides
                  courses, quizzes, and interactive content for students of all
                  levels.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  How do I enroll in a course?
                </h3>
                <p className="text-gray-600">
                  Simply browse our course catalog, click on a course you're
                  interested in, and click the "Enroll Now" button.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Are there any fees?
                </h3>
                <p className="text-gray-600">
                  Many of our courses are free, while some premium courses may
                  have a one-time or subscription fee.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Can I get a certificate?
                </h3>
                <p className="text-gray-600">
                  Yes! Upon successful completion of a course, you'll receive a
                  certificate that you can share with your network.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  How long do I have access to courses?
                </h3>
                <p className="text-gray-600">
                  You have lifetime access to all courses you enroll in, unless
                  otherwise specified by the instructor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
