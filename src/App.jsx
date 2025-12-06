import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart as RechartsBarChart, Bar, Cell, CartesianGrid
} from 'recharts';
import { 
  Menu, X, Lock, Activity, Eye, EyeOff, ArrowRight, HelpCircle 
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
    // Keep Shadow Grey (Base Website Theme)
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

// --- CONFIGURATION & MOCK DATA ---
const STRATEGIES_CONFIG = [
  // REVERTED: Sentquant color back to Teal (#22ab94) for Card/Strategy Identity
  { id: 'sentquant', name: 'Sentquant', color: '#22ab94', status: 'Offline', return: '25,516%', dd: '-29.20%', sharpe: 1.44, tvl: 8200000, apr: '1,224%' },
  { id: 'alpha_hunter', name: 'Alpha Hunter', color: '#3b82f6', status: 'Live', return: '12,450%', dd: '-18.50%', sharpe: 1.82, tvl: 3500000, apr: '850%' },
  { id: 'momentum_pro', name: 'Momentum Pro', color: '#f59e0b', status: 'Live', return: '8,320%', dd: '-22.10%', sharpe: 1.35, tvl: 2100000, apr: '620%' },
  { id: 'mean_revert', name: 'Mean Revert', color: '#8b5cf6', status: 'Offline', return: '5,680%', dd: '-15.30%', sharpe: 1.95, tvl: 1400000, apr: '410%' },
  { id: 'volatility_edge', name: 'Volatility Edge', color: '#ec4899', status: 'Live', return: '4,200%', dd: '-12.80%', sharpe: 2.15, tvl: 800200, apr: '320%' },
  { id: 'trend_follower', name: 'Trend Follower', color: '#6366f1', status: 'Offline', return: '3,850%', dd: '-19.40%', sharpe: 1.58, tvl: 500000, apr: '280%' }
];

// Helper to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// UPDATED: More organic curve generation
const generateStrategyData = () => {
  const benchmarkData = [];
  let values = STRATEGIES_CONFIG.map(() => 1000); 
  
  const strategyBehaviors = [
    { drift: 0.008, vol: 0.02 },  
    { drift: 0.005, vol: 0.035 }, 
    { drift: 0.004, vol: 0.015 }, 
    { drift: 0.003, vol: 0.04 },  
    { drift: 0.002, vol: 0.025 }, 
    { drift: 0.001, vol: 0.05 }   
  ];

  for (let i = 0; i < 200; i++) {
    const point = { date: `Day ${i}` };
    values = values.map((val, idx) => {
      const { drift, vol } = strategyBehaviors[idx];
      const changePercent = drift + (Math.random() - 0.5) * vol; 
      return Math.max(100, val * (1 + changePercent)); 
    });
    
    STRATEGIES_CONFIG.forEach((strat, idx) => {
      point[strat.id] = values[idx];
    });
    benchmarkData.push(point);
  }

  const strategiesDetails = {};
  STRATEGIES_CONFIG.forEach((strat, stratIdx) => {
    let currentLiveVal = 1000;
    const { drift, vol } = strategyBehaviors[stratIdx];
    
    const liveData = Array.from({ length: 150 }, (_, i) => {
      const change = currentLiveVal * (drift + (Math.random() - 0.5) * vol * 1.5);
      currentLiveVal = Math.max(500, currentLiveVal + change);
      return {
        date: i,
        value: currentLiveVal,
        drawdown: -(Math.abs(Math.random() * (vol * 1000)))
      };
    });

    let currentHistVal = 1000; 
    const historicalData = Array.from({ length: 365 }, (_, i) => {
      const change = currentHistVal * (drift + (Math.random() - 0.5) * vol);
      currentHistVal = Math.max(100, currentHistVal + change);
      return {
        date: i,
        value: currentHistVal,
        drawdown: -(Math.abs(Math.random() * (vol * 800)))
      };
    });

    strategiesDetails[strat.id] = {
      ...strat,
      liveData,
      historicalData,
      heatmap: Array.from({ length: 5 }, (_, y) => ({
        year: (2025 - y).toString(),
        months: Array.from({ length: 12 }, () => (Math.random() * 20 - 5).toFixed(1)).map(Number)
      })),
      topDrawdowns: [
        { rank: 1, startDate: '2022-01', endDate: '2022-03', depth: parseFloat(strat.dd), duration: 60, recovery: 20 },
        { rank: 2, startDate: '2021-05', endDate: '2021-06', depth: -10.5, duration: 30, recovery: 15 },
        { rank: 3, startDate: '2023-08', endDate: '2023-09', depth: -8.2, duration: 25, recovery: 10 },
        { rank: 4, startDate: '2020-03', endDate: '2020-04', depth: -5.5, duration: 15, recovery: 5 },
        { rank: 5, startDate: '2024-01', endDate: '2024-02', depth: -3.1, duration: 10, recovery: 2 },
      ],
      annualReturns: [
        { year: '2021', value: Math.random() * 60 - 10 },
        { year: '2022', value: Math.random() * 40 - 15 },
        { year: '2023', value: Math.random() * 80 + 10 },
        { year: '2024', value: Math.random() * 50 + 5 },
        { year: '2025', value: Math.random() * 30 }
      ],
      stats: {
        totalReturn: parseFloat(strat.return.replace(/,/g, '')),
        maxDrawdown: parseFloat(strat.dd),
        sharpe: strat.sharpe,
        sortino: (strat.sharpe * 1.5).toFixed(2),
        winRate: (50 + Math.random() * 20).toFixed(2),
        cagr: (20 + Math.random() * 15).toFixed(2),
        apr: (100 + Math.random() * 500).toFixed(2),
        expectedValue: 0.15,
        volatility: 15.5
      }
    };
  });

  return { benchmarkData, strategiesDetails };
};

const { benchmarkData: MOCK_BENCHMARK_DATA, strategiesDetails: MOCK_STRATEGIES_DETAILS } = generateStrategyData();

// --- TRANSLATIONS ---
const TRANSLATIONS = {
  en: {
    nav: { home: "Home", live: "Live", terminal: "Terminal", about: "About" },
    join: "Join",
    home: { 
      subtitle_1: "If CoinMarketCap tracks assets,",
      subtitle_2: "Sentquant tracks strategy performance.",
      tagline: "Sentquant", 
      manifesto: "Sentquant is the place where every trader can track the quality of strategies and education before spending a single dollar.",
      launch: "Launch Terminal"
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
      cant_verify: "Performance can’t be verified.",
      misled: "Retail traders are misled by empty claims.",
      talks: "Everyone talks.",
      no_data: "No data.",
      cmc_analogy_1: "If CoinMarketCap tracks assets,",
      cmc_analogy_2: "Sentquant tracks strategy performance.",
      cant_lie: "Because performance can’t lie, people can.",
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
      launch: "Buka Terminal"
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
  const metrics = [
    // REVERTED: Positive value color to Teal (#22ab94) for stats
    { label: t.metrics_labels.total_return, value: `${stats.totalReturn.toLocaleString()}%`, color: stats.totalReturn >= 0 ? 'text-[#22ab94]' : 'text-[#f23645]' },
    { label: t.metrics_labels.max_dd, value: `${stats.maxDrawdown}%`, color: 'text-[#f23645]' },
    { label: t.metrics_labels.cagr, value: `${stats.cagr}%`, color: 'text-white' },
    { label: t.metrics_labels.apr, value: `${stats.apr}%`, color: 'text-white' },
    { label: t.metrics_labels.expected_val_short, value: `${stats.expectedValue}%`, color: 'text-white' },
    { label: t.metrics_labels.volatility_short, value: `${stats.volatility}%`, color: 'text-white' },
    { label: t.metrics_labels.sharpe, value: stats.sharpe, color: 'text-white' },
    { label: t.metrics_labels.sortino, value: stats.sortino, color: 'text-white' }
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
        <AreaChart data={data} margin={{top:10, left:0, right:0, bottom:0}}>
          <defs>
            <linearGradient id={`equityGradient-${name}-${title}`} x1="0" y1="0" x2="0" y2="1">
              {/* REVERTED: Uses 'color' prop (Teal for Sentquant) instead of hardcoded Grey */}
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
            formatter={(value) => [value.toLocaleString(), 'NAV']} 
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
        <AreaChart data={data} margin={{top:5, left:0, right:0, bottom:0}}>
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
            formatter={(value) => [`${value.toFixed(2)}%`, 'Drawdown']} 
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

// --- COMPONENT: MONTHLY HEATMAP ---
const MonthlyHeatmap = ({ data, t }) => {
  return (
    <div className="mb-10 mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-bold text-white drop-shadow-md font-eth">{t.heatmap_title}</h3>
          <div className="flex gap-2">
            {/* REVERTED: Legend color to Teal (#22ab94) */}
            <span className="flex items-center gap-1 text-xs text-gray-400"><div className="w-2 h-2 bg-[#22ab94] rounded-sm"></div> {t.positive}</span>
            <span className="flex items-center gap-1 text-xs text-gray-400"><div className="w-2 h-2 bg-[#f23645] rounded-sm"></div> {t.negative}</span>
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
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors rounded-lg">
                      <td className="text-left font-bold text-white py-4 px-2">{row.year}</td>
                      {row.months.map((val, i) => (
                        <td key={i} className="text-center py-4 px-2">
                            {val !== null ? (
                              // REVERTED: Value colors back to Teal (#22ab94)
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

// --- MAIN APP ---
export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); // Default to home
  const [selectedStrategyId, setSelectedStrategyId] = useState('sentquant');
  const [visibleStrategies, setVisibleStrategies] = useState(
    STRATEGIES_CONFIG.reduce((acc, strat) => ({ ...acc, [strat.id]: true }), {})
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState('en');

  const t = TRANSLATIONS[language];

  // Calculate Total TVL dynamically
  const totalTVL = useMemo(() => {
    return STRATEGIES_CONFIG.reduce((acc, curr) => acc + curr.tvl, 0);
  }, []);

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

  // Derived data
  const currentStrategy = MOCK_STRATEGIES_DETAILS[selectedStrategyId];
  const currentStats = currentStrategy.stats;

  // Generate detailed stats sections dynamically
  const detailedStatsSections = useMemo(() => [
    {
      title: t.stats.section_return,
      metrics: [
        { l: t.metrics_labels.total_return, v: `${currentStats.totalReturn.toLocaleString()}%` },
        { l: t.metrics_labels.cagr, v: `${currentStats.cagr}%` },
        { l: t.metrics_labels.apr, v: `${currentStats.apr}%` },
      ]
    },
    {
      title: t.stats.section_drawdown,
      metrics: [
        { l: t.metrics_labels.max_dd, v: `${currentStats.maxDrawdown}%` },
      ]
    },
    {
      title: t.stats.section_risk_adj,
      metrics: [
        { l: t.metrics_labels.sharpe, v: currentStats.sharpe },
        { l: t.metrics_labels.sortino, v: currentStats.sortino },
      ]
    },
    {
      title: t.stats.section_volatility,
      metrics: [
        { l: t.metrics_labels.ann_vol, v: `${currentStats.volatility}%` },
      ]
    },
    {
      title: t.stats.section_win_loss,
      metrics: [
        { l: t.metrics_labels.win_rate, v: `${currentStats.winRate}%` },
      ]
    },
    {
      title: t.stats.section_consistency,
      metrics: [
        { l: t.metrics_labels.expected_val_short, v: `${currentStats.expectedValue}%` },
      ]
    }
  ], [language, selectedStrategyId]); // Recompute when strategy or language changes

  // Simulate initial loading
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) return <div className="h-screen bg-black text-white flex items-center justify-center font-mono">INITIALIZING SYSTEM...</div>;

  return (
    <div className="flex flex-col h-[100dvh] text-[#d1d4dc] font-sans overflow-hidden relative bg-black">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700;800&display=block');
        .font-eth { font-family: 'Montserrat', sans-serif; }
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
             <SentquantLogo size={32} />
             {/* REMOVED: Text SENTQUANT removed as requested */}
          </div>
          <div className="hidden md:block h-6 w-px bg-white/10 mx-2"></div>
          {/* UPDATED: Added font-eth directly to buttons for stronger specificity */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold tracking-wider">
            {/* KEPT: Active tab color to Grey (#A3A3A3) for Website Theme */}
            <button onClick={() => setActiveTab('home')} className={`transition-colors font-eth ${activeTab === 'home' ? 'text-[#A3A3A3]' : 'text-gray-400 hover:text-white'}`}>{t.nav.home}</button>
            <button onClick={() => setActiveTab('terminal')} className={`transition-colors font-eth ${activeTab === 'terminal' ? 'text-[#A3A3A3]' : 'text-gray-400 hover:text-white'}`}>{t.nav.terminal}</button>
            <button onClick={() => setActiveTab('live')} className={`transition-colors font-eth ${activeTab === 'live' ? 'text-[#A3A3A3]' : 'text-gray-400 hover:text-white'}`}>{t.nav.live}</button>
            <button onClick={() => setActiveTab('about')} className={`transition-colors font-eth ${activeTab === 'about' ? 'text-[#A3A3A3]' : 'text-gray-400 hover:text-white'}`}>{t.nav.about}</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setLanguage(l => l === 'en' ? 'id' : 'en')} className="text-xs font-bold text-gray-400 hover:text-white transition-colors">{language === 'en' ? 'EN' : 'ID'}</button>
          <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-2">{t.join} <Lock size={12} /></button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">{isMenuOpen ? <X size={24}/> : <Menu size={24}/>}</button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-6 md:hidden flex flex-col gap-6 animate-fade-in-up">
            {/* KEPT: Active tab color to Grey (#A3A3A3) */}
            <button onClick={() => { setActiveTab('home'); setIsMenuOpen(false); }} className={`text-xl font-bold font-eth tracking-wide text-left py-3 border-b border-white/10 ${activeTab === 'home' ? 'text-[#A3A3A3]' : 'text-gray-400'}`}>{t.nav.home}</button>
            <button onClick={() => { setActiveTab('terminal'); setIsMenuOpen(false); }} className={`text-xl font-bold font-eth tracking-wide text-left py-3 border-b border-white/10 ${activeTab === 'terminal' ? 'text-[#A3A3A3]' : 'text-gray-400'}`}>{t.nav.terminal}</button>
            <button onClick={() => { setActiveTab('live'); setIsMenuOpen(false); }} className={`text-xl font-bold font-eth tracking-wide text-left py-3 border-b border-white/10 ${activeTab === 'live' ? 'text-[#A3A3A3]' : 'text-gray-400'}`}>{t.nav.live}</button>
            <button onClick={() => { setActiveTab('about'); setIsMenuOpen(false); }} className={`text-xl font-bold font-eth tracking-wide text-left py-3 border-b border-white/10 ${activeTab === 'about' ? 'text-[#A3A3A3]' : 'text-gray-400'}`}>{t.nav.about}</button>
        </div>
      )}

      {/* MAIN CONTENT WRAPPER - SCROLLS HERE, FULL WIDTH */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 h-full">
        <WarpBackground />
        
        {/* MAIN CONTENT CONSTRAINT */}
        <main className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-full">
          
          {/* --- HOME PAGE --- */}
          {activeTab === 'home' && (
            // UPDATED: Added animate-fade-in-up
            <div className="animate-fade-in-up flex flex-col items-center justify-center min-h-[70vh] text-center max-w-5xl mx-auto space-y-12">
               
               {/* FLEX CONTAINER: Logo & Title Side-by-Side (Mobile & Desktop) */}
               {/* UPDATED: Added w-full and px-2 to ensure it centers correctly within screen bounds */}
               <div className="w-full px-2 flex flex-row items-center justify-center gap-3 md:gap-12">
                   {/* Logo with Glow - RESPONSIVE SIZING */}
                   {/* UPDATED: Kept mobile size large (w-20/w-24) but ensures it fits with text */}
                   <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-40 md:h-40">
                      {/* REMOVED: Glow background div removed as requested */}
                      {/* FIXED: Added animate={false} to ensure it stays static */}
                      <SentquantLogo size="100%" animate={false} />
                   </div>
                   
                   {/* Tagline - Now to the right of logo on mobile too */}
                   {/* UPDATED: Adjusted mobile text to text-4xl (safer for centering) up to text-5xl on slightly larger screens, kept desktop at 7xl */}
                   <h1 className="relative z-20 text-4xl sm:text-5xl md:text-7xl font-eth font-extrabold text-white tracking-tight leading-tight drop-shadow-2xl whitespace-nowrap">
                     {t.home.tagline}
                   </h1>
               </div>

               {/* Manifesto - WRAPPED IN DIV FOR STABILITY */}
               {/* UPDATED: Changed font-sans to font-eth here */}
               <div className="relative z-20 px-4">
                 <p className="text-gray-100 text-lg md:text-xl font-medium font-eth leading-relaxed max-w-2xl mx-auto antialiased drop-shadow-lg">
                   {t.home.manifesto}
                 </p>
               </div>

               {/* CTA Button */}
               {/* UPDATED: Added font-eth here */}
               {/* KEPT: Button Background to Grey (#A3A3A3) and Hover to Darker Grey (#737373) (Base Theme) */}
               <button 
                 onClick={() => setActiveTab('terminal')}
                 className="mt-4 px-10 py-4 bg-[#A3A3A3] hover:bg-[#737373] text-black font-bold font-eth rounded-full text-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(163,163,163,0.4)] flex items-center gap-3"
               >
                 {t.home.launch} <ArrowRight size={20} />
               </button>
            </div>
          )}

          {/* --- TERMINAL: BENCHMARK COMPARISON --- */}
          {activeTab === 'terminal' && (
            <div className="animate-fade-in-up space-y-8 pb-20">
              
              {/* TOTAL TVL BANNER */}
              <div className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-center flex flex-col items-center justify-center space-y-2 shadow-2xl relative overflow-hidden">
                 {/* KEPT: Gradient to Grey (Base Theme) */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#A3A3A3] to-transparent opacity-50"></div>
                 
                 {/* ADDED LOGO */}
                 <div className="mb-2">
                    <SentquantLogo size={48} /> 
                 </div>

                 {/* UPDATED: LABEL WITH TOOLTIP */}
                 <div className="flex items-center gap-2 justify-center mb-1">
                    <h2 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">{t.terminal.total_tvl_label}</h2>
                    <div className="relative group">
                       <HelpCircle size={14} className="text-gray-500 cursor-help hover:text-[#A3A3A3] transition-colors" />
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-black/90 border border-white/10 rounded-lg text-xs text-gray-300 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 backdrop-blur-sm">
                          {t.terminal.tvl_tooltip}
                       </div>
                    </div>
                 </div>
                 
                 {/* REDUCED FONT SIZE: text-4xl md:text-6xl -> text-3xl md:text-5xl */}
                 <div className="text-3xl md:text-5xl font-eth font-bold text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                    {formatCurrency(totalTVL)}
                 </div>
                 <p className="text-sm text-gray-500 font-medium">{t.terminal.tvl_sub}</p>
              </div>

              {/* BENCHMARK CHART SECTION */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h1 className="text-2xl md:text-3xl font-eth font-bold text-white">{t.terminal.title}</h1>
                  
                  {/* Visibility Toggles */}
                  <div className="flex flex-wrap gap-2">
                    {STRATEGIES_CONFIG.map(strat => (
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

                <div className="h-[400px] md:h-[500px] w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_BENCHMARK_DATA} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                      <defs>
                        {STRATEGIES_CONFIG.map(strat => (
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
                      {STRATEGIES_CONFIG.map(strat => (
                        visibleStrategies[strat.id] && (
                          <Area 
                            key={strat.id}
                            type="monotone" 
                            dataKey={strat.id} 
                            stroke={strat.color} 
                            strokeWidth={2}
                            fill={`url(#color-${strat.id})`}
                            dot={false}
                            activeDot={{r: 4, strokeWidth: 0}}
                          />
                        )
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* STRATEGY CARDS GRID - REDESIGNED */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {STRATEGIES_CONFIG.map(strat => (
                  // The card container matches the visual style: Dark bg, rounded corners, border
                  <div key={strat.id} className="relative bg-[#0E0E0E] border border-white/10 rounded-3xl p-6 flex flex-col h-[450px] overflow-hidden group hover:border-white/20 transition-all duration-300">
                    
                    {/* Header: Icon, Name, Buttons */}
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

                    {/* Main Metric: Big Total Return - REVERTED TO USE STRATEGY COLOR (TEAL FOR SENTQUANT) */}
                    <div className="mt-4 z-10">
                       <div className="text-5xl font-bold font-eth tracking-tighter" style={{ color: strat.id === 'sentquant' ? '#22ab94' : '#22ab94' }}>
                          {strat.return}
                       </div>
                       <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                          {t.terminal.total_return}
                       </div>
                    </div>

                    {/* Chart Area: Fills middle - REVERTED TO USE STRATEGY COLOR (TEAL FOR SENTQUANT) */}
                    <div className="absolute inset-x-0 top-[120px] bottom-[80px] w-full opacity-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={MOCK_STRATEGIES_DETAILS[strat.id].liveData}>
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

                    {/* Footer Metrics: APR, Max DD, Sharpe */}
                    <div className="mt-auto grid grid-cols-3 gap-4 border-t border-white/5 pt-4 z-10 bg-[#0E0E0E]/80 backdrop-blur-sm">
                       <div className="text-center">
                          <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">{t.terminal.apr}</div>
                          <div className="text-sm font-bold text-white">{strat.apr}</div>
                       </div>
                       <div className="text-center relative">
                          {/* Divider lines */}
                          <div className="absolute left-0 top-1 bottom-1 w-px bg-white/5"></div>
                          <div className="absolute right-0 top-1 bottom-1 w-px bg-white/5"></div>
                          <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">{t.terminal.max_dd}</div>
                          <div className="text-sm font-bold text-white">{strat.dd}</div>
                       </div>
                       <div className="text-center">
                          <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">{t.terminal.sharpe}</div>
                          <div className="text-sm font-bold text-white">{strat.sharpe}</div>
                       </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- LIVE: UNIFIED DASHBOARD --- */}
          {activeTab === 'live' && (
            <div className="animate-fade-in-up space-y-12 pb-20">
              
              {/* SECTION 1: LIVE TRADING STATUS */}
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

                {/* KEY METRICS GRID (ADDED ABOVE CHARTS) */}
                <KeyMetricsGrid stats={currentStats} t={t} isLive={true} />

                {/* LIVE CHARTS (STACKED) */}
                <StrategyCharts 
                  data={currentStrategy.liveData} 
                  color={currentStrategy.color} 
                  name={currentStrategy.name} 
                  title="Live" 
                />
              </div>

              {/* SECTION 2: HISTORICAL PERFORMANCE */}
              <div>
                <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
                  {/* CHANGED: Indicator to Grey (Base Theme) */}
                  <span className="w-1 h-6 bg-[#A3A3A3] rounded-full"></span>
                  <h2 className="text-xl font-eth font-bold text-white">{t.live.historical_title}</h2>
                </div>
                
                {/* HISTORICAL KEY METRICS GRID (ADDED) */}
                <KeyMetricsGrid stats={currentStats} t={t} isLive={false} />

                {/* HISTORICAL CHARTS (ADDED) */}
                <StrategyCharts 
                  data={currentStrategy.historicalData} 
                  color={currentStrategy.color} 
                  name={currentStrategy.name} 
                  title="Historical" 
                />

                <MonthlyHeatmap data={currentStrategy.heatmap} t={t.historical} />
                <TopDrawdownsTable data={currentStrategy.topDrawdowns} t={t.historical} />
              </div>

              {/* SECTION 3: STATISTICS & METRICS */}
              <div>
                <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
                  {/* CHANGED: Indicator to Grey (Base Theme) */}
                  <span className="w-1 h-6 bg-[#A3A3A3] rounded-full"></span>
                  <h2 className="text-xl font-eth font-bold text-white">{t.live.stats_title}</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Annual Returns Bar Chart */}
                  <div className="lg:col-span-2 h-[300px] bg-black/20 border border-white/5 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-white mb-4 font-eth">{t.stats.annual_returns}</h3>
                    <ResponsiveContainer width="100%" height="90%">
                      <RechartsBarChart data={currentStrategy.annualReturns}>
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} />
                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#000', border: 'none'}} />
                        <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                          {currentStrategy.annualReturns.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.value >= 0 ? currentStrategy.color : '#f23645'} />
                          ))}
                        </Bar>
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* About Model */}
                  <div className="lg:col-span-1">
                    <AboutModelsCard t={t.stats} />
                  </div>
                </div>

                {/* Detailed Stats Grid */}
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
            <div className="animate-fade-in-up flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto">
               <SentquantLogo size={100} />
               <h2 className="text-3xl font-eth font-bold text-white mt-8 mb-4">{t.about.broken}</h2>
               <p className="text-gray-400 leading-relaxed mb-8">{t.about.fake_gurus} {t.about.misled} {t.about.era_ends}</p>
               {/* CHANGED: Button to Grey (Base Theme) */}
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
