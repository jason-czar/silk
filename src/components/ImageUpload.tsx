
import React, { useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface ImageUploadProps {
  onImageProcessed: (searchQuery: string) => void;
  disabled?: boolean;
}

const ImageUpload = ({ onImageProcessed, disabled = false }: ImageUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
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
    setOpenDialog(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please drop an image file",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setOpenDialog(true);
    }
  };

  const processImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      toast({
        title: "Processing Image",
        description: "Please wait while we analyze your image..."
      });

      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        const base64data = reader.result?.toString().split(',')[1]; // Remove data URL prefix
        
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
          setOpenDialog(false);
        } else {
          throw new Error("No labels detected in the image");
        }
      };
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <div 
          className="relative overflow-hidden cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            disabled={disabled || isProcessing}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            aria-label="Take a photo"
          />
          <Button 
            variant="outline" 
            className="flex items-center space-x-2 bg-[#EBEBEB] border-gray-300 hover:bg-gray-200"
            disabled={disabled || isProcessing}
          >
            <Camera className="h-5 w-5 text-gray-700" />
            <span className="text-gray-700">Take Photo</span>
          </Button>
        </div>
        
        <div 
          className="relative overflow-hidden cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || isProcessing}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            aria-label="Upload an image"
          />
          <Button 
            variant="outline" 
            className="flex items-center space-x-2 bg-[#EBEBEB] border-gray-300 hover:bg-gray-200"
            disabled={disabled || isProcessing}
          >
            <Upload className="h-5 w-5 text-gray-700" />
            <span className="text-gray-700">Upload Image</span>
          </Button>
        </div>
      </div>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
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
                onClick={handleCloseDialog}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                onClick={processImage} 
                disabled={!selectedFile || isProcessing}
                className="bg-[#3ecf8e] hover:bg-[#2ebd7d]"
              >
                {isProcessing ? "Processing..." : "Search with this image"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageUpload;
