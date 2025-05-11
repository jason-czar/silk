
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPlatformFavicon } from '../utils';

interface SourceBadgeProps {
  source: string;
}

const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => {
  // Get the appropriate favicon for this platform
  const favicon = getPlatformFavicon(source);
  
  return (
    <div className="flex items-center mb-1">
      <Avatar className="h-5 w-5 mr-2">
        {favicon ? <AvatarImage src={favicon} alt={source} /> : null}
        <AvatarFallback className="text-black text-xs bg-gray-300">
          {source.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <span className="text-gray-400 text-sm">{source}</span>
    </div>
  );
};

export default SourceBadge;
