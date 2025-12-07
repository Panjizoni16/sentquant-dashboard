import React, { useEffect, useRef } from 'react';

// --- COMPONENT: CUSTOM Q LOGO ---
// Menggunakan logo yang sama agar branding tetap konsisten
const LOGO_PATHS = [
  "M490 333.1c-60.3 7.7-116.7 49.2-142.8 104.9-5.7 12.2-11.3 29.4-14.3 44-2.2 10.3-2.4 14-2.3 35.5 0 13.2.5 25 1 26.3.9 2.1 1.8 1.3 13.9-12.5 7.2-8.1 19.1-21.5 26.5-29.8 7.5-8.2 27.6-31 44.6-50.5 17.1-19.5 38-43.2 46.5-52.6s25.1-27.7 36.9-40.8 21.7-24.2 21.8-24.7c.4-1.1-22.9-1-31.8.2",
  "M540.8 334.9c-.3.9-22.7 26.6-28.7 33.1-5.7 6.1-22.1 24.8-22.1 25.2 0 .3 2.4.1 5.3-.4 8.1-1.4 31.4-1.4 39.7.1 54.3 9.5 96.5 52.3 103.6 105.1 1.8 13.6 1.8 21.8-.2 34.9-3.5 24.3-15.6 50.7-31.2 68.1l-4.8 5.3-6.2-6.8-6.3-6.9-36.2.3c-19.9.1-36.3.3-36.4.4 0 .1 24.9 25.5 55.5 56.5l55.7 56.3 35.9-.1h35.9l-4.3-4.7c-3.8-4.2-11.2-11.9-44.3-46l-8-8.1 8.4-9.4c22.9-25.7 39.1-59.3 45-93.3 2.8-16.3 3-40.6.5-56.5-11.9-75.6-68.5-135.1-144.6-152.1-9.7-2.1-11.7-2.3-12.2-1",
  "M385 511.5c-2.5 2.9-12.8 14.5-23 25.9-10.2 11.5-20 22.6-21.9 24.8l-3.3 3.9 3.2 9.2c9.5 27.6 24.6 51.3 46.1 72.3 39.2 38.2 90.2 56.8 144.1 52.6 19.7-1.6 42.2-6.3 54.9-11.5l3.1-1.2-23.3-23.9-23.4-23.8-6.5 1.3c-9.1 1.7-30.7 1.5-40.5-.5-27.7-5.7-48.1-16.3-66.5-34.6-25.2-24.9-36.2-50-37.9-86.5l-.6-13.1z"
];

const SentquantLogo = ({ size = 120, animate = false }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 1024 1024"
    className={`drop-shadow-[0_0_35px_rgba(163,163,163,0.4)] ${animate ? 'animate-pulse-slow' : ''}`}
  >
    <g transform="translate(512, 512) scale(1.4) translate(-512, -512)">
      {LOGO_PATHS.map((d, i) => (
        <path key={i} fill="#FFFFFF" d={d} />
      ))}
    </g>
  </svg>
);

// --- COMPONENT: WARP BACKGROUND ---
// Efek background bintang bergerak
const WarpBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    let animationFrameId;
    let stars = [];
    const numStars = 100; // Dikurangi sedikit agar lebih tenang
    const speed = 0.5; // Lebih lambat untuk suasana maintenance
    
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    
    for(let i=0; i<numStars; i++){ stars.push({ x: Math.random() * w - w/2, y: Math.random() * h - h/2, z: Math.random() * w }); }
    
    const draw = () => {
      if(!ctx) return;
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, w, h);
      const cx = w/2; const cy = h/2;
      stars.forEach(star => {
        star.z -= speed;
        if(star.z <= 0) { star.x = Math.random() * w - w/2; star.y = Math.random() * h - h/2; star.z = w; }
        const x = (star.x / star.z) * w + cx;
        const y = (star.y / star.z) * h + cy;
        const size = Math.max(0, (1 - star.z / w) * 2.5);
        const alpha = Math.max(0, Math.min(1, (1 - star.z / w)));
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI*2); ctx.fill();
      });
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none" />;
};

// --- MAIN APP ---
export default function App() {
  return (
    <div className="flex flex-col h-screen w-full bg-black text-[#d1d4dc] font-sans items-center justify-center relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700;800&display=block');
        .font-eth { font-family: 'Montserrat', sans-serif; }
        body, .font-sans { font-family: 'Inter', sans-serif; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .7; } }
      `}</style>

      {/* Background Effect */}
      <WarpBackground />

      {/* Content Container */}
      <div className="z-10 flex flex-col items-center text-center px-6 max-w-2xl animate-fade-in-up">
        
        {/* Logo */}
        <div className="mb-8">
            <SentquantLogo size={140} animate={true} />
        </div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-6xl font-bold font-eth text-white tracking-tighter mb-4 drop-shadow-2xl">
          Under Maintenance
        </h1>

        {/* Subtitle / Description */}
        <div className="space-y-4">
            <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed">
              Sentquant Systems is undergoing scheduled maintenance to improve performance and security.
            </p>
            
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#22ab94] to-transparent mx-auto my-6 opacity-50"></div>
            
            <p className="text-sm text-gray-500 font-mono">
              ESTIMATED TIME REMAINING: <span className="text-[#22ab94]">UNKNOWN</span>
            </p>
        </div>

        {/* Optional: Social Links or Contact Placeholder */}
        <div className="mt-12 flex gap-4">
           <a href="#" className="text-xs text-gray-600 hover:text-white transition-colors uppercase tracking-widest font-bold">Twitter</a>
           <span className="text-gray-800">•</span>
           <a href="#" className="text-xs text-gray-600 hover:text-white transition-colors uppercase tracking-widest font-bold">Discord</a>
           <span className="text-gray-800">•</span>
           <a href="#" className="text-xs text-gray-600 hover:text-white transition-colors uppercase tracking-widest font-bold">Support</a>
        </div>

      </div>

      {/* Footer Copyright */}
      <div className="absolute bottom-6 text-[10px] text-gray-700 font-mono uppercase tracking-widest z-10">
        © 2025 Sentquant Systems. All systems offline.
      </div>

    </div>
  );
}
