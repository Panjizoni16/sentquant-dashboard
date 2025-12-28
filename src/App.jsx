import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, BarChart as RechartsBarChart, Bar, Cell 
} from 'recharts';
import { 
  User, ShieldCheck, Zap, ChevronLeft, 
  LayoutGrid, Award, BarChart3, Briefcase, Calendar, 
  ArrowLeft, ArrowRight, ChevronDown, Shield
} from 'lucide-react';

// ==========================================
// 1. CONFIG & DATA DUMMY (Untuk Heatmap & Stats)
// ==========================================
const STRATEGIES_CONFIG = [
  { id: 'sentquant', name: 'Sentquant Core', protocol: 'Sentquant', color: '#f3f4f5', bio: "Sentquant flagship quantitative infrastructure.", joined: "Jan 2024" },
  { id: 'systemic_hyper', name: 'Systemic Hyper', protocol: 'Hyperliquid', color: '#10b981', bio: "High-frequency market making on Hyperliquid L1.", joined: "Mar 2024" },
  { id: 'jlp_neutral', name: 'JLP Delta Neutral', protocol: 'Drift', color: '#a5b4fc', bio: "Consistent yield through funding rate arbitrage.", joined: "Feb 2024" }
];

// Helper untuk Heatmap Dummy
const generateMonthlyReturns = () => [
  { year: 2025, months: [1.2, 2.5, -0.5, 3.1, null, null, null, null, null, null, null, null] },
  { year: 2024, months: [2.1, 1.8, 3.2, -1.2, 0.5, 2.7, 1.9, -0.8, 4.2, 1.5, 2.2, 3.0] }
];

// ==========================================
// 2. MINI COMPONENTS (Dashboard Elements)
// ==========================================
const MetricBoxUnified = ({ label, value, subValue }) => (
  <div className="relative border border-white/10 bg-black/40 backdrop-blur-sm p-6 flex flex-col items-center justify-center">
    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40"></div>
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/40"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/40"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40"></div>
    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</span>
    <span className="text-2xl md:text-3xl font-black text-white tracking-tighter">{value}</span>
    {subValue && <span className="text-[10px] text-gray-500 mt-1 uppercase">{subValue}</span>}
  </div>
);

