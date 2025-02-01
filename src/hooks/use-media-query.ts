import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Set the initial value
    setMatches(media.matches)

    // Define a callback function to handle changes
    const listener = () => setMatches(media.matches)

    // Add the listener to handle changes
    media.addEventListener("change", listener)

    // Remove the listener when the component unmounts
    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}

