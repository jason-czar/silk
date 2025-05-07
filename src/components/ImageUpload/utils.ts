
export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64data = reader.result?.toString().split(',')[1]; // Remove data URL prefix
      if (base64data) {
        resolve(base64data);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const validateImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};
