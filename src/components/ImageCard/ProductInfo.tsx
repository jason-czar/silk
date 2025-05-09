
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPlatformFavicon } from './utils';

interface ProductInfoProps {
  brandName: string;
  source: string;
  displayTitle: string;
  handleClick: (e: React.MouseEvent) => void;
}

const ProductInfo = ({ brandName, source, displayTitle, handleClick }: ProductInfoProps) => {
  // Get the appropriate favicon for this platform
  const favicon = getPlatformFavicon(source);
  
  return (
    <div className="p-3 text-white">
      <div className="flex items-center mb-1">
        <Avatar className="h-5 w-5 mr-2">
          {favicon ? <AvatarImage src={favicon} alt={source} /> : null}
          <AvatarFallback className="text-black text-xs bg-gray-300">
            {source.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className="text-gray-400 text-sm">{source}</span>
      </div>
      <p className="text-base font-medium mb-1 truncate text-[#2C2C2C]">{displayTitle}</p>
      <button onClick={handleClick} className="w-full mt-2 py-2 bg-white text-black font-medium rounded-md hover:bg-gray-100">View product</button>
    </div>
  );
};

export default ProductInfo;
