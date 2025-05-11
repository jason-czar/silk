
import React from 'react';

interface ProductTitleProps {
  title: string;
}

const ProductTitle: React.FC<ProductTitleProps> = ({ title }) => {
  return (
    <p className="text-base font-medium mb-1 truncate text-[#2C2C2C]">
      {title}
    </p>
  );
};

export default ProductTitle;
