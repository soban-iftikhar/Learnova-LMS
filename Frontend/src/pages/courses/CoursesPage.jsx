import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import AppShell from '../../components/common/AppShell';
import CourseCard from '../../components/common/CourseCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const CoursesPage = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const allCourses = [
    {
      id: 1,
      title: 'Introduction to React',
      instructor: 'Sarah Johnson',
      progress: 75,
      status: 'in-progress',
      image: 'https://via.placeholder.com/300x150?text=React+Fundamentals',
    },
    {
      id: 2,
      title: 'Web Design Principles',
      instructor: 'Mike Davis',
      progress: 45,
      status: 'in-progress',
      image: 'https://via.placeholder.com/300x150?text=Web+Design',
    },
    {
      id: 3,
      title: 'JavaScript Mastery',
      instructor: 'Emma Wilson',
      progress: 60,
      status: 'in-progress',
      image: 'https://via.placeholder.com/300x150?text=JavaScript',
    },
    {
      id: 4,
      title: 'Advanced CSS Techniques',
      instructor: 'Alex Turner',
      progress: 100,
      status: 'completed',
      image: 'https://via.placeholder.com/300x150?text=CSS+Advanced',
    },
    {
      id: 5,
      title: 'Python for Data Science',
      instructor: 'Dr. Lisa Chen',
      progress: 0,
      status: 'not-started',
      image: 'https://via.placeholder.com/300x150?text=Python+Data',
    },
    {
      id: 6,
      title: 'Mobile App Development',
      instructor: 'James Brown',
      progress: 30,
      status: 'in-progress',
      image: 'https://via.placeholder.com/300x150?text=Mobile+Apps',
    },
    {
      id: 7,
      title: 'Cloud Computing Basics',
      instructor: 'Rachel Green',
      progress: 0,
      status: 'not-started',
      image: 'https://via.placeholder.com/300x150?text=Cloud+Computing',
    },
    {
      id: 8,
      title: 'Introduction to AI',
      instructor: 'Dr. Robert Smith',
      progress: 100,
      status: 'completed',
      image: 'https://via.placeholder.com/300x150?text=AI+Introduction',
    },
  ];

  const filters = [
    { id: 'all', label: 'All Courses' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'not-started', label: 'Not Started' },
  ];

  const filteredCourses = allCourses.filter((course) => {
    const matchesFilter = selectedFilter === 'all' || course.status === selectedFilter;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleContinueLearn = (courseId) => {
    console.log('Continue learning course:', courseId);
    // Navigate to course details
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Courses</h1>
          <p className="text-muted-foreground">
            Browse and manage all your enrolled courses
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Search courses or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedFilter === filter.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold">{filteredCourses.length}</span> of <span className="font-semibold">{allCourses.length}</span> courses
          </p>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onContinue={handleContinueLearn}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <Filter size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No courses found
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              Try adjusting your search or filter criteria
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedFilter('all');
              }}
              variant="outline"
              size="md"
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default CoursesPage;
