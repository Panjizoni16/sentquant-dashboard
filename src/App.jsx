import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart as RechartsBarChart, Bar, Cell, CartesianGrid
} from 'recharts';
import { 
  Menu, X, Lock, Activity, Eye, EyeOff, ArrowRight, ArrowLeft, HelpCircle, Terminal, ChevronDown, Filter 
} from 'lucide-react';

// --- UTILITY: Fetch or Fallback ---
const fetchOrFallback = async (url, fallback) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(fallback), 500); 
  });
};

// --- LOGO DATA ---
const LOGO_PATHS = [
  "M490 333.1c-60.3 7.7-116.7 49.2-142.8 104.9-5.7 12.2-11.3 29.4-14.3 44-2.2 10.3-2.4 14-2.3 35.5 0 13.2.5 25 1 26.3.9 2.1 1.8 1.3 13.9-12.5 7.2-8.1 19.1-21.5 26.5-29.8 7.5-8.2 27.6-31 44.6-50.5 17.1-19.5 38-43.2 46.5-52.6s25.1-27.7 36.9-40.8 21.7-24.2 21.8-24.7c.4-1.1-22.9-1-31.8.2",
  "M540.8 334.9c-.3.9-22.7 26.6-28.7 33.1-5.7 6.1-22.1 24.8-22.1 25.2 0 .3 2.4.1 5.3-.4 8.1-1.4 31.4-1.4 39.7.1 54.3 9.5 96.5 52.3 103.6 105.1 1.8 13.6 1.8 21.8-.2 34.9-3.5 24.3-15.6 50.7-31.2 68.1l-4.8 5.3-6.2-6.8-6.3-6.9-36.2.3c-19.9.1-36.3.3-36.4.4 0 .1 24.9 25.5 55.5 56.5l55.7 56.3 35.9-.1h35.9l-4.3-4.7c-3.8-4.2-11.2-11.9-44.3-46l-8-8.1 8.4-9.4c22.9-25.7 39.1-59.3 45-93.3 2.8-16.3 3-40.6.5-56.5-11.9-75.6-68.5-135.1-144.6-152.1-9.7-2.1-11.7-2.3-12.2-1",
  "M385 511.5c-2.5 2.9-12.8 14.5-23 25.9-10.2 11.5-20 22.6-21.9 24.8l-3.3 3.9 3.2 9.2c9.5 27.6 24.6 51.3 46.1 72.3 39.2 38.2 90.2 56.8 144.1 52.6 19.7-1.6 42.2-6.3 54.9-11.5l3.1-1.2-23.3-23.9-23.4-23.8-6.5 1.3c-9.1 1.7-30.7 1.5-40.5-.5-27.7-5.7-48.1-16.3-66.5-34.6-25.2-24.9-36.2-50-37.9-86.5l-.6-13.1z"
];

// --- COMPONENT: CUSTOM Q LOGO ---
const SentquantLogo = ({ size = 120, withBg = false, animate = false }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 1024 1024"
    className={`${animate ? 'animate-fade-in-up' : ''} ${!withBg ? 'drop-shadow-[0_0_35px_rgba(163,163,163,0.4)]' : ''}`}
  >
    {withBg && <rect x="0" y="0" width="1024" height="1024" fill="#000000" />}
    <g transform="translate(512, 512) scale(1.4) translate(-512, -512)">
      {LOGO_PATHS.map((d, i) => (
        <path key={i} fill="#FFFFFF" d={d} />
      ))}
    </g>
  </svg>
);

// ==========================================
// 1. STATIC CONFIGURATION (METADATA)
// ==========================================
// Data ini statis (ID, Nama, Warna, Protokol Dasar)
const STRATEGIES_CONFIG = [
  { id: 'sentquant', name: 'Sentquant', color: '#22ab94', protocol: 'Lighter' },
   { id: 'systemic_hyper', name: 'Systemic Hyper', color: '#10b981', protocol: 'Hyperliquid' },
  { id: 'momentum_pro', name: 'Momentum Pro', color: '#f59e0b', protocol: 'Lighter' },
  { id: 'mean_revert', name: 'Mean Revert', color: '#8b5cf6', protocol: 'Hyperliquid' },
  { id: 'volatility_edge', name: 'Volatility Edge', color: '#ec4899', protocol: 'GMX' },
  { id: 'trend_follower', name: 'Trend Follower', color: '#6366f1', protocol: 'Lighter' }
];

