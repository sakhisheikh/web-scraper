import React from 'react';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ☰
          </button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white ml-4 lg:ml-0">
            Dashboard Overview
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          
          {/* User menu */}
          <div className="relative">
            <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                👤
              </div>
              <span className="hidden md:block text-sm font-medium">Sakhi</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 