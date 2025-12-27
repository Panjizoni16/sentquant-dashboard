import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { User, ShieldCheck, Zap, LayoutGrid, Award, BarChart3, Briefcase, ChevronDown } from 'lucide-react';

// 1. DAFTAR AGEN STRATEGI
const STRATEGIES_CONFIG = [
  { id: 'sentquant', name: 'Sentquant Core', protocol: 'Sentquant', color: '#f3f4f5' },
  { id: 'systemic_hyper', name: 'Systemic Hyper', protocol: 'Hyperliquid', color: '#10b981' },
  { id: 'jlp_neutral', name: 'JLP Delta Neutral', protocol: 'Drift', color: '#a5b4fc' },
  { id: 'guineapool', name: 'Guinea Pool', protocol: 'Lighter', color: '#f59e0b' },
  { id: 'edgehedge', name: 'Edge and Hedge', protocol: 'Lighter', color: '#ebfd4a' },
  { id: 'systemicls', name: 'Systemic Strategies L/S', protocol: 'Hyperliquid', color: '#6366f1' }
];

const App = () => {
  const [activeTab, setActiveTab] = useState('arena');
  const [quants, setQuants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleStrategies, setVisibleStrategies] = useState({});

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val || 0);

  useEffect(() => {
    const fetchData = async () => {
      const results = await Promise.all(STRATEGIES_CONFIG.map(async (strat) => {
        try {
          const res = await fetch(`/data/live-data-${strat.id}.json`);
          const json = await res.json();
          const data = json[strat.id];
          const latest = data.liveData[data.liveData.length - 1];
          return { ...strat, profitValue: ((latest.value - 1000) / 1000) * 100, tvl: data.tvl, history: data.liveData, bio: strat.bio || "Quantitative Infrastructure." };
        } catch { return null; }
      }));
      const filtered = results.filter(r => r !== null).sort((a, b) => b.profitValue - a.profitValue);
      setQuants(filtered);
      filtered.forEach(q => setVisibleStrategies(p => ({...p, [q.id]: true})));
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalTVL = useMemo(() => quants.reduce((acc, curr) => acc + (curr.tvl || 0), 0), [quants]);
  const benchmarkData = useMemo(() => {
    if (!quants.length) return [];
    const times = [...new Set(quants.flatMap(q => q.history.map(h => h.timestamp || h.date)))].sort();
    return times.map(time => {
      const p = { time };
      quants.forEach(q => { const m = q.history.find(h => (h.timestamp || h.date) === time); p[q.id] = m ? m.value : null; });
      return p;
    });
  }, [quants]);

  if (loading) return <div className="h-[100dvh] bg-black flex items-center justify-center text-white font-black italic animate-pulse">SYNCING ARENA...</div>;

  return (
    <div className="h-[100dvh] w-screen bg-black text-white overflow-hidden flex flex-col relative font-sans">
      <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
        
        {/* ARENA: REAL TIKTOK STYLE FULLSCREEN CHARTS */}
        {activeTab === 'arena' && (
          <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
            {quants.map((q, idx) => (
              <section key={q.id} className="h-full w-full snap-start relative flex flex-col">
                
                {/* 1. BACKGROUND CHART (THE "VIDEO" CONTENT) */}
                <div className="absolute inset-0 z-0 opacity-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={q.history} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`glow-${q.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={q.color} stopOpacity={0.6}/>
                          <stop offset="80%" stopColor={q.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <YAxis hide domain={['auto', 'auto']} />
                      <Area type="monotone" dataKey="value" stroke={q.color} strokeWidth={6} fill={`url(#glow-${q.id})`} dot={false} animationDuration={2000} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* 2. OVERLAY UI (THE "TEXT" ON VIDEO) */}
                <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none">
                  <div className="space-y-4 mb-24 max-w-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                        <User size={24} className="text-white" />
                      </div>
                      <span className="px-4 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                        RANK #{idx + 1}
                      </span>
                    </div>

                    <h3 className="text-6xl md:text-[140px] font-black italic leading-tight tracking-tighter uppercase drop-shadow-2xl">
                      {q.name}
                    </h3>

                    <div className="flex flex-col gap-1">
                      <div className="text-emerald-400 font-mono text-2xl md:text-5xl font-bold tracking-tighter">
                        {q.profitValue.toFixed(2)}% <span className="text-white/20 text-xs md:text-xl font-black italic">PROFIT</span>
                      </div>
                      <div className="flex items-center gap-4 text-white/40 font-black italic tracking-widest text-[10px] md:text-lg">
                        <span>{q.protocol} PROTOCOL</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                        <span>{formatCurrency(q.tvl)} TVL</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vertical Swipe Indicator */}
                <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-2 opacity-20">
                  {quants.map((_, i) => (
                    <div key={i} className={`w-1 rounded-full transition-all ${i === idx ? 'h-8 bg-white' : 'h-4 bg-white/50'}`} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* --- TAB BENCHMARK (TETAP SAMA TAPI RESPONSIVE) --- */}
        {activeTab === 'benchmark' && (
          <div className="h-full w-full p-6 md:p-12 overflow-y-auto no-scrollbar animate-fade-in flex flex-col items-center">
            <div className="max-w-[1400px] w-full space-y-10 pb-32">
              <div className="w-full bg-white/[0.02] border border-white/10 rounded-[40px] p-8 md:p-16 text-center flex flex-col items-center justify-center space-y-3 backdrop-blur-xl">
                <h2 className="text-[10px] md:text-sm font-bold text-white/30 uppercase tracking-[0.4em]">Total Tracked TVL</h2>
                <div className="text-4xl md:text-9xl font-black italic tracking-tighter">{formatCurrency(totalTVL)}</div>
                <p className="text-[10px] font-bold text-white/20 tracking-widest italic uppercase">Global Multi-Agent Infrastructure</p>
              </div>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
                <h1 className="text-6xl md:text-[100px] font-black italic tracking-tighter uppercase leading-none">COMPARISON</h1>
                <button className="px-10 py-5 bg-neutral-900 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-white shadow-2xl">Filter Agents</button>
              </div>
              <div className="h-[400px] md:h-[600px] bg-white/[0.01] border border-white/5 rounded-[60px] p-8 md:p-16">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={benchmarkData}>
                    <defs>
                      {quants.map(q => (
                        <linearGradient key={q.id} id={`grad-bench-${q.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={q.color} stopOpacity={0.4}/><stop offset="95%" stopColor={q.color} stopOpacity={0}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="white" strokeOpacity={0.03} vertical={false} />
                    <XAxis dataKey="time" hide /><YAxis domain={['auto', 'auto']} hide />
                    {quants.map(q => visibleStrategies[q.id] && (
                      <Area key={q.id} type="monotone" dataKey={q.id} stroke={q.color} strokeWidth={4} fill={`url(#grad-bench-${q.id})`} dot={false} connectNulls />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION */}
        <nav className="flex-none h-24 md:h-32 w-full bg-black/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-center px-8 z-[100]">
           <div className="flex w-full max-w-5xl justify-between items-center relative">
             <div className="flex gap-10 md:gap-16">
               <NavItem active={activeTab === 'arena'} icon={<LayoutGrid size={24} />} label="Arena" onClick={() => setActiveTab('arena')} />
               <NavItem active={activeTab === 'rank'} icon={<Award size={24} />} label="Rank" onClick={() => setActiveTab('rank')} />
             </div>
             <div className="relative -top-10">
               <button onClick={() => setActiveTab('home')} className={`w-20 h-20 rounded-full bg-neutral-950 border border-white/10 flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 ${activeTab === 'home' ? 'border-white shadow-[0_0_50px_rgba(255,255,255,0.3)]' : ''}`}>
                 <Zap size={32} className={activeTab === 'home' ? 'text-white fill-current' : 'text-white/20'} />
               </button>
             </div>
             <div className="flex gap-10 md:gap-16">
               <NavItem active={activeTab === 'benchmark'} icon={<BarChart3 size={24} />} label="Analytic" onClick={() => setActiveTab('benchmark')} />
               <NavItem active={activeTab === 'portofolio'} icon={<Briefcase size={24} />} label="Portfolio" onClick={() => setActiveTab('portofolio')} />
             </div>
           </div>
        </nav>
      </main>

      <style>{`
        .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;