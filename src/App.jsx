import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, BarChart as RechartsBarChart, Bar, Cell, LineChart, Line
} from 'recharts';
import { 
  User, ShieldCheck, Zap, ChevronLeft, LayoutGrid, Award, 
  BarChart3, Briefcase, ArrowLeft, ArrowRight, ChevronDown, Shield, 
  Calendar, MapPin, Link as LinkIcon, Cpu,Play, Globe, TrendingUp, Wallet, Home
} from 'lucide-react';

// ==========================================
// 1. DATA MOCK & KONFIGURASI
// ==========================================
const STRATEGIES_CONFIG = [
  { id: 'sentquant', name: 'Sentquant', protocol: 'Lighter', color: '#f3f4f5', srs: 562 },
  { id: 'systemic_hyper', name: 'Systemic Hyper', protocol: 'Hyperliquid', color: '#3b1bccff', srs: 739 },
  { id: 'jlp_neutral', name: 'JLP Delta Neutral', protocol: 'Drift', color: '#e9d5ff', srs: 260 },
  { id: 'guineapool', name: 'Guinea Pool', protocol: 'Lighter', color: '#9c69c5ff', srs: 201 },
  { id: 'edgehedge', name: 'Edge and Hedge', protocol: 'Lighter', color: '#a54316', srs: 260 },
  { id: 'systemicls', name: 'Systemic L/S', protocol: 'Lighter', color: '#ebfd4a', srs: 862 },
];
// ==========================================
// 2. KOMPONEN DASHBOARD UTAMA
// ==========================================
// --- HELPER COMPONENTS DARI SKRIP 1 ---
// --- KOMPONEN BADGE TITAN (PB STYLE) ---
// --- KOMPONEN TITAN BADGE (SQUARE RED EDITION - BINTANG 5) ---
// --- KOMPONEN TITAN BADGE (BLUE PENTAGON EDITION - BINTANG 5) ---
// --- KOMPONEN TITAN BADGE (BULAT BIRU REACTOR) ---
// --- 1. KOMPONEN TITAN BADGE (BULAT BIRU + 5 BINTANG KUNING) ---
// --- TITAN BADGE: ELITE TEXT EDITION ---
// --- TITAN BADGE: ELITE TEXT EDITION (PERFECT FIT) ---
// --- TITAN BADGE: ELITE TEXT EDITION (FINAL PERFECT POSITION) ---
// --- TITAN BADGE: ELITE TEXT EDITION (PURE STARS) ---
// --- TITAN BADGE: ELITE TEXT EDITION (FINAL CLEAN CODE) ---
// --- TITAN BADGE: ELITE TEXT EDITION (DIPERBAIKI UNTUK RESPONSIF) ---
const TitanBadge = ({ size = 160 }) => (
  <div className="relative inline-block" style={{ width: size, height: size * 1.2 }}>
    <svg width="100%" height="100%" viewBox="0 0 500 600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="eliteGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FCD34D" /> 
          <stop offset="50%" stopColor="#F59E0B" /> 
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <filter id="textGlow">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      
      <rect width="500" height="500" rx="100" fill="#1a1a1a" stroke="#F39237" strokeWidth="8"/>
      <rect x="20" y="20" width="460" height="460" rx="80" fill="#F39237" opacity="0.1"/>

      <text x="50%" y="47%" textAnchor="middle" dominantBaseline="central" fill="url(#eliteGold)" fontSize="110" fontWeight="900" fontStyle="italic" style={{ letterSpacing: '0.05em', fontFamily: 'Inter, sans-serif' }} filter="url(#textGlow)">
        ELITE
      </text>
      
      <g transform="translate(65, 530)">
        {[0, 85, 170, 255, 340].map((x) => (
          <path key={x} transform={`translate(${x}, 0) scale(2.5)`} d="M10 0L13.09 6.26L20 7.27L15 12.14L16.18 19.02L10 15.77L3.82 19.02L5 12.14L0 7.27L6.91 6.26L10 0Z" fill="url(#eliteGold)" />
        ))}
      </g>
    </svg>
  </div>
);

