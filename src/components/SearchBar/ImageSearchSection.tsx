
import React from 'react';
import ImageUpload from '../ImageUpload';

interface ImageSearchSectionProps {
  onImageProcessed: (query: string) => void;
  disabled: boolean;
}

const ImageSearchSection = ({ onImageProcessed, disabled }: ImageSearchSectionProps) => {
  return (
    <div className="flex items-center justify-center mt-3">
      <p className="text-sm text-gray-500 mr-2">Search by image:</p>
      <ImageUpload onImageProcessed={onImageProcessed} disabled={disabled} />
    </div>
  );
};

export default ImageSearchSection;
