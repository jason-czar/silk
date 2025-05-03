
import ImageCard from './ImageCard';
import { ImageSearchResult } from '../services/imageSearch';

interface ImageGridProps {
  results: ImageSearchResult | null;
  loading?: boolean;
}

const ImageGrid = ({ results, loading = false }: ImageGridProps) => {
  if (loading) {
    return (
      <div className="my-8 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-lg text-gray-600">Searching for images...</p>
      </div>
    );
  }

  if (!results || !results.items || results.items.length === 0) {
    return (
      <div className="my-8 text-center">
        <p className="text-lg text-gray-600">
          {results ? 'No images found. Try a different search term.' : 'Enter a search term to find images.'}
        </p>
      </div>
    );
  }

  return (
    <div className="my-8">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {results.items.map((item, index) => (
          <ImageCard
            key={`${item.link}-${index}`}
            title={item.title}
            thumbnailUrl={item.image.thumbnailLink}
            imageUrl={item.link}
            contextLink={item.image.contextLink}
            width={item.image.thumbnailWidth}
            height={item.image.thumbnailHeight}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageGrid;
