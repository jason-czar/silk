
import { ImageSearchResult } from '@/services/imageSearch';
import ImageGrid from '@/components/ImageGrid';
import InfiniteScrollHandler from '@/components/InfiniteScrollHandler';

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
  if (!results) return null;

  return (
    <main className={`transition-all duration-500 ${animateResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
      
      {results?.searchInformation && (
        <div className="text-center text-sm text-gray-500 mt-4 animate-fade-in">
          Found {results.searchInformation.formattedTotalResults} results in {results.searchInformation.formattedSearchTime} seconds
        </div>
      )}
    </main>
  );
};

export default ResultsSection;
