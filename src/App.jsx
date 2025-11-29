import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart as RechartsBarChart, Bar, Cell 
} from 'recharts';
import { 
  Menu, X, ChevronDown, Filter, ArrowUpRight, Circle, Lock, Info, Star, Zap, Grid, Code, Wind, Settings, ArrowUp
} from 'lucide-react';

// --- LOGO DATA ---
const LOGO_PATHS = [
  "M490 333.1c-60.3 7.7-116.7 49.2-142.8 104.9-5.7 12.2-11.3 29.4-14.3 44-2.2 10.3-2.4 14-2.3 35.5 0 13.2.5 25 1 26.3.9 2.1 1.8 1.3 13.9-12.5 7.2-8.1 19.1-21.5 26.5-29.8 7.5-8.2 27.6-31 44.6-50.5 17.1-19.5 38-43.2 46.5-52.6s25.1-27.7 36.9-40.8 21.7-24.2 21.8-24.7c.4-1.1-22.9-1-31.8.2",
  "M540.8 334.9c-.3.9-22.7 26.6-28.7 33.1-5.7 6.1-22.1 24.8-22.1 25.2 0 .3 2.4.1 5.3-.4 8.1-1.4 31.4-1.4 39.7.1 54.3 9.5 96.5 52.3 103.6 105.1 1.8 13.6 1.8 21.8-.2 34.9-3.5 24.3-15.6 50.7-31.2 68.1l-4.8 5.3-6.2-6.8-6.3-6.9-36.2.3c-19.9.1-36.3.3-36.4.4 0 .1 24.9 25.5 55.5 56.5l55.7 56.3 35.9-.1h35.9l-4.3-4.7c-3.8-4.2-11.2-11.9-44.3-46l-8-8.1 8.4-9.4c22.9-25.7 39.1-59.3 45-93.3 2.8-16.3 3-40.6.5-56.5-11.9-75.6-68.5-135.1-144.6-152.1-9.7-2.1-11.7-2.3-12.2-1",
  "M385 511.5c-2.5 2.9-12.8 14.5-23 25.9-10.2 11.5-20 22.6-21.9 24.8l-3.3 3.9 3.2 9.2c9.5 27.6 24.6 51.3 46.1 72.3 39.2 38.2 90.2 56.8 144.1 52.6 19.7-1.6 42.2-6.3 54.9-11.5l3.1-1.2-23.3-23.9-23.4-23.8-6.5 1.3c-9.1 1.7-30.7 1.5-40.5-.5-27.7-5.7-48.1-16.3-66.5-34.6-25.2-24.9-36.2-50-37.9-86.5l-.6-13.1z"
];

// --- COMPONENT: CUSTOM Q LOGO ---
const SentquantLogo = ({ size = 120 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 1024 1024"
    className="animate-fade-in-up drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]"
  >
    {LOGO_PATHS.map((d, i) => (
      <path key={i} fill="#FFFFFF" d={d} />
    ))}
  </svg>
);

// --- COMPONENT: MONTHLY HEATMAP ---
const MonthlyHeatmap = ({ data, enableFilter = false }) => {
  const [selectedRange, setSelectedRange] = useState('2020-2025');
  const filterRanges = ['2020-2025', '2015-2019', '2010-2014', '2005-2009'];

  const filteredData = useMemo(() => {
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
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs text-gray-400"><div className="w-2 h-2 bg-[#22ab94] rounded-sm"></div> Positive</span>
              <span className="flex items-center gap-1 text-xs text-gray-400"><div className="w-2 h-2 bg-[#f23645] rounded-sm"></div> Negative</span>
            </div>
          )}
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-2 rounded-xl bg-black/10 backdrop-blur-sm p-2">
          <table className="w-full text-sm border-collapse min-w-[800px]">
            <thead>
                <tr>
                  <th className="text-left text-gray-400 font-medium py-3 px-2">Year</th>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                      <th key={m} className="text-center text-gray-400 font-medium py-3 px-2">{m}</th>
                  ))}
                  <th className="text-center text-gray-400 font-medium py-3 px-2">Annual</th>
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
                      Data not available for period {selectedRange}
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

