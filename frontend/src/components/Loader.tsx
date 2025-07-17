import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600`}></div>
        {text && (
          <p className="text-gray-500 text-sm">{text}</p>
        )}
      </div>
    </div>
  );
};

export default Loader; 