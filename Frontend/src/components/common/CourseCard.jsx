import React from 'react';
import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

const CourseCard = ({ course, onContinue }) => {
  const truncateText = (text, length) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 h-full flex flex-col">
      {/* Course Image */}
      {course.image && (
        <div className="w-full h-48 bg-muted overflow-hidden">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}

      <CardContent className="flex-1 flex flex-col">
        {/* Course Title */}
        <h3 className="font-semibold text-lg text-foreground mt-4 mb-1">
          {truncateText(course.title, 40)}
        </h3>

        {/* Instructor */}
        <p className="text-sm text-muted-foreground mb-3">{course.instructor}</p>

        {/* Progress Section */}
        <div className="mb-4 flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground">Progress</span>
            <Badge variant="secondary" className="text-xs">
              {course.progress}%
            </Badge>
          </div>
          <ProgressBar value={course.progress} max={100} />
        </div>

        {/* Button */}
        <Button
          onClick={() => onContinue?.(course.id)}
          variant="primary"
          size="md"
          className="w-full flex items-center justify-center gap-2"
        >
          <span>Continue Learning</span>
          <ArrowRight size={16} />
        </Button>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
