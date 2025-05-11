
import React from 'react';

interface ViewProductButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

const ViewProductButton: React.FC<ViewProductButtonProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick} 
      className="w-full mt-2 py-2 bg-white text-black font-medium rounded-md hover:bg-gray-100"
    >
      View product
    </button>
  );
};

export default ViewProductButton;
