"use client";

export default function EditOptions() {
  return (
    <div className="p-6 max-w-4xl mx-auto bg-black text-white rounded-lg shadow-lg space-y-6">
      {/* Edit Options Section */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">1. Change Background</h2>
        <p className="text-sm text-gray-400">Replace with prompt or image</p>
        <div className="bg-gray-800 rounded-md p-4">
          <button className="px-4 py-2 bg-gold text-black rounded-md">Change Background</button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold">2. Edit in Canvas</h2>
        <p className="text-sm text-gray-400">Add dummy text below</p>
        <div className="bg-gray-800 rounded-md p-4">
          <p className="text-gray-300">Canvas editing will be displayed here.</p>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold">3. Change the Human</h2>
        <p className="text-sm text-gray-400">Add dummy text below</p>
        <div className="bg-gray-800 rounded-md p-4">
          <p className="text-gray-300">Here you can change human features.</p>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold">4. Extend Image</h2>
        <p className="text-sm text-gray-400">Add dummy text below</p>
        <div className="bg-gray-800 rounded-md p-4">
          <p className="text-gray-300">Extend the image options will be here.</p>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold">5. Upscale the Image</h2>
        <p className="text-sm text-gray-400">Add dummy text below</p>
        <div className="bg-gray-800 rounded-md p-4">
          <p className="text-gray-300">Image upscaling options will be here.</p>
        </div>
      </div>

      {/* Metadata Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Image Metadata</h2>
        <div className="bg-gray-800 rounded-md p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">API Timestamp</span>
              <span className="text-gray-300">2025-01-20 12:34:56</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Image Resolution</span>
              <span className="text-gray-300">1920x1080</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Image Format</span>
              <span className="text-gray-300">JPEG</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Image Size</span>
              <span className="text-gray-300">2.5 MB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Image Quality</span>
              <span className="text-gray-300">High</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Upload Status</span>
              <span className="text-gray-300">Successful</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
