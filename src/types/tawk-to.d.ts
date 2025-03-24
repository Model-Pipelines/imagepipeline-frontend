declare module '@tawk.to/tawk-messenger-react' {
    import { ComponentType, Ref, ComponentClass } from 'react';
  
    interface TawkMessengerProps {
      propertyId: string;
      widgetId: string;
      ref?: Ref<TawkMessengerRef>;
      onLoad?: () => void;
      onStatusChange?: (status: string) => void;
      onBeforeLoad?: () => void;
      onChatMaximized?: () => void;
      onChatMinimized?: () => void;
      onChatHidden?: () => void;
      onChatStarted?: () => void;
      onChatEnded?: () => void;
      onPrechatSubmit?: (data: any) => void;
      onOfflineSubmit?: (data: any) => void;
    }
  
    interface TawkMessengerRef {
      maximize: () => void;
      minimize: () => void;
      toggle: () => void;
      getWindow: () => Window;
      showWidget: () => void;
      hideWidget: () => void;
      toggleVisibility: () => void;
    }
  
    const TawkMessengerReact: ComponentType<TawkMessengerProps>;
    export default TawkMessengerReact;
  }