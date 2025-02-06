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
} from "@/AxiosApi/GenerativeApi";

import { ChangeBackgroundPayload, ChangeHumanPayload, ControlNetPayload, FaceControlPayload, GenerateImagePayload, GenerateLogoPayload, InteriorDesignPayload, RecolorImagePayload, RenderSketchPayload, UploadFilesPayload, UpscaleImagePayload } from './types';

// Generate Image Mutation
export const useGenerateImage = () => {
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['generateImage'],
    mutationFn: (data: GenerateImagePayload) => generateImage(data),
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Image generated successfully!",
      });
      return response.data.image_url; // Return the URL for external handling
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

  return useQuery({
    queryKey: ['describeImage', inputImage],
    queryFn: () => describeImage({ input_image: inputImage }),
    enabled: !!inputImage,
    staleTime: 1000 * 60 * 5,
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Image described successfully!",
      });
      return {
        url: inputImage,
        description: response.data.description,
      }; // Return data for external handling
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

// Upload Files Mutation
export const useUploadFiles = () => {
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['uploadFiles'],
    mutationFn: ({ userUploadedImage, maskImageUrl }: UploadFilesPayload) =>
      uploadFiles(userUploadedImage, maskImageUrl),
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Files uploaded successfully!",
      });
      return response.data.image_urls; // Return URLs for external handling
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

// Upload Backend Files Mutation
export const useUploadBackendFiles = () => {
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['uploadBackendFiles'],
    mutationFn: (file: File) => uploadBackendFiles(file),
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Backend file uploaded successfully!",
      });
      return response; // Return the URL directly (response is already the URL)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload backend file.",
        variant: "destructive",
      });
      console.error('Error uploading backend files:', error);
    },
  });
};

// ControlNet Mutation
export const useControlNet = () => {
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['controlNet'],
    mutationFn: (data: ControlNetPayload) => controlNet(data),
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "ControlNet applied successfully!",
      });
      return response.data.image_url; // Return URL for external handling
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

  return useMutation({
    mutationKey: ['renderSketch'],
    mutationFn: (data: RenderSketchPayload) => renderSketch(data),
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Sketch rendered successfully!",
      });
      return response.data.image_url; // Return URL for external handling
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

  return useMutation({
    mutationKey: ['recolorImage'],
    mutationFn: (data: RecolorImagePayload) => recolorImage(data),
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Image recolored successfully!",
      });
      return response.data.image_url; // Return URL for external handling
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

  return useMutation({
    mutationKey: ['interiorDesign'],
    mutationFn: (data: InteriorDesignPayload) => interiorDesign(data),
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Interior design applied successfully!",
      });
      return response.data.image_url; // Return URL for external handling
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

  return useMutation({
    mutationKey: ['generateLogo'],
    mutationFn: (data: GenerateLogoPayload) => generateLogo(data),
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Logo generated successfully!",
      });
      return response.data.image_url; // Return URL for external handling
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

  return useMutation({
    mutationKey: ['faceControl'],
    mutationFn: (data: FaceControlPayload) => faceControl(data),
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Face control applied successfully!",
      });
      return response.data.image_url; // Return URL for external handling
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

  return useMutation({
    mutationKey: ['changeBackground'],
    mutationFn: (data: ChangeBackgroundPayload) => changeBackground(data),
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Background changed successfully!",
      });
      return response.data.image_url; // Return URL for external handling
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

  return useMutation({
    mutationKey: ['changeHuman'],
    mutationFn: (data: ChangeHumanPayload) => changeHuman(data),
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Human changed successfully!",
      });
      return response.data.image_url; // Return URL for external handling
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

  return useMutation({
    mutationKey: ['upscaleImage'],
    mutationFn: (data: UpscaleImagePayload) => upscaleImage(data),
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Image upscaled successfully!",
      });
      return response.data.image_url; // Return URL for external handling
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
