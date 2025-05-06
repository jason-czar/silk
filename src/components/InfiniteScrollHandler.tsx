
import { useEffect, useRef } from 'react';

interface InfiniteScrollHandlerProps {
  loading: boolean;
  autoLoading: boolean;
  hasMoreData: boolean;
  onLoadMore: () => void;
}

const InfiniteScrollHandler = ({ loading, autoLoading, hasMoreData, onLoadMore }: InfiniteScrollHandlerProps) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMoreData && !loading && !autoLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the element is visible
    );

    const currentRef = loadMoreRef.current;
    
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMoreData, loading, autoLoading, onLoadMore]);

  if (!hasMoreData) {
    return null;
  }

  return (
    <div ref={loadMoreRef} className="h-16 flex items-center justify-center my-4">
      {autoLoading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin mb-2 w-6 h-6 border-4 border-[#3ECF8E] border-t-transparent rounded-full"></div>
          <span className="text-gray-500">Loading more items...</span>
        </div>
      ) : (
        <div className="h-8 opacity-0">Loading trigger</div>
      )}
    </div>
  );
};

export default InfiniteScrollHandler;
