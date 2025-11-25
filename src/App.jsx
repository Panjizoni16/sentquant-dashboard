import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart as RechartsBarChart, Bar, Cell 
} from 'recharts';
import { 
  Search, Menu, Settings, Camera, Maximize, 
  ChevronRight, ChevronDown, 
  BarChart2, MoreHorizontal, ArrowRight, ThumbsUp, MessageCircle, Share2, Twitter, Facebook, Instagram, Youtube, Linkedin, TrendingDown, TrendingUp, Clock, Activity, AlertTriangle, BarChart, Filter, Layers
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

// --- COMPONENT: GRID WAVE BACKGROUND (LOCKED & GRAY) ---
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
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      const perspective = 300;
      const stripWidth = 40;
      const speed = 0.5;
      
      frame += speed;

      // CHANGED TO GRAY
      ctx.strokeStyle = 'rgba(120, 120, 120, 0.15)'; 
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = -w; x < w * 2; x += stripWidth) {
        ctx.beginPath();
        ctx.moveTo(x + (w/2 - x) * 0.5, 0); // Converge towards top center
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Horizontal lines (moving)
      const totalLines = 30;
      for(let i = 0; i < totalLines; i++) {
        let y = ((frame + i * 20) % h);
        // Perspective scaling for y
        let relativeY = y / h;
        let drawY = y; 
        
        // Simple exponential density to fake perspective
        drawY = Math.pow(relativeY, 1.5) * h;

        ctx.beginPath();
        ctx.moveTo(0, drawY);
        ctx.lineTo(w, drawY);
        ctx.stroke();
      }
      
      // Add a vignette
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

// --- DATA LOGIC ---
// ✅ TULIS INI DI LINE 122:

// Generate list tahun dinamis dari data
const yearsList = ['ALL', ...Array.from({length: 21}, (_, i) => (2025 - i).toString())];


const annualReturnsData = [
  { year: '2021', value: 25.4 },
  { year: '2022', value: -5.2 },
  { year: '2023', value: 18.7 },
  { year: '2024', value: 12.1 },
  { year: '2025', value: 8.5 },
];

// ✅ GANTI JADI INI:
export default function App() {
  // State untuk data dari JSON
  const [fullData, setFullData] = useState([]);
  const [liveData, setLiveData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [annualReturnsData, setAnnualReturnsData] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [liveStatsData, setLiveStatsData] = useState(null);
  const [loading, setLoading] = useState(true);


// ✅ TAMBAH INI DI LINE 250 (setelah state, sebelum selectedYear):

// Fetch semua data dari JSON files
useEffect(() => {
  const fetchAllData = async () => {
    try {
  const [hist, live, heatmap, annual, stats, liveStats] = await Promise.all([
        fetch('/data/equity-historical.json').then(r => r.json()),
        fetch('/data/equity-live.json').then(r => r.json()),
        fetch('/data/heatmap-data.json').then(r => r.json()),
        fetch('/data/annual-returns.json').then(r => r.json()),
        fetch('/data/stats-data.json').then(r => r.json()),
        fetch('/data/live-stats-data.json').then(r => r.json()),
      ]);
      
      setFullData(hist);
      setFilteredChartData(hist);
      setLiveData(live);
      setHeatmapData(heatmap);
      setAnnualReturnsData(annual);
      setStatsData(stats);
      setLiveStatsData(liveStats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };
  
  fetchAllData();
}, []);

  
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [filteredChartData, setFilteredChartData] = useState(fullData);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // --- ACTIVE TAB STATE ---
  const [activeTab, setActiveTab] = useState('home'); // Default changed to 'home'

  // --- DYNAMIC STATS CALCULATION ---
  const stats = useMemo(() => {
    if (!filteredChartData || filteredChartData.length === 0) return {
        totalReturn: 0, maxDrawdown: 0, cagr: 0, apr: 0, expectedValue: 0, volatility: 0, sharpe: 0, sortino: 0
    };

    const startVal = filteredChartData[0].value;
    const endVal = filteredChartData[filteredChartData.length - 1].value;
    
    // Total Return
    const totalReturn = ((endVal - startVal) / startVal) * 100;

    // Max Drawdown (lowest value in 'drawdown' field)
    const maxDrawdown = Math.min(...filteredChartData.map(d => d.drawdown));

    // Calculate Daily Returns
    const dailyReturns = [];
    for (let i = 1; i < filteredChartData.length; i++) {
        const r = (filteredChartData[i].value - filteredChartData[i-1].value) / filteredChartData[i-1].value;
        dailyReturns.push(r);
    }

    // Annualized Metrics
    const tradingDays = 252;
    const meanDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const annualizedReturn = meanDailyReturn * tradingDays;
    
    // CAGR
    const startDate = new Date(filteredChartData[0].date);
    const endDate = new Date(filteredChartData[filteredChartData.length - 1].date);
    const yearsDiff = Math.max((endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25), 0.01); // Avoid zero div
    const cagr = (Math.pow(endVal / startVal, 1 / yearsDiff) - 1) * 100;

    // APR (Annual Percentage Rate - Simple)
    const apr = annualizedReturn * 100;

    // Expected Value (Mean daily return as percentage)
    const expectedValue = meanDailyReturn * 100;

    // Volatility (Standard Deviation * sqrt(252))
    const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - meanDailyReturn, 2), 0) / (dailyReturns.length - 1);
    const stdDev = Math.sqrt(variance);
    const volatility = stdDev * Math.sqrt(tradingDays) * 100;

    // Downside Deviation for Sortino
    const downsideReturns = dailyReturns.filter(r => r < 0);
    const downsideVariance = downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / dailyReturns.length; 
    const downsideDev = Math.sqrt(downsideVariance);
    const annDownsideDev = downsideDev * Math.sqrt(tradingDays);

    // Sharpe Ratio (Assume Rf = 0)
    const sharpe = (volatility !== 0) ? (apr / volatility) : 0;

    // Sortino Ratio (Assume Rf = 0)
    const sortino = (annDownsideDev !== 0 && !isNaN(annDownsideDev)) ? (apr / (annDownsideDev * 100)) : 0;

    return {
        totalReturn,
        maxDrawdown,
        cagr,
        apr,
        expectedValue,
        volatility,
        sharpe,
        sortino
    };
  }, [filteredChartData]);

  // Helper for formatting stats
  const fmt = (val, suffix = '') => val ? `${val > 0 && suffix === '%' ? '+' : ''}${val.toLocaleString(undefined, {maximumFractionDigits: 2})} ${suffix}` : '-';
  const colorClass = (val) => val >= 0 ? 'text-[#22ab94]' : 'text-[#f23645]';


  // --- FILTER LOGIC ---
  useEffect(() => {
    if (selectedYear === 'ALL') {
        setFilteredChartData(fullData);
    } else {
        const filtered = fullData.filter(d => d.year === selectedYear);
        setFilteredChartData(filtered);
    }
  }, [selectedYear, fullData]);

  // --- SPLASH SCREEN STATE ---
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOutSplash, setFadeOutSplash] = useState(false);
  const [slideInTitle, setSlideInTitle] = useState(false);

  useEffect(() => {
    const timerSlide = setTimeout(() => setSlideInTitle(true), 100);
    const timerFade = setTimeout(() => setFadeOutSplash(true), 2500);
    const timerRemove = setTimeout(() => setShowSplash(false), 3500);
    return () => { clearTimeout(timerSlide); clearTimeout(timerFade); clearTimeout(timerRemove); };
  }, []); 
  
  // Loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="text-4xl font-bold text-white font-eth mb-4 animate-pulse">
            Sentquant
          </div>
          <div className="text-gray-400">Loading data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen text-[#d1d4dc] font-sans overflow-hidden relative bg-black">
      
      {/* Injecting Fonts: Inter for general text, Montserrat for Brand */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700;800&display=swap');
          
          /* "Sentquant" brand font */
          .font-eth {
             font-family: 'Montserrat', sans-serif;
          }
          
          /* Default font for everything else (Numbers, Text) */
          body, .font-sans {
             font-family: 'Inter', sans-serif;
          }

          /* Ensure splash screen uses brand font */
          .splash-title {
             font-family: 'Montserrat', sans-serif;
          }
          /* Hide Scrollbar for Year Filter */
          .no-scrollbar::-webkit-scrollbar {
              display: none;
          }
          .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2); 
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      {/* --- SPLASH SCREEN --- */}
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
              {[
                { id: 'home', label: 'Home' },
                { id: 'historical', label: 'Historical' },
                { id: 'live', label: 'Live' },
                { id: 'stats', label: 'Stats' },
                { id: 'about', label: 'About' }
              ].map(item => (
                <button 
                  key={item.id} 
                  onClick={() => setActiveTab(item.id)}
                  className={`hover:text-white transition-colors drop-shadow-sm ${activeTab === item.id ? 'text-white' : 'text-[#d1d4dc]/60'}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <button className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full text-sm font-bold transition-colors backdrop-blur-md">Join</button>
          <button className="hover:bg-white/10 p-2 rounded-full md:hidden transition-colors"><Menu size={24} /></button>
        </div>
      </header>

      {/* 2. MAIN SCROLLABLE CONTENT */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          
          {/* BACKGROUND LAYER - LOCKED TO GRID WAVE (GRAY) */}
          <GridWaveBackground height={580} />

         <div className="max-w-[1584px] mx-auto px-4 sm:px-6 py-8 pb-20 relative z-10">
            
            {/* ================== TAB CONTENT: HOME ================== */}
            {activeTab === 'home' && (
              <div className="animate-fade-in-up flex flex-col items-center justify-center h-[70vh]">
                 <h1 className="text-7xl md:text-9xl font-bold text-white font-eth tracking-tighter drop-shadow-2xl mb-6">
                   Sentquant
                 </h1>
                 <p className="text-gray-400 text-sm md:text-base font-light tracking-wide text-center max-w-lg">
                   if CoinMarketCap track asset , then Sentquant track strategy performance
                 </p>
              </div>
            )}

            {/* ================== TAB CONTENT: HISTORICAL ================== */}
            {activeTab === 'historical' && (
              <>
                {/* --- HEADER SECTION (Like Live Tab) --- */}
                <div className="mb-10 animate-fade-in-up">
                  <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-white font-eth drop-shadow-md">
                          Historical Performance
                      </h3>
                    </div>

                    {/* TIME TRAVEL BAR */}
                    <div className="relative flex gap-2 items-center">
                       <button onClick={() => { setSelectedYear('ALL'); setIsFilterOpen(false); }} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedYear === 'ALL' ? 'bg-[#22ab94] text-black shadow-[0_0_15px_rgba(34,171,148,0.5)]' : 'bg-white/5 text-gray-400 hover:bg-white/20 hover:text-white backdrop-blur-sm'}`}>ALL</button>
                       <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${selectedYear !== 'ALL' ? 'bg-gray-600 text-white shadow-[0_0_15px_rgba(75,85,99,0.5)]' : 'bg-white/5 text-gray-400 hover:bg-white/20 hover:text-white backdrop-blur-sm'}`}>
                          {selectedYear !== 'ALL' ? selectedYear : 'FILTER'} <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                       </button>
                       {isFilterOpen && (
                          <div className="absolute top-full right-0 mt-2 w-32 max-h-60 overflow-y-auto bg-[#0a0a0a] rounded-xl shadow-xl z-50 p-2 custom-scrollbar backdrop-blur-md">
                              {yearsList.map((year) => (
                                  <button key={year} onClick={() => { setSelectedYear(year); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors mb-1 ${selectedYear === year ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'}`}>{year}</button>
                              ))}
                          </div>
                       )}
                    </div>
                  </div>

                  {/* --- 2 BOX STATISTICS (UPDATED: FULLY TRANSPARENT) --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    {/* BOX 1: Returns & Risk */}
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

                    {/* BOX 2: Stats & Ratios */}
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

                  {/* --- CHARTS SECTION --- */}
                  <div className="flex flex-col space-y-2">
                      {/* Main Equity Chart - FIXED TO MATCH LIVE (GLASSMORPHISM) */}
                      <div className="h-[400px] rounded-t-xl bg-black/20 backdrop-blur-sm overflow-hidden relative">
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

                      {/* Underwater Chart - FIXED TO MATCH LIVE (GLASSMORPHISM) */}
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
                </div>
              </>
            )}

            {/* ================== TAB CONTENT: LIVE ================== */}
            {activeTab === 'live' && (
              <div className="animate-fade-in-up">
                {/* --- LIVE HEADER --- */}
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

                  {/* --- 2 BOX STATISTICS (LIVE) --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      {/* BOX 1: Live Returns & Risk */}
                      <div className="p-4 flex flex-col justify-center transition-colors backdrop-blur-sm rounded-xl bg-black/10"> 
                          <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                              <div>
                                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Total Return (1Y)</div>
                                  <div className="text-lg font-bold text-[#22ab94] drop-shadow-sm">+14.5 %</div>
                              </div>
                              <div>
                                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Max Drawdown</div>
                                  <div className="text-lg font-bold text-[#f23645] drop-shadow-sm">-8.24 %</div>
                              </div>
                              <div>
                                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">CAGR (1Y)</div>
                                  <div className="text-lg font-bold text-white drop-shadow-sm">+14.5 %</div>
                              </div>
                              <div>
                                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Win Rate</div>
                                  <div className="text-lg font-bold text-white drop-shadow-sm">62.4 %</div>
                              </div>
                          </div>
                      </div>

                      {/* BOX 2: Live Stats & Ratios */}
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
                                  <div className="text-lg font-bold text-[#22ab94] drop-shadow-sm">2.14</div>
                              </div>
                              <div>
                                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Sortino Ratio</div>
                                  <div className="text-lg font-bold text-[#22ab94] drop-shadow-sm">3.05</div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Live Charts Container */}
                  <div className="flex flex-col space-y-2">
                     {/* Live Equity Chart */}
                     <div className="h-[400px] rounded-t-xl bg-black/20 backdrop-blur-sm overflow-hidden relative">
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

                      {/* Live Underwater Chart */}
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
                </div>
              </div>
            )}

            {/* ================== TAB CONTENT: STATS ================== */}
            {activeTab === 'stats' && (
              <div className="animate-fade-in-up">
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-2xl font-bold text-white drop-shadow-md font-eth">Monthly Returns Heatmap</h3>
                     <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-xs text-gray-400"><div className="w-2 h-2 bg-[#22ab94] rounded-sm"></div> Positif</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400"><div className="w-2 h-2 bg-[#f23645] rounded-sm"></div> Negatif</span>
                     </div>
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
                           {heatmapData.map((row, idx) => (
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
                           ))}
                        </tbody>
                     </table>
                  </div>
                </div>

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

                <div className="mb-20 flex flex-col lg:flex-row gap-8 items-start">
                    <div className="w-full lg:w-1/2 rounded-xl bg-black/20 backdrop-blur-sm overflow-hidden">
                        <div className="bg-[#2962ff]/10 px-4 py-3 flex justify-between items-center backdrop-blur-md">
                              <h3 className="font-bold text-white font-eth">Global Statistic</h3>
                              <span className="text-xs text-[#2962ff] uppercase tracking-widest font-bold">Value</span>
                        </div>
                        <div className="p-2">
                            {[
                                { l: 'Sharpe Ratio', v: '3.18', good: true },
                                { l: 'Sortino Ratio', v: '4.22', good: true },
                                { l: 'Max Drawdown', v: '-12.45 %', good: false },
                                { l: 'Win Rate', v: '68.5 %', good: true },
                                { l: 'Profit Factor', v: '2.15', good: true },
                                { l: 'Avg Turnover', v: '0.03 %', good: null },
                                { l: 'Total Trades', v: '456', good: null },
                                { l: 'Holding Time', v: '14 Days', good: null },
                            ].map((row, i) => (
                                <div key={i} className="flex justify-between items-center px-4 py-3 hover:bg-white/5 transition-colors rounded-lg">
                                    <span className="text-gray-300 text-sm font-medium">{row.l}</span>
                                    <span className={`font-bold ${row.good === true ? 'text-[#22ab94]' : row.good === false ? 'text-[#f23645]' : 'text-white'}`}>
                                        {row.v}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 rounded-xl bg-black/20 backdrop-blur-sm overflow-hidden">
                        <div className="bg-[#2962ff]/10 px-4 py-3 grid grid-cols-4 gap-4 backdrop-blur-md">
                              <h3 className="font-bold text-white font-eth col-span-1">Metric</h3>
                              <h3 className="font-bold text-white font-eth text-center">Strategy</h3>
                              <h3 className="font-bold text-gray-400 font-eth text-center">IHSG</h3>
                              <h3 className="font-bold text-gray-400 font-eth text-center">LQ45</h3>
                        </div>
                        <div className="p-2">
                            {[
                                { l: 'Total Return', s: '+4327 %', b1: '+140 %', b2: '+95 %', sg: true },
                                { l: 'CAGR', s: '+45.2 %', b1: '+8.5 %', b2: '+6.2 %', sg: true },
                                { l: 'Volatility', s: '18.5 %', b1: '12.2 %', b2: '14.1 %', sg: null },
                                { l: 'Sharpe', s: '3.18', b1: '0.65', b2: '0.44', sg: true },
                                { l: 'Max DD', s: '-12.5 %', b1: '-35.6 %', b2: '-42.1 %', sg: true }, 
                                { l: 'Correlation', s: '0.12', b1: '1.00', b2: '0.89', sg: null },
                            ].map((row, i) => (
                                <div key={i} className="grid grid-cols-4 gap-4 px-4 py-3 hover:bg-white/5 transition-colors items-center rounded-lg">
                                    <span className="text-gray-300 text-sm font-medium col-span-1">{row.l}</span>
                                    <div className={`text-center font-bold py-1 rounded ${row.sg ? 'text-[#22ab94]' : 'text-white'}`}>
                                        {row.s}
                                    </div>
                                    <span className="text-center text-gray-400 text-sm">{row.b1}</span>
                                    <span className="text-center text-gray-400 text-sm">{row.b2}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              </div>
            )}

            {/* ================== TAB CONTENT: ABOUT ================== */}
            {activeTab === 'about' && (
              <div className="animate-fade-in-up flex items-center justify-center h-[60vh]">
                 <div className="text-center">
                    <h2 className="text-4xl font-bold text-white font-eth mb-4">About Sentquant</h2>
                    <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">
                       Sentquant adalah platform analitik kuantitatif yang menyediakan data performa strategi trading secara transparan dan akurat. Kami percaya bahwa data historis dan live monitoring adalah kunci kepercayaan dalam dunia trading algoritmik.
                    </p>
                 </div>
              </div>
            )}

            {/* --- FOOTER (Shown on all tabs or just About? Let's keep it on all for structure) --- */}
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

          </div>
        </main>
      </div>
    </div>
  );
}
