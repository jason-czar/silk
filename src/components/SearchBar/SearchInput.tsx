
import React from 'react';
import { Search, Camera } from 'lucide-react';

interface SearchInputProps {
  query: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  isProcessing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCameraClick: () => void;
}

const SearchInput = ({
  query,
  onChange,
  disabled,
  isProcessing,
  onSubmit,
  onCameraClick
}: SearchInputProps) => {
  return (
    <form onSubmit={onSubmit} className="relative">
      <div className="relative flex items-center">
        <Search 
          size={24} 
          className="absolute left-4 text-gray-500"
        />
        <input 
          type="text" 
          value={query} 
          onChange={onChange} 
          placeholder="Search" 
          disabled={disabled || isProcessing} 
          className="w-full pl-12 pr-12 rounded-full bg-[#EBEBEB] 
                    border border-gray-300 text-gray-800 text-lg 
                    placeholder:text-[#BDBDBD] 
                    focus:outline-none 
                    focus:border-[#3ECF8E80] 
                    focus:ring-2 
                    focus:ring-[#3ECF8E80] 
                    shadow-md
                    px-[22px] py-[16px]"
        />
        <button 
          type="button"
          onClick={onCameraClick}
          disabled={disabled || isProcessing}
          aria-label="Search with image" 
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          <Camera
            size={24} 
            className="text-[#4285F4] hover:text-[#4285F4]/80 transition-colors duration-300" 
          />
        </button>
      </div>
    </form>
  );
};

export default SearchInput;
