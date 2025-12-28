import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, BarChart as RechartsBarChart, Bar, Cell 
} from 'recharts';
import { 
  User, ShieldCheck, Zap, ChevronLeft, LayoutGrid, Award, 
  BarChart3, Briefcase, ArrowLeft, ArrowRight, ChevronDown, Shield, 
  Calendar, MapPin, Link as LinkIcon
} from 'lucide-react';

// ==========================================
// 1. CONFIG LENGKAP (6 AGEN) - TIDAK DIHAPUS
// ==========================================
const STRATEGIES_CONFIG = [
  { id: 'sentquant', name: 'Sentquant Core', protocol: 'Sentquant', color: '#f3f4f5', bio: "Sentquant flagship quantitative infrastructure. Multi-strategy execution engine.", joined: "Jan 2024", status: "Live" },
  { id: 'systemic_hyper', name: 'Systemic Hyper', protocol: 'Hyperliquid', color: '#10b981', bio: "High-frequency market making on Hyperliquid L1.", joined: "Mar 2024", status: "Live" },
  { id: 'jlp_neutral', name: 'JLP Delta Neutral', protocol: 'Drift', color: '#a5b4fc', bio: "Consistent yield through funding rate arbitrage.", joined: "Feb 2024", status: "Live" },
  { id: 'guineapool', name: 'Guinea Pool', protocol: 'Lighter', color: '#f59e0b', bio: "Advanced MEV-protected liquidity pool.", joined: "Dec 2023", status: "Live" },
  { id: 'edgehedge', name: 'Edge and Hedge', protocol: 'Lighter', color: '#ebfd4a', bio: "Hedging edge scenarios with directional volatility.", joined: "Apr 2024", status: "Live" },
  { id: 'systemicls', name: 'Systemic Strategies L/S', protocol: 'Hyperliquid', color: '#6366f1', bio: "Long/Short systemic algorithmic rebalancing.", joined: "Jan 2024", status: "Live" }
];

const generateMonthlyReturns = () => [
  { year: 2025, months: [1.2, 2.5, -0.5, 3.1, null, null, null, null, null, null, null, null] },
  { year: 2024, months: [2.1, 1.8, 3.2, -1.2, 0.5, 2.7, 1.9, -0.8, 4.2, 1.5, 2.2, 3.0] }
];

// ==========================================
// 2. HELPER COMPONENTS
// ==========================================
const NavItem = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all duration-300 flex-1 ${active ? 'scale-110 opacity-100' : 'opacity-30 hover:opacity-60'}`}>
    <div className={`p-1 ${active ? 'text-white' : 'text-zinc-500'}`}>{icon}</div>
    <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${active ? 'text-white' : 'text-zinc-600'}`}>{label}</span>
  </button>
);

