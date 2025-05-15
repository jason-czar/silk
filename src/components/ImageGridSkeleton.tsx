
import React from 'react';

interface ImageGridSkeletonProps {
  count?: number;
}

const ImageGridSkeleton: React.FC<ImageGridSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded animate-pulse">
          <div className="w-full aspect-square"></div>
          <div className="p-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGridSkeleton;
