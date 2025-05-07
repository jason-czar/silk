
import React from 'react';
import { Button } from "@/components/ui/button";
import { LucideIcon } from 'lucide-react';

interface ImageUploadButtonProps {
  icon: LucideIcon;
  label: string;
  disabled: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  capture?: string;
  ariaLabel: string;
}

const ImageUploadButton = ({
  icon: Icon,
  label,
  disabled,
  onDragOver,
  onDrop,
  onChange,
  capture,
  ariaLabel
}: ImageUploadButtonProps) => {
  return (
    <div 
      className="relative overflow-hidden cursor-pointer"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input
        type="file"
        accept="image/*"
        capture={capture}
        onChange={onChange}
        disabled={disabled}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
        aria-label={ariaLabel}
      />
      <Button 
        variant="outline" 
        className="flex items-center space-x-2 bg-[#EBEBEB] border-gray-300 hover:bg-gray-200"
        disabled={disabled}
      >
        <Icon className="h-5 w-5 text-gray-700" />
        <span className="text-gray-700">{label}</span>
      </Button>
    </div>
  );
};

export default ImageUploadButton;
