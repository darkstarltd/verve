
import React, { useRef, useEffect } from 'react';

export type EffectType = 'rain' | 'snow';

interface DigitalWeatherProps {
  effectType: EffectType;
}

export const DigitalWeather: React.FC<DigitalWeatherProps> = ({ effectType }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; speed: number; char: string; size: number }[] = [];
    
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createParticles();
    };

    const createParticles = () => {
        const particleCount = effectType === 'rain' ? Math.floor(canvas.width / 15) : 150;
        particles = [];
        const chars = effectType === 'rain' 
            ? 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
            : '*+·.';
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speed: Math.random() * (effectType === 'rain' ? 5 : 1) + 1,
                char: chars.charAt(Math.floor(Math.random() * chars.length)),
                size: effectType === 'rain' ? 14 : Math.random() * 3 + 1,
            });
        }
    };
    
    const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = effectType === 'rain' ? '#0F0' : '#FFF';
        ctx.font = `14px monospace`;

        particles.forEach(p => {
            if (effectType === 'rain') {
                ctx.fillStyle = `rgba(0, 255, 0, ${p.speed / 5})`;
                ctx.font = `${p.size}px monospace`;
                ctx.fillText(p.char, p.x, p.y);
                p.y += p.speed;
                if (p.y > canvas.height) {
                    p.y = 0;
                    p.x = Math.random() * canvas.width;
                }
            } else { // Snow
                ctx.globalAlpha = p.speed / 2;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                p.y += p.speed;
                p.x += Math.sin(p.y / 50) * 0.5; // Gentle sway
                if (p.y > canvas.height) {
                    p.y = -p.size;
                    p.x = Math.random() * canvas.width;
                }
            }
        });
        
        ctx.globalAlpha = 1; // Reset alpha
    };
    
    const animate = () => {
        draw();
        animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [effectType]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};