const MetricBoxUnified = ({ label, value }) => (
  <div className="relative border border-white/10 bg-black/40 backdrop-blur-sm p-6 flex flex-col items-center justify-center">
    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40"></div>
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/40"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/40"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40"></div>
    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</span>
    <span className="text-2xl md:text-3xl font-black text-white tracking-tighter">{value}</span>
  </div>
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
          const live = data.liveData;
          return {
            ...strat,
            profitValue: ((live[live.length - 1].value - 1000) / 1000) * 100,
            tvl: data.tvl || 0,
            history: live,
            annualReturns: [{year: '2024', value: 24.5}, {year: '2025', value: 8.2}]
          };
        } catch { return null; }
      }));
      setQuants(results.filter(r => r !== null).sort((a, b) => b.profitValue - a.profitValue));
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalTVL = useMemo(() => quants.reduce((acc, curr) => acc + (curr.tvl || 0), 0), [quants]);

  if (loading) return <div className="h-[100dvh] bg-black flex items-center justify-center text-white font-black italic animate-pulse">ARENA SYNCING...</div>;

  return (
    <div className="h-[100dvh] w-screen bg-black text-white overflow-hidden flex flex-col relative font-sans">
      <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
        
        {activeTab === 'home' && (
          <div className="w-full p-6 animate-fade-in flex flex-col items-center justify-center h-full text-center">
             <h1 className="text-6xl md:text-[120px] font-black italic text-white tracking-tighter uppercase mb-4 leading-none">SENTQUANT<br/><span className="text-zinc-700">ARENA</span></h1>
             <button onClick={() => setActiveTab('arena')} className="mt-12 px-12 py-5 bg-white text-black font-black uppercase rounded-2xl hover:scale-110 transition-all">Masuk Arena</button>
          </div>
        )}

        {activeTab === 'arena' && (
          selectedProfile ? (
            <div className="h-full w-full bg-[#050505] overflow-y-auto no-scrollbar animate-fade-in p-4 md:p-8 pb-32">
              <div className="max-w-[1600px] mx-auto space-y-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <button onClick={() => setSelectedProfile(null)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /><span className="font-bold text-xs tracking-wider uppercase">Back to Arena</span>
                  </button>
                  <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-zinc-200 text-black font-black rounded-xl text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-2xl hover:scale-105">
                    <span>Trade Now</span><ArrowRight size={16} />
                  </button>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"><User size={30} className="text-white/20" /></div>
                    <div><h1 className="text-3xl md:text-5xl font-black italic uppercase text-white">{selectedProfile.name}</h1><div className="flex items-center gap-2 mt-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Trading Active</span></div></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricBoxUnified label="NAV" value={selectedProfile.history[selectedProfile.history.length-1].value.toFixed(2)} />
                  <MetricBoxUnified label="TVL" value={formatCurrency(selectedProfile.tvl)} />
                  <MetricBoxUnified label="PROTOCOL" value={selectedProfile.protocol} />
                </div>
                <div className="h-[400px] bg-white/[0.02] border border-white/5 rounded-[40px] p-6 backdrop-blur-md">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedProfile.history}><Area type="monotone" dataKey="value" stroke={selectedProfile.color} strokeWidth={2} fillOpacity={0.1} dot={false} /></AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
              {quants.map((q, idx) => (
                <section key={q.id} className="h-full w-full snap-start relative flex flex-col overflow-hidden">
                  <div className="absolute inset-0 z-0 opacity-70">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={q.history} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <YAxis hide domain={['auto', 'auto']} />
                        <Area type="monotone" dataKey="value" stroke={q.color} strokeWidth={2} fill={q.color} fillOpacity={0.1} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* ARENA HEADER: MATCHING 667856.png */}
                  <div className="absolute top-12 left-8 z-20 flex items-center gap-4">
                    <button onClick={() => setSelectedProfile(q)} className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"><User size={24} className="text-white/40" /></button>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Rank #{idx+1}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic opacity-90">{q.name}</span>
                    </div>
                  </div>

                  <div className="absolute inset-0 z-10 p-10 flex flex-col justify-end pb-32">
                    <div className="text-emerald-400 font-mono text-5xl md:text-8xl font-bold tracking-tighter drop-shadow-2xl">
                      {q.profitValue.toFixed(2)}% <span className="text-white/20 text-xs md:text-xl font-black italic uppercase">Profit</span>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          )
        )}

        {activeTab === 'benchmark' && (
          <div className="h-full w-full p-6 md:p-12 overflow-y-auto no-scrollbar animate-fade-in bg-black">
            <div className="max-w-[1400px] mx-auto w-full space-y-10 pb-32">
              <div className="w-full bg-white/[0.02] border border-white/10 rounded-[40px] p-8 md:p-16 text-center backdrop-blur-xl relative overflow-hidden">
                <div className="text-4xl md:text-9xl font-black italic tracking-tighter leading-none">{formatCurrency(totalTVL)}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rank' && (
          <div className="h-full w-full p-8 lg:p-20 overflow-y-auto no-scrollbar animate-fade-in bg-black">
             <div className="max-w-6xl w-full pb-32 space-y-4">
                {quants.map((q, i) => (
                  <div key={q.id} className="flex items-center justify-between p-6 rounded-[30px] bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-6"><span className="text-2xl font-mono text-white/10">0{i+1}</span><div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center"><User size={24} className="text-white/10" /></div><div><span className="text-lg font-black italic text-white uppercase">{q.name}</span></div></div>
                    <div className="text-right text-xl font-black text-emerald-400 italic">{q.profitValue.toFixed(2)}%</div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* --- BOTTOM NAVIGATION: FLAT & SEJAJAR (MATCHING 667856.png) --- */}
        <nav className="fixed bottom-0 left-0 w-full h-24 bg-black/90 backdrop-blur-2xl border-t border-white/5 flex items-center justify-center px-4 z-[100]">
           <div className="flex w-full max-w-2xl justify-between items-center px-4">
             <NavItem active={activeTab === 'arena'} icon={<LayoutGrid size={24} />} label="Arena" onClick={() => {setActiveTab('arena'); setSelectedProfile(null);}} />
             <NavItem active={activeTab === 'rank'} icon={<Award size={24} />} label="Rank" onClick={() => setActiveTab('rank')} />
             <NavItem active={activeTab === 'home'} icon={<Zap size={24} />} label="Home" onClick={() => {setActiveTab('home'); setSelectedProfile(null);}} />
             <NavItem active={activeTab === 'benchmark'} icon={<BarChart3 size={24} />} label="Analytic" onClick={() => setActiveTab('benchmark')} />
             <NavItem active={activeTab === 'portofolio'} icon={<Briefcase size={24} />} label="Portfolio" onClick={() => setActiveTab('portofolio')} />
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