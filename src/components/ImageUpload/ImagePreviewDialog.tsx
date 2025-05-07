
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface ImagePreviewDialogProps {
  preview: string | null;
  isProcessing: boolean;
  open: boolean;
  onClose: () => void;
  onProcess: () => void;
}

const ImagePreviewDialog = ({ 
  preview, 
  isProcessing, 
  open, 
  onClose, 
  onProcess 
}: ImagePreviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Process Image</DialogTitle>
        <div className="flex flex-col items-center justify-center space-y-4">
          {preview && (
            <div className="relative h-64 w-64 overflow-hidden rounded-md">
              <img 
                src={preview} 
                alt="Preview" 
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={onProcess} 
              disabled={!preview || isProcessing}
              className="bg-[#3ecf8e] hover:bg-[#2ebd7d]"
            >
              {isProcessing ? "Processing..." : "Search with this image"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
