
import { ImageSearchResult } from '@/services/imageSearch';
import ImageGrid from '@/components/ImageGrid';
import InfiniteScrollHandler from '@/components/InfiniteScrollHandler';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect } from 'react';

interface ResultsSectionProps {
  results: ImageSearchResult | null;
  loading: boolean;
  autoLoading: boolean;
  animateResults: boolean;
  hasMoreResults: boolean;
  onAutoLoadMore: () => Promise<void>;
}

const ResultsSection = ({ 
  results, 
  loading, 
  autoLoading, 
  animateResults, 
  hasMoreResults,
  onAutoLoadMore
}: ResultsSectionProps) => {
  const isMobile = useIsMobile();
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Simulate load progress when loading
  useEffect(() => {
    if (loading && !autoLoading) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        if (progress >= 90) {
          clearInterval(interval);
        }
        setLoadProgress(progress);
      }, 100);
      
      return () => {
        clearInterval(interval);
        // If loading completes, set to 100%
        if (!loading) {
          setLoadProgress(100);
          
          // Reset after animation completes
          setTimeout(() => setLoadProgress(0), 500);
        }
      };
    } else if (!loading) {
      setLoadProgress(100);
      // Reset after animation completes
      const timer = setTimeout(() => setLoadProgress(0), 500);
      return () => clearTimeout(timer);
    }
  }, [loading, autoLoading]);
  
  if (!results) return null;

  return (
    <main className={`transition-all duration-500 ${animateResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${isMobile ? 'pt-14' : ''}`}>
      {/* Show progress bar at the top during initial load */}
      {loading && !autoLoading && loadProgress > 0 && loadProgress < 100 && (
        <div className="sticky top-0 z-10 w-full px-4">
          <ProgressBar 
            value={loadProgress} 
            max={100} 
            size="sm" 
            className="mb-2" 
          />
        </div>
      )}
      
      {/* Display any errors */}
      {error && (
        <Alert variant="destructive" className="mb-4 mx-auto max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <ImageGrid results={results} loading={loading && !results} animate={animateResults} />
      
      <InfiniteScrollHandler 
        loading={loading} 
        autoLoading={autoLoading} 
        hasMoreData={hasMoreResults} 
        onLoadMore={onAutoLoadMore}
      />
      
      {loading && results && !autoLoading && (
        <div className="text-center my-8">
          <div className="animate-spin inline-block w-6 h-6 border-4 border-white dark:border-gray-600 border-t-transparent rounded-full"></div>
          <span className="ml-2 text-gray-400 dark:text-gray-500">Loading more images...</span>
        </div>
      )}
      
      {autoLoading && (
        <div className="text-center my-4 py-2">
          <ProgressBar 
            value={70} 
            max={100} 
            size="sm" 
            className="max-w-xs mx-auto mb-2" 
            animate={true}
          />
          <span className="text-sm text-gray-400 dark:text-gray-500">
            Loading more results...
          </span>
        </div>
      )}
      
      {results?.searchInformation && (
        <div className="text-center text-sm text-gray-500 mt-4 animate-fade-in">
          Found {results.searchInformation.formattedTotalResults} results in {results.searchInformation.formattedSearchTime} seconds
        </div>
      )}
    </main>
  );
};

export default ResultsSection;
