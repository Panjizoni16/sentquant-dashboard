import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart as RechartsBarChart, Bar, Cell 
} from 'recharts';
import { 
  Menu, X, ChevronDown, Filter, ArrowUpRight, Circle, Lock, Info, Star
} from 'lucide-react';

// --- COMPONENT: CUSTOM Q LOGO (SVG REPLICA) ---
const SentquantLogo = ({ size = 120 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="animate-fade-in-up drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]"
  >
    <defs>
      <mask id="cut-mask">
        <rect width="100" height="100" fill="white" />
        <path d="M18 18 L40 40" stroke="black" strokeWidth="8" strokeLinecap="square" />
        <path d="M60 60 L90 90" stroke="black" strokeWidth="0" /> 
      </mask>
    </defs>
    
    <g mask="url(#cut-mask)">
      <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="15" />
    </g>
    
    <path d="M62 62 L78 78 L90 90 L95 85 L70 55 L62 62Z" fill="white" />
    <path d="M58 68 L85 95 L70 95 L52 75 L58 68" fill="white" />
  </svg>
);

// --- COMPONENT: MONTHLY HEATMAP (REUSABLE & FILTERABLE) ---
const MonthlyHeatmap = ({ data, enableFilter = false }) => {
  // State untuk rentang tahun yang dipilih (Default: 2020-2025)
  const [selectedRange, setSelectedRange] = useState('2020-2025');
  
  // Daftar rentang filter
  const filterRanges = ['2020-2025', '2015-2019', '2010-2014', '2005-2009'];

  // Logika Filter Data
  const filteredData = useMemo(() => {
    // Jika filter dimatikan (misal di page Live), tampilkan semua data atau batasi sesuai kebutuhan
    if (!enableFilter) return data;

    const [start, end] = selectedRange.split('-').map(Number);
    
    return data.filter(row => {
      const year = parseInt(row.year);
      return year >= start && year <= end;
    });
  }, [data, enableFilter, selectedRange]);

  return (
    <div className="mb-10 animate-fade-in-up mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="text-2xl font-bold text-white drop-shadow-md font-eth">Monthly Returns Heatmap</h3>
          
          {/* FITUR FILTER KHUSUS HISTORICAL */}
          {enableFilter ? (
            <div className="flex flex-wrap gap-2">
              {filterRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all border border-white/10 
                    ${selectedRange === range 
                      ? 'bg-[#22ab94] text-black shadow-[0_0_10px_rgba(34,171,148,0.4)] border-transparent' 
                      : 'bg-black/40 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                >
                  {range}
                </button>
              ))}
            </div>
          ) : (
            // Indikator Legenda (Hanya muncul jika filter mati / default)
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs text-gray-400"><div className="w-2 h-2 bg-[#22ab94] rounded-sm"></div> Positif</span>
              <span className="flex items-center gap-1 text-xs text-gray-400"><div className="w-2 h-2 bg-[#f23645] rounded-sm"></div> Negatif</span>
            </div>
          )}
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-2 rounded-xl bg-black/10 backdrop-blur-sm p-2">
          <table className="w-full text-sm border-collapse min-w-[800px]">
            <thead>
                <tr>
                  <th className="text-left text-gray-400 font-medium py-3 px-2">Tahun</th>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                      <th key={m} className="text-center text-gray-400 font-medium py-3 px-2">{m}</th>
                  ))}
                  <th className="text-center text-gray-400 font-medium py-3 px-2">Tahunan</th>
                </tr>
            </thead>
            <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors rounded-lg">
                        <td className="text-left font-bold text-white py-4 px-2">{row.year}</td>
                        {row.months.map((val, i) => (
                          <td key={i} className="text-center py-4 px-2">
                              {val !== null ? (
                                <span className={`px-2 py-1 rounded font-medium backdrop-blur-md ${val >= 0 ? 'text-[#22ab94] bg-[#22ab94]/20' : 'text-[#f23645] bg-[#f23645]/20'}`}>
                                      {val > 0 ? '+' : ''}{val}%
                                </span>
                              ) : <span className="text-gray-600">-</span>}
                          </td>
                        ))}
                        <td className="text-center py-4 px-2 font-bold text-white">
                          {row.months.reduce((acc, curr) => acc + (curr || 0), 0).toFixed(1)}%
                        </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="14" className="text-center py-8 text-gray-500 italic">
                      Data tidak tersedia untuk periode {selectedRange}
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
      </div>
    </div>
  );
};

