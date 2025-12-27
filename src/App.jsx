import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { 
  User, ShieldCheck, Zap, ChevronRight, 
  LayoutGrid, Award, BarChart3, Briefcase, Filter, ChevronDown
} from 'lucide-react';

// ==========================================
// 1. CONFIG: DAFTAR AGEN STRATEGI
// ==========================================
const STRATEGIES_CONFIG = [
  { id: 'sentquant', name: 'Sentquant Core', protocol: 'Sentquant', color: '#f3f4f5' },
  { id: 'systemic_hyper', name: 'Systemic Hyper', protocol: 'Hyperliquid', color: '#10b981' },
  { id: 'jlp_neutral', name: 'JLP Delta Neutral', protocol: 'Drift', color: '#a5b4fc' },
  { id: 'guineapool', name: 'Guinea Pool', protocol: 'Lighter', color: '#f59e0b' },
  { id: 'edgehedge', name: 'Edge and Hedge', protocol: 'Lighter', color: '#ebfd4a' },
  { id: 'systemicls', name: 'Systemic Strategies L/S', protocol: 'Hyperliquid', color: '#6366f1' }
];

// ==========================================
// 2. HELPER COMPONENTS
// ==========================================
const NavItem = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'scale-110 opacity-100' : 'opacity-40 hover:opacity-70'}`}>
    <div className={`p-1 ${active ? 'text-white' : 'text-zinc-500'}`}>{icon}</div>
    <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${active ? 'text-white' : 'text-zinc-600'}`}>{label}</span>
  </button>
);

