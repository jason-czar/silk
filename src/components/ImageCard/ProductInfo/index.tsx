
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPlatformFavicon } from '../utils';
import { ProductInfoProps } from './types';
import SourceBadge from './SourceBadge';
import ProductTitle from './ProductTitle';
import ViewProductButton from './ViewProductButton';

const ProductInfo = ({ brandName, source, displayTitle, handleClick }: ProductInfoProps) => {
  return (
    <div className="p-3 text-white">
      <SourceBadge source={source} />
      <ProductTitle title={displayTitle} />
      <ViewProductButton onClick={handleClick} />
    </div>
  );
};

export default ProductInfo;
