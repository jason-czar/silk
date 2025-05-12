
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
    console.log(`Successfully loaded favicon for ${source}: ${favicon}`);
    setIsLoading(false);
  };

  // Return an empty div (hiding this component for now)
  return (
    <div className="mb-1"></div>
  );
};

export default SourceBadge;
