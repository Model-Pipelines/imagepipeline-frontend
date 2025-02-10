"use client";
import { SignUp } from '@clerk/nextjs';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const InteractiveCanvas = ({ prompt, style }) => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Generate neural network nodes
    const newNodes = Array.from({ length: 50 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 2,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    }));

    setNodes(newNodes);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      nodes.forEach((node, i) => {
        nodes.slice(i + 1).forEach(target => {
          const distance = Math.hypot(target.x - node.x, target.y - node.y);
          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = `rgba(255,255,255,${1 - distance / 150})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [nodes]);

  return <canvas ref={canvasRef} className="absolute inset-0" />;
};

const StyleCard = ({ style, isActive, onClick }) => {
  return (
    <motion.div
      className={`relative cursor-pointer rounded-xl overflow-hidden border-2 ${isActive ? 'border-purple-400' : 'border-gray-700'
        }`}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
    >
      <div className="h-32 bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <span className="text-lg font-bold text-white">{style.name}</span>
          <p className="text-sm text-gray-400 mt-1">{style.example}</p>
        </div>
      </div>
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-purple-400/10 border-2 border-purple-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </motion.div>
  );
};

export default function Page() {
  const [activeStyle, setActiveStyle] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef(null);

  const styles = [
    { name: 'Cyberpunk', example: 'Neon-lit cityscape', color: '#9333ea' },
    { name: 'Surreal', example: 'Floating islands', color: '#3b82f6' },
    { name: 'Painting', example: 'Oil brush strokes', color: '#10b981' },
    { name: '3D', example: 'Hyper-realistic', color: '#ef4444' }
  ];

  const handlePromptSubmit = (e) => {
    e.preventDefault();
    if (!prompt) return;

    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-900 flex items-center justify-center overflow-hidden relative"
      onMouseMove={(e) => {
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }}
    >
      {/* Interactive Neural Network Visualization */}
      <div className="absolute inset-0 opacity-30">
        <InteractiveCanvas prompt={prompt} style={styles[activeStyle]} />
      </div>

      {/* Floating Style Previews */}
      <div className="absolute inset-0 pointer-events-none">
        {styles.map((style, i) => (
          <motion.div
            key={style.name}
            className="absolute w-64 h-64 rounded-xl overflow-hidden"
            style={{
              x: useTransform(mouseX, (val) => val + Math.sin(Date.now() * 0.001 + i) * 50),
              y: useTransform(mouseY, (val) => val + Math.cos(Date.now() * 0.001 + i) * 50),
              rotate: useTransform(mouseX, [0, window.innerWidth], [-15, 15])
            }}
          >
            <div className="h-full bg-gray-800 border-2 border-gray-700 rounded-xl p-4">
              <h3 className="text-white font-bold">{style.name}</h3>
              <p className="text-gray-400 text-sm mt-2">{style.example}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Interface */}
      <motion.div
        className="relative bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-gray-700 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Style Selector Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {styles.map((style, i) => (
            <StyleCard
              key={style.name}
              style={style}
              isActive={activeStyle === i}
              onClick={() => setActiveStyle(i)}
            />
          ))}
        </div>

        {/* Prompt Input */}
        <form onSubmit={handlePromptSubmit} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your vision..."
              className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
            />
            <motion.button
              type="submit"
              className="absolute right-2 top-2 bg-purple-400 text-white px-4 py-1 rounded-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Preview
            </motion.button>
          </div>
        </form>

        {/* AI Process Visualization */}
        <div className="h-48 rounded-lg bg-gray-900/50 border-2 border-dashed border-gray-700 mb-8 relative overflow-hidden">
          <AnimatePresence>
            {isGenerating ? (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center">
                  <div className="flex justify-center space-x-2 mb-4">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-purple-400 rounded-full"
                        animate={{ y: [0, -20, 0] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-purple-400 text-sm">
                    Imagining {prompt} in {styles[activeStyle].name} style...
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-gray-500 text-sm">
                  Describe your vision to see a preview
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Signup Form */}
        <SignUp
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-transparent shadow-none space-y-6',
              headerTitle: 'text-2xl font-bold text-white text-center',
              headerSubtitle: 'text-gray-400 text-center',
              socialButtonsBlockButton: 'bg-gray-700/50 border-gray-600 hover:bg-gray-700',
              socialButtonsBlockButtonText: 'text-gray-200',
              dividerText: 'text-gray-500',
              formFieldLabel: 'text-gray-300',
              formFieldInput: 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20',
              formButtonPrimary: 'bg-purple-400 hover:bg-purple-500 text-white',
              footerActionText: 'text-gray-400',
              footerActionLink: 'text-purple-400 hover:text-purple-300'
            }
          }}
        />
      </motion.div>

      {/* Interactive Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              x: useTransform(mouseX, (val) => val + (Math.random() - 0.5) * 100),
              y: useTransform(mouseY, (val) => val + (Math.random() - 0.5) * 100)
            }}
            animate={{
              scale: [0.5, 1, 0.5],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity
            }}
          />
        ))}
      </div>
    </div>
  );
}
