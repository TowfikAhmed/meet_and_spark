import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/app/context/ThemeContext';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  brightness: number;
}

const EffectCosmos: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { settings } = useTheme();

  const config = settings.cosmosConfig;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars: Star[] = [];

    // Initialize stars at random 3D coordinates
    const initStars = () => {
        stars.length = 0;
        for (let i = 0; i < config.intensity; i++) {
            stars.push({
                x: Math.random() * width - width / 2,
                y: Math.random() * height - height / 2,
                z: Math.random() * width,
                size: Math.random() * 1.5,
                brightness: Math.random(),
            });
        }
    }
    initStars();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initStars();
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse from -1 to 1
      mouseRef.current = {
        x: (e.clientX - width / 2) * 0.05,
        y: (e.clientY - height / 2) * 0.05
      };
    };

    // Helper for Hex to RGB
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
    };
    const colorRgb = hexToRgb(config.elementColor);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      stars.forEach((star) => {
        // Move star towards screen
        star.z -= config.speed;

        // Reset if it passes the screen
        if (star.z <= 0) {
          star.z = width;
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
        }

        // Project 3D to 2D
        const k = 128.0 / star.z;
        const px = star.x * k + cx + (mouseRef.current.x * (width - star.z) * 0.001);
        const py = star.y * k + cy + (mouseRef.current.y * (width - star.z) * 0.001);

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const size = (1 - star.z / width) * 2.5 * star.size;
          const alpha = (1 - star.z / width) * star.brightness;
          
          ctx.beginPath();
          ctx.fillStyle = `rgba(${colorRgb}, ${alpha})`;
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(render);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, [config]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

export default EffectCosmos;