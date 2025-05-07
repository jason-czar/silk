
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import SearchInput from './SearchInput';
import ImageProcessingDialog from './ImageProcessingDialog';
import UrlProcessor from './UrlProcessor';

interface SearchBarProps {
  onSearch: (query: string, useDHgate?: boolean) => void;
  disabled?: boolean;
}

const SearchBar = ({
  onSearch,
  disabled = false
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const [useDHgate, setUseDHgate] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const { toast } = useToast();

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const trimmedQuery = query.trim();
    if (isValidUrl(trimmedQuery)) {
      setIsProcessingUrl(true);
      // The URL processor component will handle this
    } else {
      onSearch(trimmedQuery, useDHgate);
    }
  };

  const handleCameraClick = () => {
    setShowImageDialog(true);
  };

  const handleUrlProcessingComplete = (searchTerm: string) => {
    onSearch(searchTerm);
  };

  const handleUrlProcessingFinish = () => {
    setIsProcessingUrl(false);
  };

  return (
    <div className="search-bar-container">
      <SearchInput
        query={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={disabled}
        isProcessing={isProcessingUrl}
        onSubmit={handleSubmit}
        onCameraClick={handleCameraClick}
      />
      
      {isProcessingUrl && query && isValidUrl(query.trim()) && (
        <UrlProcessor 
          url={query.trim()} 
          onComplete={handleUrlProcessingComplete}
          onFinish={handleUrlProcessingFinish}
        />
      )}

      <ImageProcessingDialog
        open={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onImageProcessed={onSearch}
      />
    </div>
  );
};

export default SearchBar;
