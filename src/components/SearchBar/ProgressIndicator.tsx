
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  isProcessing: boolean;
  progress: number;
}

const ProgressIndicator = ({ isProcessing, progress }: ProgressIndicatorProps) => {
  if (!isProcessing) return null;
  
  return (
    <div className="mt-2">
      <Progress value={progress} className="h-1" />
      <p className="text-xs text-gray-500 mt-1 text-center">Processing product data... {progress}%</p>
    </div>
  );
};

export default ProgressIndicator;
