import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/app/context/ThemeContext';

const EffectGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const { settings } = useTheme();

  const config = settings.gridConfig;

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

    // Helper for color alpha
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
    };
    const colorRgb = hexToRgb(config.elementColor);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += config.speed;

      // Horizon height (approx 1/3 down from top, or middle)
      const horizonY = height * 0.4;
      const fov = 300; 

      ctx.save();
      
      // Draw background gradient (Sky)
      const grad = ctx.createLinearGradient(0, 0, 0, horizonY);
      grad.addColorStop(0, config.bgColor);
      grad.addColorStop(1, config.elementColor); // Glow at horizon
      ctx.fillStyle = config.bgColor;
      ctx.fillRect(0, 0, width, height);

      // Clip below horizon for grid
      ctx.beginPath();
      ctx.rect(0, horizonY, width, height - horizonY);
      ctx.clip();
      
      // Grid Floor Color
      ctx.fillStyle = `rgba(${hexToRgb(config.bgColor)}, 0.5)`;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      ctx.strokeStyle = config.elementColor;
      ctx.lineWidth = 1;
      ctx.shadowBlur = 5;
      ctx.shadowColor = config.elementColor;

      // Vertical lines (Perspective)
      // Number of vertical lines based on intensity
      const numVLines = config.intensity + 10;
      const spacing = width * 2 / numVLines;
      
      for (let i = -numVLines; i <= numVLines; i++) {
        // Perspective calculation
        // Vanishing point is (width/2, horizonY)
        const x = width / 2 + i * spacing;
        
        ctx.beginPath();
        ctx.moveTo(width / 2, horizonY);
        // Fan out towards bottom
        // Simple perspective approximation
        const dx = (x - width / 2) * 4; 
        ctx.lineTo(width / 2 + dx, height);
        
        // Fade out lines near horizon
        const gradStroke = ctx.createLinearGradient(0, horizonY, 0, height);
        gradStroke.addColorStop(0, `rgba(${colorRgb}, 0)`);
        gradStroke.addColorStop(0.2, `rgba(${colorRgb}, 1)`);
        ctx.strokeStyle = gradStroke;
        
        ctx.stroke();
      }

      // Horizontal lines (Moving)
      // Z movement
      const zSpeed = 0.5;
      const offset = (time * zSpeed) % 50; 
      
      for (let z = 10; z < 2000; z+=50) {
         // Effective Z moves towards viewer
         let currentZ = z - offset;
         if (currentZ < 10) currentZ += 2000;

         // Project Z to Y
         // y = horizonY + scale / z
         const scale = 100000; // Arbitrary scale factor
         const y = horizonY + scale / currentZ;

         if (y > height) continue;

         const alpha = Math.min(1, (y - horizonY) / 100);

         ctx.beginPath();
         ctx.moveTo(0, y);
         ctx.lineTo(width, y);
         ctx.strokeStyle = `rgba(${colorRgb}, ${alpha})`;
         ctx.stroke();
      }

      ctx.restore();

      animationRef.current = requestAnimationFrame(render);
    };

    window.addEventListener('resize', handleResize);
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [config]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

export default EffectGrid;
