
import React from 'react';
import { ImageSearchResult } from '@/services/imageSearch';
import SearchHeader from '@/components/SearchHeader';
import ResultsSection from '@/components/ResultsSection';

interface SearchResultsScreenProps {
  searchResults: ImageSearchResult;
  loading: boolean;
  autoLoading: boolean;
  animateResults: boolean;
  hasMoreResults: boolean;
  onSearch: (query: string, useDHgate?: boolean) => void;
  resetSearch: () => void;
  onAutoLoadMore: () => Promise<void>;
}

const SearchResultsScreen: React.FC<SearchResultsScreenProps> = ({
  searchResults,
  loading,
  autoLoading,
  animateResults,
  hasMoreResults,
  onSearch,
  resetSearch,
  onAutoLoadMore
}) => {
  return (
    <div className="bg-[#EBEBEB] dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <SearchHeader 
        onSearch={onSearch} 
        loading={loading} 
        resetSearch={resetSearch} 
        isCompact={true} 
      />
      
      <div className="container mx-auto px-4 py-0">
        <ResultsSection 
          results={searchResults} 
          loading={loading} 
          autoLoading={autoLoading} 
          animateResults={animateResults} 
          hasMoreResults={hasMoreResults} 
          onAutoLoadMore={onAutoLoadMore} 
        />
      </div>
    </div>
  );
};

export default SearchResultsScreen;
