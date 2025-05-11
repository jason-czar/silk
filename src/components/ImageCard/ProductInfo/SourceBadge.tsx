
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPlatformFavicon, getSourceDisplayName } from '../utils';

interface SourceBadgeProps {
  source: string;
}

const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => {
  // Get the appropriate favicon and display name for this platform
  const favicon = getPlatformFavicon(source);
  const displayName = getSourceDisplayName(source);
  
  return (
    <div className="flex items-center mb-1">
      <Avatar className="h-5 w-5 mr-2">
        {favicon ? <AvatarImage src={favicon} alt={displayName} /> : null}
        <AvatarFallback className="text-black text-xs bg-gray-300">
          {displayName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <span className="text-gray-400 text-sm">{displayName}</span>
    </div>
  );
};

export default SourceBadge;
