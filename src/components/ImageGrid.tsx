
import React from 'react';
import ImageCard from './ImageCard';
import { ImageSearchResult } from '../services/imageSearch';

interface ImageGridProps {
  results: ImageSearchResult | null;
  loading?: boolean;
  animate?: boolean;
}

const ImageGrid = ({ results, loading = false, animate = false }: ImageGridProps) => {
  if (loading) {
    return (
      <div className="my-8 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-lg text-gray-600 dark:text-gray-300">Searching for images...</p>
      </div>
    );
  }

  if (!results || !results.items || results.items.length === 0) {
    return (
      <div className="my-8 text-center">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {results ? 'No images found. Try a different search term.' : 'Enter a search term to find images.'}
        </p>
      </div>
    );
  }

  return (
    <div className="my-8">
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {results.items.map((item, index) => (
          <div 
            key={`${item.link}-${index}`} 
            className={animate ? "slide-in-right" : ""}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <ImageCard
              title={item.title}
              thumbnailUrl={item.image.thumbnailLink}
              imageUrl={item.link}
              contextLink={item.image.contextLink}
              width={item.image.thumbnailWidth}
              height={item.image.thumbnailHeight}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGrid;
