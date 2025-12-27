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
// 2. RESPONSIVE COMPONENTS
// ==========================================
const LighterMatrix = () => (
  <div className="fixed inset-0 z-0 bg-[#0a0a0a]">
    <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/80 pointer-events-none" />
  </div>
);

const NavItem = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'scale-105 opacity-100' : 'opacity-30 hover:opacity-60'}`}>
    <div className={`p-1 transition-colors ${active ? 'text-zinc-200' : 'text-slate-400'}`}>{icon}</div>
    <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-slate-500'}`}>{label}</span>
    {active && <div className="w-1 h-1 rounded-full bg-zinc-200 mt-1 shadow-[0_0_12px_rgba(255,255,255,0.5)]" />}
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
              bio: strat.bio || "Infrastruktur kuantitatif otomatis Sentquant."
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

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white font-black italic tracking-[0.2em] animate-pulse">Arena Syncing...</div>;

  return (
    <div className="h-screen w-screen bg-[#070707] text-slate-100 overflow-hidden flex flex-col relative font-sans">
      <LighterMatrix />

      <main className="flex-1 h-full relative z-10 flex flex-col overflow-hidden">
        
        {/* TAB: ARENA - TIKTOK STYLE FEED */}
        {activeTab === 'arena' && (
          <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
            {quants.map((q, idx) => (
              <section key={q.id} className="h-full w-full snap-start flex flex-col relative p-6 md:p-20 items-center justify-center">
                <div className="w-full max-w-5xl z-10 animate-fade-in text-center md:text-left space-y-4 md:space-y-8">
                  {/* Header Agen */}
                  <div>
                    <h3 className="text-5xl md:text-[100px] font-black italic text-white tracking-tighter uppercase leading-none">{q.name}</h3>
                    <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                      <span className="text-emerald-400 font-mono text-sm md:text-2xl font-bold tracking-[0.2em] uppercase">PROFIT: {q.profitValue.toFixed(2)}%</span>
                      <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] md:text-xs font-black uppercase text-white/60">Rank #{idx+1}</div>
                    </div>
                  </div>

                  {/* Grafik Utama */}
                  <div className="w-full h-[350px] md:h-[500px] bg-white/[0.02] border border-white/5 rounded-[40px] md:rounded-[60px] p-4 md:p-10 relative shadow-2xl backdrop-blur-sm overflow-hidden group">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={q.history}>
                        <defs>
                          <linearGradient id={`glow-${q.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={q.color} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={q.color} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip contentStyle={{backgroundColor: '#000', border: 'none', borderRadius: '15px'}} />
                        <Area type="monotone" dataKey="value" stroke={q.color} strokeWidth={4} fillOpacity={1} fill={`url(#glow-${q.id})`} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                    
                    {/* Floating Info */}
                    <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 flex flex-col items-end space-y-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{q.protocol} PROTOCOL</span>
                      <span className="text-lg md:text-2xl font-black italic text-white">{formatCurrency(q.tvl)} TVL</span>
                    </div>
                  </div>

                  {/* Swipe Indicator (Hanya di Mobile) */}
                  <div className="flex flex-col items-center md:hidden pt-4 opacity-30 animate-bounce">
                    <span className="text-[8px] font-bold uppercase tracking-[0.3em] mb-2">Swipe for next agent</span>
                    <ChevronDown size={16} />
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}

        {/* TAB: TOLOK UKUR */}
        {activeTab === 'benchmark' && (
          <div className="h-full w-full p-4 md:p-10 overflow-y-auto no-scrollbar animate-fade-in flex flex-col items-center">
            <div className="max-w-[1400px] w-full space-y-6 md:space-y-10 pb-32">
              <div className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-[30px] md:rounded-[40px] p-6 md:p-10 text-center flex flex-col items-center justify-center space-y-2 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-40"></div>
                <Zap size={24} className="text-white/20 mb-2" />
                <h2 className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-[0.3em]">Total Tracked TVL</h2>
                <div className="text-3xl md:text-7xl font-black italic text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">{formatCurrency(totalTVL)}</div>
                <p className="text-[10px] md:text-sm text-gray-500 font-medium italic opacity-60 uppercase tracking-widest">Across {quants.length} Strategies</p>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
                <div>
                  <h1 className="text-5xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-none">COMPARISON</h1>
                </div>
                <div className="relative group">
                  <button className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-neutral-900 border border-white/10 rounded-xl md:rounded-2xl text-[10px] font-black uppercase text-white shadow-xl hover:bg-neutral-800 transition-all">
                    <LayoutGrid size={16} />
                    <span>FILTER STRATEGIES</span>
                    <ChevronDown size={14} />
                  </button>
                  <div className="absolute right-0 top-full mt-3 w-full md:w-72 bg-neutral-950 border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl z-50 py-4 hidden group-hover:block backdrop-blur-3xl">
                    {quants.map(strat => (
                      <button key={strat.id} onClick={() => setVisibleStrategies(p => ({...p, [strat.id]: !p[strat.id]}))} className="w-full flex items-center justify-between px-6 py-3 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: strat.color}}></div>
                          <span className={`text-[10px] font-black uppercase tracking-tight ${visibleStrategies[strat.id] !== false ? 'text-white' : 'text-zinc-600'}`}>{strat.name}</span>
                        </div>
                        {visibleStrategies[strat.id] !== false && <ShieldCheck size={16} className="text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-[350px] md:h-[550px] w-full bg-white/[0.01] border border-white/5 rounded-[30px] md:rounded-[60px] p-6 md:p-12 shadow-inner relative overflow-hidden backdrop-blur-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={benchmarkData}>
                    <defs>
                      {quants.map(q => (
                        <linearGradient key={q.id} id={`grad-bench-${q.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={q.color} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={q.color} stopOpacity={0}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} tick={{fill: '#444', fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} orientation="right" />
                    <Tooltip contentStyle={{backgroundColor: '#000', border: 'none', borderRadius: '20px', padding: '15px'}} itemStyle={{fontSize: '11px', fontWeight: '900'}} />
                    {quants.map(q => visibleStrategies[q.id] !== false && (
                      <Area key={q.id} type="monotone" dataKey={q.id} name={q.name} stroke={q.color} strokeWidth={3} fill={`url(#grad-bench-${q.id})`} dot={false} connectNulls={true} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB: RANK - Compact */}
        {activeTab === 'rank' && (
          <div className="h-full w-full p-6 md:p-20 overflow-y-auto no-scrollbar animate-fade-in flex flex-col items-center">
             <div className="max-w-6xl w-full pb-32">
                <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-10 md:mb-16 text-center">Global Leaderboard</h1>
                <div className="space-y-4">
                  {quants.map((q, i) => (
                    <div key={q.id} className="group flex items-center justify-between p-6 md:p-8 rounded-[30px] md:rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-xl hover:bg-white/[0.05] transition-all">
                      <div className="flex items-center gap-4 md:gap-10">
                        <span className="text-2xl md:text-3xl font-mono text-white/10">0{i+1}</span>
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center shadow-xl"><User size={24} className="text-white/10" /></div>
                        <div>
                          <span className="text-base md:text-xl font-black italic text-white uppercase tracking-tighter">{q.name}</span>
                          <div className="text-[9px] md:text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1">{q.protocol} Protocol</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] md:text-[10px] text-white/20 uppercase font-black block">Total Profit</span>
                        <span className="text-lg md:text-2xl font-black text-emerald-400 italic">{q.profitValue.toFixed(2)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION - Sleek & Static */}
        <nav className="flex-none h-24 md:h-28 w-full bg-black/80 backdrop-blur-3xl border-t border-white/5 flex items-center justify-center px-6 md:px-8 z-[100]">
           <div className="flex w-full max-w-5xl justify-between items-center relative">
             <div className="flex gap-8 md:gap-12">
               <NavItem active={activeTab === 'arena'} icon={<LayoutGrid size={22} />} label="Arena" onClick={() => setActiveTab('arena')} />
               <NavItem active={activeTab === 'rank'} icon={<Award size={22} />} label="Peringkat" onClick={() => setActiveTab('rank')} />
             </div>
             <div className="relative -top-6 md:-top-8">
               <button onClick={() => setActiveTab('home')} className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-neutral-950 border border-white/10 flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90 ${activeTab === 'home' ? 'border-zinc-200 shadow-[0_0_30px_rgba(255,255,255,0.2)]' : ''}`}>
                 <Zap size={28} className={activeTab === 'home' ? 'text-white fill-current' : 'text-white/20'} />
               </button>
             </div>
             <div className="flex gap-8 md:gap-12">
               <NavItem active={activeTab === 'benchmark'} icon={<BarChart3 size={22} />} label="Tolok Ukur" onClick={() => setActiveTab('benchmark')} />
               <NavItem active={activeTab === 'portofolio'} icon={<Briefcase size={22} />} label="Portofolio" onClick={() => setActiveTab('portofolio')} />
             </div>
           </div>
        </nav>
      </main>

      {/* GLOBAL STYLES */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;