// ==========================================
// 3. MAIN APP
// ==========================================
const App = () => {
  const [activeTab, setActiveTab] = useState('arena');
  const [quants, setQuants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleStrategies, setVisibleStrategies] = useState({});

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { 
    style: 'currency', currency: 'USD', minimumFractionDigits: 0 
  }).format(val || 0);

  useEffect(() => {
    const fetchData = async () => {
      const results = await Promise.all(
        STRATEGIES_CONFIG.map(async (strat) => {
          try {
            const res = await fetch(`/data/live-data-${strat.id}.json`);
            if (!res.ok) throw new Error();
            const json = await res.json();
            const data = json[strat.id];
            const live = data.liveData;
            const latest = live[live.length - 1];
            const profit = ((latest.value - 1000) / 1000) * 100;
            return {
              ...strat,
              profitValue: profit,
              tvl: data.tvl || 0,
              drawdown: latest.drawdown,
              history: live,
              status: data.status,
              bio: strat.bio || "Quantitative Infrastructure."
            };
          } catch { return null; }
        })
      );
      const filtered = results.filter(r => r !== null).sort((a, b) => b.profitValue - a.profitValue);
      setQuants(filtered);
      const visibility = {};
      filtered.forEach(q => visibility[q.id] = true);
      setVisibleStrategies(visibility);
      setLoading(false);
    };
    fetchData();
  }, []);

  const benchmarkData = useMemo(() => {
    if (!quants.length) return [];
    const allTimePoints = [...new Set(quants.flatMap(q => q.history.map(h => h.timestamp || h.date)))].sort();
    return allTimePoints.map(time => {
      const point = { time };
      quants.forEach(q => {
        const match = q.history.find(h => (h.timestamp || h.date) === time);
        point[q.id] = match ? match.value : null;
      });
      return point;
    });
  }, [quants]);

  const totalTVL = useMemo(() => quants.reduce((acc, curr) => acc + (curr.tvl || 0), 0), [quants]);

  if (loading) return <div className="h-[100dvh] bg-black flex items-center justify-center text-white font-black italic tracking-widest animate-pulse">ARENA SYNCING...</div>;

  return (
    <div className="h-[100dvh] w-screen bg-black text-white overflow-hidden flex flex-col relative font-sans">
      
      <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
        
        {/* TAB: ARENA - TIKTOK STYLE (CHART BACKGROUND) */}
        {activeTab === 'arena' && (
          <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
            {quants.map((q, idx) => (
              <section key={q.id} className="h-full w-full snap-start relative flex flex-col overflow-hidden">
                
                {/* 1. LATAR BELAKANG GRAFIK - Garis diperhalus (strokeWidth: 3) */}
                <div className="absolute inset-0 z-0 opacity-70">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={q.history} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`glow-${q.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={q.color} stopOpacity={0.7}/>
                          <stop offset="80%" stopColor={q.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <YAxis hide domain={['auto', 'auto']} />
                      {/* strokeWidth dikurangi jadi 3 agar lebih ramping */}
                      <Area type="monotone" dataKey="value" stroke={q.color} strokeWidth={3} fill={`url(#glow-${q.id})`} dot={false} animationDuration={2000} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* 2. TOP HEADER: RANK & AGENT NAME */}
                <div className="absolute top-12 left-8 z-20 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                    <User size={20} className="text-white/40" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                      RANK #{idx + 1}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic opacity-90">
                      {q.name}
                    </span>
                  </div>
                </div>

                {/* 3. BOTTOM INFO: METRICS */}
                <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none">
                  <div className="mb-24 animate-fade-in">
                    <div className="flex flex-col gap-1">
                      <div className="text-emerald-400 font-mono text-4xl md:text-6xl font-bold tracking-tighter">
                        {q.profitValue.toFixed(2)}% <span className="text-white/20 text-sm md:text-xl font-black italic uppercase">Profit</span>
                      </div>
                      <div className="flex items-center gap-4 text-white/40 font-black italic tracking-widest text-[10px] md:text-lg">
                        <span>{q.protocol} PROTOCOL</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                        <span>{formatCurrency(q.tvl)} TVL</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-2 opacity-20">
                  {quants.map((_, i) => (
                    <div key={i} className={`w-1 rounded-full transition-all ${i === idx ? 'h-8 bg-white' : 'h-4 bg-white/50'}`} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* TAB: ANALYTIC - TERMINAL STYLE */}
        {activeTab === 'benchmark' && (
          <div className="h-full w-full p-6 md:p-12 overflow-y-auto no-scrollbar animate-fade-in flex flex-col items-center bg-[#070707]">
            <div className="max-w-[1400px] w-full space-y-10 pb-32">
              
              <div className="w-full bg-white/[0.02] border border-white/10 rounded-[40px] p-8 md:p-16 text-center flex flex-col items-center justify-center space-y-3 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-50"></div>
                <Zap size={24} className="text-white/20 mb-2" />
                <h2 className="text-[10px] md:text-sm font-bold text-white/30 uppercase tracking-[0.4em]">Total Tracked TVL</h2>
                <div className="text-4xl md:text-9xl font-black italic tracking-tighter leading-none">{formatCurrency(totalTVL)}</div>
                <p className="text-[10px] font-bold text-white/10 tracking-[0.5em] italic uppercase">Across 6 Global Strategies</p>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
                <div>
                  <h1 className="text-6xl md:text-[100px] font-black italic tracking-tighter uppercase leading-none">COMPARISON</h1>
                </div>
                <div className="relative group">
                  <button className="px-10 py-5 bg-neutral-900 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-white shadow-2xl flex items-center gap-3">
                    <LayoutGrid size={16} />
                    <span>Filter Agents</span>
                  </button>
                  <div className="absolute right-0 top-full mt-4 w-72 bg-neutral-950 border border-white/10 rounded-[30px] shadow-2xl z-50 py-4 hidden group-hover:block backdrop-blur-3xl">
                    {quants.map(strat => (
                      <button key={strat.id} onClick={() => setVisibleStrategies(p => ({...p, [strat.id]: !p[strat.id]}))} className="w-full flex items-center justify-between px-8 py-3.5 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: strat.color}}></div>
                          <span className={`text-[10px] font-black uppercase ${visibleStrategies[strat.id] !== false ? 'text-white' : 'text-zinc-700'}`}>{strat.name}</span>
                        </div>
                        {visibleStrategies[strat.id] !== false && <ShieldCheck size={18} className="text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-[400px] md:h-[600px] bg-white/[0.01] border border-white/5 rounded-[60px] p-8 md:p-16 relative overflow-hidden backdrop-blur-sm shadow-inner">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={benchmarkData}>
                    <defs>
                      {quants.map(q => (
                        <linearGradient key={q.id} id={`grad-bench-${q.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={q.color} stopOpacity={0.4}/>
                          <stop offset="95%" stopColor={q.color} stopOpacity={0}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="white" strokeOpacity={0.03} vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip contentStyle={{backgroundColor: '#000', border: 'none', borderRadius: '25px', padding: '20px'}} />
                    {quants.map(q => visibleStrategies[q.id] !== false && (
                      /* strokeWidth dikurangi jadi 2 agar perbandingan terlihat lebih rapi */
                      <Area key={q.id} type="monotone" dataKey={q.id} name={q.name} stroke={q.color} strokeWidth={2} fill={`url(#grad-bench-${q.id})`} dot={false} connectNulls={true} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB: RANK */}
        {activeTab === 'rank' && (
          <div className="h-full w-full p-8 lg:p-20 overflow-y-auto no-scrollbar animate-fade-in flex flex-col items-center bg-[#070707]">
             <div className="max-w-6xl w-full pb-32">
                <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-16 text-center">Leaderboard</h1>
                <div className="space-y-4">
                  {quants.map((q, i) => (
                    <div key={q.id} className="group flex items-center justify-between p-6 md:p-8 rounded-[30px] md:rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-xl hover:bg-white/[0.05] transition-all">
                      <div className="flex items-center gap-6">
                        <span className="text-2xl font-mono text-white/10">0{i+1}</span>
                        <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center shadow-xl"><User size={24} className="text-white/10" /></div>
                        <div>
                          <span className="text-lg font-black italic text-white uppercase">{q.name}</span>
                          <div className="text-[9px] text-zinc-500 font-mono uppercase mt-1">{q.protocol} Protocol</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-white/20 uppercase font-black block">Profit</span>
                        <span className="text-xl md:text-2xl font-black text-emerald-400 italic">{q.profitValue.toFixed(2)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION */}
        <nav className="flex-none h-24 md:h-32 w-full bg-black/90 backdrop-blur-2xl border-t border-white/5 flex items-center justify-center px-8 z-[100]">
           <div className="flex w-full max-w-5xl justify-between items-center relative">
             <div className="flex gap-10 md:gap-16">
               <NavItem active={activeTab === 'arena'} icon={<LayoutGrid size={24} />} label="Arena" onClick={() => setActiveTab('arena')} />
               <NavItem active={activeTab === 'rank'} icon={<Award size={24} />} label="Rank" onClick={() => setActiveTab('rank')} />
             </div>
             <div className="relative -top-10">
               <button onClick={() => setActiveTab('home')} className={`w-20 h-20 rounded-full bg-neutral-950 border border-white/10 flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 ${activeTab === 'home' ? 'bg-white shadow-[0_0_50px_rgba(255,255,255,0.3)]' : ''}`}>
                 <Zap size={32} className={activeTab === 'home' ? 'text-black fill-current' : 'text-white/20'} />
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
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;