// Helper to format currency
const formatCurrency = (value) => {
  if (value === undefined || value === null) return "$0";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Helper: Calculate Metrics from Historical Data Array
// Ini adalah otak kalkulasi dinamis


// Helper: Generate Mock Benchmark Data (For Terminal Chart)
// This fixes the "MOCK_BENCHMARK_DATA is not defined" error
const generateBenchmarkData = () => {
  const data = [];
  let values = STRATEGIES_CONFIG.map(() => 1000); 
  
  // Drift and Volatility for simulation
  const strategyBehaviors = [
    { drift: 0.008, vol: 0.02 },  
    { drift: 0.005, vol: 0.035 }, 
    { drift: 0.004, vol: 0.015 }, 
    { drift: 0.003, vol: 0.04 },  
    { drift: 0.002, vol: 0.025 }, 
    { drift: 0.001, vol: 0.05 }   
  ];

  for (let i = 0; i < 100; i++) {
    const point = { date: `Day ${i}` };
    values = values.map((val, idx) => {
      const { drift, vol } = strategyBehaviors[idx];
      const changePercent = drift + (Math.random() - 0.5) * vol; 
      return Math.max(100, val * (1 + changePercent)); 
    });
    
    STRATEGIES_CONFIG.forEach((strat, idx) => {
      point[strat.id] = values[idx];
    });
    data.push(point);
  }
  return data;
};

// Generate the benchmark data once
const MOCK_BENCHMARK_DATA = generateBenchmarkData();
// Helper: Fetch Real Sentquant Data
const fetchSentquantRealData = async () => {
  try {
    const [historicalRes, heatmapRes] = await Promise.all([
      fetch('/data/equity-historical-sentquant.json'),
      fetch('/data/heatmap-data-sentquant.json')
    ]);
    
    const historicalData = await historicalRes.json();
    const heatmapData = await heatmapRes.json();
    
    return { historicalData, heatmapData };
  } catch (error) {
    console.error('Error fetching Sentquant data:', error);
    return { historicalData: [], heatmapData: [] };
  }
};

// Helper: Generate Empty Data for Other Strategies
// Helper: Generate Mock Data (SIMULATING API RESPONSE)
// Fetch real data from JSON files
const fetchRealData = async (strategy) => {
  try {
    if (strategy === 'sentquant') {
      // Fetch live data for Sentquant
      const liveResponse = await fetch('/data/live-data-sentquant.json');
      const liveData = await liveResponse.json();
      
      // Fetch historical data
      const histResponse = await fetch('/data/equity-historical-sentquant.json');
      const histData = await histResponse.json();
      
      // Fetch heatmap data
      const heatResponse = await fetch('/data/heatmap-data-sentquant.json');
      const heatData = await heatResponse.json();
      
      const sentquantLive = liveData.sentquant || {
        liveData: [],
        tvl: 0,
        status: 'Offline'
      };
      
      return {
        historicalData: histData,
        liveData: sentquantLive.liveData,
        heatmap: heatData,
        tvl: sentquantLive.tvl,
        status: sentquantLive.status,
        topDrawdowns: []
      };
    } else {
      // Other strategies - return empty for now
      return generateEmptyStrategyData();
    }
  } catch (error) {
    console.error(`Error fetching data for ${strategy}:`, error);
    return generateEmptyStrategyData();
  }
};

// Generate empty data for strategies without data yet
const generateEmptyStrategyData = () => {
  return {
    historicalData: [],
    liveData: [],
    heatmap: [],
    tvl: 0,
    status: 'Offline',
    topDrawdowns: []
  };
};

// --- TRANSLATIONS ---
const TRANSLATIONS = {
  en: {
    nav: { home: "Home", live: "Live", terminal: "Terminal", about: "About" },
    join: "Join",
    home: { 
      subtitle_1: "If CoinMarketCap tracks assets,",
      subtitle_2: "Sentquant tracks strategy performance.",
      tagline: "Sentquant", 
      manifesto: "Sentquant is the place where every trader can track the quality of strategies before spending a single dollar.",
      launch: "Launch Terminal",
      problem_title: "PROBLEM",
      problem_text: "For many fake gurus, the profit source isn't the market it's YOU. Their members are the product, retail traders are lured with empty claim and dream in only to be milked for membership fees until they are financially drained.",
      solution_title: "SOLUTION",
      solution_text: "Sentquant empowers every trader to audit the real-time performance of strategies and mentors before risking capital or buying a course.",
      impact_title: "IMPACT",
      impact_text: "The era of \"Salesmen disguised as Mentors\" and \"Lucky Gamblers\" flexing one-time memecoin gains is over. In the Sentquant ecosystem, marketing budget means nothing. Only those with proven, repeatable mathematical edge will survive. The rest will fade into irrelevance."
    },
    terminal: {
      title: "Benchmark Comparison",
      live_view: "Live View",
      total_return: "TOTAL RETURN",
      max_dd: "MAX DD",
      sharpe: "SHARPE",
      apr: "APR",
      total_tvl_label: "TOTAL TRACKED TVL",
      tvl_sub: "Across 6 Strategies",
      history: "History",
      live_btn: "Live",
      tvl_tooltip: "Total verified liquidity tracked across external execution protocol. Sentquant acts purely as a analytics layer and does not hold funds."
    },
    live: {
      title: "Live on LIGHTER",
      offline_status: "Offline",
      live_drawdown: "Live Drawdown",
      historical_title: "Historical Performance",
      stats_title: "Statistics & Metrics"
    },
    stats: {
      annual_returns: "Annual Returns",
      about_models: "ABOUT THE MODELS",
      model_desc_1: "The Framework is for exploiting structural inefficiencies.",
      model_desc_2: "Strategies run on O-U mean reversion and microstructure.",
      model_desc_3: "Regimes shift? No problem. Dynamic risk reallocation.",
      section_return: "RETURN METRICS",
      section_drawdown: "DRAWDOWN METRICS",
      section_risk_adj: "RISK-ADJUSTED RETURN METRICS",
      section_volatility: "VOLATILITY & RISK METRICS",
      section_distribution: "DISTRIBUTION METRICS",
      section_win_loss: "WIN/LOSS METRICS",
      section_consistency: "CONSISTENCY METRICS"
    },
    about: {
      broken: "The trading industry is broken.",
      fake_gurus: "Fake gurus sell dreams.",
      cant_verify: "Performance can't be verified.",
      misled: "Retail traders are misled by empty claims.",
      talks: "Everyone talks.",
      no_data: "No data.",
      cmc_analogy_1: "If CoinMarketCap tracks assets,",
      cmc_analogy_2: "Sentquant tracks strategy performance.",
      cant_lie: "Because performance can't lie, people can.",
      era_ends: "The era of fake trading gurus ends here.",
      join_movement: "Join Movement"
    },
    metrics_labels: {
      total_return: "Total Return",
      cagr: "CAGR (Annualized)",
      apr: "APR (Simple Annual)",
      ann_vol: "Annualized Volatility",
      max_dd: "Max Drawdown",
      sharpe: "Sharpe Ratio",
      sortino: "Sortino Ratio",
      win_rate: "Win Rate",
      expected_val_short: "Expected Value",
      volatility_short: "Volatility"
    },
    historical: {
      heatmap_title: "Monthly Returns Heatmap",
      top_drawdowns: "Top 5 Drawdowns",
      rank: "Rank",
      start_date: "Start Date",
      end_date: "End Date",
      depth: "Depth",
      duration: "Duration",
      recovery: "Recovery",
      positive: "Positive",
      negative: "Negative"
    }
  },
  id: {
    nav: { home: "Beranda", live: "Langsung", terminal: "Terminal", about: "Tentang" },
    join: "Gabung",
    home: { 
      subtitle_1: "Jika CoinMarketCap melacak aset,",
      subtitle_2: "Sentquant melacak kinerja strategi.",
      tagline: "Sentquant", 
      manifesto: "Sentquant adalah tempat di mana setiap trader dapat melacak kualitas strategi dan edukasi sebelum mengeluarkan uang sepeser pun.",
      launch: "Buka Terminal",
      problem_title: "MASALAH",
      problem_text: "Bagi banyak guru palsu, sumber keuntungan mereka bukan dari pasar melainkan dari ANDA. Member mereka adalah produk nya, trader retail dipancing dengan klaim kosong dan mimpi hanya untuk diperah biaya membership hingga mereka kehabisan uang.",
      solution_title: "SOLUSI",
      solution_text: "Sentquant mengajak setiap trader untuk menilai performa strategi atau mentor nya secara real-time sebelum mengeluarkan uang atau membeli kursus.",
      impact_title: "DAMPAK",
      impact_text: "Era \"Sales berkedok Mentor\" dan \"Penjudi Beruntung\" yang pamer keuntungan memecoin karena hanya bullrun telah berakhir. Di ekosistem Sentquant, semua trader mendapatkan informasi di awal , semua trader membeli karena nilai yang valid , bukan lagi karena klaim palsu atau hype marketing."
    },
    terminal: {
      title: "Perbandingan Benchmark",
      live_view: "Lihat Langsung",
      total_return: "TOTAL RETURN",
      max_dd: "MAX DD",
      sharpe: "SHARPE",
      apr: "APR",
      total_tvl_label: "TOTAL TVL TERLACAK",
      tvl_sub: "Di Seluruh 6 Strategi",
      history: "Riwayat",
      live_btn: "Langsung",
      tvl_tooltip: "Total likuiditas terverifikasi yang dilacak di seluruh protokol eksekusi eksternal. Sentquant murni bertindak sebagai lapisan analitik dan tidak memegang dana."
    },
    live: {
      title: "Langsung di LIGHTER",
      offline_status: "Offline",
      live_drawdown: "Drawdown Langsung",
      historical_title: "Kinerja Historis",
      stats_title: "Statistik & Metrik"
    },
    stats: {
      annual_returns: "Pengembalian Tahunan",
      about_models: "TENTANG MODEL",
      model_desc_1: "Kerangka kerja ini memanfaatkan inefisiensi struktural.",
      model_desc_2: "Strategi berjalan pada O-U mean reversion dan mikrostruktur.",
      model_desc_3: "Pergeseran rezim? Tidak masalah. Realokasi risiko dinamis.",
      section_return: "METRIK PENGEMBALIAN",
      section_drawdown: "METRIK DRAWDOWN",
      section_risk_adj: "METRIK PENGEMBALIAN DISESUAIKAN RISIKO",
      section_volatility: "METRIK VOLATILITAS & RISIKO",
      section_distribution: "METRIK DISTRIBUSI",
      section_win_loss: "METRIK MENANG/KALAH",
      section_consistency: "METRIK KONSISTENSI"
    },
    about: {
      broken: "Industri trading rusak.",
      fake_gurus: "Guru palsu menjual mimpi.",
      cant_verify: "Kinerja tidak dapat diverifikasi.",
      misled: "Trader ritel disesatkan oleh klaim kosong.",
      talks: "Semua orang bicara.",
      no_data: "Tidak ada data.",
      cmc_analogy_1: "Jika CoinMarketCap melacak aset,",
      cmc_analogy_2: "Sentquant melacak kinerja strategi.",
      cant_lie: "Karena kinerja tidak bisa berbohong, orang bisa.",
      era_ends: "Era trading guru palsu berakhir di sini.",
      join_movement: "Gabung Gerakan"
    },
    metrics_labels: {
      total_return: "Total Return",
      cagr: "CAGR (Disetahunkan)",
      apr: "APR (Bunga Sederhana)",
      ann_vol: "Volatilitas Disetahunkan",
      max_dd: "Max Drawdown",
      sharpe: "Rasio Sharpe",
      sortino: "Rasio Sortino",
      win_rate: "Tingkat Menang",
      expected_val_short: "Nilai Harapan",
      volatility_short: "Volatilitas"
    },
    historical: {
      heatmap_title: "Peta Panas Pengembalian Bulanan",
      top_drawdowns: "5 Drawdown Teratas",
      rank: "Peringkat",
      start_date: "Tanggal Mulai",
      end_date: "Tanggal Akhir",
      depth: "Kedalaman",
      duration: "Durasi",
      recovery: "Pemulihan",
      positive: "Positif",
      negative: "Negatif"
    }
  }
};

// --- COMPONENT: KEY METRICS GRID (NEW) ---
const KeyMetricsGrid = ({ stats, t, isLive }) => {
  const s = stats || {};
  
  const metrics = [
    { 
      label: t.metrics_labels.total_return, 
      value: typeof s.totalReturn === 'number' ? `${s.totalReturn.toLocaleString('en-US', {maximumFractionDigits: 2})}%` : '-', 
      color: (s.totalReturn || 0) >= 0 ? 'text-[#22ab94]' : 'text-[#f23645]' 
    },
    { 
      label: t.metrics_labels.max_dd, 
      value: typeof s.maxDrawdown === 'number' ? `${s.maxDrawdown.toFixed(2)}%` : '-', 
      color: 'text-[#f23645]' 
    },
    { 
      label: t.metrics_labels.cagr, 
      value: (typeof s.cagr === 'number' && s.cagr !== 0) ? `${s.cagr.toFixed(2)}%` : '-', 
      color: 'text-white' 
    },
    { 
      label: t.metrics_labels.apr, 
      value: (typeof s.apr === 'number' && s.apr !== 0) ? `${s.apr.toFixed(2)}%` : '-', 
      color: 'text-white' 
    },
    { 
      label: t.metrics_labels.expected_val_short, 
      value: (typeof s.expectedValue === 'number' && s.expectedValue !== 0) ? `${s.expectedValue.toFixed(2)}%` : '-', 
      color: 'text-white' 
    },
    { 
      label: t.metrics_labels.volatility_short, 
      value: (typeof s.volatility === 'number' && s.volatility !== 0) ? `${s.volatility.toFixed(2)}%` : '-', 
      color: 'text-white' 
    },
    { 
      label: t.metrics_labels.sharpe, 
      value: (typeof s.sharpe === 'number' && s.sharpe !== 0) ? s.sharpe.toFixed(2) : '-', 
      color: 'text-white' 
    },
    { 
      label: t.metrics_labels.sortino, 
      value: (typeof s.sortino === 'number' && s.sortino !== 0) ? s.sortino.toFixed(2) : '-', 
      color: 'text-white' 
    }
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4 py-4">
      {metrics.map((m, i) => (
        <div key={i} className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">{m.label}</span>
          <span className={`text-xl font-bold font-eth ${m.color}`}>{m.value}</span>
        </div>
      ))}
    </div>
  );
};
// --- COMPONENT: STRATEGY CHARTS (STACKED) ---
const StrategyCharts = ({ data, color, name, title }) => (
  <div className="flex flex-col space-y-2 mt-4">
    {/* TOP: EQUITY CHART */}
    <div className="h-[300px] md:h-[400px] rounded-t-xl bg-[#020202] backdrop-blur-sm overflow-hidden relative border border-white/5 border-b-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data || []} margin={{top:10, left:0, right:0, bottom:0}}>
          <defs>
            <linearGradient id={`equityGradient-${name}-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <YAxis orientation="right" domain={['auto', 'auto']} tick={{fill: '#a1a1aa', fontSize: 11}} axisLine={false} tickLine={false} />
          <Tooltip 
            separator=" " 
            contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', backdropFilter: 'blur(10px)', fontFamily: 'Inter'}} 
            itemStyle={{color: color}} 
            formatter={(value) => [value ? value.toLocaleString() : '0', 'NAV']} 
            labelStyle={{color: '#fff', fontFamily: 'Inter'}} 
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2} 
            fill={`url(#equityGradient-${name}-${title})`} 
            dot={false} 
            animationDuration={1500} 
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="absolute top-4 left-4 flex gap-1 bg-black/40 backdrop-blur-md p-1 rounded shadow-lg">
        <span className="p-1 text-gray-300 text-xs font-bold">{name} Model</span>
      </div>
    </div>

    {/* BOTTOM: DRAWDOWN CHART */}
    <div className="h-[180px] rounded-b-xl bg-[#020202] backdrop-blur-sm overflow-hidden relative border border-white/5 border-t-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data || []} margin={{top:5, left:0, right:0, bottom:0}}>
          <defs>
            <linearGradient id={`drawdownGradient-${name}-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f23645" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#f23645" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <YAxis orientation="right" tick={{fill: '#a1a1aa', fontSize: 10}} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', backdropFilter: 'blur(10px)', fontFamily: 'Inter'}} 
            itemStyle={{color: '#f23645'}} 
            formatter={(value) => [`${value ? value.toFixed(2) : 0}%`, 'Drawdown']} 
            labelStyle={{color: '#fff', fontFamily: 'Inter'}} 
          />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
          <Area 
            type="stepAfter" 
            dataKey="drawdown" 
            stroke="#f23645" 
            strokeWidth={1.5} 
            fill={`url(#drawdownGradient-${name}-${title})`} 
            dot={false} 
            animationDuration={1500} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// --- COMPONENT: DETAILED STAT CARD ---
const DetailedStatCard = ({ section }) => (
  <div className="rounded-xl bg-black/20 backdrop-blur-sm overflow-hidden h-full flex flex-col border border-white/5">
    <div className="bg-white/5 px-5 py-4">
      <h3 className="font-bold text-white font-eth text-xs md:text-sm tracking-widest">{section.title}</h3>
    </div>
    <div className="p-0 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <tbody className="divide-y divide-white/5">
          {section.metrics.map((item, idx) => (
            <tr key={idx} className="hover:bg-white/5 transition-colors">
              <td className="px-5 py-3 font-medium text-gray-400 text-xs">{item.l}</td>
              <td className="px-5 py-3 text-right text-white font-bold text-xs">{item.v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// --- COMPONENT: MONTHLY HEATMAP WITH FILTER ---
const MonthlyHeatmap = ({ data, t }) => {
  const [filter, setFilter] = useState('2020-2025');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Jika data kosong, tampilkan placeholder atau null
  if (!data || data.length === 0) return <div className="text-gray-500 text-center py-4">No heatmap data available</div>;

  const filteredData = useMemo(() => {
    const [start, end] = filter.split('-').map(Number);
    return data.filter(row => {
      const year = parseInt(row.year);
      return year >= start && year <= end;
    });
  }, [data, filter]);

  return (
    <div className="mb-10 mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-bold text-white drop-shadow-md font-eth">{t.heatmap_title}</h3>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Legend */}
            <div className="flex gap-2 mr-4">
              <span className="flex items-center gap-1 text-xs text-gray-400"><div className="w-2 h-2 bg-[#22ab94] rounded-sm"></div> {t.positive}</span>
              <span className="flex items-center gap-1 text-xs text-gray-400"><div className="w-2 h-2 bg-[#f23645] rounded-sm"></div> {t.negative}</span>
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-white/10 rounded-lg text-xs font-bold text-white transition-colors"
              >
                {filter} <ChevronDown size={14} />
              </button>
              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-32 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl z-20 py-1">
                  {['2020-2025', '2015-2019', '2010-2014', '2005-2009'].map(range => (
                    <button
                      key={range}
                      onClick={() => { setFilter(range); setIsFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-white/5 transition-colors ${filter === range ? 'text-white' : 'text-gray-400'}`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-2 rounded-xl bg-black/10 backdrop-blur-sm p-2 border border-white/5">
          <table className="w-full text-xs md:text-sm border-collapse min-w-[800px]">
            <thead>
                <tr>
                  <th className="text-left text-gray-400 font-medium py-3 px-2">Year</th>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                      <th key={m} className="text-center text-gray-400 font-medium py-3 px-2">{m}</th>
                  ))}
                  <th className="text-center text-gray-400 font-medium py-3 px-2">Ann</th>
                </tr>
            </thead>
            <tbody>
                {filteredData.map((row, idx) => (
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
  );
};

// --- COMPONENT: TOP 5 DRAWDOWNS TABLE ---
const TopDrawdownsTable = ({ data, t }) => (
  <div className="mb-10 mt-8">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-white drop-shadow-md font-eth">{t.top_drawdowns}</h3>
    </div>
    <div className="overflow-x-auto custom-scrollbar pb-2 rounded-xl bg-black/10 backdrop-blur-sm p-2 border border-white/5">
      <table className="w-full text-xs md:text-sm border-collapse min-w-[600px]">
        <thead>
          <tr className="text-left text-gray-400 font-medium border-b border-white/5">
            <th className="py-3 px-4">{t.rank}</th>
            <th className="py-3 px-4">{t.start_date}</th>
            <th className="py-3 px-4">{t.end_date}</th>
            <th className="py-3 px-4 text-right">{t.depth}</th>
            <th className="py-3 px-4 text-right">{t.duration}</th>
            <th className="py-3 px-4 text-right">{t.recovery}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data && data.map((row) => (
            <tr key={row.rank} className="hover:bg-white/5 transition-colors">
              <td className="py-3 px-4 font-bold text-white">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs">
                  {row.rank}
                </div>
              </td>
              <td className="py-3 px-4 text-gray-300 font-mono text-xs">{row.startDate}</td>
              <td className="py-3 px-4 text-gray-300 font-mono text-xs">{row.endDate}</td>
              <td className="py-3 px-4 text-right font-bold text-[#f23645]">{row.depth.toFixed(2)}%</td>
              <td className="py-3 px-4 text-right text-white font-mono">{row.duration} days</td>
              {/* REVERTED: Recovery days to Teal (#22ab94) */}
              <td className="py-3 px-4 text-right text-[#22ab94] font-mono">{row.recovery} days</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// --- COMPONENT: ABOUT MODELS CARD ---
const AboutModelsCard = ({ t }) => (
  <div className="mb-8 rounded-xl bg-black/20 backdrop-blur-sm overflow-hidden flex flex-col border border-white/5">
    <div className="bg-white/5 px-5 py-4">
      <h3 className="font-bold text-white font-eth text-lg">{t.about_models}</h3>
    </div>
    <div className="p-5 md:p-6 space-y-4 text-white text-sm font-medium leading-relaxed font-sans text-gray-300">
      <p>{t.model_desc_1}</p>
      <p>{t.model_desc_2}</p>
      <p>{t.model_desc_3}</p>
    </div>
  </div>
);

// --- COMPONENT: WARP BACKGROUND ---
const WarpBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    let animationFrameId;
    let stars = [];
    const numStars = 150;
    const speed = 1.5;
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
// --- CUSTOM TOOLTIP FOR BENCHMARK CHART ---
const CustomBenchmarkTooltip = ({ active, payload, label }) => {
  // CRITICAL: Only show if active AND has valid payload
  if (!active) return null;
  if (!payload || payload.length === 0) return null;
  
  // Filter out null/undefined values
  const validData = payload.filter(p => p.value != null && p.value !== undefined && p.value !== 0);
  
  // If no valid data after filtering, don't show tooltip
  if (validData.length === 0) return null;
  
  return (
    <div style={{
      backgroundColor: 'rgba(0,0,0,0.9)', 
      border: '1px solid rgba(255,255,255,0.1)', 
      borderRadius: '8px',
      padding: '8px 12px'
    }}>
      <p style={{color: '#888', marginBottom: '5px', fontSize: '12px'}}>{label}</p>
      {validData.map((entry, index) => (
        <p key={index} style={{
          fontSize: '12px', 
          fontWeight: 'bold',
          color: entry.color,
          margin: '2px 0'
        }}>
          {entry.name}: {entry.value.toFixed(2)}
        </p>
      ))}
    </div>
  );
};
// --- MAIN APP ---
export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); 
  const [selectedStrategyId, setSelectedStrategyId] = useState('sentquant');
  
  // 2. STATE BARU: Menyimpan data dinamis hasil fetch
  const [strategiesData, setStrategiesData] = useState({});
  const [historicalChartData, setHistoricalChartData] = useState([]); // Khusus chart historical

  const [visibleStrategies, setVisibleStrategies] = useState(
    STRATEGIES_CONFIG.reduce((acc, strat) => ({ ...acc, [strat.id]: true }), {})
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState('en');

  // HISTORICAL CHART FILTER STATE
  const [chartTimeRange, setChartTimeRange] = useState('ALL'); // '5Y', 'ALL', 'FILTER'
  const [chartYearFilter, setChartYearFilter] = useState(null); // specific year if FILTER is active
  const [isChartFilterOpen, setIsChartFilterOpen] = useState(false);

  const t = TRANSLATIONS[language];

  // 3. FETCHING DATA (Simulasi API)
// 3. FETCHING DATA (Real data for Sentquant, Empty for others)
useEffect(() => {
    const initData = async () => {
      setLoading(true);
      
      const newData = {};
      
   for (const strat of STRATEGIES_CONFIG) {
 if (strat.id === 'sentquant' || strat.id === 'systemic_hyper') {
    const [histRes, heatRes, liveRes] = await Promise.all([
  fetch(`/data/equity-historical-${strat.id}.json`),
  fetch(`/data/heatmap-data-${strat.id}.json`),
  fetch(`/data/live-data-${strat.id}.json`)
]);

let historicalData = [];
let heatmapData = [];
let liveDataJson = {};

try {
  historicalData = await histRes.json();
} catch (e) {
  console.log('Historical data error:', e);
  historicalData = [];
}

try {
  heatmapData = await heatRes.json();
} catch (e) {
  console.log('Heatmap data error:', e);
  heatmapData = [];
}

try {
  liveDataJson = await liveRes.json();
} catch (e) {
  console.log('Live data error:', e);
  liveDataJson = {};
}
    
   const strategyLive = liveDataJson[strat.id] || {
  liveData: [],
  tvl: 0,
  status: 'Offline'
};

const liveData = strategyLive.liveData || [];
let calculatedStats = { apr: '-', return: '-', dd: '-', sharpe: '-' };

if (liveData.length >= 2) {
  const startVal = liveData[0].value;
  const endVal = liveData[liveData.length - 1].value;
  const totalReturn = ((endVal - startVal) / startVal) * 100;
  
  const returns = [];
  for (let i = 1; i < liveData.length; i++) {
    const r = (liveData[i].value - liveData[i-1].value) / liveData[i-1].value;
    returns.push(r);
  }
  
  const startTime = new Date(liveData[0].timestamp || liveData[0].date);
  const endTime = new Date(liveData[liveData.length - 1].timestamp || liveData[liveData.length - 1].date);
  const hoursElapsed = Math.max((endTime - startTime) / (1000 * 60 * 60), 1);
  
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  
  let apr = '-';
  let cagr = '-';
  
  if (hoursElapsed >= 168) {
    const yearFraction = hoursElapsed / (24 * 365);
    cagr = ((Math.pow(endVal / startVal, 1 / yearFraction) - 1) * 100).toFixed(2);
    
    const periodsPerYear = (24 * 365) / (hoursElapsed / returns.length);
    apr = (meanReturn * periodsPerYear * 100).toFixed(2);
  }
  
  const maxDD = Math.min(...liveData.map(d => d.drawdown || 0)).toFixed(2);
  
  let sharpe = '-';
  if (hoursElapsed >= 168 && returns.length >= 10) {
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1);
    const stdDev = Math.sqrt(variance);
    const annualizedStdDev = stdDev * Math.sqrt(24 * 365 / (hoursElapsed / returns.length));
    sharpe = (annualizedStdDev !== 0 && !isNaN(annualizedStdDev)) 
      ? (parseFloat(apr) / (annualizedStdDev * 100)).toFixed(2) 
      : '-';
  }
  
  calculatedStats = {
    apr: apr,
    return: totalReturn.toLocaleString('en-US', {maximumFractionDigits: 2}),
    dd: `${maxDD}%`,
    sharpe: sharpe
  };
}

newData[strat.id] = {
  ...strat,
  return: calculatedStats.return,
  dd: calculatedStats.dd,
  sharpe: calculatedStats.sharpe,
  tvl: strategyLive.tvl,
  apr: calculatedStats.apr,
  status: strategyLive.status,
  liveData: strategyLive.liveData,
  historicalData: historicalData,
  heatmap: heatmapData,
  annualReturns: [],
  stats: null,
  topDrawdowns: []
};
  } else {
    newData[strat.id] = generateEmptyStrategyData(strat);
  }
}
      
      setStrategiesData(newData);
      setLoading(false);
    };

    initData();
  }, []);

  // 4. FETCHING HISTORICAL JSON (Ketika strategi dipilih)
  useEffect(() => {
    // Pada implementasi nyata, fetch JSON di sini
    if (strategiesData[selectedStrategyId]) {
        // Simulasi: Mengambil data historis dari object strategy yang sudah diload
        setHistoricalChartData(strategiesData[selectedStrategyId].historicalData); 
    }
  }, [selectedStrategyId, strategiesData]);


  // Calculate Total TVL dynamically from Fetched Data
const totalTVL = useMemo(() => {
  return Object.values(strategiesData).reduce((acc, curr) => {
    if (curr.id === 'sentquant') return acc;
    return acc + (curr.tvl || 0);
  }, 0);
}, [strategiesData]);

  // Helper to toggle strategy visibility
  const toggleStrategyVisibility = (id) => {
    setVisibleStrategies(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper to switch to live view
  const handleLiveView = (id) => {
    setSelectedStrategyId(id);
    setActiveTab('live');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Derived data for Current View
  const currentStrategy = strategiesData[selectedStrategyId] || {};
 // ✅ DYNAMIC STATS CALCULATION
  const currentStats = useMemo(() => {
    const data = historicalChartData;
    
    if (!data || data.length === 0) return {
      totalReturn: 0,
      maxDrawdown: 0,
      cagr: 0,
      apr: 0,
      expectedValue: 0,
      volatility: 0,
      sharpe: 0,
      sortino: 0
    };
    
    const startVal = data[0].value;
    const endVal = data[data.length - 1].value;
    const totalReturn = ((endVal - startVal) / startVal) * 100;
    const maxDrawdown = Math.min(...data.map(d => d.drawdown));
    
    const dailyReturns = [];
    for (let i = 1; i < data.length; i++) {
      const r = (data[i].value - data[i-1].value) / data[i-1].value;
      dailyReturns.push(r);
    }
    
    const tradingDays = 252;
    const meanDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const annualizedReturn = meanDailyReturn * tradingDays;
    
    const startDate = new Date(data[0].date);
    const endDate = new Date(data[data.length - 1].date);
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
    
    // Calculate Win Rate
    const winningDays = dailyReturns.filter(r => r > 0).length;
    const totalDays = dailyReturns.length;
    const winRate = totalDays > 0 ? ((winningDays / totalDays) * 100).toFixed(2) : 0;
    
    return {
      totalReturn,
      maxDrawdown,
      cagr,
      apr,
      expectedValue,
      volatility,
      sharpe,
      sortino,
      winRate
    };
  }, [historicalChartData]);
// ✅ LIVE STATS CALCULATION (Separate from Historical)
 const liveStats = useMemo(() => {
    const data = currentStrategy.liveData;
    
    if (!data || data.length === 0) return {
      totalReturn: 0,
      maxDrawdown: 0,
      cagr: 0,
      apr: 0,
      expectedValue: 0,
      volatility: 0,
      sharpe: 0,
      sortino: 0
    };
    
    // Always calculate Total Return & Max DD from raw data
    const startVal = data[0].value;
    const endVal = data[data.length - 1].value;
    const totalReturn = ((endVal - startVal) / startVal) * 100;
    const maxDrawdown = Math.min(...data.map(d => d.drawdown || 0));
    
    // Check how many unique DAYS we have
    const uniqueDays = new Set(data.map(d => d.date)).size;
    
    if (uniqueDays < 7) {
      // Not enough days - return dash for annualized metrics
      return {
        totalReturn,
        maxDrawdown,
        cagr: 0,
        apr: 0,
        expectedValue: 0,
        volatility: 0,
        sharpe: 0,
        sortino: 0
      };
    }
    
    // We have 7+ days - aggregate by day & calculate
    const dailyDataMap = {};
    
    data.forEach(point => {
      const date = point.date;
      
      if (!dailyDataMap[date]) {
        dailyDataMap[date] = point;
      } else {
        const currentTime = point.timestamp || point.date;
        const existingTime = dailyDataMap[date].timestamp || dailyDataMap[date].date;
        
        if (currentTime > existingTime) {
          dailyDataMap[date] = point;
        }
      }
    });
    
    const dailyData = Object.values(dailyDataMap).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Calculate daily returns
    const dailyReturns = [];
    for (let i = 1; i < dailyData.length; i++) {
      const r = (dailyData[i].value - dailyData[i-1].value) / dailyData[i-1].value;
      dailyReturns.push(r);
    }
    
    const tradingDays = 252;
    const meanDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const expectedValue = meanDailyReturn * 100;
    
    // APR (Simple Annual)
    const apr = meanDailyReturn * tradingDays * 100;
    
    // CAGR (Compound Annual)
    const startDate = new Date(dailyData[0].date);
    const endDate = new Date(dailyData[dailyData.length - 1].date);
    const yearsDiff = Math.max((endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25), 0.001);
    const dailyStartVal = dailyData[0].value;
    const dailyEndVal = dailyData[dailyData.length - 1].value;
    const cagr = (Math.pow(dailyEndVal / dailyStartVal, 1 / yearsDiff) - 1) * 100;
    
    // Volatility & Sharpe
    const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - meanDailyReturn, 2), 0) / (dailyReturns.length - 1);
    const dailyStdDev = Math.sqrt(variance);
    const volatility = dailyStdDev * Math.sqrt(tradingDays) * 100;
    const sharpe = (volatility !== 0) ? (apr / volatility) : 0;
    
    // Sortino
    const downsideReturns = dailyReturns.filter(r => r < 0);
    let sortino = 0;
    
    if (downsideReturns.length > 0) {
      const downsideVariance = downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / dailyReturns.length;
      const downsideDev = Math.sqrt(downsideVariance);
      const annDownsideDev = downsideDev * Math.sqrt(tradingDays);
      sortino = (annDownsideDev !== 0 && !isNaN(annDownsideDev)) ? (apr / (annDownsideDev * 100)) : 0;
    }
    
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
  }, [currentStrategy.liveData]);
  // Filter Logic for Historical Chart using Real/Mocked Data
  const filteredHistoricalData = useMemo(() => {
    let data = historicalChartData || [];
    
    // Pastikan data ada sebelum filter
    if (data.length === 0) return [];

    if (chartTimeRange === '5Y') {
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
        data = data.filter(d => new Date(d.date) >= fiveYearsAgo);
    } else if (chartTimeRange === 'FILTER' && chartYearFilter) {
        // Asumsi data JSON punya field 'year' atau kita parse dari 'date'
        data = data.filter(d => {
           const y = parseInt(d.year) || new Date(d.date).getFullYear();
            return y === chartYearFilter;
        });
    }
    return data;
  }, [historicalChartData, chartTimeRange, chartYearFilter]);

  // --- NEW: DYNAMIC METRICS CALCULATION ---
  // Calculates metrics based on the FILTERED historical data
 const dynamicHistoricalStats = useMemo(() => {
    // If no filter is applied (or ALL), use the pre-calculated stats (which represent all-time)
    // BUT user requested dynamic metrics based on the chart.
    // So we should calculate from filteredHistoricalData.
    
    if (!filteredHistoricalData || filteredHistoricalData.length === 0) {
       return currentStats; // Fallback to global stats
    }
    const data = filteredHistoricalData;
    
    const startVal = data[0].value;
    const endVal = data[data.length - 1].value;
    const totalReturn = ((endVal - startVal) / startVal) * 100;
    const maxDrawdown = Math.min(...data.map(d => d.drawdown));
    
    const dailyReturns = [];
    for (let i = 1; i < data.length; i++) {
      const r = (data[i].value - data[i-1].value) / data[i-1].value;
      dailyReturns.push(r);
    }
    
    const tradingDays = 252;
    const meanDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const annualizedReturn = meanDailyReturn * tradingDays;
    
    const startDate = new Date(data[0].date);
    const endDate = new Date(data[data.length - 1].date);
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
    
    // Calculate Win Rate
    const winningDays = dailyReturns.filter(r => r > 0).length;
    const totalDays = dailyReturns.length;
    const winRate = totalDays > 0 ? ((winningDays / totalDays) * 100).toFixed(2) : 0;
    
    return {
      totalReturn,
      maxDrawdown,
      cagr,
      apr,
      expectedValue,
      volatility,
      sharpe,
      sortino,
      winRate
    };
  }, [filteredHistoricalData, currentStats]);

  // Generate detailed stats sections dynamically
  const detailedStatsSections = useMemo(() => {
    // Jika data belum siap, return array kosong untuk menghindari error render
    if (!currentStats || !currentStats.totalReturn) return []; 

    return [
    {
      title: t.stats.section_return,
      metrics: [
        { l: t.metrics_labels.total_return, v: `${currentStats.totalReturn.toLocaleString('en-US', {maximumFractionDigits: 2})}%` },
        { l: t.metrics_labels.cagr, v: `${currentStats.cagr.toFixed(2)}%` },
        { l: t.metrics_labels.apr, v: `${currentStats.apr.toFixed(2)}%` },
      ]
    },
    {
      title: t.stats.section_drawdown,
      metrics: [
        { l: t.metrics_labels.max_dd, v: `${currentStats.maxDrawdown.toFixed(2)}%` },
      ]
    },
    {
      title: t.stats.section_risk_adj,
      metrics: [
        { l: t.metrics_labels.sharpe, v: currentStats.sharpe.toFixed(2) },
        { l: t.metrics_labels.sortino, v: currentStats.sortino.toFixed(2) },
      ]
    },
    {
      title: t.stats.section_volatility,
      metrics: [
        { l: t.metrics_labels.ann_vol, v: `${currentStats.volatility.toFixed(2)}%` },
      ]
    },
    {
      title: t.stats.section_win_loss,
      metrics: [
        { l: t.metrics_labels.win_rate, v: currentStats.winRate ? `${currentStats.winRate}%` : 'N/A' },
      ]
    },
    {
      title: t.stats.section_consistency,
      metrics: [
        { l: t.metrics_labels.expected_val_short, v: `${currentStats.expectedValue.toFixed(2)}%` },
      ]
    }
  ]}, [language, currentStats, t]);
  // Loading Screen
  if (loading) return <div className="h-screen bg-black text-white flex items-center justify-center font-mono">INITIALIZING SYSTEM...</div>;

  return (
    <div className="flex flex-col h-[100dvh] text-[#d1d4dc] font-sans overflow-hidden relative bg-black">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=block');
        .font-eth { font-family: 'Montserrat', sans-serif; }
        .font-mono-code { font-family: 'Space Mono', monospace; }
        body, .font-sans { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* HEADER */}
      <header className="h-[60px] flex-none flex items-center justify-between px-4 md:px-8 bg-black/50 backdrop-blur-md z-50 border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
             <SentquantLogo size={48} />
          </div>
          <div className="hidden md:block h-6 w-px bg-white/10 mx-2"></div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold tracking-wider">
            <button onClick={() => setActiveTab('home')} className={`transition-colors font-eth ${activeTab === 'home' ? 'text-[#A3A3A3]' : 'text-gray-400 hover:text-white'}`}>{t.nav.home}</button>
            <button onClick={() => setActiveTab('terminal')} className={`transition-colors font-eth ${activeTab === 'terminal' ? 'text-[#A3A3A3]' : 'text-gray-400 hover:text-white'}`}>{t.nav.terminal}</button>
            <button onClick={() => setActiveTab('live')} className={`transition-colors font-eth ${activeTab === 'live' ? 'text-[#A3A3A3]' : 'text-gray-400 hover:text-white'}`}>{t.nav.live}</button>
            <button onClick={() => setActiveTab('about')} className={`transition-colors font-eth ${activeTab === 'about' ? 'text-[#A3A3A3]' : 'text-gray-400 hover:text-white'}`}>{t.nav.about}</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
         {/* LANGUAGE FLAGS */}
<div className="flex items-center gap-2">
  <button 
    onClick={() => setLanguage('en')}
    className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all duration-300 ${
      language === 'en' 
        ? 'opacity-100 scale-110 border-white/30' 
        : 'opacity-40 hover:opacity-70 hover:scale-105 border-transparent'
    }`}
    title="English"
  >
    <img 
      src="https://flagcdn.com/w40/gb.png" 
      srcSet="https://flagcdn.com/w80/gb.png 2x"
      alt="EN" 
      className="w-full h-full object-cover" 
    />
  </button>
  <button 
    onClick={() => setLanguage('id')}
    className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all duration-300 ${
      language === 'id' 
        ? 'opacity-100 scale-110 border-white/30' 
        : 'opacity-40 hover:opacity-70 hover:scale-105 border-transparent'
    }`}
    title="Bahasa Indonesia"
  >
    <img 
      src="https://flagcdn.com/w40/id.png" 
      srcSet="https://flagcdn.com/w80/id.png 2x"
      alt="ID" 
      className="w-full h-full object-cover" 
    />
  </button>
</div>
          <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-2">{t.join} <Lock size={12} /></button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">{isMenuOpen ? <X size={24}/> : <Menu size={24}/>}</button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-6 md:hidden flex flex-col gap-6 animate-fade-in-up">
            <button onClick={() => { setActiveTab('home'); setIsMenuOpen(false); }} className={`text-xl font-bold font-eth tracking-wide text-left py-3 border-b border-white/10 ${activeTab === 'home' ? 'text-[#A3A3A3]' : 'text-gray-400'}`}>{t.nav.home}</button>
            <button onClick={() => { setActiveTab('terminal'); setIsMenuOpen(false); }} className={`text-xl font-bold font-eth tracking-wide text-left py-3 border-b border-white/10 ${activeTab === 'terminal' ? 'text-[#A3A3A3]' : 'text-gray-400'}`}>{t.nav.terminal}</button>
            <button onClick={() => { setActiveTab('live'); setIsMenuOpen(false); }} className={`text-xl font-bold font-eth tracking-wide text-left py-3 border-b border-white/10 ${activeTab === 'live' ? 'text-[#A3A3A3]' : 'text-gray-400'}`}>{t.nav.live}</button>
            <button onClick={() => { setActiveTab('about'); setIsMenuOpen(false); }} className={`text-xl font-bold font-eth tracking-wide text-left py-3 border-b border-white/10 ${activeTab === 'about' ? 'text-[#A3A3A3]' : 'text-gray-400'}`}>{t.nav.about}</button>
        </div>
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 h-full flex flex-col">
        <WarpBackground />
        
        {/* MAIN CONTENT CONSTRAINT */}
        <main className="flex-1 flex flex-col relative z-20">
          
          {/* --- HOME PAGE --- */}
          {activeTab === 'home' && (
            <div className="animate-fade-in-up flex-1 flex flex-col items-center justify-start p-4 md:p-8 space-y-8">
               <div className="relative w-full max-w-4xl mx-auto border border-white/10 bg-black/40 backdrop-blur-sm p-8 md:p-16 text-center">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/40"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/40"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40"></div>

                  <div className="text-xs md:text-sm text-gray-500 font-mono tracking-[0.3em] uppercase mb-6">
                  </div>

                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-eth font-extrabold text-white mb-2 tracking-tighter leading-none drop-shadow-2xl">
                    Sentquant
                  </h1>

                  <h2 className="text-sm md:text-xl text-gray-400 font-light tracking-widest uppercase mb-12">
                    WE DON'T TRACK WALLETS. WE TRACK THE EDGE.
                  </h2>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
                    <button 
                      onClick={() => setActiveTab('terminal')}
                      className="w-full md:w-auto px-8 py-3 bg-[#A3A3A3] text-black font-bold font-mono text-sm uppercase tracking-wider hover:bg-[#8f8f8f] transition-colors"
                    >
                      START TRACKING
                    </button>
                  </div>

                  <div className="border-y border-white/10 py-8 max-w-2xl mx-auto">
                    <p className="text-gray-400 text-sm md:text-base font-mono leading-relaxed px-4">
                      {t.home.manifesto}
                    </p>
                  </div>
               </div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
  <div className="relative border border-white/10 bg-black/40 backdrop-blur-sm p-6 text-left h-full flex flex-col">
    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40"></div>
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/40"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/40"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40"></div>
    
    <h3 className="text-white font-eth font-bold text-lg mb-4 tracking-wider uppercase border-b border-white/10 pb-2">
      {t.home.problem_title}
    </h3>
    <p className="text-gray-400 text-sm font-mono leading-relaxed">
      {t.home.problem_text}
    </p>
  </div>
  <div className="relative border border-white/10 bg-black/40 backdrop-blur-sm p-6 text-left h-full flex flex-col">
    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40"></div>
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/40"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/40"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40"></div>
    
    <h3 className="text-white font-eth font-bold text-lg mb-4 tracking-wider uppercase border-b border-white/10 pb-2">
      {t.home.solution_title}
    </h3>
    <p className="text-gray-400 text-sm font-mono leading-relaxed">
      {t.home.solution_text}
    </p>
  </div>
  <div className="relative border border-white/10 bg-black/40 backdrop-blur-sm p-6 text-left h-full flex flex-col">
    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40"></div>
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/40"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/40"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40"></div>
    
    <h3 className="text-white font-eth font-bold text-lg mb-4 tracking-wider uppercase border-b border-white/10 pb-2">
      {t.home.impact_title}
    </h3>
    <p className="text-gray-400 text-sm font-mono leading-relaxed">
      {t.home.impact_text}
    </p>
  </div>
</div>
            </div>
          )}

        {/* --- TERMINAL --- */}
{activeTab === 'terminal' && (
  <div className="animate-fade-in-up space-y-8 pb-20 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
    <div className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-center flex flex-col items-center justify-center space-y-2 shadow-2xl relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#A3A3A3] to-transparent opacity-50"></div>
       <div className="mb-2">
          <SentquantLogo size={48} /> 
       </div>
       <div className="flex items-center gap-2 justify-center mb-1">
          <h2 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">{t.terminal.total_tvl_label}</h2>
          <div className="relative group">
             <HelpCircle size={14} className="text-gray-500 cursor-help hover:text-[#A3A3A3] transition-colors" />
             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-black/90 border border-white/10 rounded-lg text-xs text-gray-300 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 backdrop-blur-sm">
                {t.terminal.tvl_tooltip}
             </div>
          </div>
       </div>
       <div className="text-3xl md:text-5xl font-eth font-bold text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
          {formatCurrency(totalTVL)}
       </div>
       <p className="text-sm text-gray-500 font-medium">{t.terminal.tvl_sub}</p>
    </div>

{/* BENCHMARK CHART SECTION */}
<div className="space-y-4">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <h1 className="text-2xl md:text-3xl font-eth font-bold text-white">{t.terminal.title}</h1>
    <div className="flex flex-wrap gap-2">
      {Object.values(strategiesData).map(strat => (
        <button 
          key={strat.id}
          onClick={() => toggleStrategyVisibility(strat.id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${visibleStrategies[strat.id] ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-gray-500'}`}
        >
          {visibleStrategies[strat.id] ? <Eye size={12} style={{color: strat.color}} /> : <EyeOff size={12} />}
          {strat.name}
        </button>
      ))}
    </div>
  </div>

  {/* ✅ USE REAL DATA */}
  {(() => {
    // Prepare benchmark data - use real data for Sentquant, mock for others
  // Prepare data for each strategy separately
const sentquantData = strategiesData.sentquant?.liveData || [];
const systemicHyperData = strategiesData.systemic_hyper?.liveData || [];

    return (
      <div className="h-[400px] md:h-[500px] w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 relative">
       <ResponsiveContainer width="100%" height="100%">
  <AreaChart 
    margin={{top: 10, right: 10, left: -20, bottom: 0}}
    data={[...sentquantData, ...systemicHyperData].sort((a, b) => new Date(a.date || a.timestamp) - new Date(b.date || b.timestamp))}
  >
            <defs>
              {Object.values(strategiesData).map(strat => (
                <linearGradient key={strat.id} id={`color-${strat.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strat.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={strat.color} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="date" hide />
            <YAxis domain={['dataMin', 'auto']} tick={{fill: '#666', fontSize: 10}} axisLine={false} tickLine={false} />
<Tooltip 
  contentStyle={{backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px'}} 
  itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
  labelStyle={{color: '#888', marginBottom: '5px'}}
/>
{/* Sentquant Line */}
{visibleStrategies.sentquant && sentquantData.length > 0 && (
  <Area 
    key="sentquant"
    type="monotone" 
    dataKey={(entry) => entry.value}
    stroke="#22ab94"
    strokeWidth={2}
    fill="url(#color-sentquant)"
    dot={false}
    activeDot={{r: 4, strokeWidth: 0}}
    connectNulls={true}
  />
)}


{/* Systemic Hyper Line */}
{visibleStrategies.systemic_hyper && systemicHyperData.length > 0 && (
  <Area 
    key="systemic_hyper"
    type="monotone" 
    dataKey={(entry) => entry.value}
    stroke="#10b981"
    strokeWidth={2}
    fill="url(#color-systemic_hyper)"
    dot={false}
    activeDot={{r: 4, strokeWidth: 0}}
    connectNulls={true}
  />
)}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  })()}
</div>

{/* STRATEGY CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(strategiesData).map(strat => {
            // Calculate live stats for this card
            const cardStats = (() => {
  if ((strat.id !== 'sentquant' && strat.id !== 'systemic_hyper') || 
      !strat.liveData || 
      strat.liveData.length === 0) {
    return { apr: '-', maxDD: '-', totalReturn: '-' };
  }
  
  const data = strat.liveData;
  
  // Always calculate Total Return & Max DD
  const startVal = data[0].value;
  const endVal = data[data.length - 1].value;
  const totalReturn = ((endVal - startVal) / startVal) * 100;
  const maxDD = Math.min(...data.map(d => d.drawdown || 0)).toFixed(2);
  
  // Check unique days
  const uniqueDays = new Set(data.map(d => d.date)).size;
  
  if (uniqueDays < 7) {
    // Not enough days - show dash for APR
    return { 
      apr: '-', 
      maxDD: `${maxDD}%`,
      totalReturn: totalReturn.toLocaleString('en-US', {maximumFractionDigits: 2})
    };
  }
  
  // 7+ days - aggregate by day & calculate APR
  const dailyDataMap = {};
  
  data.forEach(point => {
    const date = point.date;
    
    if (!dailyDataMap[date]) {
      dailyDataMap[date] = point;
    } else {
      const currentTime = point.timestamp || point.date;
      const existingTime = dailyDataMap[date].timestamp || dailyDataMap[date].date;
      
      if (currentTime > existingTime) {
        dailyDataMap[date] = point;
      }
    }
  });
  
  const dailyData = Object.values(dailyDataMap).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
  
  const dailyReturns = [];
  for (let i = 1; i < dailyData.length; i++) {
    const r = (dailyData[i].value - dailyData[i-1].value) / dailyData[i-1].value;
    dailyReturns.push(r);
  }
  
  const meanDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const tradingDays = 252;
  const apr = (meanDailyReturn * tradingDays * 100).toFixed(2);
  
  return { 
    apr: `${apr}%`, 
    maxDD: `${maxDD}%`,
    totalReturn: totalReturn.toLocaleString('en-US', {maximumFractionDigits: 2})
  };
})();

            const getColor = (value) => {
              if (value === '-') return 'text-white';
              const numValue = parseFloat(value);
              return numValue < 0 ? 'text-[#f23645]' : 'text-[#22ab94]';
            };

            return (
              <div key={strat.id} className="relative bg-[#0E0E0E] border border-white/10 rounded-3xl p-6 flex flex-col h-[450px] overflow-hidden group hover:border-white/20 transition-all duration-300">
                <div className="flex justify-between items-start mb-2 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/5">
                       {strat.id === 'sentquant' ? <SentquantLogo size={24} /> : <Activity size={20} style={{color: strat.color}} />}
                    </div>
                    <div>
                       <h3 className="font-bold text-white font-eth text-lg tracking-wide">{strat.name}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => handleLiveView(strat.id)} className="px-3 py-1 bg-[#1A1A1A] hover:bg-[#252525] border border-white/10 rounded-lg text-[10px] font-bold text-gray-300 transition-colors">
                       {t.terminal.history}
                     </button>
                     <button onClick={() => handleLiveView(strat.id)} className="px-3 py-1 bg-[#1A1A1A] hover:bg-[#252525] border border-white/10 rounded-lg text-[10px] font-bold text-white transition-colors">
                       {t.terminal.live_btn}
                     </button>
                  </div>
                </div>

                <div className="mt-4 z-10">
                   <div className={`text-5xl font-bold font-eth tracking-tighter ${getColor(cardStats.totalReturn)}`}>
                      {cardStats.totalReturn}%
                   </div>
                   <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                      {t.terminal.total_return}
                   </div>
                </div>

                <div className="absolute inset-x-0 top-[120px] bottom-[80px] w-full opacity-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={strat.liveData}>
                        <defs>
                          <linearGradient id={`cardGradient-${strat.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={strat.id === 'sentquant' ? '#22ab94' : '#22ab94'} stopOpacity={0.2}/>
                            <stop offset="100%" stopColor={strat.id === 'sentquant' ? '#22ab94' : '#22ab94'} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip 
                            contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', backdropFilter: 'blur(4px)'}}
                            itemStyle={{color: strat.id === 'sentquant' ? '#22ab94' : '#22ab94'}}
                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                            formatter={(val) => [val.toFixed(2), 'NAV']}
                            labelStyle={{display: 'none'}}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke={strat.id === 'sentquant' ? '#22ab94' : '#22ab94'} 
                          strokeWidth={2} 
                          fill={`url(#cardGradient-${strat.id})`} 
                          dot={false}
                          activeDot={{ r: 4, fill: strat.id === 'sentquant' ? '#22ab94' : '#22ab94', stroke: '#fff' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-auto grid grid-cols-3 gap-4 border-t border-white/5 pt-4 z-10 bg-[#0E0E0E]/80 backdrop-blur-sm">
                  {/* NAV */}
<div className="text-center">
  <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">NAV</div>
  <div className="text-sm font-bold text-white">
    {strat.liveData && strat.liveData.length > 0 
      ? strat.liveData[strat.liveData.length - 1].value.toFixed(2)
      : '-'}
  </div>
</div>
                  
                  {/* TVL */}
                  <div className="text-center relative">
                    <div className="absolute left-0 top-1 bottom-1 w-px bg-white/5"></div>
                    <div className="absolute right-0 top-1 bottom-1 w-px bg-white/5"></div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">TVL</div>
                    <div className="text-sm font-bold text-white">
                      {strat.id === 'sentquant' ? 'LOCKED' : formatCurrency(strat.tvl)}
                    </div>
                  </div>
                  
                  {/* PROTOCOL */}
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">PROTOCOL</div>
                    <div className="text-sm font-bold text-white">{strat.protocol}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
  </div>
)}
          {/* --- LIVE: UNIFIED DASHBOARD --- */}
          {activeTab === 'live' && (
            <div className="animate-fade-in-up space-y-12 pb-20 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
              
            {/* HEADER WITH BACK & TRADE BUTTONS */}
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
  {/* BACK BUTTON */}
  <button 
    onClick={() => setActiveTab('terminal')}
    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
  >
    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
    <span className="font-eth font-bold text-sm tracking-wider">BACK TO TERMINAL</span>
  </button>

  {/* TRADE NOW BUTTON - TOP RIGHT */}
  <button 
    className="w-full sm:w-auto px-6 py-3 bg-[#A3A3A3] hover:bg-[#8f8f8f] text-black font-eth font-bold rounded-xl text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
  >
    <span>TRADE</span>
    <ArrowRight size={16} />
  </button>
</div>

<div className="space-y-6">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10">
         {currentStrategy.id === 'sentquant' ? <SentquantLogo size={32} /> : <Activity size={24} style={{color: currentStrategy.color}} />}
      </div>
      <div>
        <h1 className="text-3xl font-eth font-bold text-white">{currentStrategy.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className={`w-2 h-2 rounded-full ${currentStrategy.status === 'Live' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{currentStrategy.status} TRADING</span>
        </div>
      </div>
    </div>
  </div>

                {/* NEW METRICS BOX: APR, TVL, PROTOCOL - STYLED */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* NAV BOX */}
<div className="relative border border-white/10 bg-black/40 backdrop-blur-sm p-6 flex flex-col items-center justify-center">
  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40"></div>
  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/40"></div>
  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/40"></div>
  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40"></div>
  
  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">NAV</span>
  <span className="text-2xl md:text-3xl font-eth font-bold text-white tracking-tighter">
    {currentStrategy.liveData && currentStrategy.liveData.length > 0 
      ? currentStrategy.liveData[currentStrategy.liveData.length - 1].value.toFixed(2)
      : '-'}
  </span>
</div>

                  {/* TVL BOX */}
                  <div className="relative border border-white/10 bg-black/40 backdrop-blur-sm p-6 flex flex-col items-center justify-center">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/40"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/40"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40"></div>
                    
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">TVL</span>
                   <span className="text-2xl md:text-3xl font-eth font-bold text-white tracking-tighter">
  {currentStrategy.id === 'sentquant' ? 'LOCKED' : formatCurrency(currentStrategy.tvl)}
</span>
                  </div>

                  {/* PROTOCOL BOX */}
                  <div className="relative border border-white/10 bg-black/40 backdrop-blur-sm p-6 flex flex-col items-center justify-center">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/40"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/40"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40"></div>
                    
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">PROTOCOL</span>
                    <span className="text-2xl md:text-3xl font-eth font-bold text-white tracking-tighter">{currentStrategy.protocol}</span>
                  </div>

                </div>

                {/* KEY METRICS GRID */}
               <KeyMetricsGrid stats={liveStats} t={t} isLive={true} />

                {/* LIVE CHARTS */}
                <StrategyCharts 
                  data={currentStrategy.liveData} 
                  color={currentStrategy.color} 
                  name={currentStrategy.name} 
                  title="Live" 
                />
              </div>

              {/* SECTION 2: HISTORICAL PERFORMANCE WITH NEW FILTERS */}
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#A3A3A3] rounded-full"></span>
                    <h2 className="text-xl font-eth font-bold text-white">{t.live.historical_title}</h2>
                  </div>

                  {/* CHART FILTERS: 5Y, ALL, FILTER (Dropdown) */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setChartTimeRange('5Y'); setChartYearFilter(null); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${chartTimeRange === '5Y' ? 'bg-[#22ab94] border-[#22ab94] text-black' : 'bg-[#1A1A1A] border-white/10 text-gray-400 hover:text-white'}`}
                    >
                      5Y
                    </button>
                    <button 
                      onClick={() => { setChartTimeRange('ALL'); setChartYearFilter(null); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${chartTimeRange === 'ALL' ? 'bg-[#22ab94] border-[#22ab94] text-black' : 'bg-[#1A1A1A] border-white/10 text-gray-400 hover:text-white'}`}
                    >
                      ALL
                    </button>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setIsChartFilterOpen(!isChartFilterOpen)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${chartTimeRange === 'FILTER' ? 'bg-[#22ab94] border-[#22ab94] text-black' : 'bg-[#1A1A1A] border-white/10 text-gray-400 hover:text-white'}`}
                      >
                        {chartTimeRange === 'FILTER' && chartYearFilter ? chartYearFilter : 'FILTER'} <ChevronDown size={12} />
                      </button>
                      
                      {isChartFilterOpen && (
                        <div className="absolute right-0 top-full mt-2 w-32 max-h-60 overflow-y-auto custom-scrollbar bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl z-20 py-1">
                          {Array.from({ length: 21 }, (_, i) => 2025 - i).map(year => (
                            <button
                              key={year}
                              onClick={() => { 
                                setChartTimeRange('FILTER'); 
                                setChartYearFilter(year); 
                                setIsChartFilterOpen(false); 
                              }}
                              className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-white/5 transition-colors ${chartYearFilter === year ? 'text-[#22ab94]' : 'text-gray-400'}`}
                            >
                              {year}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <KeyMetricsGrid stats={dynamicHistoricalStats} t={t} isLive={false} />

                {/* PASSING FILTERED DATA TO CHART */}
                <StrategyCharts 
                  data={filteredHistoricalData} 
                  color={currentStrategy.color} 
                  name={currentStrategy.name} 
                  title="Historical" 
                />

                {/* MONTHLY HEATMAP WITH NEW FILTERS */}
                <MonthlyHeatmap data={currentStrategy.heatmap} t={t.historical} />
                
                <TopDrawdownsTable data={currentStrategy.topDrawdowns} t={t.historical} />
              </div>

              {/* SECTION 3: STATISTICS & METRICS */}
              <div>
                <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
                  <span className="w-1 h-6 bg-[#A3A3A3] rounded-full"></span>
                  <h2 className="text-xl font-eth font-bold text-white">{t.live.stats_title}</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="lg:col-span-2 h-[300px] bg-black/20 border border-white/5 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-white mb-4 font-eth">{t.stats.annual_returns}</h3>
                    <ResponsiveContainer width="100%" height="90%">
                      <RechartsBarChart data={currentStrategy.annualReturns || []}>
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} />
                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#000', border: 'none'}} />
                        <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                          {(currentStrategy.annualReturns || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.value >= 0 ? currentStrategy.color : '#f23645'} />
                          ))}
                        </Bar>
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <AboutModelsCard t={t.stats} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {detailedStatsSections.map((section, idx) => (
                    <DetailedStatCard key={idx} section={section} />
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* --- ABOUT --- */}
          {activeTab === 'about' && (
            <div className="animate-fade-in-up flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto p-4 md:p-8">
               <SentquantLogo size={100} />
               <h2 className="text-3xl font-eth font-bold text-white mt-8 mb-4">{t.about.broken}</h2>
               <p className="text-gray-400 leading-relaxed mb-8">{t.about.fake_gurus} {t.about.misled} {t.about.era_ends}</p>
               <button className="px-8 py-3 bg-[#A3A3A3] text-black font-bold rounded-full hover:bg-[#737373] transition-colors">
                 {t.about.join_movement}
               </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}