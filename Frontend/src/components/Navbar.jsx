import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User, BookOpen, Home, Compass, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg w-10 h-10 flex items-center justify-center group-hover:shadow-lg transition-shadow">
              <BookOpen size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent hidden sm:inline">
              Learnova
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium text-sm"
            >
              <Home size={18} />
              Dashboard
            </Link>
            <Link
              to="/courses"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium text-sm"
            >
              <Compass size={18} />
              Courses
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium text-sm"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium text-sm"
            >
              Contact
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline max-w-xs truncate">
                  {user?.email}
                </span>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-fadeIn">
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                  >
                    <User size={18} />
                    <span className="text-sm font-medium">My Profile</span>
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-all"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-gray-200 pt-4 animate-slideInLeft">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium"
            >
              <div className="flex items-center gap-2">
                <Home size={18} />
                Dashboard
              </div>
            </Link>
            <Link
              to="/courses"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium"
            >
              <div className="flex items-center gap-2">
                <Compass size={18} />
                Courses
              </div>
            </Link>
            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium"
            >
              Contact
            </Link>
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium"
            >
              <div className="flex items-center gap-2">
                <User size={18} />
                My Profile
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all font-medium"
            >
              <div className="flex items-center gap-2">
                <LogOut size={18} />
                Logout
              </div>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
