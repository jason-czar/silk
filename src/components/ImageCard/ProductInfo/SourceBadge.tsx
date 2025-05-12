
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPlatformFavicon, getSourceDisplayName } from '../utils';

interface SourceBadgeProps {
  source: string;
}

const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => {
  const [iconError, setIconError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get the appropriate favicon and display name for this platform
  const favicon = getPlatformFavicon(source);
  const displayName = getSourceDisplayName(source);
  
  // Reset error state when source changes
  useEffect(() => {
    setIconError(false);
    setIsLoading(true);
  }, [source]);
  
  // Function to handle image loading errors
  const handleImageError = () => {
    console.error(`Failed to load favicon for ${source}: ${favicon}`);
    setIconError(true);
    setIsLoading(false);
  };
  
  // Function to handle successful image load
  const handleImageLoad = () => {
    console.log(`Successfully loaded favicon for ${source}`);
    setIsLoading(false);
  };

  return (
    <div className="flex items-center mb-1">
      <Avatar className="h-5 w-5 mr-2 overflow-hidden">
        {favicon && !iconError ? (
          <AvatarImage 
            src={favicon} 
            alt={displayName} 
            onError={handleImageError}
            onLoad={handleImageLoad}
            className="h-full w-full object-contain"
          />
        ) : null}
        <AvatarFallback className={`text-xs ${isLoading ? 'bg-gray-200' : 'bg-gray-300'} text-black`}>
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-gray-400 text-sm">{displayName}</span>
    </div>
  );
};

export default SourceBadge;
