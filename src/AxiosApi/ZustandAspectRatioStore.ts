import { create } from 'zustand';

interface AspectRatioState {
  aspectRatio: string;
  height: number;
  width: number;
  setAspectRatio: (ratio: string) => void;
  setDimensions: (height: number, width: number) => void;
  getAspectRatioFromDimensions: (height: number, width: number) => string;
}

export const calculateDimensions = (ratio: string) => {
  const MAX_DIMENSION = 1440;
  const SQUARE_DIMENSION = 1024;

  switch (ratio) {
      case '1:1':
          return { height: SQUARE_DIMENSION, width: SQUARE_DIMENSION };
      case '9:16': {
          const height = MAX_DIMENSION;
          const width = Math.floor((height * 9) / 16);
          return { height, width };
      }

        case '3:4': {
            // For vertical formats, height is max
            const height = MAX_DIMENSION;
            const width = Math.floor((height * 3) / 4);
            return { height, width };
        }

        case '4:3': {
            // For horizontal formats, width is max
            const width = MAX_DIMENSION;
            const height = Math.floor((width * 3) / 4);
            return { height, width };
        }

        case '16:9': {
            // For horizontal formats, width is max
            const width = MAX_DIMENSION;
            const height = Math.floor((width * 9) / 16);
            return { height, width };
        }

        case '21:9': {
            // For horizontal formats, width is max
            const width = MAX_DIMENSION;
            const height = Math.floor((width * 9) / 21);
            return { height, width };
        }

        default:
            return { 
                height: SQUARE_DIMENSION, 
                width: SQUARE_DIMENSION 
            };
    }
};

const getAspectRatioFromDimensions = (height: number, width: number): string => {
  const ratio = width / height;
  const tolerance = 0.01; // Allow small rounding differences

  const ratioMap = {
      1: '1:1',
      0.5625: '9:16',
      0.75: '3:4',
      1.333: '4:3',
      1.778: '16:9',
      2.333: '21:9'
  };

  for (const [value, name] of Object.entries(ratioMap)) {
      if (Math.abs(ratio - parseFloat(value)) < tolerance) {
          return name;
      }
  }

  return 'custom';
};


export const useAspectRatioStore = create<AspectRatioState>((set, get) => ({
  aspectRatio: '1:1',
  height: 1024,
  width: 1024,
  setAspectRatio: (ratio) => {
      const dimensions = calculateDimensions(ratio);
      set({ aspectRatio: ratio, ...dimensions });
  },
  setDimensions: (height, width) => {
      const newAspectRatio = getAspectRatioFromDimensions(height, width);
      set({ height, width, aspectRatio: newAspectRatio });
  },
  getAspectRatioFromDimensions
}));