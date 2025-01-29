import type React from "react"
import LoadingSpinner from "./LoadingSpinner"

interface ImageUploadLoaderProps {
  imagePreview: string | null
  isUploading: boolean
}

const ImageUploadLoader: React.FC<ImageUploadLoaderProps> = ({ imagePreview, isUploading }) => {
  return (
    <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden z-50">
      {imagePreview ? (
        <img 
          src={imagePreview || "/placeholder.svg"} 
          alt="Upload preview" 
          className="w-full h-full object-cover relative z-50" 
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center relative z-50">
          <LoadingSpinner />
        </div>
      )}
      {isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center gap-2 z-[60]">
          <div className="relative z-[60]">
            <LoadingSpinner />
          </div>
          <div className="text-white text-xs font-semibold relative z-[60]">Uploading...</div>
        </div>
      )}
    </div>
  )
}

export default ImageUploadLoader