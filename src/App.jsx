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
// 2. Immersive Components
// ==========================================
const LighterMatrix = () => (
  <div className="fixed inset-0 z-0 bg-[#0a0a0a]">
    <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
  </div>
);

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

  if (loading) return <div className="h-[100dvh] bg-black flex items-center justify-center text-white font-black italic tracking-widest animate-pulse">ARENA LOADING...</div>;

  return (
    <div className="h-[100dvh] w-screen bg-[#050505] text-white overflow-hidden flex flex-col relative">
      <LighterMatrix />

      <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
        
        {/* TAB: ARENA - TIKTOK FULLSCREEN FEED */}
        {activeTab === 'arena' && (
          <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
            {quants.map((q, idx) => (
              <section key={q.id} className="h-full w-full snap-start flex flex-col relative px-6 py-12 md:p-24 justify-center items-center">
                <div className="w-full max-w-6xl space-y-6 md:space-y-12">
                  
                  {/* Floating Rank */}
                  <div className="flex justify-center md:justify-start">
                    <span className="px-4 py-1.5 bg-white text-black text-[10px] md:text-sm font-black uppercase italic rounded-full shadow-xl">
                      RANKING #{idx + 1}
                    </span>
                  </div>

                  {/* Header Title */}
                  <div className="text-center md:text-left">
                    <h3 className="text-5xl md:text-[120px] font-black italic tracking-tighter uppercase leading-none mb-2">{q.name}</h3>
                    <div className="text-emerald-400 font-mono text-xl md:text-4xl font-bold tracking-[0.1em]">{q.profitValue.toFixed(2)}% <span className="text-white/20 text-sm md:text-xl font-black italic">PROFIT</span></div>
                  </div>

                  {/* Fullscreen Chart */}
                  <div className="w-full h-[40vh] md:h-[50vh] bg-white/[0.03] border border-white/10 rounded-[40px] md:rounded-[80px] p-6 md:p-12 relative backdrop-blur-md overflow-hidden shadow-2xl">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={q.history}>
                        <defs>
                          <linearGradient id={`glow-${q.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={q.color} stopOpacity={0.5}/>
                            <stop offset="95%" stopColor={q.color} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <YAxis hide domain={['auto', 'auto']} />
                        <Area type="monotone" dataKey="value" stroke={q.color} strokeWidth={5} fill={`url(#glow-${q.id})`} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                    
                    {/* Immersive Info */}
                    <div className="absolute bottom-8 left-8 md:bottom-16 md:left-16 flex flex-col">
                      <span className="text-[10px] md:text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-1">{q.protocol} Protocol</span>
                      <span className="text-xl md:text-4xl font-black italic text-white">{formatCurrency(q.tvl)}</span>
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}

        {/* TAB: TOLOK UKUR - TERMINAL STYLE */}
        {activeTab === 'benchmark' && (
          <div className="h-full w-full p-6 md:p-12 overflow-y-auto no-scrollbar animate-fade-in flex flex-col items-center">
            <div className="max-w-[1400px] w-full space-y-10 pb-32">
              <div className="w-full bg-white/[0.02] border border-white/10 rounded-[40px] p-10 text-center flex flex-col items-center justify-center space-y-3 relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-50"></div>
                <h2 className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-[0.4em]">Total Tracked TVL</h2>
                <div className="text-4xl md:text-8xl font-black italic text-white tracking-tighter drop-shadow-2xl">{formatCurrency(totalTVL)}</div>
                <p className="text-[10px] md:text-xs text-gray-600 font-bold uppercase tracking-widest italic">Across {quants.length} Global Strategies</p>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
                <h1 className="text-6xl md:text-[100px] font-black italic text-white uppercase tracking-tighter leading-none">COMPARISON</h1>
                <div className="relative group">
                  <button className="w-full md:w-auto flex items-center justify-center gap-4 px-10 py-5 bg-neutral-900 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-white shadow-2xl hover:bg-neutral-800 transition-all">
                    <LayoutGrid size={18} />
                    <span>Filter Agents</span>
                  </button>
                  <div className="absolute right-0 top-full mt-4 w-72 bg-neutral-950 border border-white/10 rounded-[30px] shadow-2xl z-50 py-4 hidden group-hover:block backdrop-blur-3xl">
                    {quants.map(strat => (
                      <button key={strat.id} onClick={() => setVisibleStrategies(p => ({...p, [strat.id]: !p[strat.id]}))} className="w-full flex items-center justify-between px-8 py-3.5 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full" style={{backgroundColor: strat.color}}></div>
                          <span className={`text-[10px] font-black uppercase ${visibleStrategies[strat.id] !== false ? 'text-white' : 'text-zinc-700'}`}>{strat.name}</span>
                        </div>
                        {visibleStrategies[strat.id] !== false && <ShieldCheck size={18} className="text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-[400px] md:h-[600px] w-full bg-white/[0.01] border border-white/5 rounded-[60px] p-8 md:p-16 relative overflow-hidden backdrop-blur-sm shadow-inner">
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
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} tick={{fill: '#444', fontSize: 10}} axisLine={false} tickLine={false} orientation="right" />
                    <Tooltip contentStyle={{backgroundColor: '#000', border: 'none', borderRadius: '25px', padding: '20px'}} />
                    {quants.map(q => visibleStrategies[q.id] !== false && (
                      <Area key={q.id} type="monotone" dataKey={q.id} name={q.name} stroke={q.color} strokeWidth={4} fill={`url(#grad-bench-${q.id})`} dot={false} connectNulls={true} />
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
               <button onClick={() => setActiveTab('home')} className={`w-20 h-20 rounded-full bg-neutral-950 border border-white/10 flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 ${activeTab === 'home' ? 'border-zinc-200 shadow-[0_0_50px_rgba(255,255,255,0.2)]' : ''}`}>
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
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;