const KeyMetricsGrid = ({ stats }) => {
  const metrics = [
    { label: "Total Return", value: `${stats.totalReturn.toFixed(2)}%`, color: stats.totalReturn >= 0 ? 'text-[#10b981]' : 'text-red-500' },
    { label: "Max Drawdown", value: `${stats.maxDrawdown.toFixed(2)}%`, color: 'text-red-500' },
    { label: "Sharpe Ratio", value: stats.sharpe.toFixed(2), color: 'text-white' },
    { label: "Win Rate", value: `${stats.winRate}%`, color: 'text-white' }
  ];
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {metrics.map((m, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-[8px] uppercase font-bold text-zinc-500 tracking-wider mb-1">{m.label}</div>
          <div className={`text-xl font-black italic ${m.color}`}>{m.value}</div>
        </div>
      ))}
    </div>
  );
};

const DetailedStatCard = ({ title, metrics }) => (
  <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden mb-4">
    <div className="bg-white/5 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-zinc-400 border-b border-white/5">{title}</div>
    <div className="p-4 space-y-2">
      {metrics.map((m, i) => (
        <div key={i} className="flex justify-between items-center text-[10px] uppercase tracking-wider">
          <span className="text-zinc-500 font-bold">{m.l}</span>
          <span className="text-white font-black">{m.v}</span>
        </div>
      ))}
    </div>
  </div>
);
// --- INTERACTIVE PERFORMANCE CHART (FIXED & CLEAN) ---
const InteractivePerformanceChart = ({ data }) => {
  return (
    <div className="w-full bg-[#080808] border-y border-white/5 py-0 select-none overflow-hidden">
      
      {/* Header Info */}
      <div className="px-6 pt-10 flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 bg-zinc-900/80 border border-white/5 px-4 py-2 rounded-xl">
          <span className="text-[10px] font-black uppercase text-white">Performance</span>
          <ChevronDown size={14} className="text-[#10b981]" />
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/80 border border-white/5 px-4 py-2 rounded-xl">
          <span className="text-[10px] font-black uppercase text-white">All</span>
          <ChevronDown size={14} className="text-[#10b981]" />
        </div>
      </div>

      <div className="h-[350px] md:h-[500px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: -1 }}>
            <defs>
              <linearGradient id="tradingGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.5}/>
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.15}/> 
              </linearGradient>
            </defs>

            <YAxis 
              orientation="right" 
              mirror={true} 
              domain={['dataMin', 'auto']} 
              hide={false} 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#333', fontSize: 10, fontWeight: '900' }}
              tickCount={6}
            />

            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-black/90 backdrop-blur-2xl border border-[#10b981]/30 px-4 py-3 rounded-2xl shadow-2xl">
                      <p className="text-[12px] font-black text-[#10b981] tracking-tighter">${payload[0].value.toLocaleString()}</p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1">{payload[0].payload.date}</p>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
            />

            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#10b981" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#tradingGreen)" 
              dot={false}
              baseValue="dataMin" 
              isAnimationActive={true}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
// --- TOOLTIP KHUSUS ANALYTICS (FIX ERROR) ---
const CustomBenchmarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const validData = payload.filter(p => p.value != null);
  if (validData.length === 0) return null;
  return (
    <div className="bg-black/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl">
      <p className="text-[10px] text-zinc-500 font-bold mb-2 uppercase tracking-widest">{label}</p>
      {validData.map((entry, index) => (
        <p key={index} style={{ color: entry.color }} className="text-[11px] font-black uppercase mb-1">
          {entry.name}: {entry.value.toFixed(2)}
        </p>
      ))}
    </div>
  );
};
const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const scrollRef = React.useRef(null);
  const [quants, setQuants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [visibleStrategies, setVisibleStrategies] = useState({});
  const [agentContentTab, setAgentContentTab] = useState('feed');

  // --- LOGIKA PROFIL STYLE TRADINGVIEW (FIXED POSITION) ---
  const latestValue = useMemo(() => {
    if (!selectedProfile || !selectedProfile.history || !selectedProfile.history.length) return 0;
    return selectedProfile.history[selectedProfile.history.length - 1].value;
  }, [selectedProfile]);

  const profitColor = useMemo(() => {
    if (!selectedProfile) return 'text-white';
    return selectedProfile.profitValue >= 0 ? 'text-[#10b981]' : 'text-red-500';
  }, [selectedProfile]);

  const profileTabs = ['Overview', 'Performance', 'Executions', 'Vault Info'];
  // --- AKHIR LOGIKA PROFIL ---

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    minimumFractionDigits: 0 
  }).format(val || 0);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // Kita ambil data untuk SEMUA strategi yang ada di CONFIG secara paralel
        const fetchedData = await Promise.all(
          STRATEGIES_CONFIG.map(async (strat) => {
            try {
              // Menarik data dari folder public/data/
              const liveRes = await fetch(`/data/live-data-${strat.id}.json`);
              const liveDataJson = await liveRes.json();
              
              // Ambil data spesifik strategi ini dari dalam JSON
              const strategyLive = liveDataJson[strat.id] || { liveData: [], tvl: 0 };
              const liveData = strategyLive.liveData || [];

              // HITUNG PROFIT ASLI (Kalkulasi dari harga pertama & terakhir)
              let profit = 0;
              if (liveData.length > 1) {
                const firstVal = liveData[0].value;
                const lastVal = liveData[liveData.length - 1].value;
                profit = ((lastVal - firstVal) / firstVal) * 100;
              }

              return {
                ...strat,
                profitValue: profit,      // Profit dari data asli
                tvl: strategyLive.tvl,    // TVL dari data asli
                history: liveData         // Memasukkan liveData ke dalam key 'history' Arena
              };
            } catch (err) {
              console.warn(`Data untuk ${strat.id} tidak ditemukan, pakai fallback.`);
              return { ...strat, profitValue: 0, tvl: 0, history: [] };
            }
          })
        );

        setQuants(fetchedData);

        // Update visibilitas benchmark agar semua muncul di awal
        // --- LOGIKA RANDOMIZE (TIKTOK STYLE) ---
        const randomizedData = [...fetchedData].sort(() => Math.random() - 0.5);
        setQuants(randomizedData);

        const initialVisible = {};
        randomizedData.forEach(q => (initialVisible[q.id] = true));
        setVisibleStrategies(initialVisible);
      } catch (error) {
        console.error("Gagal inisialisasi Arena:", error);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);
  // --- LOGIKA BIAR SWIPE GAK ADA HABISNYA ---
  const handleInfiniteScroll = (e) => {
    if (activeTab !== 'arena' || selectedProfile) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const oneThird = scrollHeight / 3;

    // Pas sampe atas banget, teleport ke tengah
    if (scrollTop <= 0) {
      e.currentTarget.scrollTop = oneThird;
    } 
    // Pas sampe bawah banget, teleport ke tengah
    else if (scrollTop + clientHeight >= scrollHeight) {
      e.currentTarget.scrollTop = oneThird;
    }
  };

  // Efek biar pas awal buka Arena, posisi langsung di tengah
  useEffect(() => {
    if (activeTab === 'arena' && scrollRef.current && !selectedProfile) {
      const timer = setTimeout(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight / 3;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab, selectedProfile, quants]);
// --- CALCULATOR LOGIC DARI SKRIP 1 ---
  const profileStats = useMemo(() => {
    if (!selectedProfile || !selectedProfile.history.length) return null;
    const data = selectedProfile.history;
    const startVal = data[0].value;
    const endVal = data[data.length - 1].value;
    
    const returns = [];
    for (let i = 1; i < data.length; i++) {
      returns.push((data[i].value - data[i-1].value) / data[i-1].value);
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(returns.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / returns.length);
    
    return {
      totalReturn: ((endVal - startVal) / startVal) * 100,
      maxDrawdown: Math.min(...data.map(d => d.drawdown || 0)),
      sharpe: stdDev !== 0 ? (mean / stdDev) * Math.sqrt(252) : 0,
      winRate: returns.length > 0 ? ((returns.filter(r => r > 0).length / returns.length) * 100).toFixed(1) : "0"
    };
  }, [selectedProfile]);
  const totalTVL = useMemo(() => quants.reduce((acc, curr) => acc + (curr.tvl || 0), 0), [quants]);
  // --- LOGIKA PERINGKAT GLOBAL BERDASARKAN SRS ---
  const rankedQuants = useMemo(() => {
    // Kita urutkan berdasarkan SRS tertinggi, lalu ROI sebagai cadangan
    return [...quants].sort((a, b) => (b.srs || 0) - (a.srs || 0) || (b.profitValue - a.profitValue));
  }, [quants]);
  
const benchmarkData = useMemo(() => {
    if (!quants.length || quants.every(q => q.history.length === 0)) return [];

    
    
    // 1. Ambil SETIAP DETIK update unik dari SEMUA agen
    const allTimestamps = new Set();
    quants.forEach(q => {
      q.history.forEach(h => allTimestamps.add(h.timestamp || h.date));
    });

    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => new Date(a) - new Date(b));

    // 2. Gunakan sistem "Ingatan Terakhir" (Forward Fill)
    const memory = {};
    quants.forEach(q => { memory[q.id] = null; });

    // 3. Bangun timeline: Ambil data persis setiap ada update di profil
    return sortedTimestamps.map(timestamp => {
      const point = { time: timestamp };
      quants.forEach(q => {
        // Cari apakah agen ini punya data di jam/detik ini
        const match = q.history.find(h => (h.timestamp || h.date) === timestamp);
        if (match) { memory[q.id] = match.value; }
        point[q.id] = memory[q.id];
      });
      return point;
    });
  }, [quants]);
  const NavItem = ({ id, icon, label }) => (
    <button 
      onClick={() => { setActiveTab(id); if(id !== 'arena') setSelectedProfile(null); }} 
      className={`flex flex-col items-center gap-1 transition-all duration-500 flex-1 ${activeTab === id ? 'scale-110 opacity-100' : 'opacity-30 hover:opacity-60'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${activeTab === id ? 'text-[#10b981] bg-[#10b981]/10' : 'text-zinc-500'}`}>
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <span className="text-[7px] md:text-[9px] font-black uppercase tracking-wider">{label}</span>
    </button>
  );

  if (loading) return (
    <div className="h-[100dvh] w-screen bg-black flex flex-col items-center justify-center text-white gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-[#10b981]/20 rounded-full animate-spin border-t-[#10b981]"></div>
        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#10b981] animate-pulse" size={24} />
      </div>
      <div className="font-black text-[10px] tracking-[0.4em] uppercase animate-pulse">Syncing Arena...</div>
    </div>
  );

  return (
    <div className="h-[100dvh] w-screen bg-[#050505] text-white flex flex-col relative overflow-hidden font-sans">
      
      {/* Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
        
        {/* --- TAMPILAN: HOME --- */}
        {activeTab === 'home' && (
          <div className="h-full w-full p-6 flex flex-col items-center justify-center text-center animate-fade-in relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
              <h1 className="text-[40vw] font-black italic">SQ</h1>
            </div>
            <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/10 mb-6 backdrop-blur-md">
              <span className="text-[8px] md:text-[10px] font-black tracking-[0.3em] uppercase text-zinc-400">Verified Tier 1</span>
            </div>
            <h1 className="text-5xl md:text-9xl font-black italic tracking-tighter uppercase leading-none mb-4 select-none">
              SENTQUANT<br/><span className="text-zinc-700">ARENA</span>
            </h1>
            <p className="max-w-xs md:max-w-md text-[10px] md:text-xl text-white/30 italic uppercase mb-10 tracking-widest leading-relaxed">
              Global Intelligence Layer for Quantitative Alpha.
            </p>
            <button 
              onClick={() => setActiveTab('arena')} 
              className="px-10 py-4 bg-[#10b981] text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-95 transition-all"
            >
              Enter Arena
            </button>
          </div>
        )}

        {/* --- TAMPILAN: ARENA --- */}
      {/* --- TAMPILAN: ARENA --- */}
        {activeTab === 'arena' && (
          selectedProfile ? (
            /* --- 1. BOX PEMBUNGKUS UTAMA PROFIL (BIAR GAK ERROR PARENT) --- */
          <div className="h-full w-full bg-black overflow-y-auto no-scrollbar animate-fade-in relative font-sans">
              
              {/* HEADER (BACK BUTTON) */}
              <div className="sticky top-0 bg-[#080808]/80 backdrop-blur-md z-40 px-4 py-3 flex items-center justify-between border-b border-white/5">
                <button onClick={() => setSelectedProfile(null)} className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Market Profile</div>
                <button className="px-5 py-1.5 bg-[#10b981] text-black font-black text-[9px] uppercase tracking-widest rounded-lg">Trade</button>
              </div>

              <div className="max-w-4xl mx-auto pb-40">
               
{/* --- 2. DISCORD STYLE BANNER (SHRUNK & NO GLOW) --- */}
              <div className="relative h-40 md:h-52 w-full overflow-hidden border-b border-white/5 group">
                
                {/* Background Layer */}
                <div className="absolute inset-0 bg-[#0a0a0a]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/30 via-black to-black opacity-90"></div>
                  <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-emerald-500/10 blur-[120px] rounded-full"></div>
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent z-10 flex items-end p-6 md:px-8 pb-5">
                  <div className="flex items-center gap-4">
                    
                    {/* Badge: UKURAN DIPERKECIL & GLOW DIHAPUS */}
                    <div className="relative z-20">
                      <TitanBadge size={typeof window !== 'undefined' && window.innerWidth < 768 ? 45 : 65} />
                    </div>

                  {/* Nama: ULTRA CLEAN X-STYLE */}
                    <div>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <h1 className="text-xl md:text-2xl font-sans font-bold text-white leading-tight tracking-tight">
                          {selectedProfile.name}
                        </h1>
                        
                        {/* ICON CENTANG BIRU TETAP ADA */}
                        <div className="bg-[#1d9bf0] rounded-full flex items-center justify-center w-[14px] h-[14px] md:w-[18px] md:h-[18px] shrink-0">
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-[8px] h-[8px] md:w-[10px] md:h-[10px]">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      </div>

                      {/* Metadata: Protocol Badge + Rank Indicator */}
<div className="flex items-center gap-3 mt-2">
  {/* Protocol Badge */}
  <span className="text-[8px] md:text-[9px] font-black bg-white/10 text-zinc-300 border border-white/10 px-2 py-0.5 rounded uppercase tracking-widest backdrop-blur-sm opacity-80">
    {selectedProfile.protocol}
  </span>

  {/* Rank Label - Warna Orange senada dengan Arena */}
  <div className="flex items-center gap-2 border-l border-white/10 pl-3">
    <span className="text-[10px] md:text-[11px] font-black text-orange-500 uppercase tracking-[0.2em] italic">
      Rank {rankedQuants.findIndex(rq => rq.id === selectedProfile.id) + 1}
    </span>
  </div>
</div>
                    </div>

                  </div>
                </div>
              </div>
              {/* --- END BANNER --- */}
              {/* 3. SOCIAL METRICS SECTION (X-STYLE - FULL BLACK) */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-8 bg-black relative z-20">
                
                {/* Following Metric */}
                <div className="flex items-center gap-2 cursor-pointer group">
                  <span className="text-xl font-black text-white tracking-tight">128</span>
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest group-hover:underline decoration-zinc-700">Following</span>
                </div>

                {/* Followers Metric */}
                <div className="flex items-center gap-2 cursor-pointer group">
                  <span className="text-xl font-black text-white tracking-tight">15.4K</span>
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest group-hover:underline decoration-zinc-700">Followers</span>
                </div>

                {/* Verified Strategy Tag (Optional Add-on for more X vibe) */}
                <div className="ml-auto hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Active Signal</span>
                </div>
              </div>

                {/* NAVIGATION TABS */}
                <div className="flex items-center gap-8 px-6 border-b border-white/5 overflow-x-auto no-scrollbar mb-8">
                  {profileTabs.map((tab, i) => (
                    <button key={i} className={`py-4 text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap border-b-2 transition-all ${i === 0 ? 'text-white border-[#10b981]' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}>{tab}</button>
                  ))}
                </div>

                {/* 5. IMMERSIVE CHART (PERFORMANCE OVERLAY) */}
              <div className="w-full h-[400px] md:h-[600px] relative mb-10 overflow-hidden border-y border-white/5">
                
                {/* --- OVERLAY PERFORMA POJOK KIRI ATAS --- */}
                <div className="absolute top-6 left-6 z-20 pointer-events-none">
                  <div className={`text-2xl md:text-4xl font-black italic tracking-tighter ${profitColor}`} 
                       style={{ textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
                    {selectedProfile.profitValue >= 0 ? '+' : ''}{selectedProfile.profitValue.toFixed(2)}%
                  </div>
                  <div className="text-[8px] md:text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mt-1">
                    All-Time Performance
                  </div>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedProfile.history} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tradingViewFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={selectedProfile.color} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={selectedProfile.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                    <YAxis 
                      orientation="right" 
                      mirror={true} 
                      domain={['dataMin', 'auto']} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#444', fontSize: 11, fontWeight: '900' }}
                      tickFormatter={(val) => `$${val.toFixed(0)}`}
                    />
                    <XAxis dataKey="date" hide />
                    <Tooltip content={<CustomBenchmarkTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={selectedProfile.color} 
                      strokeWidth={3} 
                      fill="url(#tradingViewFill)" 
                      dot={false}
                      connectNulls={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

             {/* TIKTOK GRID CONTAINER (THE MASTER CLEAN - NO TEXT, NO CIRCLES) */}
                <div className="grid grid-cols-2 gap-px bg-white/5 min-h-[500px]">
                  
                  {[1, 2, 3, 4].map((item) => (
                    <div 
                      key={item} 
                      className="aspect-[9/12] relative bg-[#050505] flex flex-col items-center justify-center overflow-hidden group cursor-pointer"
                    >
                      {/* 1. HOVER OVERLAY: Sangat tipis hanya untuk feedback klik */}
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.01] transition-colors z-10"></div>
                      
                      {/* 2. KONTEN PUSAT: HANYA PLAY & SOON */}
                      <div className="relative z-20 flex flex-col items-center gap-6">
                        
                        {/* ICON PLAY: Ukuran Raksasa (64px), Tanpa Background, Tanpa Bulatan */}
                        <div className="opacity-10 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700 ease-out">
                          <Play size={64} fill="white" className="text-white" />
                        </div>

                        {/* TEXT SOON: Tanpa sub-teks Content #1 di bawahnya */}
                        <div className="text-3xl md:text-5xl font-black italic tracking-tighter text-white/5 uppercase select-none group-hover:text-white/15 transition-all duration-500">
                          Soon
                        </div>
                      </div>

                      {/* --- SEMUA ELEMEN SAMPING & ANGKA DI BAWAH SUDAH DIHAPUS TOTAL --- */}
                    </div>
                  ))}

                </div>
              </div>
            </div>
          ) : (
           /* --- TAMPILAN FEED ARENA (TIKTOK STYLE) --- */
            <div ref={scrollRef} onScroll={handleInfiniteScroll} className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black">
              {[...quants, ...quants, ...quants].map((q, idx) => {
                // 1. HITUNG RANK DI SINI (Sekarang aman karena pake kurung kurawal {})
                const agentRank = (rankedQuants.findIndex(rq => rq.id === q.id) + 1) || '-';

                return (
                  <section key={`${q.id}-${idx}`} className="h-full w-full snap-start relative flex flex-col overflow-hidden bg-black">
                    {/* BACKGROUND CHART */}
                    <div className="absolute inset-0 z-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={q.history} margin={{ top: 120, right: 0, left: 0, bottom: 96 }}>
                          <defs>
                            <linearGradient id={`g-${q.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={q.color} stopOpacity={0.6}/>
                              <stop offset="100%" stopColor={q.color} stopOpacity={0.05}/>
                            </linearGradient>
                          </defs>
                          <YAxis hide domain={['auto', 'auto']} />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke={q.color} 
                            strokeWidth={3} 
                            fill={`url(#g-${q.id})`} 
                            dot={false}
                            style={{ filter: `drop-shadow(0 0 15px ${q.color}44)` }} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* --- INFO AGEN: X STYLE DENGAN CENTANG BIRU & RANK --- */}
                    <div className="absolute top-10 left-6 md:top-20 md:left-20 z-20 pointer-events-none">
                      <div className="flex items-center gap-4 md:gap-6 mb-6">
                        <TitanBadge size={typeof window !== 'undefined' && window.innerWidth < 768 ? 45 : 75} /> 
                        
                        <div className="flex flex-col justify-center">
                          <div className="flex items-center gap-2 md:gap-3">
                            <h2 className="text-2xl md:text-5xl font-sans font-bold text-white tracking-tight leading-none">
                              {q.name}
                            </h2>
                            {/* Centang Biru X-Style */}
                            <div className="bg-[#1d9bf0] rounded-full flex items-center justify-center w-[16px] h-[16px] md:w-[24px] md:h-[24px] shrink-0 shadow-[0_0_15px_rgba(29,155,240,0.3)]">
                              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-[10px] h-[10px] md:w-[14px] md:h-[14px]">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          </div>

                          {/* Label Rank di Bawah Nama - WARNA ORANGE */}
<div className="mt-2 flex items-center gap-2 opacity-90">
  {/* Garis kecil di samping tulisan Rank */}
  <div className="h-[1px] w-4 bg-orange-500/50"></div>
  <span className="text-[10px] md:text-sm font-black text-orange-500 uppercase tracking-[0.4em] italic">
    Rank {agentRank}
  </span>
</div>
                        </div>
                      </div>

                      {/* Profit Value */}
                      <div className={`text-5xl md:text-[140px] font-black italic tracking-tighter leading-none mb-3 md:mb-6 ${q.profitValue >= 0 ? 'text-[#10b981]' : 'text-red-500'}`} style={{ textShadow: '0 0 30px rgba(16,185,129,0.4), 0 4px 15px rgba(0,0,0,0.8)' }}>
                        {(q.profitValue || 0) >= 0 ? '+' : ''}{q.profitValue.toFixed(2)}%
                      </div>

                      <div className="flex items-center gap-3 md:gap-6 text-[9px] md:text-sm font-bold text-white/40 uppercase tracking-[0.2em]">
                        <span>{q.protocol}</span><span className="w-1 h-1 bg-white/10 rounded-full"></span><span>{formatCurrency(q.tvl)} TVL</span>
                      </div>
                    </div>

                    <div className="absolute bottom-28 right-6 md:bottom-40 md:right-20 z-20">
                      <button onClick={() => setSelectedProfile(q)} className="px-8 py-3.5 md:px-12 md:py-5 bg-white text-black font-black uppercase text-[10px] md:text-xs tracking-widest rounded-xl md:rounded-2xl shadow-2xl active:scale-90 transition-all flex items-center gap-3 group">
                        Analyze <ArrowRight size={16} />
                      </button>
                    </div>
                  </section>
                );
              })}
            </div>
          )
        )}

       

       {/* --- TAMPILAN: ANALYTICS --- */}
        {activeTab === 'benchmark' && (
          <div className="h-full w-full p-5 md:p-12 overflow-y-auto no-scrollbar animate-fade-in bg-black">
            <div className="max-w-6xl mx-auto w-full space-y-8 md:space-y-12 pb-32">
              
              {/* Stats Grid - Sekarang cuma 1 kolom (TVL Saja) */}
              <div className="grid grid-cols-1 gap-4 md:gap-8">
                <div className="bg-white/[0.02] border border-white/5 rounded-[30px] md:rounded-[40px] p-8 flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={100} className="text-[#10b981]" /></div>
                  <h2 className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] mb-3">Network TVL</h2>
                  <div className="text-3xl md:text-7xl font-black italic tracking-tighter leading-none group-hover:scale-105 transition-transform duration-700">{formatCurrency(totalTVL)}</div>
                </div>
      
              
              </div>

              {/* Title & Filters */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
               <h1 className="text-4xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">THE BIG 5</h1>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                   {quants.map(q => (
                     <button 
                      key={q.id}
                      onClick={() => setVisibleStrategies(prev => ({...prev, [q.id]: !prev[q.id]}))}
                      className={`whitespace-nowrap px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${visibleStrategies[q.id] ? 'bg-[#10b981] text-black border-[#10b981]' : 'bg-transparent text-zinc-600 border-white/10'}`}
                     >
                        {q.name}
                     </button>
                   ))}
                </div>
              </div>

          {/* Multi-Agent Chart: Profile Style Implementation (FULL BLACK) */}
              <div className="w-full bg-black border-y border-white/5 py-0 select-none overflow-hidden h-[350px] md:h-[500px] relative">
                <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={benchmarkData} margin={{ top: 0, right: 0, left: 0, bottom: -1 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis 
                      orientation="right" 
                      mirror={true} 
                      domain={['dataMin - 10', 'auto']} 
                      hide={false} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#333', fontSize: 10, fontWeight: '900' }}
                      tickCount={6}
                    />
                    
                    <Tooltip content={<CustomBenchmarkTooltip />} shared={true} />

                    {quants.map(q => visibleStrategies[q.id] && (
                      <Area 
                        key={q.id} 
                        type="monotone" 
                        dataKey={q.id} 
                        stroke={q.color} 
                        strokeWidth={2} 
                        fill="none"
                        dot={false} 
                        connectNulls={true} 
                        isAnimationActive={false} 
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* --- 4. INTEGRASI LEADERBOARD (STOCKS STYLE) --- */}
              <div className="mt-16 animate-fade-in border-t border-white/5 pt-12">
                
                {/* Header Global Rankings */}
                <div className="flex justify-between items-end mb-8 px-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Global Rankings</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Live Alpha Stream</span>
                  </div>
                </div>

              <div className="flex flex-col">
                 {rankedQuants.map((q, idx) => (
  <div 
    key={q.id} 
    onClick={() => { setSelectedProfile(q); setActiveTab('arena'); }}
    className="group flex items-center justify-between py-4 md:py-7 border-b border-white/[0.03] hover:bg-white/[0.01] transition-all cursor-pointer px-2 gap-4"
  >
    {/* BAGIAN KIRI: IDENTITY */}
    <div className="flex items-center gap-4 flex-1">
      <span className="text-[10px] font-black text-zinc-800 italic w-4 group-hover:text-[#10b981]">
        {(idx + 1).toString().padStart(2, '0')}
      </span>
      <div className="shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
        <TitanBadge size={35} />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-base md:text-xl font-sans font-bold text-white tracking-tight leading-none italic">
            {q.name}
          </span>
          <div className="bg-[#1d9bf0] rounded-full flex items-center justify-center w-[12px] h-[12px] shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-[8px] h-[8px]">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    {/* BAGIAN KANAN: ROI */}
    <div className="flex items-center justify-end ml-4">
      <div className={`px-2.5 py-1.5 rounded-[4px] text-[13px] font-black min-w-[85px] text-center shadow-lg transition-all ${
        (q?.profitValue || 0) >= 0 ? 'bg-[#10b981] text-black' : 'bg-red-500 text-white'
      }`}>
        {(q?.profitValue || 0) >= 0 ? '+' : ''}{(q?.profitValue || 0).toFixed(2)}%
      </div>
    </div>
  </div>
))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAMPILAN: VAULT --- */}
        {activeTab === 'portofolio' && (
          <div className="h-full w-full p-8 bg-black animate-fade-in flex flex-col items-center justify-center text-center">
             <Wallet size={60} className="text-zinc-800 mb-6" />
             <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-3 text-white">VAULT ENCRYPTED</h1>
             <p className="max-w-[240px] text-[9px] text-zinc-500 uppercase tracking-widest leading-relaxed mb-8">Connect infrastructure wallet to view positions.</p>
             <button onClick={() => setWalletConnected(!walletConnected)} className="px-10 py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl active:scale-95 shadow-2xl">
               {walletConnected ? '0x82...3B21 Connected' : 'Connect Private Key'}
             </button>
          </div>
        )}

      </main>

      {/* --- NAVIGASI BAWAH --- */}
      <nav className="absolute bottom-0 left-0 w-full h-20 md:h-24 bg-black/60 backdrop-blur-3xl border-t border-white/5 flex items-center justify-between px-2 md:px-4 z-[100] pb-4 md:pb-6">
          <div className="flex w-full max-w-5xl justify-between items-center mx-auto">
            <NavItem id="arena" icon={<LayoutGrid />} label="Arena" />
            <NavItem id="home" icon={<Home />} label="Home" />
            <NavItem id="benchmark" icon={<BarChart3 />} label="Analytics" />
            <NavItem id="portofolio" icon={<Briefcase />} label="Vault" />
          </div>
      </nav>

      {/* HOME INDICATOR */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/10 rounded-full z-[110] md:hidden"></div>

      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@900&display=swap');
        
        /* Buat class khusus untuk font nama agen */
        .font-agent { font-family: 'Outfit', sans-serif; }
        .srs-glow { text-shadow: 0 0 15px rgba(16,185,129,0.3); }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        * { -webkit-tap-highlight-color: transparent; outline: none; }
        body { margin: 0; background: #050505; color: white; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default App;