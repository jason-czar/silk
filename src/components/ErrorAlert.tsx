
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  description: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  title = "Error", 
  description 
}) => {
  return (
    <Alert variant="destructive" className="mx-auto mt-4 max-w-2xl">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
