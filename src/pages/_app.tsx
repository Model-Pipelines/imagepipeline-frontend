"use client"

import { AppProps } from "next/app";
import { ApiProvider } from "../context/apiContext";
// import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApiProvider>
      <Component {...pageProps} />
    </ApiProvider>
  );
}

export default MyApp;
