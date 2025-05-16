
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ViewProductButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

const ViewProductButton: React.FC<ViewProductButtonProps> = ({ onClick }) => {
  const isMobile = useIsMobile();
  
  return (
    <button 
      onClick={(e) => {
        // On mobile, we don't need to stop propagation as we want the parent click to happen too
        if (!isMobile) {
          e.stopPropagation(); // Only prevent double navigation on desktop
        }
        onClick(e); 
      }}
      style={{ touchAction: 'manipulation' }}
      className="w-full mt-2 py-2 bg-white text-black font-medium rounded-md hover:bg-gray-100"
    >
      View product
    </button>
  );
};

export default ViewProductButton;