// --- COMPONENT: ABOUT MODELS CARD ---
const AboutModelsCard = () => (
  <div className="mb-8 rounded-xl bg-black/20 backdrop-blur-sm overflow-hidden flex flex-col">
    <div className="bg-[#2962ff]/10 px-5 py-4">
      <h3 className="font-bold text-white font-eth text-xl">ABOUT THE MODELS</h3>
    </div>
    
    <div className="p-5 md:p-6 space-y-4 text-white text-sm font-medium leading-relaxed font-sans">
      <p>
        The Framework is for exploiting structural inefficiencies in commodity and cryptocurrency markets.
      </p>
      <p>
        We run O-U mean reversion on commodities and microstructure on crypto. two strategies, zero overlap, naturally uncorrelated.
      </p>
      <p>
        Regimes shift? No problem. We use 3 state HMM dynamically reallocates risk so the model always adapts.
      </p>
      <p>
        IN SAMPLE/OUT OF SAMPLE backtest , with 30%+ CAGR , 1.44 Sharpe , 27.77% APR in 21 years, Kurtosis 54.5 yeah, it’s fat-tail territory but chill we tame the tails with EVT + CVaR hedging.
      </p>
      <p className="pt-2">
        Infrastructure use : Python, C++, Wolfram
      </p>
      
      <div className="mt-6 pt-6 opacity-100 font-sans">
        <p>But enough with the nerd stuff.</p>
        <p>If it has edge, you’ll see it. If it doesn’t, you’ll see that too.</p>
      </div>
    </div>
  </div>
);

// --- DATA: DETAILED STATS STRUCTURE ---
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

// --- COMPONENT: DETAILED STAT CARD ---
const DetailedStatCard = ({ section }) => (
  <div className="rounded-xl bg-black/20 backdrop-blur-sm overflow-hidden h-full flex flex-col">
    <div className="bg-[#2962ff]/10 px-5 py-4">
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
        <tbody>
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
        <div className="p-5 bg-white/[0.02] flex-grow">
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

// --- COMPONENT: WARP/STARFIELD BACKGROUND ---
const WarpBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    let animationFrameId;
    
    let stars = [];
    const numStars = 200;
    const speed = 2; // Warp speed

    let lastWidth = window.innerWidth;

    const resize = () => {
      // Only resize if width changes (orientation change), ignore height changes (address bar)
      if (window.innerWidth !== lastWidth) {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        lastWidth = window.innerWidth;
      } else {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      }
    };
    // Initial size
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    
    window.addEventListener('resize', resize);

    // Initialize stars
    for(let i=0; i<numStars; i++){
      stars.push({
        x: Math.random() * w - w/2,
        y: Math.random() * h - h/2,
        z: Math.random() * w
      });
    }

    const draw = () => {
      if(!ctx) return;
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, w, h);
      
      const cx = w/2;
      const cy = h/2;

      stars.forEach(star => {
        star.z -= speed;
        if(star.z <= 0) {
          star.x = Math.random() * w - w/2;
          star.y = Math.random() * h - h/2;
          star.z = w;
        }

        const x = (star.x / star.z) * w + cx;
        const y = (star.y / star.z) * h + cy;
        
        // Corrected size calculation to prevent negative values
        const size = Math.max(0, (1 - star.z / w) * 3);
        const alpha = Math.max(0, Math.min(1, (1 - star.z / w)));

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI*2);
        ctx.fill();
      });

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

