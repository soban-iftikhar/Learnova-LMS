import React from 'react';

const Avatar = ({ className = '', src, initials, alt = 'Avatar', size = 'md' }) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold ${className}`}
    >
      {initials}
    </div>
  );
};

export default Avatar;
