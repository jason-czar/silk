
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProductInfoProps {
  brandName: string;
  isDHgate: boolean;
  displayTitle: string;
  handleClick: (e: React.MouseEvent) => void;
}

const ProductInfo = ({ brandName, isDHgate, displayTitle, handleClick }: ProductInfoProps) => {
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
      <button onClick={handleClick} className="w-full mt-2 py-2 bg-white text-black font-medium rounded-md hover:bg-gray-100">View product</button>
    </div>
  );
};

export default ProductInfo;
