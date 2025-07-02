
import React from 'react';

const LoadingWave = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-12 bg-gradient-to-t from-purple-400 via-pink-400 to-orange-400 rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1s',
              animationIterationCount: 'infinite',
              animationDirection: 'alternate',
            }}
          />
        ))}
      </div>
      <div className="ml-4 relative">
        <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin">
          <div className="absolute inset-2 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white animate-bounce"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingWave;
