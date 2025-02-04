import { Button } from "@/components/ui/button"
import { useSingleImageStore } from "./ImageStore"

const SelectedImageEditor = () => {
  const { selectedImage, clearSelectedImage } = useSingleImageStore()

  if (!selectedImage) return null

  return (
    <div className="p-2 border rounded mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold truncate">UID: {selectedImage.id}</span>
        <div>
          <Button
            className="bg-blue-500 text-white px-2 py-1 text-xs rounded mr-2"
            onClick={() => alert(`Edit image with UID: ${selectedImage.id}`)}
          >
            Edit
          </Button>
          <Button className="bg-red-500 text-white px-2 py-1 text-xs rounded" onClick={clearSelectedImage}>
            Clear
          </Button>
        </div>
      </div>
      <img src={selectedImage.url || "/placeholder.svg"} alt="Selected" className="w-full h-auto" />
    </div>
  )
}

export default SelectedImageEditor
