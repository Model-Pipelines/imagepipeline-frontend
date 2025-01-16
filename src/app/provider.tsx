"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode, useEffect, useState } from "react";

interface ProviderProps {
  children: ReactNode;
}

const Provider = ({ children }: ProviderProps) => {
  const [mounted, setMounted] = useState(false);

  // Ensures the theme is only rendered on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid rendering until mounted
  if (!mounted) {
    return <div />;
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
};

export default Provider;
