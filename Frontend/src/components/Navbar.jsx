import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
            <div className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center">
              L
            </div>
            Learnova
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="hover:text-blue-100 transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/courses"
                  className="hover:text-blue-100 transition"
                >
                  Courses
                </Link>
                <Link
                  to="/about"
                  className="hover:text-blue-100 transition"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="hover:text-blue-100 transition"
                >
                  Contact
                </Link>
                <div className="flex items-center gap-3 border-l pl-6">
                  <User size={20} />
                  <span>{user?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/about"
                  className="hover:text-blue-100 transition"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="hover:text-blue-100 transition"
                >
                  Contact
                </Link>
                <Link
                  to="/login"
                  className="bg-white text-blue-600 px-4 py-2 rounded font-semibold hover:bg-blue-50 transition"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block hover:bg-blue-500 px-4 py-2 rounded"
                >
                  Dashboard
                </Link>
                <Link
                  to="/courses"
                  className="block hover:bg-blue-500 px-4 py-2 rounded"
                >
                  Courses
                </Link>
                <Link
                  to="/about"
                  className="block hover:bg-blue-500 px-4 py-2 rounded"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="block hover:bg-blue-500 px-4 py-2 rounded"
                >
                  Contact
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/about"
                  className="block hover:bg-blue-500 px-4 py-2 rounded"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="block hover:bg-blue-500 px-4 py-2 rounded"
                >
                  Contact
                </Link>
                <Link
                  to="/login"
                  className="block bg-white text-blue-600 px-4 py-2 rounded font-semibold hover:bg-blue-50 transition"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
