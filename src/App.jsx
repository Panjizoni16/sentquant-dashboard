import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, BarChart as RechartsBarChart, Bar, Cell, LineChart, Line
} from 'recharts';
import { 
  User, ShieldCheck, Zap, ChevronLeft, LayoutGrid, Award, 
  BarChart3, Briefcase, ArrowLeft, ArrowRight, ChevronDown, Shield, 
  Calendar, MapPin, Link as LinkIcon, Cpu, Globe, TrendingUp, Wallet, Home
} from 'lucide-react';

// ==========================================
// 1. DATA MOCK & KONFIGURASI
// ==========================================
const STRATEGIES_CONFIG = [
  { id: 'sentquant', name: 'Sentquant Core', protocol: 'Sentquant', color: '#10b981', bio: "Mesin kuantitatif utama.", risk: "Low" },
  { id: 'systemic_hyper', name: 'Systemic Hyper', protocol: 'Hyperliquid', color: '#10b981', bio: "HFT market making pada Hyperliquid L1.", risk: "Medium" },
  { id: 'jlp_neutral', name: 'JLP Delta Neutral', protocol: 'Drift', color: '#10b981', bio: "Mesin arbitrase funding rate.", risk: "Low" },
  { id: 'guineapool', name: 'Guinea Pool', protocol: 'Lighter', color: '#10b981', bio: "Likuiditas dengan proteksi MEV.", risk: "High" },
  { id: 'edgehedge', name: 'Edge and Hedge', protocol: 'Lighter', color: '#10b981', bio: "Hedging terarah volatilitas.", risk: "Medium" },
  { id: 'systemicls', name: 'Systemic L/S', protocol: 'Hyperliquid', color: '#10b981', bio: "Rebalancing algoritmik L/S.", risk: "Medium" }
];

const generateHistory = (baseValue = 1000, points = 60, volatility = 0.015) => {
  let current = baseValue;
  const history = [];
  const now = new Date();
  for (let i = points; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const direction = Math.random() > 0.45 ? 1 : -0.9; 
    const change = current * (Math.random() * volatility * direction);
    current += change;
    history.push({ date: date.toISOString().split('T')[0], value: parseFloat(current.toFixed(2)) });
  }
  return history;
};

