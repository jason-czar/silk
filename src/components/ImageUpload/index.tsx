
import React, { useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import ImagePreviewDialog from './ImagePreviewDialog';
import ImageUploadButton from './ImageUploadButton';
import { validateImageFile, readFileAsBase64 } from './utils';

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
      if (!validateImageFile(file)) {
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
        setOpenDialog(false);
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
        <ImageUploadButton
          icon={Camera}
          label="Take Photo"
          disabled={disabled || isProcessing}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onChange={handleFileChange}
          capture="environment"
          ariaLabel="Take a photo"
        />
        
        <ImageUploadButton
          icon={Upload}
          label="Upload Image"
          disabled={disabled || isProcessing}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onChange={handleFileChange}
          ariaLabel="Upload an image"
        />
      </div>
      
      <ImagePreviewDialog
        preview={preview}
        isProcessing={isProcessing}
        open={openDialog}
        onClose={handleCloseDialog}
        onProcess={processImage}
      />
    </>
  );
};

export default ImageUpload;
