
import React from 'react';
import SearchHeader from '@/components/SearchHeader';

interface WelcomeScreenProps {
  onSearch: (query: string, useDHgate?: boolean) => void;
  loading: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSearch, loading }) => {
  return (
    <div className="flex-grow flex items-center justify-center bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 text-center">
        <SearchHeader onSearch={onSearch} loading={loading} />
      </div>
    </div>
  );
};

export default WelcomeScreen;
