import React from 'react';

const ProgressBar = ({ value = 0, max = 100, className = '', showLabel = false }) => {
  const percentage = (value / max) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        {showLabel && <span className="ml-3 text-sm font-medium text-muted-foreground">{Math.round(percentage)}%</span>}
      </div>
    </div>
  );
};

export default ProgressBar;
