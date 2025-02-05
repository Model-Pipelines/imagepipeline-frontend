import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import {
  generateImage,
  describeImage,
  controlNet,
  renderSketch,
  recolorImage,
  interiorDesign,
  generateLogo,
  faceControl,
  changeBackground,
  changeHuman,
  upscaleImage,
  uploadFiles,
  uploadBackendFiles,
} from './GenerativeApi';
import {
  GenerateImagePayload,
  ControlNetPayload,
  RenderSketchPayload,
  RecolorImagePayload,
  InteriorDesignPayload,
  GenerateLogoPayload,
  FaceControlPayload,
  ChangeBackgroundPayload,
  ChangeHumanPayload,
  UpscaleImagePayload,
  UploadFilesPayload,
} from "./types";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { useImageStore } from "./ZustandImageStore"; // Your Zustand store

// Cache Keys
const cacheKeys = {
  GENERATE_IMAGE: 'generateImage',
  DESCRIBE_IMAGE: 'describeImage',
  CONTROL_NET: 'controlNet',
  RENDER_SKETCH: 'renderSketch',
  RECOLOR_IMAGE: 'recolorImage',
  INTERIOR_DESIGN: 'interiorDesign',
  GENERATE_LOGO: 'generateLogo',
  FACE_CONTROL: 'faceControl',
  CHANGE_BACKGROUND: 'changeBackground',
  CHANGE_HUMAN: 'changeHuman',
  UPSCALE_IMAGE: 'upscaleImage',
  UPLOAD_FILES: 'uploadFiles',
  UPLOAD_BACKEND_FILES: 'uploadBackendFiles',
};

// Generate Image Mutation
export const useGenerateImage = () => {
  const { toast } = useToast();
  const addImage = useImageStore((state) => state.addImage); // Zustand action to add image

  return useMutation({
    mutationKey: [cacheKeys.GENERATE_IMAGE],
    mutationFn: (data: GenerateImagePayload) => generateImage(data),
    onSuccess: (response) => {
      // Add the generated image to the Zustand store
      const newImage = {
        id: uuidv4(), // Generate a unique UUID
        url: response.data.image_url, // Assume the API returns the public URL
        name: "Generated Image", // Default name
      };
      addImage(newImage);

      toast({
        title: "Success",
        description: "Image generated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate image.",
        variant: "destructive",
      });
      console.error('Error generating image:', error);
    },
  });
};

// Describe Image Query
export const useDescribeImage = (inputImage: string) => {
  const { toast } = useToast();
  const addImage = useImageStore((state) => state.addImage); // Zustand action to add image

  return useQuery({
    queryKey: [cacheKeys.DESCRIBE_IMAGE, inputImage],
    queryFn: () => describeImage({ input_image: inputImage }),
    enabled: !!inputImage,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    onSuccess: (response) => {
      // Add the described image to the Zustand store
      const newImage = {
        id: uuidv4(), // Generate a unique UUID
        url: inputImage, // Use the input image URL
        name: "Described Image", // Default name
        description: response.data.description, // Description from the API
      };
      addImage(newImage);

      toast({
        title: "Success",
        description: "Image described successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to describe image.",
        variant: "destructive",
      });
      console.error('Error describing image:', error);
    },
  });
};

// ControlNet Mutation (Outline, Depth, Pose)
export const useControlNet = () => {
  const { toast } = useToast();
  const addImage = useImageStore((state) => state.addImage); // Zustand action to add image

  return useMutation({
    mutationKey: [cacheKeys.CONTROL_NET],
    mutationFn: (data: ControlNetPayload) => controlNet(data),
    onSuccess: (response) => {
      // Add the processed image to the Zustand store
      const newImage = {
        id: uuidv4(), // Generate a unique UUID
        url: response.data.image_url, // Assume the API returns the public URL
        name: "ControlNet Image", // Default name
      };
      addImage(newImage);

      toast({
        title: "Success",
        description: "ControlNet applied successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to apply ControlNet.",
        variant: "destructive",
      });
      console.error('Error applying ControlNet:', error);
    },
  });
};

