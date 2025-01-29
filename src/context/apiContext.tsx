"use client";

import React, { createContext, ReactNode, useContext } from 'react';
import {
  generateImage,
  generateOutlineImage,
  generateDepthImage,
  generatePoseImage,
  generateRenderSketch,
  generateRecolorSketch,
  generateInteriorDesign,
  generateLogo,
  generateBackgroundChangeByReference,
  generateHumanChangeByReference,
  upscaleImageByReference,
} from '../services/apiService';

interface ApiContextProps {
  generateImage: typeof generateImage;
  generateOutlineImage: typeof generateOutlineImage;
  generateDepthImage: typeof generateDepthImage;
  generatePoseImage: typeof generatePoseImage;
  generateRenderSketch: typeof generateRenderSketch;
  generateRecolorSketch: typeof generateRecolorSketch;
  generateInteriorDesign: typeof generateInteriorDesign;
  generateLogo: typeof generateLogo;
  generateBackgroundChangeByReference: typeof generateBackgroundChangeByReference;
  generateHumanChangeByReference: typeof generateHumanChangeByReference;
  upscaleImageByReference: typeof upscaleImageByReference;
}

const ApiContext = createContext<ApiContextProps>({
  generateImage,
  generateOutlineImage,
  generateDepthImage,
  generatePoseImage,
  generateRenderSketch,
  generateRecolorSketch,
  generateInteriorDesign,
  generateLogo,
  generateBackgroundChangeByReference,
  generateHumanChangeByReference,
  upscaleImageByReference,
});

export const ApiProvider = ({ children }: { children: ReactNode }) => {
  const value = {
    generateImage,
    generateOutlineImage,
    generateDepthImage,
    generatePoseImage,
    generateRenderSketch,
    generateRecolorSketch,
    generateInteriorDesign,
    generateLogo,
    generateBackgroundChangeByReference,
    generateHumanChangeByReference,
    upscaleImageByReference,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};