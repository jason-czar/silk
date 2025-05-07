
import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  query: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  isProcessing: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const SearchInput = ({
  query,
  onChange,
  disabled,
  isProcessing,
  onSubmit
}: SearchInputProps) => {
  return (
    <form onSubmit={onSubmit} className="relative">
      <input 
        type="text" 
        value={query} 
        onChange={onChange} 
        placeholder="Paste URL or search" 
        disabled={disabled || isProcessing} 
        className="w-full pr-12 rounded-full bg-[#EBEBEB] 
                  border border-gray-300 text-gray-800 text-Ig 
                  placeholder:text-[#BDBDBD] 
                  focus:outline-none 
                  focus:border-[#3ECF8E80] 
                  focus:ring-2 
                  focus:ring-[#3ECF8E80] 
                  shadow-md
                  px-[22px] py-[16px]"
      />
      <button 
        type="submit" 
        disabled={disabled || isProcessing || !query.trim()} 
        aria-label="Search" 
        className="absolute right-4 top-1/2 -translate-y-1/2"
      >
        <Search 
          size={24} 
          className={`${isProcessing ? 'animate-pulse' : ''} text-primary hover:text-primary/80 transition-colors duration-300`} 
        />
      </button>
    </form>
  );
};

export default SearchInput;