// ==========================================
// 2. KOMPONEN DASHBOARD UTAMA
// ==========================================
const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [quants, setQuants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [visibleStrategies, setVisibleStrategies] = useState({});

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
        const initialVisible = {};
        fetchedData.forEach(q => (initialVisible[q.id] = true));
        setVisibleStrategies(initialVisible);
      } catch (error) {
        console.error("Gagal inisialisasi Arena:", error);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const totalTVL = useMemo(() => quants.reduce((acc, curr) => acc + (curr.tvl || 0), 0), [quants]);
  
 const benchmarkData = useMemo(() => {
    if (!quants.length || quants.every(q => q.history.length === 0)) return [];
    
    // CLUE: Mencari strategi dengan jumlah data terbanyak sebagai acuan waktu (Timeline)
    const longestHistory = quants.reduce((prev, current) => 
      (prev.history.length > current.history.length) ? prev : current
    ).history;

    return longestHistory.map((h, i) => {
      const point = { time: h.date };
      quants.forEach(q => {
        // Kita cari data yang tanggalnya cocok atau ambil indeks yang tersedia
        const dataPoint = q.history.find(d => d.date === h.date) || q.history[i];
        point[q.id] = dataPoint ? dataPoint.value : null;
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
        {activeTab === 'arena' && (
          selectedProfile ? (
            /* DETAIL PROFIL */
            <div className="h-full w-full overflow-y-auto no-scrollbar p-5 md:p-12 pb-32 animate-fade-in bg-black">
              <div className="max-w-4xl mx-auto space-y-8">
                <button 
                  onClick={() => setSelectedProfile(null)} 
                  className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors active:scale-95"
                >
                  <ArrowLeft size={16}/> 
                  <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
                </button>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-8 gap-4">
                  <div>
                    <h1 className="text-3xl md:text-7xl font-black italic uppercase tracking-tighter mb-1">{selectedProfile.name}</h1>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
                      <span className="text-[9px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest">Live • {selectedProfile.protocol}</span>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-[#10b981] text-4xl md:text-7xl font-black italic tracking-tighter" style={{ textShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
                      +{selectedProfile.profitValue.toFixed(2)}%
                    </div>
                    <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.1em]">Performance</div>
                  </div>
                </div>

                <div className="h-56 md:h-96 bg-zinc-900/30 border border-white/5 rounded-[30px] p-4 md:p-8 relative overflow-hidden">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedProfile.history}>
                        <defs>
                          <linearGradient id="detailGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.5}/>
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <filter id="neonFilter"><feGaussianBlur stdDeviation="3" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
                        </defs>
                        <YAxis hide domain={['auto', 'auto']} />
                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#detailGlow)" filter="url(#neonFilter)" dot={false} />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                   <div className="bg-white/5 p-5 md:p-8 rounded-2xl border border-white/10 text-center">
                     <div className="text-[8px] md:text-[10px] text-zinc-500 uppercase mb-1">NAV</div>
                     <div className="text-base md:text-2xl font-black italic">$1,240.50</div>
                   </div>
                   <div className="bg-white/5 p-5 md:p-8 rounded-2xl border border-white/10 text-center">
                     <div className="text-[8px] md:text-[10px] text-zinc-500 uppercase mb-1">Risk</div>
                     <div className="text-base md:text-2xl font-black italic text-[#10b981]">{selectedProfile.risk}</div>
                   </div>
                   <div className="hidden md:block bg-white/5 p-8 rounded-2xl border border-white/10 text-center">
                     <div className="text-[10px] text-zinc-500 uppercase mb-1">TVL</div>
                     <div className="text-2xl font-black italic">{formatCurrency(selectedProfile.tvl)}</div>
                   </div>
                </div>

                <button className="w-full py-4 md:py-6 bg-white text-black font-black uppercase text-[10px] md:text-xs tracking-[0.2em] rounded-2xl active:scale-[0.98] transition-all">
                  Allocate Capital
                </button>
              </div>
            </div>
          ) : (
            /* FEED ARENA (TIKTOK STYLE) */
            <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black">
              {quants.map((q, idx) => (
                <section key={q.id} className="h-full w-full snap-start relative flex flex-col overflow-hidden bg-black">
                  <div className="absolute inset-0 z-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={q.history} margin={{ top: 120, right: 0, left: 0, bottom: 96 }}>
                        <defs>
                          <linearGradient id={`g-${q.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.7}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.15}/>
                          </linearGradient>
                          <filter id="arenaNeon"><feGaussianBlur stdDeviation="4" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
                        </defs>
                        <YAxis hide domain={['auto', 'auto']} />
                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill={`url(#g-${q.id})`} dot={false} filter="url(#arenaNeon)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="absolute top-10 left-6 md:top-20 md:left-20 z-20 pointer-events-none">
                    <div className="flex items-center gap-3 mb-2 md:mb-4">
                       <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-black border border-[#10b981]/20 flex items-center justify-center">
                          <User size={18} className="text-[#10b981]/40" />
                       </div>
                       <span className="text-[8px] md:text-[12px] font-black uppercase tracking-[0.4em] text-[#10b981]/60">RANK #{idx+1}</span>
                    </div>
                    
                    <h2 className="text-2xl md:text-7xl font-black italic uppercase text-white mb-2 md:mb-6 tracking-tighter leading-tight">{q.name}</h2>
                    
                    <div className={`text-5xl md:text-[140px] font-black italic tracking-tighter leading-none mb-3 md:mb-6 ${q.profitValue >= 0 ? 'text-[#10b981]' : 'text-red-500'}`} 
                         style={{ textShadow: '0 0 30px rgba(16,185,129,0.4), 0 4px 15px rgba(0,0,0,0.8)' }}>
                      +{q.profitValue.toFixed(2)}%
                    </div>
                    
                    <div className="flex items-center gap-3 md:gap-6 text-[9px] md:text-sm font-bold text-white/40 uppercase tracking-[0.2em]">
                      <span>{q.protocol}</span>
                      <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                      <span>{formatCurrency(q.tvl)} TVL</span>
                    </div>
                  </div>

                  <div className="absolute bottom-28 right-6 md:bottom-40 md:right-20 z-20">
                    <button 
                      onClick={() => setSelectedProfile(q)} 
                      className="px-8 py-3.5 md:px-12 md:py-5 bg-white text-black font-black uppercase text-[10px] md:text-xs tracking-widest rounded-xl md:rounded-2xl shadow-2xl active:scale-90 transition-all flex items-center gap-3 group"
                    >
                      Analyze <ArrowRight size={16} />
                    </button>
                  </div>
                  
                  {/* TIGA TOMBOL SAMPING TELAH DIHAPUS DARI SINI */}
                </section>
              ))}
            </div>
          )
        )}

        {/* --- TAMPILAN: RANK --- */}
        {activeTab === 'rank' && (
          <div className="h-full w-full overflow-y-auto no-scrollbar p-5 md:p-8 bg-black animate-fade-in">
             <div className="max-w-4xl mx-auto pb-32">
                <h1 className="text-3xl md:text-7xl font-black italic uppercase tracking-tighter mb-8 text-center">LEADERBOARD</h1>
                <div className="space-y-3">
                  {quants.map((q, i) => (
                    <div key={q.id} onClick={() => {setSelectedProfile(q); setActiveTab('arena');}} className="flex items-center justify-between p-4 md:p-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md active:bg-white/5 transition-all">
                      <div className="flex items-center gap-4 md:gap-8">
                        <span className="text-lg md:text-3xl font-black font-mono text-zinc-800">0{i+1}</span>
                        <div>
                          <div className="text-sm md:text-2xl font-black italic uppercase text-white leading-none">{q.name}</div>
                          <div className="text-[8px] md:text-[10px] text-zinc-600 uppercase mt-1 tracking-widest">{q.protocol} Protocol</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm md:text-3xl font-black italic text-[#10b981]">+{q.profitValue.toFixed(2)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

        {/* --- TAMPILAN: ANALYTICS --- */}
        {activeTab === 'benchmark' && (
          <div className="h-full w-full p-5 md:p-12 overflow-y-auto no-scrollbar animate-fade-in bg-black">
            <div className="max-w-6xl mx-auto w-full space-y-8 md:space-y-12 pb-32">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="bg-white/[0.02] border border-white/5 rounded-[30px] md:rounded-[40px] p-8 flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={100} className="text-[#10b981]" /></div>
                  <h2 className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] mb-3">Network TVL</h2>
                  <div className="text-3xl md:text-7xl font-black italic tracking-tighter leading-none group-hover:scale-105 transition-transform duration-700">{formatCurrency(totalTVL)}</div>
                </div>
                <div className="bg-zinc-900 border border-emerald-500/10 rounded-[30px] md:rounded-[40px] p-8 flex flex-col justify-center relative overflow-hidden">
                  <h2 className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] mb-3">Network Alpha</h2>
                  <div className="text-3xl md:text-7xl font-black italic tracking-tighter leading-none text-[#10b981]">+$2.18M</div>
                </div>
              </div>

              {/* Title & Filters */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <h1 className="text-4xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">ALPHA TREND</h1>
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

              {/* Multi-Agent Chart */}
              <div className="h-[350px] md:h-[550px] bg-black border border-white/5 rounded-[40px] md:rounded-[60px] p-6 md:p-10 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={benchmarkData}>
                    <defs>
                      <filter id="neonBench" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#111" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#000', border: '1px solid #10b981', borderRadius: '15px', fontSize: '10px'}}
                      labelStyle={{marginBottom: '8px', color: '#666'}}
                    />
                    {quants.map(q => visibleStrategies[q.id] && (
                      <Area 
                        key={q.id} 
                        type="monotone" 
                        dataKey={q.id} 
                        stroke="#10b981" 
                        strokeWidth={2.5} 
                        fill="none" 
                        dot={false} 
                        filter="url(#neonBench)"
                        animationDuration={1500}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
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
            <NavItem id="rank" icon={<Award />} label="Rank" />
            <NavItem id="home" icon={<Home />} label="Home" />
            <NavItem id="benchmark" icon={<BarChart3 />} label="Analytics" />
            <NavItem id="portofolio" icon={<Briefcase />} label="Vault" />
          </div>
      </nav>

      {/* HOME INDICATOR */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/10 rounded-full z-[110] md:hidden"></div>

      <style>{`
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