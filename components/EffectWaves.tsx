import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/app/context/ThemeContext';

const EffectWaves: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const { settings } = useTheme();

  const config = settings.wavesConfig;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let time = 0;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    // Helper to get RGB values from hex
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 255, g: 255, b: 255 };
    };

    const rgb = hexToRgb(config.elementColor);
    const baseColorStr = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

    // Configuration for the wave layers based on dynamic config
    const waves = [
      { amplitude: 1.0 * config.intensity, frequency: 0.002, speed: 0.01 * config.speed, opacity: 0.05, yOffset: 0 },
      { amplitude: 1.5 * config.intensity, frequency: 0.003, speed: 0.007 * config.speed, opacity: 0.05, yOffset: 50 },
      { amplitude: 0.8 * config.intensity, frequency: 0.001, speed: 0.015 * config.speed, opacity: 0.05, yOffset: -50 }
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 1;

      // Iterate through each defined wave
      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        
        // Draw the sine wave
        for (let x = 0; x <= width; x += 10) {
          const y = (height / 2) + wave.yOffset + 
                    Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude +
                    Math.sin(x * wave.frequency * 0.5 + time * wave.speed * 0.5) * (wave.amplitude * 0.5);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        
        ctx.fillStyle = `rgba(${baseColorStr}, ${wave.opacity})`;
        ctx.fill();
        
        // Add a subtle stroke for definition
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(${baseColorStr}, ${wave.opacity * 2})`;
        ctx.stroke();
      });

      animationRef.current = requestAnimationFrame(render);
    };

    window.addEventListener('resize', handleResize);
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [config]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen" />;
};

export default EffectWaves;