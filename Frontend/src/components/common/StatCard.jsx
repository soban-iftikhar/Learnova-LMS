import React from 'react';
import { Card, CardContent } from '../ui/Card';

const StatCard = ({ icon: Icon, title, value, description, color = 'primary' }) => {
  const colorStyles = {
    primary: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="flex items-start gap-4">
        {/* Icon */}
        <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
          <Icon size={24} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
