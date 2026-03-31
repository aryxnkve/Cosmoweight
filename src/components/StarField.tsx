import { useEffect, useRef } from 'react';

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let stars: { x: number; y: number; size: number; opacity: number; speed: number; twinkleSpeed: number; twinkleOffset: number }[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      initStars();
    }

    function initStars() {
      const count = Math.floor((canvas!.width * canvas!.height) / 3000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        size: Math.random() * 2 + 0.3,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.02 + 0.005,
        twinkleSpeed: Math.random() * 0.015 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      }));
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Subtle nebula effect
      const gradient = ctx!.createRadialGradient(
        canvas!.width * 0.7, canvas!.height * 0.3, 0,
        canvas!.width * 0.7, canvas!.height * 0.3, canvas!.width * 0.5
      );
      gradient.addColorStop(0, 'rgba(40, 20, 80, 0.03)');
      gradient.addColorStop(0.5, 'rgba(20, 40, 80, 0.02)');
      gradient.addColorStop(1, 'transparent');
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      // Draw stars
      for (const star of stars) {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
        const alpha = star.opacity * twinkle;

        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(200, 210, 240, ${alpha})`;
        ctx!.fill();

        // Star glow for larger stars
        if (star.size > 1.2) {
          ctx!.beginPath();
          ctx!.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(180, 200, 255, ${alpha * 0.08})`;
          ctx!.fill();
        }
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    animationId = requestAnimationFrame(draw);

    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="starfield">
      <canvas ref={canvasRef} className="starfield-canvas" />
    </div>
  );
}
