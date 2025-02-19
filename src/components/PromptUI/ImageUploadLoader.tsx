import type React from "react";
import { useState } from "react";
import { CircularBarsSpinnerLoader }  from  "./LoadingSpinner"

interface ImageUploadLoaderProps {
  imagePreview: string | null;
  isUploading: boolean;
}

const ImageUploadLoader: React.FC<ImageUploadLoaderProps> = ({ imagePreview, isUploading }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div className="relative w-24 h-24 bg-white rounded-lg overflow-hidden z-50">
      {/* White Background Until Image Loads */}
      {!isImageLoaded && !isUploading && (
        <div className="absolute inset-0 bg-white"></div>
      )}

      {/* Image Preview (Only Shows After It Fully Loads) */}
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Upload preview"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isImageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsImageLoaded(true)}
        />
      )}

      {/* Show Loader Only During Uploading */}
      {isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center gap-2 z-[60]">
          <CircularBarsSpinnerLoader />
        </div>
      )}
    </div>
  );
};

export default ImageUploadLoader;