// Render Sketch Mutation
export const useRenderSketch = () => {
  const { toast } = useToast();
  const addImage = useImageStore((state) => state.addImage); // Zustand action to add image

  return useMutation({
    mutationKey: [cacheKeys.RENDER_SKETCH],
    mutationFn: (data: RenderSketchPayload) => renderSketch(data),
    onSuccess: (response) => {
      // Add the rendered sketch to the Zustand store
      const newImage = {
        id: uuidv4(), // Generate a unique UUID
        url: response.data.image_url, // Assume the API returns the public URL
        name: "Rendered Sketch", // Default name
      };
      addImage(newImage);

      toast({
        title: "Success",
        description: "Sketch rendered successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to render sketch.",
        variant: "destructive",
      });
      console.error('Error rendering sketch:', error);
    },
  });
};

// Recolor Image Mutation
export const useRecolorImage = () => {
  const { toast } = useToast();
  const addImage = useImageStore((state) => state.addImage); // Zustand action to add image

  return useMutation({
    mutationKey: [cacheKeys.RECOLOR_IMAGE],
    mutationFn: (data: RecolorImagePayload) => recolorImage(data),
    onSuccess: (response) => {
      // Add the recolored image to the Zustand store
      const newImage = {
        id: uuidv4(), // Generate a unique UUID
        url: response.data.image_url, // Assume the API returns the public URL
        name: "Recolored Image", // Default name
      };
      addImage(newImage);

      toast({
        title: "Success",
        description: "Image recolored successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to recolor image.",
        variant: "destructive",
      });
      console.error('Error recoloring image:', error);
    },
  });
};

// Interior Design Mutation
export const useInteriorDesign = () => {
  const { toast } = useToast();
  const addImage = useImageStore((state) => state.addImage); // Zustand action to add image

  return useMutation({
    mutationKey: [cacheKeys.INTERIOR_DESIGN],
    mutationFn: (data: InteriorDesignPayload) => interiorDesign(data),
    onSuccess: (response) => {
      // Add the interior design image to the Zustand store
      const newImage = {
        id: uuidv4(), // Generate a unique UUID
        url: response.data.image_url, // Assume the API returns the public URL
        name: "Interior Design Image", // Default name
      };
      addImage(newImage);

      toast({
        title: "Success",
        description: "Interior design applied successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to apply interior design.",
        variant: "destructive",
      });
      console.error('Error applying interior design:', error);
    },
  });
};

// Generate Logo Mutation
export const useGenerateLogo = () => {
  const { toast } = useToast();
  const addImage = useImageStore((state) => state.addImage); // Zustand action to add image

  return useMutation({
    mutationKey: [cacheKeys.GENERATE_LOGO],
    mutationFn: (data: GenerateLogoPayload) => generateLogo(data),
    onSuccess: (response) => {
      // Add the generated logo to the Zustand store
      const newImage = {
        id: uuidv4(), // Generate a unique UUID
        url: response.data.image_url, // Assume the API returns the public URL
        name: "Generated Logo", // Default name
      };
      addImage(newImage);

      toast({
        title: "Success",
        description: "Logo generated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate logo.",
        variant: "destructive",
      });
      console.error('Error generating logo:', error);
    },
  });
};

// Face Control Mutation
export const useFaceControl = () => {
  const { toast } = useToast();
  const addImage = useImageStore((state) => state.addImage); // Zustand action to add image

  return useMutation({
    mutationKey: [cacheKeys.FACE_CONTROL],
    mutationFn: (data: FaceControlPayload) => faceControl(data),
    onSuccess: (response) => {
      // Add the face-controlled image to the Zustand store
      const newImage = {
        id: uuidv4(), // Generate a unique UUID
        url: response.data.image_url, // Assume the API returns the public URL
        name: "Face-Controlled Image", // Default name
      };
      addImage(newImage);

      toast({
        title: "Success",
        description: "Face control applied successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to apply face control.",
        variant: "destructive",
      });
      console.error('Error controlling face:', error);
    },
  });
};

