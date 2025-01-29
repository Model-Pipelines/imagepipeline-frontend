import React from "react"

const LoadingSpinner = () => {
  return (
    <div className="relative w-10 h-10">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-red-500 rounded-full transform-gpu"
          style={{
            opacity: 1 - i * 0.1,
            animation: `spinnerDot 1s linear infinite`,
            animationDelay: `${-i * 0.125}s`,
            transform: `rotate(${i * 45}deg) translate(12px, 0)`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes spinnerDot {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  )
}

export default LoadingSpinner