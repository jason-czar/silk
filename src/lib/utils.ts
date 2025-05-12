
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to convert Google Drive sharing URLs to direct download URLs
export function getGoogleDriveDirectUrl(fileId: string): string {
  return `https://drive.usercontent.google.com/download?id=${fileId}&export=view&authuser=0`;
}