// Change Background Mutation
export const useChangeBackground = () => {
  const { toast } = useToast();
  const addImage = useImageStore((state) => state.addImage); // Zustand action to add image

  return useMutation({
    mutationKey: [cacheKeys.CHANGE_BACKGROUND],
    mutationFn: (data: ChangeBackgroundPayload) => changeBackground(data),
    onSuccess: (response) => {
      // Add the background-changed image to the Zustand store
      const newImage = {
        id: uuidv4(), // Generate a unique UUID
        url: response.data.image_url, // Assume the API returns the public URL
        name: "Background-Changed Image", // Default name
      };
      addImage(newImage);

      toast({
        title: "Success",
        description: "Background changed successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to change background.",
        variant: "destructive",
      });
      console.error('Error changing background:', error);
    },
  });
};

// Change Human Mutation
export const useChangeHuman = () => {
  const { toast } = useToast();
  const addImage = useImageStore((state) => state.addImage); // Zustand action to add image

  return useMutation({
    mutationKey: [cacheKeys.CHANGE_HUMAN],
    mutationFn: (data: ChangeHumanPayload) => changeHuman(data),
    onSuccess: (response) => {
      // Add the human-changed image to the Zustand store
      const newImage = {
        id: uuidv4(), // Generate a unique UUID
        url: response.data.image_url, // Assume the API returns the public URL
        name: "Human-Changed Image", // Default name
      };
      addImage(newImage);

      toast({
        title: "Success",
        description: "Human changed successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to change human.",
        variant: "destructive",
      });
      console.error('Error changing human:', error);
    },
  });
};

// Upscale Image Mutation
export const useUpscaleImage = () => {
  const { toast } = useToast();
  const addImage = useImageStore((state) => state.addImage); // Zustand action to add image

  return useMutation({
    mutationKey: [cacheKeys.UPSCALE_IMAGE],
    mutationFn: (data: UpscaleImagePayload) => upscaleImage(data),
    onSuccess: (response) => {
      // Add the upscaled image to the Zustand store
      const newImage = {
        id: uuidv4(), // Generate a unique UUID
        url: response.data.image_url, // Assume the API returns the public URL
        name: "Upscaled Image", // Default name
      };
      addImage(newImage);

      toast({
        title: "Success",
        description: "Image upscaled successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upscale image.",
        variant: "destructive",
      });
      console.error('Error upscaling image:', error);
    },
  });
};

// File Upload Mutation for Multiple Files
export const useUploadFiles = () => {
  const { toast } = useToast();
  const addImage = useImageStore((state) => state.addImage); // Zustand action to add image

  return useMutation({
    mutationKey: [cacheKeys.UPLOAD_FILES],
    mutationFn: ({ userUploadedImage, maskImageUrl }: UploadFilesPayload) =>
      uploadFiles(userUploadedImage, maskImageUrl),
    onSuccess: (response) => {
      // Add the uploaded image(s) to the Zustand store
      response.data.image_urls.forEach((url: string) => {
        const newImage = {
          id: uuidv4(), // Generate a unique UUID
          url: url, // Public URL from the API
          name: "Uploaded Image", // Default name
        };
        addImage(newImage);
      });

      toast({
        title: "Success",
        description: "Files uploaded successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload files.",
        variant: "destructive",
      });
      console.error('Error uploading files:', error);
    },
  });
};

// File Upload Mutation for Single Backend File
export const useUploadBackendFiles = () => {
  const { toast } = useToast();
  const addImage = useImageStore((state) => state.addImage); // Zustand action to add image

  return useMutation({
    mutationKey: [cacheKeys.UPLOAD_BACKEND_FILES],
    mutationFn: (file: File) => uploadBackendFiles(file),
    onSuccess: (response) => {
      // Add the uploaded backend file to the Zustand store
      const newImage = {
        id: uuidv4(), // Generate a unique UUID
        url: response.data.image_url, // Assume the API returns the public URL
        name: "Backend Uploaded Image", // Default name
      };
      addImage(newImage);

      toast({
        title: "Success",
        description: "Backend file uploaded successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload backend file.",
        variant: "destructive",
      });
      console.error('Error uploading backend files:', error);
    },
  });
};