// --- COMPONENT: TOP 5 DRAWDOWNS TABLE ---
const TopDrawdownsTable = ({ data }) => (
  <div className="mb-10 animate-fade-in-up mt-8">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-2xl font-bold text-white drop-shadow-md font-eth">Top 5 Drawdowns</h3>
    </div>
    <div className="overflow-x-auto custom-scrollbar pb-2 rounded-xl bg-black/10 backdrop-blur-sm p-2">
      <table className="w-full text-sm border-collapse min-w-[800px]">
        <thead>
          <tr className="text-left text-gray-400 font-medium border-b border-white/5">
            <th className="py-3 px-4">Rank</th>
            <th className="py-3 px-4">Start Date</th>
            <th className="py-3 px-4">End Date</th>
            <th className="py-3 px-4 text-right">Depth</th>
            <th className="py-3 px-4 text-right">Duration (Days)</th>
            <th className="py-3 px-4 text-right">Recovery (Days)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((row) => (
            <tr key={row.rank} className="hover:bg-white/5 transition-colors">
              <td className="py-3 px-4 font-bold text-white">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs">
                  {row.rank}
                </div>
              </td>
              <td className="py-3 px-4 text-gray-300 font-mono text-xs">{row.startDate}</td>
              <td className="py-3 px-4 text-gray-300 font-mono text-xs">{row.endDate}</td>
              <td className="py-3 px-4 text-right font-bold text-[#f23645]">{row.depth.toFixed(2)}%</td>
              <td className="py-3 px-4 text-right text-white font-mono">{row.duration}</td>
              <td className="py-3 px-4 text-right text-[#22ab94] font-mono">{row.recovery}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// --- DATA: NEW COMPREHENSIVE STATISTICS STRUCTURE (CLEANED & REMOVED DRAWDOWNS) ---
const EXECUTIVE_SUMMARY_DATA = {
  grade: "A+",
  title: "Elite Institutional Quality",
  metrics: [
    { label: "CAGR", value: "30.50%", grade: "Exceptional" },
    { label: "Total Return", value: "25,516%", grade: "Outstanding" },
    { label: "Max Drawdown", value: "-29.20%", grade: "Very Good" },
    { label: "Sharpe Ratio", value: "1.44", grade: "Very Good" },
    { label: "Sortino Ratio", value: "2.35", grade: "Excellent" }
  ]
};

const DETAILED_STATS_SECTIONS = [
  {
    title: "RETURN METRICS",
    metrics: [
      { l: "Total Return", v: "25,516.42%" },
      { l: "CAGR (Annualized)", v: "30.50%" },
      { l: "APR (Simple Annual)", v: "1,224.85%" },
      { l: "Annualized Volatility", v: "17.16%" },
      { l: "Daily Return (Mean)", v: "0.1100%" },
      { l: "Daily Return (Median)", v: "-0.0800%" },
      { l: "Years Analyzed", v: "20.83" }
    ]
  },
  {
    title: "DRAWDOWN METRICS",
    metrics: [
      { l: "Max Drawdown", v: "-29.20%" },
      { l: "Average Drawdown", v: "-1.82%" },
      { l: "Max DD Duration", v: "563 days" },
      { l: "Average DD Duration", v: "12 days" },
      { l: "Number of Drawdowns", v: "361" },
      { l: "Drawdown Frequency", v: "6.77%" },
      { l: "Ulcer Index", v: "5.33%" }
    ]
    // REMOVED "extras" (Top 5 Worst Drawdowns) from here
  },
  {
    title: "RISK-ADJUSTED RETURN METRICS",
    metrics: [
      { l: "Sharpe Ratio", v: "1.44" },
      { l: "Sortino Ratio", v: "2.35" },
      { l: "Calmar Ratio", v: "1.04" },
      { l: "MAR Ratio", v: "1.04" },
      { l: "Sterling Ratio", v: "16.74" },
      { l: "Burke Ratio", v: "0.47" }
    ]
  },
  {
    title: "VOLATILITY & RISK METRICS",
    metrics: [
      { l: "Daily Std Deviation", v: "1.0808%" },
      { l: "Daily Variance", v: "1.168221" },
      { l: "Annual Volatility", v: "17.16%" },
      { l: "Downside Deviation", v: "0.6631%" },
      { l: "Upside Deviation", v: "1.0759%" },
      { l: "Semi-Variance", v: "0.439702" },
      { l: "VaR (95%)", v: "-1.06%" },
      { l: "CVaR (Expected Shortfall)", v: "-1.77%" },
      { l: "Max Daily Loss", v: "-23.42%" },
      { l: "Max Daily Gain", v: "10.44%" }
    ]
  },
  {
    title: "DISTRIBUTION METRICS",
    metrics: [
      { l: "Skewness", v: "-0.0399" },
      { l: "Kurtosis (Excess)", v: "54.4915" },
      { l: "Kurtosis (Raw)", v: "57.4915" },
      { l: "5th Percentile", v: "-1.06%" },
      { l: "95th Percentile", v: "1.83%" },
      { l: "25th Percentile (Q1)", v: "-0.34%" },
      { l: "75th Percentile (Q3)", v: "0.39%" },
      { l: "IQR", v: "0.7275%" },
      { l: "Jarque-Bera Statistic", v: "659,315.33" },
      { l: "Jarque-Bera p-value", v: "0.000000" },
      { l: "Normal Distribution?", v: "No" }
    ]
  },
  {
    title: "WIN/LOSS METRICS",
    metrics: [
      { l: "Win Rate (Daily)", v: "42.84%" },
      { l: "Loss Rate (Daily)", v: "56.60%" },
      { l: "Winning Days", v: "2,283" },
      { l: "Losing Days", v: "3,016" },
      { l: "Neutral Days", v: "30" },
      { l: "Average Win", v: "0.8606%" },
      { l: "Average Loss", v: "-0.4571%" },
      { l: "Largest Win", v: "10.44%" },
      { l: "Largest Loss", v: "-23.42%" },
      { l: "Win/Loss Ratio", v: "1.88" },
      { l: "Profit Factor", v: "1.43" },
      { l: "Expectancy", v: "0.1100%" },
      { l: "Gross Profit", v: "1,964.74%" },
      { l: "Gross Loss", v: "1,378.65%" }
    ]
  },
  {
    title: "CONSISTENCY METRICS",
    metrics: [
      { l: "Max Consecutive Wins", v: "8" },
      { l: "Max Consecutive Losses", v: "18" },
      { l: "Positive Months", v: "174" },
      { l: "Negative Months", v: "77" },
      { l: "Monthly Win Rate", v: "69.32%" },
      { l: "Recovery Factor", v: "873.93" },
      { l: "R-Squared (Stability)", v: "0.6848" },
      { l: "Avg Positive Months/Year", v: "8.4" }
    ]
  }
];

// --- COMPONENT: EXECUTIVE SUMMARY CARD ---
const ExecutiveSummaryCard = ({ data }) => (
  <div className="mb-8 rounded-xl bg-gradient-to-br from-[#2962ff]/20 to-black border border-[#2962ff]/30 overflow-hidden relative group">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Star size={100} fill="white" stroke="none" />
    </div>
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-white font-eth tracking-tight flex items-center gap-3">
            EXECUTIVE SUMMARY
          </h2>
          <p className="text-[#2962ff] font-bold tracking-widest text-sm mt-1 uppercase">
            Overall Grade: <span className="text-white text-lg">{data.grade}</span> ({data.title})
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.metrics.map((item, idx) => (
          <div key={idx} className="bg-black/40 backdrop-blur-md p-4 rounded-lg border border-white/5 hover:border-white/20 transition-colors">
            <div className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">{item.label}</div>
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold text-white">{item.value}</span>
            </div>
            <div className="text-[#22ab94] text-xs font-medium mt-2">{item.grade}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- COMPONENT: DETAILED STAT CARD ---
const DetailedStatCard = ({ section }) => (
  <div className="rounded-xl bg-black/20 backdrop-blur-sm overflow-hidden border border-white/5 h-full flex flex-col">
    <div className="bg-[#2962ff]/10 px-5 py-4 border-b border-white/5">
      <h3 className="font-bold text-white font-eth text-xl">{section.title}</h3>
    </div>
    
    <div className="p-0 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
            <th className="px-5 py-3 font-semibold">Metric</th>
            <th className="px-5 py-3 font-semibold text-right">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {section.metrics.map((item, idx) => (
            <tr key={idx} className="hover:bg-white/5 transition-colors">
              <td className="px-5 py-3 font-medium text-gray-300">{item.l}</td>
              <td className="px-5 py-3 text-right text-white font-bold">{item.v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {section.extras && (
        <div className="p-5 bg-white/[0.02] border-t border-white/5 flex-grow">
          <h4 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">{section.extras.title}</h4>
          <ul className="space-y-1">
            {section.extras.items.map((item, i) => (
              <li key={i} className="text-gray-400 text-xs font-mono bg-black/40 px-2 py-1 rounded border-l-2 border-blue-500/50">
                {item}
              </li>
            ))}
          </ul>
        </div>
    )}
  </div>
);

// --- COMPONENT: GRID WAVE BACKGROUND (LOCKED & GRAY) - Used for other tabs ---
const GridWaveBackground = ({ height = 580 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let w, h;
    let frame = 0;

    const resize = () => {
      if(!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = height;
    };

    const animate = () => {
      if(!ctx) return;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      const stripWidth = 40;
      const speed = 0.5;
      
      frame += speed;

      ctx.strokeStyle = 'rgba(120, 120, 120, 0.3)'; 
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = -w; x < w * 2; x += stripWidth) {
        ctx.beginPath();
        ctx.moveTo(x + (w/2 - x) * 0.5, 0); 
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Horizontal lines (moving)
      const totalLines = 30;
      for(let i = 0; i < totalLines; i++) {
        let y = ((frame + i * 20) % h);
        let relativeY = y / h;
        let drawY = Math.pow(relativeY, 1.5) * h;

        ctx.beginPath();
        ctx.moveTo(0, drawY);
        ctx.lineTo(w, drawY);
        ctx.stroke();
      }
      
      const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.8)');
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,w,h);

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();
    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationFrameId);
    };
  }, [height]);

  return (
    <div className="absolute top-0 left-0 w-full z-0 pointer-events-none" style={{ height: height }}>
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-black"></div>
    </div>
  );
};

// --- COMPONENT: SMOKE BACKGROUND (NEW ANIMATED FOG) ---
const SmokeBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    let animationFrameId;
    let particles = [];

    const resize = () => {
      if(!canvas) return;
      const parent = canvas.parentElement;
      w = canvas.width = parent ? parent.clientWidth : window.innerWidth;
      h = canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    // Particle factory
    const createParticle = () => ({
        x: Math.random() * w,
        y: h + Math.random() * 100, // Start slightly below screen
        vx: (Math.random() - 0.5) * 0.8, // Slow horizontal drift
        vy: -0.3 - Math.random() * 0.5, // Slow upward drift
        size: 100 + Math.random() * 150, // Large, puffy particles
        life: 0,
        maxLife: 300 + Math.random() * 200,
        alphaMax: 0.03 + Math.random() * 0.04 // Very subtle opacity
    });

    // Initialize some particles
    for(let i = 0; i < 50; i++) {
        particles.push({
            ...createParticle(),
            y: h - Math.random() * (h * 0.4), // Pre-populate bottom area
            life: Math.random() * 200
        });
    }

    const draw = () => {
      if (!ctx) return;
      
      // Background: Solid Black
      ctx.fillStyle = '#000000'; 
      ctx.fillRect(0, 0, w, h);
      
      // Add new particles occasionally to keep density
      if (particles.length < 80) {
          particles.push(createParticle());
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life++;

          // Calculate opacity based on life cycle (fade in -> hold -> fade out)
          let alpha = p.alphaMax;
          if (p.life < 100) alpha = p.alphaMax * (p.life / 100); // Fade in
          else if (p.life > p.maxLife - 100) alpha = p.alphaMax * ((p.maxLife - p.life) / 100); // Fade out

          // Remove dead particles
          if (p.life >= p.maxLife || alpha <= 0) {
              particles[i] = createParticle();
              continue;
          }

          // Draw Smoke Puff (Radial Gradient)
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`); // White center
          gradient.addColorStop(0.4, `rgba(220, 220, 230, ${alpha * 0.5})`); // Grayish mid
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Transparent edge

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none" />;
};

// --- MOCK DATA FOR FALLBACK (EXTENDED FOR HEATMAP FILTERING) ---
const MOCK_HISTORICAL = Array.from({ length: 100 }, (_, i) => ({
    date: `2024-01-${i + 1}`,
    year: '2024',
    value: 1000 + Math.random() * 500 + i * 10,
    drawdown: -(Math.random() * 10)
}));
const MOCK_LIVE = Array.from({ length: 50 }, (_, i) => ({
    date: `2025-01-${i + 1}`,
    value: 1500 + Math.random() * 200 + i * 5,
    drawdown: -(Math.random() * 5)
}));

// Generates fake monthly data for a range of years to test the filter
const generateMockHeatmap = () => {
  const years = [];
  for (let y = 2024; y >= 2005; y--) {
    const months = Array.from({length: 12}, () => (Math.random() * 10 - 4).toFixed(1)).map(Number);
    years.push({ year: y.toString(), months });
  }
  return years;
};
const MOCK_HEATMAP = generateMockHeatmap();

// --- MOCK DATA KHUSUS LIVE (2025-2029) ---
const MOCK_LIVE_HEATMAP = [
  { year: '2029', months: Array(12).fill(null) }, // Masa depan (kosong)
  { year: '2028', months: Array(12).fill(null) }, // Masa depan (kosong)
  { year: '2027', months: Array(12).fill(null) }, // Masa depan (kosong)
  { year: '2026', months: Array(12).fill(null) }, // Masa depan (kosong)
  // Tahun 2025 sebagian terisi sebagai simulasi "Live running"
  { year: '2025', months: [4.2, 1.5, -2.1, 3.8, 2.5, 1.2, 0.5, 3.1, 1.9, 4.2, 2.1, null] } 
];

const MOCK_ANNUAL = [
    { year: '2021', value: 25.4 },
    { year: '2022', value: -5.2 },
    { year: '2023', value: 18.7 },
    { year: '2024', value: 12.1 },
    { year: '2025', value: 8.5 },
];
const MOCK_STATS = { sharpe: 3.18, sortino: 4.22, maxDD: -12.45, winRate: 68.5 };
const MOCK_LIVE_STATS = { totalReturn: 14.5, maxDrawdown: -8.24, sharpe: 2.14, sortino: 3.05, winRate: 62.4 };

// --- MOCK DATA: TOP 5 DRAWDOWNS ---
const MOCK_TOP_DRAWDOWNS = [
  { rank: 1, startDate: '2022-01-05', endDate: '2022-06-15', depth: -12.45, duration: 161, recovery: 45 },
  { rank: 2, startDate: '2021-09-10', endDate: '2021-10-05', depth: -8.32, duration: 25, recovery: 12 },
  { rank: 3, startDate: '2023-03-12', endDate: '2023-04-18', depth: -6.15, duration: 37, recovery: 15 },
  { rank: 4, startDate: '2020-11-02', endDate: '2020-11-20', depth: -4.80, duration: 18, recovery: 8 },
  { rank: 5, startDate: '2024-08-01', endDate: '2024-08-15', depth: -3.20, duration: 14, recovery: 5 },
];

// --- MAIN APPLICATION ---

export default function App() {
  // State for data
  const [fullData, setFullData] = useState([]);
  const [liveData, setLiveData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [liveHeatmapData, setLiveHeatmapData] = useState([]); // STATE BARU UNTUK LIVE HEATMAP
  const [annualReturnsData, setAnnualReturnsData] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [liveStatsData, setLiveStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedYear, setSelectedYear] = useState('5Y');
  const [filteredChartData, setFilteredChartData] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // STATE FOR MOBILE MENU
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const yearsList = ['ALL', ...Array.from({length: 26}, (_, i) => (2025 - i).toString())];
  const manualRanges = ['2020-2024', '2015-2019', '2010-2014', '2005-2009'];
  
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'historical', label: 'Historical' },
    { id: 'live', label: 'Live' },
    { id: 'stats', label: 'Stats' },
    { id: 'about', label: 'About' }
  ];

  useEffect(() => {
    const fetchOrFallback = async (url, fallback) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Status ${response.status}`);
            return await response.json();
        } catch (error) {
            return fallback;
        }
    };

    const fetchAllData = async () => {
      try {
        const [hist, live, heatmap, annual, stats, liveStats, liveHeatmap] = await Promise.all([
            fetchOrFallback('/data/equity-historical.json', MOCK_HISTORICAL),
            fetchOrFallback('/data/equity-live.json', MOCK_LIVE),
            fetchOrFallback('/data/heatmap-data.json', MOCK_HEATMAP),
            fetchOrFallback('/data/annual-returns.json', MOCK_ANNUAL),
            fetchOrFallback('/data/stats-data.json', MOCK_STATS),
            fetchOrFallback('/data/live-stats-data.json', MOCK_LIVE_STATS),
            fetchOrFallback('/data/live-heatmap-data.json', MOCK_LIVE_HEATMAP), // Load data live heatmap
        ]);
        
        setFullData(hist);
        const currentYear = 2025;
        const initialFiltered = hist.filter(d => {
            const y = parseInt(d.year);
            return y > (currentYear - 5) && y <= currentYear;
        });
        setFilteredChartData(initialFiltered);

        setLiveData(live);
        setHeatmapData(heatmap);
        setLiveHeatmapData(liveHeatmap); // Set state live heatmap
        setAnnualReturnsData(annual);
        setStatsData(stats);
        setLiveStatsData(liveStats);
        setLoading(false);
      } catch (error) {
        console.error('Critical error in data loading:', error);
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);
  
  const [activeTab, setActiveTab] = useState('home');

  const handleTabChange = (tabId) => {
      setActiveTab(tabId);
      setIsMenuOpen(false); // Close menu on mobile when a tab is selected
  };

  const stats = useMemo(() => {
    if (!filteredChartData || filteredChartData.length === 0) return {
        totalReturn: 0, maxDrawdown: 0, cagr: 0, apr: 0, expectedValue: 0, volatility: 0, sharpe: 0, sortino: 0
    };

    const startVal = filteredChartData[0].value;
    const endVal = filteredChartData[filteredChartData.length - 1].value;
    const totalReturn = ((endVal - startVal) / startVal) * 100;
    const maxDrawdown = Math.min(...filteredChartData.map(d => d.drawdown));

    const dailyReturns = [];
    for (let i = 1; i < filteredChartData.length; i++) {
        const r = (filteredChartData[i].value - filteredChartData[i-1].value) / filteredChartData[i-1].value;
        dailyReturns.push(r);
    }

    const tradingDays = 252;
    const meanDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const annualizedReturn = meanDailyReturn * tradingDays;
    
    const startDate = new Date(filteredChartData[0].date);
    const endDate = new Date(filteredChartData[filteredChartData.length - 1].date);
    const yearsDiff = Math.max((endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25), 0.01);
    const cagr = (Math.pow(endVal / startVal, 1 / yearsDiff) - 1) * 100;
    const apr = annualizedReturn * 100;
    const expectedValue = meanDailyReturn * 100;

    const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - meanDailyReturn, 2), 0) / (dailyReturns.length - 1);
    const stdDev = Math.sqrt(variance);
    const volatility = stdDev * Math.sqrt(tradingDays) * 100;

    const downsideReturns = dailyReturns.filter(r => r < 0);
    const downsideVariance = downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / dailyReturns.length; 
    const downsideDev = Math.sqrt(downsideVariance);
    const annDownsideDev = downsideDev * Math.sqrt(tradingDays);

    const sharpe = (volatility !== 0) ? (apr / volatility) : 0;
    const sortino = (annDownsideDev !== 0 && !isNaN(annDownsideDev)) ? (apr / (annDownsideDev * 100)) : 0;

    return { totalReturn, maxDrawdown, cagr, apr, expectedValue, volatility, sharpe, sortino };
  }, [filteredChartData]);

  const fmt = (val, suffix = '') => val ? `${val > 0 && suffix === '%' ? '+' : ''}${val.toLocaleString(undefined, {maximumFractionDigits: 2})} ${suffix}` : '-';
  const colorClass = (val) => val >= 0 ? 'text-[#22ab94]' : 'text-[#f23645]';

  useEffect(() => {
    if (selectedYear === 'ALL') {
        setFilteredChartData(fullData);
    } else if (selectedYear === '5Y') {
        const currentYear = 2025;
        const filtered = fullData.filter(d => {
            const y = parseInt(d.year);
            return y > (currentYear - 5) && y <= currentYear;
        });
        setFilteredChartData(filtered);
    } else if (selectedYear.includes('-')) {
        const [start, end] = selectedYear.split('-').map(Number);
        const filtered = fullData.filter(d => {
            const y = parseInt(d.year);
            return y >= start && y <= end;
        });
        setFilteredChartData(filtered);
    } else {
        const filtered = fullData.filter(d => d.year === selectedYear);
        setFilteredChartData(filtered);
    }
  }, [selectedYear, fullData]);

  const [showSplash, setShowSplash] = useState(true);
  const [fadeOutSplash, setFadeOutSplash] = useState(false);
  const [slideInTitle, setSlideInTitle] = useState(false);

  useEffect(() => {
    const timerSlide = setTimeout(() => setSlideInTitle(true), 100);
    const timerFade = setTimeout(() => setFadeOutSplash(true), 2500);
    const timerRemove = setTimeout(() => setShowSplash(false), 3500);
    return () => { clearTimeout(timerSlide); clearTimeout(timerFade); clearTimeout(timerRemove); };
  }, []);

  if (loading && !showSplash) return <div className="h-screen bg-black text-white flex items-center justify-center">Loading Data...</div>;

  return (
    <div className="flex flex-col h-screen text-[#d1d4dc] font-sans overflow-hidden relative bg-black">
      
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700;800&display=swap');
          .font-eth { font-family: 'Montserrat', sans-serif; }
          body, .font-sans { font-family: 'Inter', sans-serif; }
          .splash-title { font-family: 'Montserrat', sans-serif; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
          .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      {showSplash && (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-1000 ease-in-out ${fadeOutSplash ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="text-center overflow-hidden h-48 flex items-center justify-center">
             <h1 className={`text-6xl md:text-9xl font-bold text-white font-eth tracking-tighter drop-shadow-2xl transition-all duration-1000 ease-out transform ${slideInTitle ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
               Sentquant
             </h1>
          </div>
        </div>
      )}

      {/* 1. TOP NAVBAR */}
      <header className="h-[60px] flex-none flex items-center justify-between px-4 bg-transparent z-50 relative">
        <div className="flex items-center gap-6">
          <div className="hidden md:block">
             <nav className="flex items-center gap-8 text-sm font-semibold text-[#d1d4dc]">
              {navItems.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => handleTabChange(item.id)}
                  className={`hover:text-white transition-colors drop-shadow-sm ${activeTab === item.id ? 'text-white' : 'text-[#d1d4dc]/60'}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          {/* NAVBAR BUTTON - WITH LOCK */}
          <button className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full text-sm font-bold transition-colors backdrop-blur-md flex items-center gap-2">
            Join <Lock size={14} />
          </button>
          {/* MOBILE MENU TOGGLE */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hover:bg-white/10 p-2 rounded-full md:hidden transition-colors text-white z-50"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-6 md:hidden flex flex-col gap-6 animate-fade-in-up">
            {navItems.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => handleTabChange(item.id)}
                  className={`text-2xl font-bold text-left py-2 border-b border-white/10 ${activeTab === item.id ? 'text-white' : 'text-gray-500'}`}
                >
                  {item.label}
                </button>
            ))}
            <div className="mt-auto pb-10">
                <p className="text-gray-500 text-sm">© 2024 Sentquant, Inc.</p>
            </div>
        </div>
      )}

      {/* 2. MAIN SCROLLABLE CONTENT */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          
          {/* DYNAMIC BACKGROUND LAYER */}
          {activeTab === 'about' ? (
             <SmokeBackground />
          ) : (
             <GridWaveBackground height={580} />
          )}

          <div className={`max-w-[1584px] mx-auto px-4 sm:px-6 py-8 pb-20 relative z-10 ${activeTab === 'about' ? 'h-[calc(100vh-60px)]' : ''}`}> 
            
            {/* ================== TAB CONTENT: HOME ================== */}
            {activeTab === 'home' && (
              <div className="animate-fade-in-up flex flex-col items-center justify-center h-[70vh]">
                  <h1 className="text-7xl md:text-9xl font-bold text-white font-eth tracking-tighter drop-shadow-2xl mb-6">
                    Sentquant
                  </h1>
                  <p className="text-gray-400 text-sm md:text-base font-light tracking-wide text-center max-w-lg">
                    The era of fake trading gurus ends here.
                  </p>
              </div>
            )}

            {/* ================== TAB CONTENT: HISTORICAL ================== */}
            {activeTab === 'historical' && (
              <>
                <div className="mb-10 animate-fade-in-up">
                  <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-white font-eth drop-shadow-md">
                          Historical Performance
                      </h3>
                    </div>

                    <div className="relative flex gap-2 items-center">
                        <button onClick={() => { setSelectedYear('5Y'); setIsFilterOpen(false); }} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedYear === '5Y' ? 'bg-[#22ab94] text-black shadow-[0_0_15px_rgba(34,171,148,0.5)]' : 'bg-white/5 text-gray-400 hover:bg-white/20 hover:text-white backdrop-blur-sm'}`}>5Y</button>
                        <button onClick={() => { setSelectedYear('ALL'); setIsFilterOpen(false); }} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedYear === 'ALL' ? 'bg-[#22ab94] text-black shadow-[0_0_15px_rgba(34,171,148,0.5)]' : 'bg-white/5 text-gray-400 hover:bg-white/20 hover:text-white backdrop-blur-sm'}`}>ALL</button>
                        
                        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${selectedYear !== 'ALL' && selectedYear !== '5Y' ? 'bg-gray-600 text-white shadow-[0_0_15px_rgba(75,85,99,0.5)]' : 'bg-white/5 text-gray-400 hover:bg-white/20 hover:text-white backdrop-blur-sm'}`}>
                          {selectedYear !== 'ALL' && selectedYear !== '5Y' ? selectedYear : 'FILTER'} <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isFilterOpen && (
                          <div className="absolute top-full right-0 mt-2 w-40 max-h-60 overflow-y-auto bg-[#0a0a0a] rounded-xl shadow-xl z-50 p-2 custom-scrollbar backdrop-blur-md">
                              <div className="mb-2 pb-2 border-b border-white/10">
                                {manualRanges.map(range => (
                                    <button key={range} onClick={() => { setSelectedYear(range); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors mb-1 ${selectedYear === range ? 'bg-[#22ab94]/20 text-[#22ab94]' : 'text-gray-300 hover:bg-white/10'}`}>
                                        {range}
                                    </button>
                                ))}
                              </div>
                              {yearsList.map((year) => (
                                  <button key={year} onClick={() => { setSelectedYear(year); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors mb-1 ${selectedYear === year ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'}`}>{year}</button>
                              ))}
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="p-4 flex flex-col justify-center transition-colors"> 
                       <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                          <div>
                             <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Total Return</div>
                             <div className={`text-lg font-bold drop-shadow-sm ${colorClass(stats.totalReturn)}`}>{fmt(stats.totalReturn, '%')}</div>
                          </div>
                          <div>
                             <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Max Drawdown</div>
                             <div className="text-lg font-bold text-[#f23645] drop-shadow-sm">{fmt(stats.maxDrawdown, '%')}</div>
                          </div>
                          <div>
                             <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">CAGR</div>
                             <div className={`text-lg font-bold drop-shadow-sm ${colorClass(stats.cagr)}`}>{fmt(stats.cagr, '%')}</div>
                          </div>
                          <div>
                             <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">APR</div>
                             <div className={`text-lg font-bold drop-shadow-sm ${colorClass(stats.apr)}`}>{fmt(stats.apr, '%')}</div>
                          </div>
                       </div>
                    </div>

                    <div className="p-4 flex flex-col justify-center transition-colors">
                       <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                          <div>
                             <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Expected Value</div>
                             <div className="text-lg font-bold text-white drop-shadow-sm">{fmt(stats.expectedValue, '%')}</div>
                          </div>
                          <div>
                             <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Volatility</div>
                             <div className="text-lg font-bold text-white drop-shadow-sm">{fmt(stats.volatility, '%')}</div>
                          </div>
                          <div>
                             <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Sharpe Ratio</div>
                             <div className="text-lg font-bold text-[#22ab94] drop-shadow-sm">{fmt(stats.sharpe)}</div>
                          </div>
                          <div>
                             <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Sortino Ratio</div>
                             <div className="text-lg font-bold text-[#22ab94] drop-shadow-sm">{fmt(stats.sortino)}</div>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                      {/* Responsive Charts */}
                      <div className="h-[300px] md:h-[400px] rounded-t-xl bg-black/20 backdrop-blur-sm overflow-hidden relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={filteredChartData} margin={{top:10, left:0, right:0, bottom:0}}>
                            <defs>
                              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22ab94" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#22ab94" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" hide />
                            <YAxis orientation="right" domain={['auto', 'auto']} tick={{fill: '#a1a1aa', fontSize: 11}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', backdropFilter: 'blur(10px)', fontFamily: 'Inter'}} 
                                itemStyle={{color: '#22ab94'}} 
                                formatter={(value) => [`$${value.toLocaleString()}`, 'Equity']}
                                labelStyle={{color: '#fff', fontFamily: 'Inter'}}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#22ab94" 
                              strokeWidth={2} 
                              fill="url(#colorGradient)" 
                              isAnimationActive={selectedYear !== 'ALL'} 
                              animationDuration={500}
                              dot={false} 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                        <div className="absolute top-4 left-4 flex gap-1 bg-black/40 backdrop-blur-md p-1 rounded shadow-lg">
                            <span className="p-1 text-gray-300 text-xs font-bold cursor-pointer hover:text-white">Sentquant Model</span>
                        </div>
                      </div>

                      <div className="h-[180px] rounded-b-xl bg-black/20 backdrop-blur-sm overflow-hidden relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={filteredChartData} margin={{top:5, left:0, right:0, bottom:0}}>
                            <defs>
                              <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f23645" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#f23645" stopOpacity={0.05}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" hide />
                            <YAxis orientation="right" tick={{fill: '#a1a1aa', fontSize: 10}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', backdropFilter: 'blur(10px)', fontFamily: 'Inter'}} 
                                itemStyle={{color: '#f23645'}} 
                                formatter={(value) => [`${value}%`, 'Drawdown']} 
                                labelStyle={{color: '#fff', fontFamily: 'Inter'}}
                            />
                            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                            <Area 
                              type="stepAfter" 
                              dataKey="drawdown" 
                              stroke="#f23645" 
                              strokeWidth={1.5} 
                              fill="url(#colorDrawdown)" 
                              isAnimationActive={selectedYear !== 'ALL'}
                              dot={false} 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                  </div>

                  {/* INSERTED HEATMAP IN HISTORICAL WITH FILTER ENABLED */}
                  <MonthlyHeatmap data={heatmapData} enableFilter={true} />

                  {/* INSERTED TOP 5 DRAWDOWNS TABLE */}
                  <TopDrawdownsTable data={MOCK_TOP_DRAWDOWNS} />
                </div>
              </>
            )}

            {/* ================== TAB CONTENT: LIVE ================== */}
            {activeTab === 'live' && (
              <div className="animate-fade-in-up">
                <div className="mb-10">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-white font-eth drop-shadow-md">
                        Live on LIGHTER
                    </h3>
                    <div className="px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-xs backdrop-blur-md flex items-center gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                       LIVE MONITORING (1Y)
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div className="p-4 flex flex-col justify-center transition-colors backdrop-blur-sm rounded-xl bg-black/10"> 
                          <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                              <div>
                                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Total Return (1Y)</div>
                                  <div className="text-lg font-bold text-[#22ab94] drop-shadow-sm">{fmt(liveStatsData?.totalReturn, '%')}</div>
                              </div>
                              <div>
                                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Max Drawdown</div>
                                  <div className="text-lg font-bold text-[#f23645] drop-shadow-sm">{fmt(liveStatsData?.maxDrawdown, '%')}</div>
                              </div>
                              <div>
                                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">CAGR (1Y)</div>
                                  <div className="text-lg font-bold text-white drop-shadow-sm">{fmt(liveStatsData?.totalReturn, '%')}</div>
                              </div>
                              <div>
                                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Win Rate</div>
                                  <div className="text-lg font-bold text-white drop-shadow-sm">{fmt(liveStatsData?.winRate, '%')}</div>
                              </div>
                          </div>
                      </div>

                      <div className="p-4 flex flex-col justify-center transition-colors backdrop-blur-sm rounded-xl bg-black/10">
                          <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                              <div>
                                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Expected Value</div>
                                  <div className="text-lg font-bold text-white drop-shadow-sm">+0.85 %</div>
                              </div>
                              <div>
                                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Volatility</div>
                                  <div className="text-lg font-bold text-white drop-shadow-sm">15.2 %</div>
                              </div>
                              <div>
                                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Sharpe Ratio</div>
                                  <div className="text-lg font-bold text-[#22ab94] drop-shadow-sm">{fmt(liveStatsData?.sharpe)}</div>
                              </div>
                              <div>
                                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Sortino Ratio</div>
                                  <div className="text-lg font-bold text-[#22ab94] drop-shadow-sm">{fmt(liveStatsData?.sortino)}</div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                      <div className="h-[300px] md:h-[400px] rounded-t-xl bg-black/20 backdrop-blur-sm overflow-hidden relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={liveData} margin={{top:10, left:0, right:0, bottom:0}}>
                            <defs>
                                <linearGradient id="colorLive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22ab94" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#22ab94" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" hide />
                            <YAxis orientation="right" domain={['auto', 'auto']} tick={{fill: '#a1a1aa', fontSize: 11}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', backdropFilter: 'blur(10px)', fontFamily: 'Inter'}} 
                                itemStyle={{color: '#22ab94'}} 
                                formatter={(value) => [`$${value.toLocaleString()}`, 'Live Equity']}
                                labelStyle={{color: '#fff', fontFamily: 'Inter'}}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#22ab94" 
                                strokeWidth={2} 
                                fill="url(#colorLive)" 
                                animationDuration={1500}
                                dot={false} 
                            />
                            </AreaChart>
                        </ResponsiveContainer>
                        <div className="absolute top-4 left-4 flex gap-1 bg-black/40 backdrop-blur-md p-1 rounded shadow-lg">
                            <span className="p-1 text-gray-300 text-xs font-bold">Sentquant Model</span>
                        </div>
                      </div>

                      <div className="h-[180px] rounded-b-xl bg-black/20 backdrop-blur-sm overflow-hidden relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={liveData} margin={{top:5, left:0, right:0, bottom:0}}>
                            <defs>
                              <linearGradient id="colorDrawdownLive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f23645" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#f23645" stopOpacity={0.05}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" hide />
                            <YAxis orientation="right" tick={{fill: '#a1a1aa', fontSize: 10}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', backdropFilter: 'blur(10px)', fontFamily: 'Inter'}} 
                                itemStyle={{color: '#f23645'}} 
                                formatter={(value) => [`${value}%`, 'Live Drawdown']} 
                                labelStyle={{color: '#fff', fontFamily: 'Inter'}}
                            />
                            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                            <Area 
                              type="stepAfter" 
                              dataKey="drawdown" 
                              stroke="#f23645" 
                              strokeWidth={1.5} 
                              fill="url(#colorDrawdownLive)" 
                              animationDuration={1500}
                              dot={false} 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                        <div className="absolute top-2 left-4">
                            <span className="text-[#f23645] text-[10px] font-bold uppercase tracking-widest">Live Underwater Plot</span>
                        </div>
                      </div>
                  </div>

                  {/* INSERTED HEATMAP IN LIVE - USING NEW LIVE DATA */}
                  <MonthlyHeatmap data={liveHeatmapData} enableFilter={false} />
                </div>
              </div>
            )}

            {/* ================== TAB CONTENT: STATS ================== */}
            {activeTab === 'stats' && (
              <div className="animate-fade-in-up">
                
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-white drop-shadow-md font-eth">Annual Returns</h3>
                  </div>
                  <div className="h-[300px] rounded-xl bg-black/20 backdrop-blur-sm p-4 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={annualReturnsData}>
                           <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', backdropFilter: 'blur(5px)', fontFamily: 'Inter'}} itemStyle={{color: '#fff'}} />
                           <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} dy={10} />
                           <YAxis hide />
                           <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                              {annualReturnsData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#22ab94' : '#f23645'} />
                              ))}
                           </Bar>
                        </RechartsBarChart>
                      </ResponsiveContainer>
                  </div>
                </div>

                {/* EXECUTIVE SUMMARY */}
                <ExecutiveSummaryCard data={EXECUTIVE_SUMMARY_DATA} />

                {/* DETAILED STATS SECTIONS */}
                <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {DETAILED_STATS_SECTIONS.map((section, idx) => (
                      <DetailedStatCard key={idx} section={section} />
                    ))}
                </div>
              </div>
            )}

            {/* ... ABOUT PAGE ... */}
            {activeTab === 'about' && (
              <div className="animate-fade-in-up flex flex-col items-start justify-start h-full relative z-10 px-4 pt-0 md:pt-8 pl-4 md:pl-20">
                  <div className="max-w-3xl text-left">
                    {/* 1. Medium Gray Title */}
                    <h2 className="text-2xl md:text-3xl font-medium text-gray-400 font-eth mb-4">
                        The trading industry is broken.
                    </h2>

                    {/* 2. Small White Text Block */}
                    <div className="text-sm md:text-base text-white font-light leading-relaxed space-y-4 max-w-xl">
                        <p>
                            Fake gurus sell dreams.
                        </p>
                        <p>
                            Performance can’t be verified.
                        </p>
                        <p>
                            Retail traders are misled by empty claims.
                        </p>
                        <p>
                            Everyone talks.<br/>
                            No data.
                        </p>
                    </div>

                    {/* 3. "If CoinMarketCap..." block styled like the Title (Medium Gray) */}
                    <div className="text-2xl md:text-3xl font-medium text-gray-400 font-eth leading-tight space-y-2 mt-12 max-w-2xl">
                        <p>
                            If CoinMarketCap tracks assets,
                        </p>
                        <p>
                            Sentquant tracks strategy performance.
                        </p>
                        <p>
                            Because performance can’t lie, people can.
                        </p>
                    </div>

                    {/* Context for other parts */}
                    <div className="mt-12 space-y-12 pb-20">
                        {/* 4. Sentquant doesn't sell... block - FULLY LEFT ALIGNED */}
                        <div className="flex flex-col space-y-3 text-white text-sm md:text-base font-light leading-relaxed max-w-xl text-left">
                            <div>Sentquant doesn't sell courses.</div>
                            <div>Sentquant doesn’t sell signals.</div>
                            <div>Sentquant doesn’t sell promises.</div>
                            <div className="text-white mt-4 leading-relaxed">
                                Sentquant is the arena where every claim is tested.
                            </div>
                        </div>
                        
                        {/* 5. Bottom block - LEFT ALIGNED */}
                        <div className="flex flex-col items-start text-left w-full max-w-4xl pt-4">
                            <div className="py-2">
                                <span className="text-white font-bold text-xl block">This is the end of the fake trading mentor era.</span>
                            </div>

                            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 border-t border-b border-white/10 py-6 my-8">
                                <div className="flex flex-wrap justify-start gap-3 md:gap-6 text-[11px] md:text-[13px] font-mono text-blue-400 tracking-widest">
                                    <span>EVERY TRADER</span>
                                    <span>EVERY STRATEGY</span>
                                    <span>EVERY CLAIM</span>
                                    <span className="whitespace-nowrap">PROVEN ON-CHAIN</span>
                                </div>
                                
                                {/* JOIN MOVEMENT BUTTON WITH LOCK */}
                                <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full text-sm md:text-base font-bold transition-colors backdrop-blur-md flex items-center gap-2 group border border-white/5">
                                    Join Movement
                                    <Lock size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                  </div>
              </div>
            )}

            {/* --- FOOTER (Hidden on About Page for cleaner look) --- */}
            {activeTab !== 'about' && (
                <footer className="pt-12 pb-8 bg-black/20 backdrop-blur-md rounded-xl mt-10 border-t border-white/5">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12 text-sm text-gray-400 px-6">
                    <div className="col-span-2 lg:col-span-2 pr-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl font-bold text-white font-eth">Sentquant</span>
                        </div>
                        <p className="mb-4">Look first / Then leap.</p>
                    </div>
                </div>
                <div className="pt-8 text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center px-6">
                    <p>Pilih data pasar disediakan oleh ICE Data Services.</p>
                    <p className="mt-2 md:mt-0">© 2024 Sentquant, Inc.</p>
                </div>
                </footer>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
