
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { readFileAsBase64, validateImageFile } from '../ImageUpload/utils';

interface ImageProcessingDialogProps {
  open: boolean;
  onClose: () => void;
  onImageProcessed: (query: string) => void;
}

const ImageProcessingDialog = ({ open, onClose, onImageProcessed }: ImageProcessingDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (!validateImageFile(file)) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

  const processImage = async () => {
    if (!selectedFile) return;

    setIsProcessingImage(true);
    try {
      toast({
        title: "Processing Image",
        description: "Please wait while we analyze your image..."
      });

      // Convert image to base64
      const base64data = await readFileAsBase64(selectedFile);
      
      // Send to our edge function
      const response = await fetch("https://jzupbllxgtobpykyerbi.supabase.co/functions/v1/vision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64data }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to process image");
      }

      // Use the labels returned from the Vision API
      if (data.labels && data.labels.length > 0) {
        // Use the top 3 labels for the search
        const searchQuery = data.labels.slice(0, 3).map((label: any) => label.description).join(' ');
        
        toast({
          title: "Image Analysis Complete",
          description: `Found: ${searchQuery}`
        });
        
        onImageProcessed(searchQuery);
        cleanupAndClose();
      } else {
        throw new Error("No labels detected in the image");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingImage(false);
    }
  };

  const cleanupAndClose = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setSelectedFile(null);
    setPreview(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <h3 className="text-lg font-medium">Search with an image</h3>
        <div className="flex flex-col items-center justify-center space-y-4">
          <label className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center p-4">
              <p className="text-sm text-gray-500">
                {preview ? 'Change image' : 'Click to select an image or drag and drop'}
              </p>
            </div>
            <input 
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isProcessingImage}
            />
          </label>
          
          {preview && (
            <div className="relative h-48 w-48 overflow-hidden rounded-md">
              <img 
                src={preview} 
                alt="Preview" 
                className="h-full w-full object-cover"
              />
            </div>
          )}
          
          <div className="flex gap-2 w-full justify-end">
            <button 
              onClick={cleanupAndClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
              disabled={isProcessingImage}
            >
              Cancel
            </button>
            <button 
              onClick={processImage} 
              disabled={!selectedFile || isProcessingImage}
              className="px-4 py-2 bg-[#4285F4] text-white rounded-md hover:bg-[#4285F4]/90 disabled:bg-gray-300"
            >
              {isProcessingImage ? "Processing..." : "Search"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageProcessingDialog;
