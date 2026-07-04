import React, { useEffect, useState } from "react";
import { Stock } from "../types";
import { api } from "../lib/api";
import { TrendingUp, TrendingDown, RefreshCw, BarChart2, Globe, Flame, ShieldAlert, Layers } from "lucide-react";

interface MarketOverviewProps {
  onSelectStock: (stock: Stock) => void;
  onSwitchTab: (tab: "Terminal" | "Market" | "Intelligence" | "Simulations" | "Academy") => void;
}

export default function MarketOverview({ onSelectStock, onSwitchTab }: MarketOverviewProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const overview = await api.getMarketOverview();
      setData(overview);
    } catch (err: any) {
      setError(err.message || "Failed to load market intelligence data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3" id="market-loading">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-cyan" />
        <span className="text-xs font-mono text-slate-500">Retrieving Global Equities Feeds...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-[#0d111a] border border-rose-500/15 rounded-lg text-center space-y-3" id="market-error">
        <ShieldAlert className="h-8 w-8 text-rose-400 mx-auto" />
        <p className="text-xs font-mono text-slate-400">{error}</p>
        <button
          onClick={fetchOverview}
          className="px-4 py-1.5 bg-slate-800 text-xs font-mono rounded text-white cursor-pointer hover:bg-slate-700"
        >
          Retry Feed Synchronization
        </button>
      </div>
    );
  }

  const { gainers, losers, indices } = data;

  const sectorPerformances = [
    { name: "Semiconductors & Compute", change: "+3.82%", color: "text-emerald-400 bg-emerald-500/5" },
    { name: "Enterprise Cloud Platforms", change: "+1.24%", color: "text-emerald-400 bg-emerald-500/5" },
    { name: "Digital Comm & Metaverses", change: "+2.53%", color: "text-emerald-400 bg-emerald-500/5" },
    { name: "Cyclical Consumer & Auto", change: "-2.11%", color: "text-rose-400 bg-rose-500/5" },
    { name: "Traditional Energy & Infrastructure", change: "-0.55%", color: "text-rose-400 bg-rose-500/5" },
    { name: "Premium Capital & Financials", change: "+0.82%", color: "text-emerald-400 bg-emerald-500/5" }
  ];

  return (
    <div className="space-y-6 animate-fadeIn" id="market-overview-workspace">
      
      {/* 1. Global Market Tape Node Rows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="market-index-node-grid">
        {/* S&P 500 Card */}
        <div className="bg-[#0d111a] border border-[#1e293b] p-5 rounded-lg glowing-shadow flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">S&P 500 Index</span>
            <div className="text-xl font-display font-semibold text-white">5,123.41</div>
          </div>
          <div className="text-right font-mono">
            <span className="text-xs text-emerald-400 font-bold block">+12.50</span>
            <span className="text-[10px] text-slate-400 block">+0.24%</span>
          </div>
        </div>

        {/* NASDAQ Card */}
        <div className="bg-[#0d111a] border border-[#1e293b] p-5 rounded-lg glowing-shadow flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">NASDAQ Composite</span>
            <div className="text-xl font-display font-semibold text-white">16,374.94</div>
          </div>
          <div className="text-right font-mono">
            <span className="text-xs text-rose-400 font-bold block">-45.10</span>
            <span className="text-[10px] text-slate-400 block">-0.27%</span>
          </div>
        </div>

        {/* VIX Volatility */}
        <div className="bg-[#0d111a] border border-[#1e293b] p-5 rounded-lg glowing-shadow flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">CBOE Volatility (VIX)</span>
            <div className="text-xl font-display font-semibold text-white">13.82</div>
          </div>
          <div className="text-right font-mono">
            <span className="text-xs text-rose-400 font-bold block">-0.15</span>
            <span className="text-[10px] text-slate-400 block">-1.07%</span>
          </div>
        </div>
      </div>

      {/* 2. Main Market Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Top Movers & Sector Matrix (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Movers card */}
          <div className="bg-[#0d111a] border border-[#1e293b] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-brand-cyan" />
                <h3 className="font-display font-semibold text-sm text-white">Top Active Movers</h3>
              </div>
              <span className="text-[9px] font-mono text-slate-500">Live 15s quote refresh</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Gainers */}
              <div>
                <span className="text-[10px] font-mono text-emerald-400 tracking-wider uppercase block mb-2 font-bold">Top High-Beta Gainers</span>
                <div className="space-y-2">
                  {gainers.map((st: Stock) => (
                    <button
                      key={st.symbol}
                      onClick={() => {
                        onSelectStock(st);
                        onSwitchTab("Terminal");
                      }}
                      className="w-full bg-slate-950/40 hover:bg-slate-950 border border-slate-900 hover:border-slate-800 flex items-center justify-between p-3 rounded-lg text-left transition-all cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-mono text-xs text-white font-bold block">{st.symbol}</span>
                        <span className="text-[9px] text-slate-400 truncate block">{st.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono text-white font-semibold block">${st.price.toFixed(2)}</span>
                        <span className="text-[10px] font-mono text-emerald-400">+{st.changePercent.toFixed(2)}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Losers */}
              <div>
                <span className="text-[10px] font-mono text-rose-400 tracking-wider uppercase block mb-2 font-bold">Tactical Downward Outflows</span>
                <div className="space-y-2">
                  {losers.map((st: Stock) => (
                    <button
                      key={st.symbol}
                      onClick={() => {
                        onSelectStock(st);
                        onSwitchTab("Terminal");
                      }}
                      className="w-full bg-slate-950/40 hover:bg-slate-950 border border-slate-900 hover:border-slate-800 flex items-center justify-between p-3 rounded-lg text-left transition-all cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-mono text-xs text-white font-bold block">{st.symbol}</span>
                        <span className="text-[9px] text-slate-400 truncate block">{st.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono text-white font-semibold block">${st.price.toFixed(2)}</span>
                        <span className="text-[10px] font-mono text-rose-400">{st.changePercent.toFixed(2)}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Heat map blocks */}
          <div className="bg-[#0d111a] border border-[#1e293b] rounded-lg p-5">
            <div className="flex items-center gap-1.5 mb-4 border-b border-slate-800 pb-3">
              <Layers className="h-4 w-4 text-brand-cyan" />
              <h3 className="font-display font-semibold text-sm text-white">Systemic Volatility Heat Grid</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded text-center space-y-1">
                <span className="text-xs font-mono font-bold text-emerald-400 block">AAPL</span>
                <span className="text-[10px] text-slate-400 font-mono">+1.24%</span>
              </div>
              <div className="bg-emerald-500/15 border border-emerald-500/30 p-4 rounded text-center space-y-1">
                <span className="text-xs font-mono font-bold text-emerald-400 block">NVDA</span>
                <span className="text-[10px] text-slate-400 font-mono">+3.82%</span>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded text-center space-y-1">
                <span className="text-xs font-mono font-bold text-rose-400 block">TSLA</span>
                <span className="text-[10px] text-slate-400 font-mono">-2.11%</span>
              </div>
              <div className="bg-[#07090e] border border-slate-800 p-4 rounded text-center space-y-1">
                <span className="text-xs font-mono font-bold text-slate-400 block">MSFT</span>
                <span className="text-[10px] text-slate-500 font-mono">+0.05%</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded text-center space-y-1">
                <span className="text-xs font-mono font-bold text-emerald-400 block">AMZN</span>
                <span className="text-[10px] text-slate-400 font-mono">+0.82%</span>
              </div>
              <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded text-center space-y-1">
                <span className="text-xs font-mono font-bold text-rose-400 block">GOOGL</span>
                <span className="text-[10px] text-slate-400 font-mono">-0.55%</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded text-center space-y-1">
                <span className="text-xs font-mono font-bold text-emerald-400 block">META</span>
                <span className="text-[10px] text-slate-400 font-mono">+2.53%</span>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded text-center space-y-1">
                <span className="text-xs font-mono font-bold text-rose-400 block">AMD</span>
                <span className="text-[10px] text-slate-400 font-mono">-2.36%</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Sector Performance & Global Intel (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Sector performances */}
          <div className="bg-[#0d111a] border border-[#1e293b] rounded-lg p-5">
            <div className="flex items-center gap-1.5 mb-4 border-b border-slate-800 pb-3">
              <BarChart2 className="h-4 w-4 text-brand-cyan" />
              <h3 className="font-display font-semibold text-sm text-white">Sector Capital Flow</h3>
            </div>

            <div className="space-y-3">
              {sectorPerformances.map((sect, i) => (
                <div key={i} className="flex justify-between items-center text-xs p-2 rounded-md bg-slate-950/20 border border-slate-900">
                  <span className="text-slate-300 font-medium">{sect.name}</span>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${sect.color}`}>
                    {sect.change}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Global Intel bulletin */}
          <div className="bg-[#0d111a] border border-[#1e293b] rounded-lg p-5">
            <div className="flex items-center gap-1.5 mb-4 border-b border-slate-800 pb-3">
              <Globe className="h-4 w-4 text-brand-cyan" />
              <h3 className="font-display font-semibold text-sm text-white">Global Capital News</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-brand-cyan block">09:42 AM EST • FLASH REPORT</span>
                <p className="text-slate-200 font-medium font-display leading-snug">Foundry processed wafers see 8% quarterly margin expansions</p>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">High performance compute nodes continue to outpace server capacities, driving silicon hardware orders.</p>
              </div>
              <div className="border-t border-slate-800 pt-3 space-y-1">
                <span className="text-[9px] font-mono text-slate-500 block">08:15 AM EST • MACRO LOG</span>
                <p className="text-slate-200 font-medium font-display leading-snug">S&P Index rebalancing triggers strategic parity capital shifts</p>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">Passive mutual funds align allocations to meet the latest quarterly weight specifications.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
