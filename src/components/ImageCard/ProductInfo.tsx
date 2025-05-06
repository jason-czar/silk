
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProductInfoProps {
  brandName: string;
  isDHgate: boolean;
  displayTitle: string;
  handleClick: (e: React.MouseEvent) => void;
  handleFindSimilar: (e: React.MouseEvent) => void;
}

const ProductInfo = ({ 
  brandName, 
  isDHgate, 
  displayTitle, 
  handleClick,
  handleFindSimilar
}: ProductInfoProps) => {
  return (
    <div className="p-3 text-white">
      <div className="flex items-center mb-1">
        <Avatar className="h-5 w-5 mr-2">
          {isDHgate ? <AvatarImage src="https://www.dhgate.com/favicon.ico" alt="DHgate" /> : null}
          <AvatarFallback className="text-black text-xs bg-gray-300">
            {isDHgate ? 'D' : brandName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className="text-gray-400 text-sm">{brandName}</span>
      </div>
      <p className="text-base font-medium mb-1 truncate text-[#2C2C2C]">{displayTitle}</p>
      <div className="grid grid-cols-1 gap-2 mt-2">
        <button 
          onClick={handleFindSimilar} 
          className="w-full py-2 font-medium rounded-md bg-gray-700 text-[#ebebeb] hover:bg-gray-600 transition-colors"
        >
          Find similar
        </button>
        <button 
          onClick={handleClick} 
          className="w-full py-2 font-medium rounded-md bg-[#3ecf8e] text-[#ebebeb] hover:bg-[#2ebd7d] transition-colors"
        >
          View on DHgate
        </button>
      </div>
    </div>
  );
};

export default ProductInfo;
