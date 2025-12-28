import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart as RechartsBarChart, Bar, Cell } from 'recharts';
import { User, Zap, LayoutGrid, Award, BarChart3, Briefcase, ArrowLeft, ArrowRight, Shield, ChevronLeft } from 'lucide-react';

// 1. DATA CONFIG
const STRATEGIES_CONFIG = [
  { id: 'sentquant', name: 'Sentquant Core', protocol: 'Sentquant', color: '#f3f4f5', bio: "Sentquant flagship quantitative infrastructure.", joined: "Jan 2024" },
  { id: 'systemic_hyper', name: 'Systemic Hyper', protocol: 'Hyperliquid', color: '#10b981', bio: "High-frequency market making on Hyperliquid L1.", joined: "Mar 2024" },
  { id: 'jlp_neutral', name: 'JLP Delta Neutral', protocol: 'Drift', color: '#a5b4fc', bio: "Consistent yield through funding rate arbitrage.", joined: "Feb 2024" }
];

// 2. NAV ITEM COMPONENT (FLAT STYLE)
const NavItem = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all duration-300 flex-1 ${active ? 'opacity-100' : 'opacity-30'}`}>
    <div className={active ? 'text-white' : 'text-zinc-500'}>{icon}</div>
    <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-zinc-600'}`}>{label}</span>
  </button>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [quants, setQuants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val || 0);

  useEffect(() => {
    const fetchData = async () => {
      const results = await Promise.all(STRATEGIES_CONFIG.map(async (strat) => {
        try {
          const res = await fetch(`/data/live-data-${strat.id}.json`);
          const json = await res.json();
          const data = json[strat.id];
          return { ...strat, profitValue: ((data.liveData[data.liveData.length - 1].value - 1000) / 1000) * 100, tvl: data.tvl || 0, history: data.liveData };
        } catch { return null; }
      }));
      setQuants(results.filter(r => r !== null));
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-[100dvh] bg-black flex items-center justify-center text-white font-black italic animate-pulse">SYNCING...</div>;

  return (
    <div className="h-[100dvh] w-screen bg-black text-white overflow-hidden flex flex-col relative">
      <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
        
        {/* --- TAB HOME --- */}
        {activeTab === 'home' && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-fade-in">
             <h1 className="text-6xl md:text-[120px] font-black italic tracking-tighter uppercase leading-none mb-6">SENTQUANT<br/><span className="text-zinc-700">ARENA</span></h1>
             <button onClick={() => setActiveTab('arena')} className="px-12 py-5 bg-white text-black font-black uppercase rounded-2xl hover:scale-105 transition-all">Enter Arena</button>
          </div>
        )}

        {/* --- TAB ARENA / PROFILE --- */}
        {activeTab === 'arena' && (
          selectedProfile ? (
            <div className="h-full w-full bg-[#050505] overflow-y-auto p-4 md:p-8 pb-32 animate-fade-in">
              <div className="max-w-[1400px] mx-auto space-y-8">
                <div className="flex justify-between items-center">
                  <button onClick={() => setSelectedProfile(null)} className="flex items-center gap-2 text-zinc-500 hover:text-white font-bold text-xs"><ChevronLeft size={20}/> BACK</button>
                  <button className="px-6 py-3 bg-white text-black font-black rounded-xl text-xs uppercase">TRADE</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl text-center">
                    <span className="text-[10px] text-zinc-500 font-bold block mb-2">NAV</span>
                    <span className="text-2xl font-black">{selectedProfile.history[selectedProfile.history.length-1].value.toFixed(2)}</span>
                  </div>
                  <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl text-center">
                    <span className="text-[10px] text-zinc-500 font-bold block mb-2">TVL</span>
                    <span className="text-2xl font-black">{formatCurrency(selectedProfile.tvl)}</span>
                  </div>
                  <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl text-center">
                    <span className="text-[10px] text-zinc-500 font-bold block mb-2">PROTOCOL</span>
                    <span className="text-2xl font-black uppercase">{selectedProfile.protocol}</span>
                  </div>
                </div>
                <div className="h-[300px] md:h-[500px] bg-white/[0.02] rounded-[40px] p-6 border border-white/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedProfile.history}>
                      <YAxis hide domain={['auto', 'auto']} />
                      <Area type="monotone" dataKey="value" stroke={selectedProfile.color} strokeWidth={2} fill={selectedProfile.color} fillOpacity={0.1} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
              {quants.map((q, idx) => (
                <section key={q.id} className="h-full w-full snap-start relative flex flex-col overflow-hidden">
                  <div className="absolute inset-0 z-0 opacity-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={q.history} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <YAxis hide domain={['auto', 'auto']} />
                        <Area type="monotone" dataKey="value" stroke={q.color} strokeWidth={2} fill={q.color} fillOpacity={0.05} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="absolute top-12 left-8 z-20 flex items-center gap-4">
                    <button onClick={() => setSelectedProfile(q)} className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:scale-110 transition-all"><User size={24} className="text-white/40" /></button>
                    <div className="flex flex-col"><span className="text-[10px] font-black uppercase bg-white/10 px-2 py-0.5 rounded border border-white/5 w-fit mb-1">Rank #{idx+1}</span><span className="text-sm font-black italic uppercase">{q.name}</span></div>
                  </div>
                  <div className="absolute inset-0 z-10 p-10 flex flex-col justify-end pb-32 text-emerald-400 font-mono text-5xl md:text-8xl font-bold tracking-tighter">
                    {q.profitValue.toFixed(2)}% <span className="text-white/20 text-xs font-black italic uppercase">Profit</span>
                  </div>
                </section>
              ))}
            </div>
          )
        )}

        {/* --- TAB ANALYTIC --- */}
        {activeTab === 'benchmark' && (
          <div className="h-full w-full p-6 animate-fade-in bg-black flex flex-col items-center justify-center text-center">
             <div className="p-10 md:p-20 bg-white/[0.02] border border-white/10 rounded-[40px] w-full max-w-4xl">
                <span className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-[10px]">Total Tracked TVL</span>
                <div className="text-4xl md:text-8xl font-black italic tracking-tighter my-4">{formatCurrency(quants.reduce((a,c) => a+c.tvl, 0))}</div>
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
             </div>
          </div>
        )}

        {/* --- BOTTOM NAVIGATION: FIXED & SEJAJAR (FLAT) --- */}
        <nav className="fixed bottom-0 left-0 w-full h-24 bg-black/95 backdrop-blur-2xl border-t border-white/5 flex items-center justify-center z-[100]">
           <div className="flex w-full max-w-lg justify-around items-center px-4">
             <NavItem active={activeTab === 'arena'} icon={<LayoutGrid size={22} />} label="Arena" onClick={() => {setActiveTab('arena'); setSelectedProfile(null);}} />
             <NavItem active={activeTab === 'rank'} icon={<Award size={22} />} label="Rank" onClick={() => setActiveTab('rank')} />
             
             {/* SEJAJAR: Tidak menonjol lagi */}
             <NavItem active={activeTab === 'home'} icon={<Zap size={22} />} label="Home" onClick={() => {setActiveTab('home'); setSelectedProfile(null);}} />
             
             <NavItem active={activeTab === 'benchmark'} icon={<BarChart3 size={22} />} label="Analytic" onClick={() => setActiveTab('benchmark')} />
             <NavItem active={activeTab === 'portofolio'} icon={<Briefcase size={22} />} label="Portfolio" onClick={() => setActiveTab('portofolio')} />
           </div>
        </nav>
      </main>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
// update v2.1