const NavItem = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'opacity-100 scale-110' : 'opacity-40'}`}>
    <div className={active ? 'text-white' : 'text-zinc-500'}>{icon}</div>
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

// ==========================================
// 3. MAIN APP
// ==========================================
const App = () => {
  const [activeTab, setActiveTab] = useState('arena');
  const [quants, setQuants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  
  // States untuk Filter Dashboard
  const [chartTimeRange, setChartTimeRange] = useState('ALL');
  const [chartYearFilter, setChartYearFilter] = useState(null);
  const [isChartFilterOpen, setIsChartFilterOpen] = useState(false);

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val || 0);

  useEffect(() => {
    const fetchData = async () => {
      const results = await Promise.all(STRATEGIES_CONFIG.map(async (strat) => {
        try {
          const res = await fetch(`/data/live-data-${strat.id}.json`);
          const json = await res.json();
          const data = json[strat.id];
          return { ...strat, profitValue: ((data.liveData[data.liveData.length - 1].value - 1000) / 1000) * 100, tvl: data.tvl || 0, history: data.liveData, status: "Live", annualReturns: [{year: '2024', value: 24.5}, {year: '2025', value: 8.2}] };
        } catch { return null; }
      }));
      setQuants(results.filter(r => r !== null));
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-[100dvh] bg-black flex items-center justify-center text-white font-black animate-pulse">SYNCING SYSTEMS...</div>;

  return (
    <div className="h-[100dvh] w-screen bg-black text-white overflow-hidden flex flex-col relative font-sans">
      <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
        
        {/* --- LIVE: UNIFIED DASHBOARD (PROFILS AGEN) --- */}
        {selectedProfile ? (
          <div className="h-full w-full bg-[#050505] overflow-y-auto no-scrollbar animate-fade-in p-4 md:p-8 pb-32">
            <div className="max-w-[1600px] mx-auto space-y-12">
              
              {/* HEADER WITH BACK & TRADE BUTTONS */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <button onClick={() => setSelectedProfile(null)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="font-bold text-sm tracking-wider uppercase">Back to Arena</span>
                </button>
                <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-zinc-200 text-black font-black rounded-xl text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-2xl hover:scale-105">
                  <span>Trade Now</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* STRATEGY IDENTITY */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"><User size={30} className="text-white/20" /></div>
                  <div>
                    <h1 className="text-3xl md:text-5xl font-black italic uppercase text-white">{selectedProfile.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Live Trading Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* UNIFIED METRICS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricBoxUnified label="NAV" value={selectedProfile.history[selectedProfile.history.length-1].value.toFixed(2)} />
                <MetricBoxUnified label="TVL" value={selectedProfile.id === 'sentquant' ? 'LOCKED' : formatCurrency(selectedProfile.tvl)} />
                <MetricBoxUnified label="PROTOCOL" value={selectedProfile.protocol} />
              </div>

              {/* LIVE CHART */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <span className="w-1 h-6 bg-white rounded-full"></span>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Live Performance</h2>
                </div>
                <div className="h-[400px] w-full bg-white/[0.02] border border-white/5 rounded-[40px] p-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedProfile.history}>
                      <defs>
                        <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={selectedProfile.color} stopOpacity={0.3}/><stop offset="95%" stopColor={selectedProfile.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="white" opacity={0.05} vertical={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={['auto', 'auto']} hide />
                      <Tooltip contentStyle={{backgroundColor: '#000', border: 'none', borderRadius: '15px'}} />
                      <Area type="monotone" dataKey="value" stroke={selectedProfile.color} strokeWidth={3} fill="url(#colorVis)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* MONTHLY RETURNS HEATMAP */}
              <div className="mt-8">
                <h3 className="text-xl font-black text-white uppercase mb-6 tracking-tight">Monthly Returns History</h3>
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-4">
                  <table className="w-full text-xs min-w-[800px]">
                    <thead>
                      <tr className="text-gray-500 uppercase tracking-widest border-b border-white/5">
                        <th className="text-left py-4">Year</th>
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <th key={m} className="text-center">{m}</th>)}
                        <th className="text-center">YTD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateMonthlyReturns().map((row, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-5 font-black text-white">{row.year}</td>
                          {row.months.map((val, i) => (
                            <td key={i} className="text-center">
                              {val !== null ? (
                                <span className={`px-2 py-1 rounded font-bold ${val >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-500 bg-red-500/10'}`}>
                                  {val > 0 ? '+' : ''}{val}%
                                </span>
                              ) : <span className="text-zinc-800">-</span>}
                            </td>
                          ))}
                          <td className="text-center font-black text-white underline decoration-zinc-700">
                            {row.months.reduce((acc, curr) => acc + (curr || 0), 0).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BAR CHART: ANNUAL RETURNS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[350px] bg-black/40 border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-6">Annual Returns Breakdown</h3>
                  <ResponsiveContainer width="100%" height="80%">
                    <RechartsBarChart data={selectedProfile.annualReturns}>
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#444', fontSize: 10, fontWeight: 'bold'}} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#000', border: 'none'}} />
                      <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                        {selectedProfile.annualReturns.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.value >= 0 ? selectedProfile.color : '#f23645'} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white text-black rounded-3xl p-8 flex flex-col justify-center">
                   <Shield size={40} className="mb-4" />
                   <h4 className="text-xl font-black uppercase leading-tight mb-2">Verified Infrastructure</h4>
                   <p className="text-xs font-medium opacity-60 italic leading-relaxed">This strategy is managed by AI agents on encrypted rails. Real-time auditing active.</p>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* TAB ARENA - TIKTOK STYLE (Tetap Sama) */
          activeTab === 'arena' && (
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
                  <div className="absolute top-12 left-8 z-20 flex items-center gap-4">
                    <button onClick={() => setSelectedProfile(q)} className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                      <User size={24} className="text-white/40" />
                    </button>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded w-fit mb-1 border border-white/5">Rank #{idx+1}</span>
                      <span className="text-sm font-black italic uppercase">{q.name}</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 z-10 p-10 flex flex-col justify-end bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none pb-32">
                    <div className="text-emerald-400 font-mono text-5xl md:text-8xl font-bold tracking-tighter drop-shadow-2xl">
                      {q.profitValue.toFixed(2)}% <span className="text-white/20 text-xs md:text-xl font-black italic uppercase">Profit</span>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          )
        )}

        {/* --- BOTTOM NAVIGATION --- */}
        <nav className="fixed bottom-0 left-0 w-full h-24 md:h-28 bg-black/90 backdrop-blur-2xl border-t border-white/5 flex items-center justify-center px-8 z-[100]">
           <div className="flex w-full max-w-5xl justify-between items-center relative">
             <div className="flex gap-12">
               <NavItem active={activeTab === 'arena'} icon={<LayoutGrid size={24} />} label="Arena" onClick={() => {setActiveTab('arena'); setSelectedProfile(null);}} />
               <NavItem active={activeTab === 'rank'} icon={<Award size={24} />} label="Rank" onClick={() => setActiveTab('rank')} />
             </div>
             <div className="relative -top-10">
               <button onClick={() => {setActiveTab('arena'); setSelectedProfile(null);}} className={`w-20 h-20 rounded-full border border-white/10 flex items-center justify-center transition-all ${activeTab === 'arena' && !selectedProfile ? 'bg-white text-black' : 'bg-neutral-950 text-white/20'}`}><Zap size={32} /></button>
             </div>
             <div className="flex gap-12">
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