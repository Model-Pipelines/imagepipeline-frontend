export interface CanvasElement {
    id: string;
    type: 'image' | 'video' | 'audio' | 'text';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    zIndex: number;
    content: string; // URL for media, text content for text elements
    scale: number;
  }
  
  export interface CanvasState {
    elements: CanvasElement[];
    viewportTransform: {
      x: number;
      y: number;
      scale: number;
    };
    selectedElementId: string | null;
  }

  export interface ColorPalette {
    name: string
    colors: string[]
  }
  
  export interface ColorPaletteProps {
    onSelectPalette?: (palette: ColorPalette) => void
    defaultPalette?: string
  }