import React, { useEffect, useRef } from 'react';
import { noise3D } from '@/app/utils/noise';
import { useTheme } from '@/app/context/ThemeContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  colorBase: string;
  alpha: number;
  targetAlpha: number;
  lifeSpeed: number;
  phase: number;
}

const EffectAether: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);
  const { settings } = useTheme();
  
  const config = settings.aetherConfig;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let particles: Particle[] = [];
    let time = 0;

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < config.intensity; i++) {
        particles.push(createParticle(true));
      }
    };

    const createParticle = (randomY: boolean = false): Particle => {
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + 10,
        vx: 0,
        vy: 0,
        size: Math.random() * 2.5 + 0.5,
        colorBase: config.elementColor,
        alpha: 0,
        targetAlpha: Math.random() * 0.6 + 0.2,
        lifeSpeed: Math.random() * 0.01 + 0.005,
        phase: Math.random() * Math.PI * 2
      };
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 1;
      const flowTime = time * 0.0001 * config.speed * 2; // base time scale

      particles.forEach((p) => {
        // Flow Field using 3D Simplex Noise
        const noiseVal = noise3D(
          p.x * 0.005, 
          p.y * 0.005, 
          flowTime
        );
        
        const angle = noiseVal * Math.PI * 4;
        let targetVx = Math.cos(angle) * 0.3 * config.speed;
        let targetVy = Math.sin(angle) * 0.3 * config.speed - 0.2; 

        // Mouse Interaction
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influenceRadius = 300;

        if (dist < influenceRadius) {
          const force = (1 - dist / influenceRadius) * 0.05;
          targetVx += dx * force;
          targetVy += dy * force;
        }

        p.vx += (targetVx - p.vx) * 0.05;
        p.vy += (targetVy - p.vy) * 0.05;

        p.x += p.vx;
        p.y += p.vy;

        p.phase += p.lifeSpeed;
        p.alpha = Math.abs(Math.sin(p.phase)) * p.targetAlpha;

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        // Use the configured color
        gradient.addColorStop(0, `${p.colorBase}${Math.floor(p.alpha * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${p.colorBase}00`);
        
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Wrap around
        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;
        if (p.y < -50) p.y = height + 50;
        if (p.y > height + 50) p.y = -50;
      });

      animationRef.current = requestAnimationFrame(render);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    initParticles();
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, [config]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

export default EffectAether;