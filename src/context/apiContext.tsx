import React, { createContext, ReactNode, useContext } from 'react';
import {
  generateImage,
  generateControlNetImage,
  generateSDXLControlNetImage,
  generateLogo,
} from '../services/apiService';

interface ApiContextProps {
  generateImage: typeof generateImage;
  generateControlNetImage: typeof generateControlNetImage;
  generateSDXLControlNetImage: typeof generateSDXLControlNetImage;
  generateLogo: typeof generateLogo;
}

// Create context with a default value matching the interface
const ApiContext = createContext<ApiContextProps>({
  generateImage,
  generateControlNetImage,
  generateSDXLControlNetImage,
  generateLogo,
});

export const ApiProvider = ({ children }: { children: ReactNode }) => {
  const value = {
    generateImage,
    generateControlNetImage,
    generateSDXLControlNetImage,
    generateLogo,
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
