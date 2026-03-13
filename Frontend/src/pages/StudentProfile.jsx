import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentService } from '../services/api';
import { Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react';

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    completed: 0,
    inProgress: 0,
  });

  useEffect(() => {
    loadProfileData();
  }, [user?.id]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      // Load student profile
      const response = await studentService.getProfile(user?.id);
      setProfile(response.data);
      setFormData(response.data);

      // Load enrollment stats
      const enrollmentsResponse = await studentService.getEnrollments(
        user?.id
      );
      const enrollments = enrollmentsResponse.data;
      setStats({
        totalEnrolled: enrollments.length,
        completed: enrollments.filter(e => e.enrollmentStatus === 'COMPLETED')
          .length,
        inProgress: enrollments.filter(e => e.enrollmentStatus === 'ACTIVE')
          .length,
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await studentService.updateProfile(user?.id, formData);
      setProfile(formData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-gray-600">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">My Profile</h1>
        <p className="text-gray-600 mb-8">Manage your student profile and settings</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {stats.totalEnrolled}
            </div>
            <p className="text-gray-600">Total Enrolled</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {stats.inProgress}
            </div>
            <p className="text-gray-600">In Progress</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {stats.completed}
            </div>
            <p className="text-gray-600">Completed</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Personal Info</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Edit2 size={20} />
                Edit Profile
              </button>
            ) : null}
          </div>

          {!isEditing ? (
            // View Mode
            <div className="space-y-6">
              {/* User Email */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                  <Mail size={24} className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {user?.email || profile?.email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                  <Phone size={24} className="text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {profile?.phoneNumber || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <div className="flex items-center gap-3">
                  <MapPin size={24} className="text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {profile?.location || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {profile?.bio && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Bio</p>
                  <p className="text-gray-800">{profile.bio}</p>
                </div>
              )}
            </div>
          ) : (
            // Edit Mode
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="Enter your location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  placeholder="Tell us about yourself"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <Save size={20} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition"
                >
                  <X size={20} />
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Learning Preferences (Optional Section) */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Learning Preferences
          </h3>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="text-gray-800">
                Email notifications for new assignments
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="text-gray-800">
                Email notifications for course updates
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-gray-800">
                Weekly progress email digest
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
