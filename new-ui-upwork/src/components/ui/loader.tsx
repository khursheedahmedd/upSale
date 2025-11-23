import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer ring */}
        <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
        
        {/* Animated spinner */}
        <div className="absolute inset-0 border-2 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        
        {/* Inner pulse */}
        <div className="absolute inset-1 bg-blue-50 rounded-full animate-pulse"></div>
        
        {/* Center dot */}
        <div className="absolute inset-2 bg-blue-600 rounded-full animate-ping opacity-75"></div>
      </div>
    </div>
  );
};

export default Loader; 