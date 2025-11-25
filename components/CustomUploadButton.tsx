'use client';

import { useUploadThing } from '@/lib/uploadthing';
import { useState } from 'react';

interface CustomUploadButtonProps {
  onUploadComplete?: (urls: string[]) => void;
  onUploadError?: (error: Error) => void;
  children: (props: { isUploading: boolean; onClick: () => void }) => React.ReactNode;
}

export function CustomUploadButton({ 
  onUploadComplete, 
  onUploadError,
  children 
}: CustomUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { startUpload } = useUploadThing('propertyImages', {
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      if (res) {
        const urls = res.map((r) => r.url);
        onUploadComplete?.(urls);
      }
    },
    onUploadError: (error) => {
      setIsUploading(false);
      onUploadError?.(error);
    },
  });

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/jpg';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        setIsUploading(true);
        await startUpload(Array.from(files));
      }
    };
    
    input.click();
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children({ isUploading, onClick: handleClick })}
    </div>
  );
}
