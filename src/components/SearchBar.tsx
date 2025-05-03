
import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  disabled?: boolean;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

const SearchBar = ({ 
  onSearch, 
  disabled = false, 
  suggestions = [],
  onSuggestionClick
}: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for images..."
          disabled={disabled}
          className="w-full py-3 px-5 pr-12 rounded-full bg-[#42484B] border border-white/50 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-md"
        />
        <button 
          type="submit" 
          disabled={disabled || !query.trim()}
          aria-label="Search"
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          <Search size={24} className="text-primary hover:text-primary/80 transition-colors duration-300" />
        </button>
      </form>
      
      {suggestions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={disabled}
              className="px-4 py-2 rounded-full bg-[#42484B] border border-white/20 text-white/80 text-sm hover:bg-[#4e5559] hover:border-white/40 transition-colors shadow-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
