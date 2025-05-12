
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPlatformFavicon, getSourceDisplayName } from '../utils';

interface SourceBadgeProps {
  source: string;
}

const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => {
  const [iconError, setIconError] = useState(false);
  
  // Get the appropriate favicon and display name for this platform
  const favicon = getPlatformFavicon(source);
  const displayName = getSourceDisplayName(source);
  
  // Function to handle image loading errors
  const handleImageError = () => {
    console.error(`Failed to load favicon for ${source}`);
    setIconError(true);
  };

  return (
    <div className="flex items-center mb-1">
      <Avatar className="h-5 w-5 mr-2 overflow-hidden">
        {favicon && !iconError ? (
          <AvatarImage 
            src={favicon} 
            alt={displayName} 
            onError={handleImageError}
            className="h-full w-full object-contain"
          />
        ) : null}
        <AvatarFallback className="text-black text-xs bg-gray-300">
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-gray-400 text-sm">{displayName}</span>
    </div>
  );
};

export default SourceBadge;
