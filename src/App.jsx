import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { 
  User, ShieldCheck, Zap, ChevronLeft, 
  LayoutGrid, Award, BarChart3, Briefcase, Calendar, ChevronDown
} from 'lucide-react';

// ==========================================
// 1. CONFIG: DAFTAR AGEN STRATEGI
// ==========================================
const STRATEGIES_CONFIG = [
  { id: 'sentquant', name: 'Sentquant Core', protocol: 'Sentquant', color: '#f3f4f5', bio: "Sentquant flagship quantitative infrastructure. Multi-strategy execution engine.", joined: "Jan 2024" },
  { id: 'systemic_hyper', name: 'Systemic Hyper', protocol: 'Hyperliquid', color: '#10b981', bio: "High-frequency market making on Hyperliquid L1.", joined: "Mar 2024" },
  { id: 'jlp_neutral', name: 'JLP Delta Neutral', protocol: 'Drift', color: '#a5b4fc', bio: "Consistent yield through funding rate arbitrage.", joined: "Feb 2024" },
  { id: 'guineapool', name: 'Guinea Pool', protocol: 'Lighter', color: '#f59e0b', bio: "Advanced MEV-protected liquidity pool.", joined: "Dec 2023" },
  { id: 'edgehedge', name: 'Edge and Hedge', protocol: 'Lighter', color: '#ebfd4a', bio: "Hedging edge scenarios with directional volatility.", joined: "Apr 2024" },
  { id: 'systemicls', name: 'Systemic Strategies L/S', protocol: 'Hyperliquid', color: '#6366f1', bio: "Long/Short systemic algorithmic rebalancing.", joined: "Jan 2024" }
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

const App = () => {
  const [activeTab, setActiveTab] = useState('arena');
  const [quants, setQuants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleStrategies, setVisibleStrategies] = useState({});
  const [selectedProfile, setSelectedProfile] = useState(null);

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { 
    style: 'currency', currency: 'USD', minimumFractionDigits: 0 
  }).format(val || 0);

  useEffect(() => {
    const fetchData = async () => {
      const results = await Promise.all(
        STRATEGIES_CONFIG.map(async (strat) => {
          try {
            const res = await fetch(`/data/live-data-${strat.id}.json`);
            const json = await res.json();
            const data = json[strat.id];
            const live = data.liveData;
            return {
              ...strat,
              profitValue: ((live[live.length - 1].value - 1000) / 1000) * 100,
              tvl: data.tvl || 0,
              history: live
            };
          } catch { return null; }
        })
      );
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

  if (loading) return <div className="h-[100dvh] bg-black flex items-center justify-center text-white font-black italic animate-pulse">ARENA SYNCING...</div>;

  return (
    <div className="h-[100dvh] w-screen bg-black text-white overflow-hidden flex flex-col relative font-sans">
      <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
        
        {/* TAMPILAN PROFIL (X STYLE) */}
        {selectedProfile ? (
          <div className="h-full w-full bg-black overflow-y-auto no-scrollbar animate-fade-in flex flex-col relative pb-32">
            <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl p-4 flex items-center gap-6 border-b border-white/5">
              <button onClick={() => setSelectedProfile(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={20} /></button>
              <div><h4 className="text-sm font-black uppercase">{selectedProfile.name}</h4><p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{selectedProfile.history.length} Points</p></div>
            </div>
            <div className="w-full h-32 md:h-48 bg-gradient-to-br from-zinc-800 to-black relative border-b border-white/5"></div>
            <div className="px-6 relative -mt-12 md:-mt-16">
              <div className="flex justify-between items-end">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-black border-4 border-black overflow-hidden">
                  <div className="w-full h-full bg-neutral-900 flex items-center justify-center border border-white/10 rounded-full"><User size={40} className="text-white/20" /></div>
                </div>
                <button className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase rounded-full">Follow Agent</button>
              </div>
              <div className="mt-4"><div className="flex items-center gap-2"><h3 className="text-xl md:text-3xl font-black italic uppercase">{selectedProfile.name}</h3><ShieldCheck size={18} className="text-emerald-400" /></div></div>
              <p className="mt-4 text-xs md:text-sm text-zinc-300 leading-relaxed max-w-xl">{selectedProfile.bio}</p>
              <div className="mt-4 flex gap-6 text-xs border-b border-white/5 pb-6">
                <div><span className="font-black text-white">{selectedProfile.profitValue.toFixed(2)}%</span> <span className="text-zinc-500">Profit</span></div>
                <div><span className="font-black text-white">{formatCurrency(selectedProfile.tvl)}</span> <span className="text-zinc-500">TVL</span></div>
              </div>
            </div>
          </div>
        ) : (
          /* TAB ARENA */
          activeTab === 'arena' && (
            <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
              {quants.map((q, idx) => (
                <section key={q.id} className="h-full w-full snap-start relative flex flex-col overflow-hidden">
                  <div className="absolute inset-0 z-0 opacity-70">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={q.history} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs><linearGradient id={`glow-${q.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={q.color} stopOpacity={0.7}/><stop offset="80%" stopColor={q.color} stopOpacity={0}/></linearGradient></defs>
                        <YAxis hide domain={['auto', 'auto']} />
                        <Area type="monotone" dataKey="value" stroke={q.color} strokeWidth={2} fill={`url(#glow-${q.id})`} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="absolute top-12 left-8 z-20 flex items-center gap-4">
                    <button onClick={() => setSelectedProfile(q)} className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:scale-110 active:scale-90 transition-all"><User size={20} className="text-white/40" /></button>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">RANK #{idx + 1}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">{q.name}</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none pb-32">
                    <div className="text-emerald-400 font-mono text-4xl md:text-6xl font-bold tracking-tighter">{q.profitValue.toFixed(2)}% <span className="text-white/20 text-xs md:text-xl font-black italic uppercase">Profit</span></div>
                    <div className="flex items-center gap-4 text-white/40 font-black italic tracking-widest text-[10px] md:text-lg"><span>{q.protocol} PROTOCOL</span><span>{formatCurrency(q.tvl)} TVL</span></div>
                  </div>
                </section>
              ))}
            </div>
          )
        )}

        {/* TAB ANALYTIC */}
        {activeTab === 'benchmark' && (
          <div className="h-full w-full p-6 md:p-12 overflow-y-auto no-scrollbar animate-fade-in flex flex-col bg-black">
            <div className="max-w-[1400px] mx-auto w-full space-y-10 pb-32">
              <div className="w-full bg-white/[0.02] border border-white/10 rounded-[40px] p-8 md:p-16 text-center backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-50"></div>
                <h2 className="text-[10px] md:text-sm font-bold text-white/30 uppercase tracking-[0.4em]">Total Tracked TVL</h2>
                <div className="text-4xl md:text-9xl font-black italic tracking-tighter leading-none">{formatCurrency(totalTVL)}</div>
              </div>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
                <h1 className="text-6xl md:text-[100px] font-black italic tracking-tighter uppercase leading-none">COMPARISON</h1>
                <button className="px-10 py-5 bg-neutral-900 border border-white/10 rounded-2xl text-[10px] font-black uppercase">Filter Agents</button>
              </div>
              <div className="h-[400px] md:h-[600px] bg-white/[0.01] border border-white/5 rounded-[60px] p-8 md:p-16 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={benchmarkData}>
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{backgroundColor: '#000', border: 'none', borderRadius: '15px'}} />
                    {quants.map(q => visibleStrategies[q.id] && (
                      <Area key={q.id} type="monotone" dataKey={q.id} stroke={q.color} strokeWidth={1.5} fillOpacity={0} dot={false} connectNulls />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION */}
        <nav className="fixed bottom-0 left-0 w-full h-24 md:h-32 bg-black/95 backdrop-blur-2xl border-t border-white/5 flex items-center justify-center px-8 z-[100]">
           <div className="flex w-full max-w-5xl justify-between items-center relative">
             <div className="flex gap-10 md:gap-16">
               <NavItem active={activeTab === 'arena'} icon={<LayoutGrid size={24} />} label="Arena" onClick={() => {setActiveTab('arena'); setSelectedProfile(null);}} />
               <NavItem active={activeTab === 'rank'} icon={<Award size={24} />} label="Rank" onClick={() => setActiveTab('rank')} />
             </div>
             <div className="relative -top-10">
               <button onClick={() => {setActiveTab('arena'); setSelectedProfile(null);}} className={`w-20 h-20 rounded-full border border-white/10 flex items-center justify-center transition-all ${activeTab === 'arena' && !selectedProfile ? 'bg-white text-black' : 'bg-neutral-950 text-white/20'}`}><Zap size={32} /></button>
             </div>
             <div className="flex gap-10 md:gap-16">
               <NavItem active={activeTab === 'benchmark'} icon={<BarChart3 size={24} />} label="Analytic" onClick={() => setActiveTab('benchmark')} />
               <NavItem active={activeTab === 'portofolio'} icon={<Briefcase size={24} />} label="Portfolio" onClick={() => setActiveTab('portofolio')} />
             </div>
           </div>
        </nav>
      </main>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;