// --- MOCK DATA ---
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
const generateMockHeatmap = () => {
  const years = [];
  for (let y = 2024; y >= 2005; y--) {
    const months = Array.from({length: 12}, () => (Math.random() * 10 - 4).toFixed(1)).map(Number);
    years.push({ year: y.toString(), months });
  }
  return years;
};
const MOCK_HEATMAP = generateMockHeatmap();
const MOCK_LIVE_HEATMAP = [
  { year: '2029', months: Array(12).fill(null) },
  { year: '2028', months: Array(12).fill(null) },
  { year: '2027', months: Array(12).fill(null) },
  { year: '2026', months: Array(12).fill(null) },
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
const MOCK_TOP_DRAWDOWNS = [
  { rank: 1, startDate: '2022-01-05', endDate: '2022-06-15', depth: -12.45, duration: 161, recovery: 45 },
  { rank: 2, startDate: '2021-09-10', endDate: '2021-10-05', depth: -8.32, duration: 25, recovery: 12 },
  { rank: 3, startDate: '2023-03-12', endDate: '2023-04-18', depth: -6.15, duration: 37, recovery: 15 },
  { rank: 4, startDate: '2020-11-02', endDate: '2020-11-20', depth: -4.80, duration: 18, recovery: 8 },
  { rank: 5, startDate: '2024-08-01', endDate: '2024-08-15', depth: -3.20, duration: 14, recovery: 5 },
];

// --- MAIN APPLICATION ---

export default function App() {
  const [fullData, setFullData] = useState([]);
  const [liveData, setLiveData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [liveHeatmapData, setLiveHeatmapData] = useState([]);
  const [annualReturnsData, setAnnualReturnsData] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [liveStatsData, setLiveStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('5Y');
  const [filteredChartData, setFilteredChartData] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  
  // Scroll to top logic
  const mainScrollRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (mainScrollRef.current) {
        setShowScrollTop(mainScrollRef.current.scrollTop > 400);
      }
    };

    const scrollContainer = mainScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
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
            fetchOrFallback('/data/live-heatmap-data.json', MOCK_LIVE_HEATMAP),
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
        setLiveHeatmapData(liveHeatmap);
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

  useEffect(() => {
    const updateFavicons = async () => {
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
          <circle cx="512" cy="512" r="512" fill="black"/>
          <g transform="translate(512, 512) scale(1.5) translate(-512, -512)"> 
            ${LOGO_PATHS.map(d => `<path fill="#FFFFFF" d="${d}" />`).join('')}
          </g>
        </svg>
      `;

      const generatePngIcon = (size) => {
        return new Promise((resolve) => {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
          
          img.onload = () => {
            ctx.drawImage(img, 0, 0, size, size);
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = () => {
             // Fallback for iframe environments that block data URL images
             resolve('');
          }
        });
      };

      try {
        const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
        let linkIcon = document.querySelector("link[rel~='icon']");
        if (!linkIcon) {
            linkIcon = document.createElement('link');
            linkIcon.rel = 'icon';
            document.head.appendChild(linkIcon);
        }
        linkIcon.href = svgUrl;

        // Note: These might not render in all sandboxed environments but the code is preserved
        const appleTouchIconUrl = await generatePngIcon(180);
        if(appleTouchIconUrl) {
            let linkApple = document.querySelector("link[rel='apple-touch-icon']");
            if (!linkApple) {
                linkApple = document.createElement('link');
                linkApple.rel = 'apple-touch-icon';
                document.head.appendChild(linkApple);
            }
            linkApple.href = appleTouchIconUrl;
        }
      } catch (e) {
          console.log("Favicon generation skipped due to environment restrictions");
      }
    };

    updateFavicons();
  }, []);

  // Force scrollbar visibility
  useEffect(() => {
    const mainEl = mainScrollRef.current;
    if (mainEl) {
      mainEl.style.overflowY = 'scroll';
      mainEl.style.scrollbarGutter = 'stable';
    }
  }, []);

  const handleTabChange = (tabId) => {
  const handleTabChange = (tabId) => {
      setActiveTab(tabId);
      setIsMenuOpen(false);
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
    const sharpe = (volatility !== 0) ? (apr / volatility) : 0;
    const downsideReturns = dailyReturns.filter(r => r < 0);
    const downsideVariance = downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / dailyReturns.length;
    const downsideDev = Math.sqrt(downsideVariance);
    const annDownsideDev = downsideDev * Math.sqrt(tradingDays);
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
    <div className="flex flex-col h-[100dvh] text-[#d1d4dc] font-sans overflow-hidden relative bg-black">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700;800&display=swap');
          .font-eth { font-family: 'Montserrat', sans-serif; }
          body, .font-sans { font-family: 'Inter', sans-serif; }
          .splash-title { font-family: 'Montserrat', sans-serif; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
/* Force scrollbar to always be visible - EXTREME VERSION */
main.custom-scrollbar {
  overflow-y: scroll !important;
  height: calc(100vh - 60px) !important;
  max-height: calc(100vh - 60px) !important;
  min-height: calc(100vh - 60px) !important;
}

main.custom-scrollbar::-webkit-scrollbar {
  width: 20px !important;
  display: block !important;
  background: #FF0000 !important; /* MERAH biar keliatan jelas */
}

main.custom-scrollbar::-webkit-scrollbar-track {
  background: #333333 !important;
}

main.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #00FF00 !important; /* HIJAU biar keliatan jelas */
  border-radius: 0px !important;
  min-height: 50px !important;
}

main.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #FFFF00 !important; /* KUNING saat hover */
}

main.custom-scrollbar {
  scrollbar-width: auto !important;
  scrollbar-color: #00FF00 #333333 !important;
}
       .custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.4) transparent;
}
/* Force scrollbar to always show */
main.custom-scrollbar {
  overflow-y: scroll !important;
  scrollbar-gutter: stable;
}

/* For Webkit browsers (Chrome, Safari, Edge) */
main.custom-scrollbar::-webkit-scrollbar {
  -webkit-appearance: none;
  width: 10px !important;
 background-color: rgba(0, 0, 0, 0.3);
}

main.custom-scrollbar::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background-color: rgba(128, 128, 128, 0.8);
 border: 2px solid rgba(0, 0, 0, 0.2);
  background-clip: padding-box;
}

main.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(128, 128, 128, 1);
}

/* For Firefox */
main.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.5) rgba(255, 255, 255, 0.05);
}
          .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          /* FIX: FORCE BLACK BACKGROUND AND DISABLE OVERSCROLL BOUNCE */
          html, body {
            background-color: #000000 !important;
            margin: 0;
            padding: 0;
            overscroll-behavior: none; /* Prevents pull-to-refresh white space */
            overscroll-behavior-y: none;
            height: 100%;
            width: 100%;
          }
          #root {
            height: 100%;
            width: 100%;
            background-color: #000000;
          }
        `}
      </style>

      {/* SPLASH SCREEN */}
      {showSplash && (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-1000 ease-in-out ${fadeOutSplash ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className={`text-center overflow-hidden flex items-center justify-center transition-all duration-1000 ease-out transform ${slideInTitle ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
             <SentquantLogo size={360} />
          </div>
        </div>
      )}

      {/* HEADER */}
      <header 
        className="h-[60px] flex-none flex items-center justify-between px-4 bg-transparent z-50 relative"
        style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
      >
        <div className="flex items-center gap-6">
          {/* MOBILE LOGO */}
          <div className="flex items-center gap-2 md:hidden">
             <SentquantLogo size={80} />
          </div>

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
          <button className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full text-sm font-bold transition-colors backdrop-blur-md flex items-center gap-2">
            Join <Lock size={14} />
          </button>
          {/* MOBILE MENU TOGGLE */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="block md:hidden hover:bg-white/10 p-2 rounded-full transition-colors text-white z-[60] relative"
            aria-label="Toggle Menu"
            style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl pt-24 px-6 md:hidden flex flex-col gap-6 animate-fade-in-up">
            {navItems.map(item => (
                <button key={item.id} onClick={() => handleTabChange(item.id)} className={`text-2xl font-bold text-left py-2 border-b border-white/10 ${activeTab === item.id ? 'text-white' : 'text-gray-500'}`}>{item.label}</button>
            ))}
            <div className="mt-auto pb-10"><p className="text-gray-500 text-sm">© 2024 Sentquant, Inc.</p></div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        <div className="fixed inset-0 z-[-10] bg-black pointer-events-none"></div>

      <main ref={mainScrollRef} className="flex-1 overflow-y-scroll custom-scrollbar relative" style={{overflowY: 'scroll'}}>
          
          <WarpBackground />

          <div className={`max-w-[1584px] mx-auto px-4 sm:px-6 py-8 pb-20 relative z-10 ${activeTab === 'about' ? 'h-[calc(100vh-60px)]' : ''}`}> 
            
            {/* HOME */}
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

            {/* HISTORICAL */}
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
                                    <button key={range} onClick={() => { setSelectedYear(range); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors mb-1 ${selectedYear === range ? 'bg-[#22ab94]/20 text-[#22ab94]' : 'text-gray-300 hover:bg-white/10'}`}>{range}</button>
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
                            <Tooltip contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', backdropFilter: 'blur(10px)', fontFamily: 'Inter'}} itemStyle={{color: '#22ab94'}} formatter={(value) => [`$${value.toLocaleString()}`, 'Equity']} labelStyle={{color: '#fff', fontFamily: 'Inter'}} />
                            <Area type="monotone" dataKey="value" stroke="#22ab94" strokeWidth={2} fill="url(#colorGradient)" isAnimationActive={selectedYear !== 'ALL'} animationDuration={500} dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                        <div className="absolute top-4 left-4 flex gap-1 bg-black/40 backdrop-blur-md p-1 rounded shadow-lg"><span className="p-1 text-gray-300 text-xs font-bold cursor-pointer hover:text-white">Sentquant Model</span></div>
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
                            <Tooltip contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', backdropFilter: 'blur(10px)', fontFamily: 'Inter'}} itemStyle={{color: '#f23645'}} formatter={(value) => [`${value}%`, 'Drawdown']} labelStyle={{color: '#fff', fontFamily: 'Inter'}} />
                            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                            <Area type="stepAfter" dataKey="drawdown" stroke="#f23645" strokeWidth={1.5} fill="url(#colorDrawdown)" isAnimationActive={selectedYear !== 'ALL'} dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                  </div>
                  <MonthlyHeatmap data={heatmapData} enableFilter={true} />
                  <TopDrawdownsTable data={MOCK_TOP_DRAWDOWNS} />
                </div>
              </>
            )}

            {/* LIVE */}
            {activeTab === 'live' && (
              <div className="animate-fade-in-up">
                <div className="mb-10">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-white font-eth drop-shadow-md">Live on LIGHTER</h3>
                    <div className="px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-xs backdrop-blur-md flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>LIVE MONITORING (1Y)</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div className="p-4 flex flex-col justify-center transition-colors backdrop-blur-sm rounded-xl bg-black/10"> 
                          <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                              <div><div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Total Return (1Y)</div><div className="text-lg font-bold text-[#22ab94] drop-shadow-sm">{fmt(liveStatsData?.totalReturn, '%')}</div></div>
                              <div><div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Max Drawdown</div><div className="text-lg font-bold text-[#f23645] drop-shadow-sm">{fmt(liveStatsData?.maxDrawdown, '%')}</div></div>
                              <div><div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">CAGR (1Y)</div><div className="text-lg font-bold text-white drop-shadow-sm">{fmt(liveStatsData?.totalReturn, '%')}</div></div>
                              <div><div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Win Rate</div><div className="text-lg font-bold text-white drop-shadow-sm">{fmt(liveStatsData?.winRate, '%')}</div></div>
                          </div>
                      </div>
                      <div className="p-4 flex flex-col justify-center transition-colors backdrop-blur-sm rounded-xl bg-black/10">
                          <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                              <div><div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Expected Value</div><div className="text-lg font-bold text-white drop-shadow-sm">+0.85 %</div></div>
                              <div><div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Volatility</div><div className="text-lg font-bold text-white drop-shadow-sm">15.2 %</div></div>
                              <div><div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Sharpe Ratio</div><div className="text-lg font-bold text-[#22ab94] drop-shadow-sm">{fmt(liveStatsData?.sharpe)}</div></div>
                              <div><div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Sortino Ratio</div><div className="text-lg font-bold text-[#22ab94] drop-shadow-sm">{fmt(liveStatsData?.sortino)}</div></div>
                          </div>
                      </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                      <div className="h-[300px] md:h-[400px] rounded-t-xl bg-black/20 backdrop-blur-sm overflow-hidden relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={liveData} margin={{top:10, left:0, right:0, bottom:0}}>
                            <defs><linearGradient id="colorLive" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22ab94" stopOpacity={0.4}/><stop offset="95%" stopColor="#22ab94" stopOpacity={0}/></linearGradient></defs>
                            <XAxis dataKey="date" hide /><YAxis orientation="right" domain={['auto', 'auto']} tick={{fill: '#a1a1aa', fontSize: 11}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', backdropFilter: 'blur(10px)', fontFamily: 'Inter'}} itemStyle={{color: '#22ab94'}} formatter={(value) => [`$${value.toLocaleString()}`, 'Live Equity']} labelStyle={{color: '#fff', fontFamily: 'Inter'}} />
                            <Area type="monotone" dataKey="value" stroke="#22ab94" strokeWidth={2} fill="url(#colorLive)" animationDuration={1500} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                        <div className="absolute top-4 left-4 flex gap-1 bg-black/40 backdrop-blur-md p-1 rounded shadow-lg"><span className="p-1 text-gray-300 text-xs font-bold">Sentquant Model</span></div>
                      </div>
                      <div className="h-[180px] rounded-b-xl bg-black/20 backdrop-blur-sm overflow-hidden relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={liveData} margin={{top:5, left:0, right:0, bottom:0}}>
                            <defs><linearGradient id="colorDrawdownLive" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f23645" stopOpacity={0.4}/><stop offset="95%" stopColor="#f23645" stopOpacity={0.05}/></linearGradient></defs>
                            <XAxis dataKey="date" hide /><YAxis orientation="right" tick={{fill: '#a1a1aa', fontSize: 10}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', backdropFilter: 'blur(10px)', fontFamily: 'Inter'}} itemStyle={{color: '#f23645'}} formatter={(value) => [`${value}%`, 'Live Drawdown']} labelStyle={{color: '#fff', fontFamily: 'Inter'}} />
                            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                            <Area type="stepAfter" dataKey="drawdown" stroke="#f23645" strokeWidth={1.5} fill="url(#colorDrawdownLive)" animationDuration={1500} dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                        <div className="absolute top-2 left-4"><span className="text-[#f23645] text-[10px] font-bold uppercase tracking-widest">Live Underwater Plot</span></div>
                      </div>
                  </div>
                  <MonthlyHeatmap data={liveHeatmapData} enableFilter={false} />
                </div>
              </div>
            )}

            {/* STATS */}
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
                <AboutModelsCard />
                <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {DETAILED_STATS_SECTIONS.map((section, idx) => (
                      <DetailedStatCard key={idx} section={section} />
                    ))}
                </div>
              </div>
            )}

            {/* ABOUT */}
            {activeTab === 'about' && (
              <div className="animate-fade-in-up flex flex-col items-start justify-start h-full relative z-10 px-4 pt-0 md:pt-8 pl-4 md:pl-20">
                  <div className="max-w-3xl text-left">
                    <h2 className="text-2xl md:text-3xl font-medium text-gray-400 font-eth mb-4">The trading industry is broken.</h2>
                    <div className="text-sm md:text-base text-white font-light leading-relaxed space-y-4 max-w-xl">
                        <p>Fake gurus sell dreams.</p>
                        <p>Performance can’t be verified.</p>
                        <p>Retail traders are misled by empty claims.</p>
                        <p>Everyone talks.<br/>No data.</p>
                    </div>
                    <div className="text-2xl md:text-3xl font-medium text-gray-400 font-eth leading-tight space-y-2 mt-12 max-w-2xl">
                        <p>If CoinMarketCap tracks assets,</p>
                        <p>Sentquant tracks strategy performance.</p>
                        <p>Because performance can’t lie, people can.</p>
                    </div>
                    <div className="mt-12 space-y-12 pb-20">
                        <div className="flex flex-col space-y-3 text-white text-sm md:text-base font-light leading-relaxed max-w-xl text-left">
                            <div>Sentquant doesn't sell courses.</div>
                            <div>Sentquant doesn’t sell signals.</div>
                            <div>Sentquant doesn’t sell promises.</div>
                            <div className="text-white mt-4 leading-relaxed">Sentquant is the arena where every claim is tested.</div>
                        </div>
                        <div className="flex flex-col items-start text-left w-full max-w-4xl pt-4">
                            <div className="py-2"><span className="text-white font-bold text-xl block">This is the end of the fake trading mentor era.</span></div>
                            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 border-t border-b border-white/10 py-6 my-8">
                                <div className="flex flex-wrap justify-start gap-3 md:gap-6 text-[11px] md:text-[13px] font-mono text-blue-400 tracking-widest">
                                    <span>EVERY TRADER</span>
                                    <span>EVERY STRATEGY</span>
                                    <span>EVERY CLAIM</span>
                                    <span className="whitespace-nowrap">PROVEN ON-CHAIN</span>
                                </div>
                                <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full text-sm md:text-base font-bold transition-colors backdrop-blur-md flex items-center gap-2 group border border-white/5">
                                    Join Movement <Lock size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                  </div>
              </div>
            )}

            {/* FOOTER */}
            {activeTab !== 'about' && (
                <footer className="pt-12 pb-8 bg-black/20 backdrop-blur-md rounded-xl mt-10 border-t border-white/5">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12 text-sm text-gray-400 px-6">
                    <div className="col-span-2 lg:col-span-2 pr-8">
                        <div className="flex items-center gap-2 mb-4"><span className="text-xl font-bold text-white font-eth">Sentquant</span></div>
                        <p className="mb-4">Look first / Then leap.</p>
                    </div>
                </div>
                <div className="pt-8 text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center px-6">
                    <p>Market data provided by ICE Data Services.</p>
                    <p className="mt-2 md:mt-0">© 2024 Sentquant, Inc.</p>
                </div>
                </footer>
            )}

          </div>
        </main>
        
        {/* SCROLL TO TOP BUTTON */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 z-50 p-3 rounded-full bg-gray-500/80 hover:bg-gray-600 text-white shadow-lg backdrop-blur-sm transition-all duration-500 transform ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      </div>
    </div>
  );
}
