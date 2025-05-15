
import React from 'react';
interface ProductTitleProps {
  title: string;
}
const ProductTitle: React.FC<ProductTitleProps> = ({
  title
}) => {
  return (
    <p className="text-base mb-1 line-clamp-2 min-h-[48px] text-[#2C2C2C] font-normal hover:text-black transition-colors">
      {title}
    </p>
  );
};
export default ProductTitle;
