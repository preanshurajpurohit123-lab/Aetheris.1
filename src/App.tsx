import React, { useState, useEffect, useMemo } from "react";
import { Stock, PortfolioState, Holding, OptimizationResult, Collection } from "./types";
import { INITIAL_BUYING_POWER, generateHistory, AI_COLLECTIONS } from "./data";
import PerformanceChart from "./components/PerformanceChart";
import Watchlist from "./components/Watchlist";
import CopilotWidget from "./components/CopilotWidget";
import SystemReasoning from "./components/SystemReasoning";
import SimulatedTrade from "./components/SimulatedTrade";
import TradingViewChart from "./components/TradingViewChart";
import MarketOverview from "./components/MarketOverview";
import AuthScreen from "./components/AuthScreen";
import { api } from "./lib/api";
import { 
  TrendingUp, 
  Layers, 
  BookOpen, 
  Compass, 
  Terminal as TerminalIcon, 
  Shield, 
  Activity, 
  Briefcase,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
  Lock,
  ArrowRight,
  LogOut,
  RefreshCw,
  AlertTriangle,
  X,
  TrendingDown,
  Globe
} from "lucide-react";

export default function App() {
  // Authentication states
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState<string | null>(null);

  // Navigation active tab
  const [activeTab, setActiveTab] = useState<"Terminal" | "Market" | "Intelligence" | "Simulations" | "Academy">("Terminal");

  // Chart View Toggle (Valuation Area Chart vs Interactive Candlestick Chart)
  const [chartView, setChartView] = useState<"recharts" | "tradingview">("tradingview");

  // Core interactive paper trading states
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  const [portfolio, setPortfolio] = useState<PortfolioState>({
    totalValue: 1242591.42,
    buyingPower: INITIAL_BUYING_POWER,
    holdings: [],
    history: generateHistory(1100000, 30, 0.012, 0.001)
  });

  // Intelligence Sentiment indicators & stress inputs
  const [intelligenceTopic, setIntelligenceTopic] = useState("Big Tech Concentration Risks");
  const [rateCutSimulation, setRateCutSimulation] = useState(false);

  // Academy states
  const [activeLesson, setActiveLesson] = useState<number>(1);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null);

  // Simulated minor ticker tape values fluctuating live
  const [tickerPrices, setTickerPrices] = useState({
    sp500: 5123.41,
    spChange: 0.12,
    nasdaq: 16374.94,
    ndChange: -0.45,
    gold: 2176.00,
    goldChange: 1.41,
    btc: 68241.10,
    btcChange: 0.92,
    vix: 13.82,
    vixChange: -1.16
  });

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionUser = await api.getSession();
        setUser(sessionUser);
      } catch (err) {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };
    checkSession();
  }, []);

  // Load and refresh data for authenticated user
  const loadUserData = async () => {
    if (!user) return;
    try {
      const [stList, port, wl, txs] = await Promise.all([
        api.getStocks(),
        api.getPortfolio(),
        api.getWatchlist(),
        api.getTransactions()
      ]);

      setStocks(stList);
      setPortfolio(port);
      setWatchlistSymbols(wl);
      setTransactions(txs);

      // Default stock selection if none selected
      if (stList.length > 0 && !selectedStock) {
        setSelectedStock(stList[0]);
      }
    } catch (err: any) {
      console.error("Error loading secure data:", err);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserData();
      const interval = setInterval(loadUserData, 5000); // 5s polling matches server ticker fluctuation!
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fluctuating ticker ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerPrices(prev => ({
        sp500: Number((prev.sp500 + (Math.random() - 0.49) * 2).toFixed(2)),
        spChange: Number((prev.spChange + (Math.random() - 0.5) * 0.02).toFixed(2)),
        nasdaq: Number((prev.nasdaq + (Math.random() - 0.51) * 8).toFixed(2)),
        ndChange: Number((prev.ndChange + (Math.random() - 0.5) * 0.04).toFixed(2)),
        gold: Number((prev.gold + (Math.random() - 0.45) * 0.5).toFixed(2)),
        goldChange: Number((prev.goldChange + (Math.random() - 0.5) * 0.01).toFixed(2)),
        btc: Number((prev.btc + (Math.random() - 0.48) * 15).toFixed(2)),
        btcChange: Number((prev.btcChange + (Math.random() - 0.5) * 0.05).toFixed(2)),
        vix: Number((prev.vix + (Math.random() - 0.52) * 0.05).toFixed(2)),
        vixChange: Number((prev.vixChange + (Math.random() - 0.5) * 0.05).toFixed(2))
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic Portfolio Risk Score assessment based on mega-cap tech concentration
  const portfolioRiskMetrics = useMemo(() => {
    let totalStockVal = 0;
    let nvdaVal = 0;
    let aaplVal = 0;

    portfolio.holdings.forEach(h => {
      const stock = stocks.find(s => s.symbol === h.symbol);
      const price = stock ? stock.price : h.avgPrice;
      const val = h.shares * price;
      totalStockVal += val;
      if (h.symbol === "NVDA") nvdaVal = val;
      if (h.symbol === "AAPL") aaplVal = val;
    });

    const concentrationRatio = totalStockVal > 0 ? (nvdaVal + aaplVal) / totalStockVal : 0;
    
    let score = "B+";
    let text = "Moderate Aggressive";
    let style = "text-amber-400";

    if (concentrationRatio > 0.7) {
      score = "B+";
      text = "Highly Concentrated";
      style = "text-amber-400";
    } else if (concentrationRatio > 0.4 && concentrationRatio <= 0.7) {
      score = "A-";
      text = "Balanced Active";
      style = "text-emerald-400 font-medium";
    } else if (concentrationRatio <= 0.4) {
      score = "AA";
      text = "Optimized Parity";
      style = "text-emerald-400 font-semibold";
    }

    return { score, text, style, ratio: concentrationRatio };
  }, [portfolio.holdings, stocks]);

  // Calculate Aetheris Alpha relative to benchmark indices
  const portfolioAlpha = useMemo(() => {
    if (portfolioRiskMetrics.score === "A-" || portfolioRiskMetrics.score === "AA") {
      return { val: "+5.8%", text: "Vs. Benchmark S&P" };
    }
    return { val: "+4.2%", text: "Vs. Benchmark S&P" };
  }, [portfolioRiskMetrics.score]);

  // Execute Simulated Trade (Paper Trading) Action Handler
  const handleExecuteTrade = async (symbol: string, shares: number, price: number, type: "BUY" | "SELL") => {
    try {
      setErrorAlert(null);
      await api.executeTrade(symbol, shares, type);
      await loadUserData();
    } catch (err: any) {
      setErrorAlert(err.message || "Failed to execute trade on system ledger");
    }
  };

  // Watchlist Star Toggle Callback
  const handleToggleWatchlist = async (symbol: string) => {
    try {
      setErrorAlert(null);
      const isCurrentlyWatchlisted = watchlistSymbols.includes(symbol);
      let updatedSymbols: string[];
      if (isCurrentlyWatchlisted) {
        updatedSymbols = await api.removeFromWatchlist(symbol);
      } else {
        updatedSymbols = await api.addToWatchlist(symbol);
      }
      setWatchlistSymbols(updatedSymbols);
    } catch (err: any) {
      setErrorAlert("Failed to sync watchlist change with cloud ledger");
    }
  };

  // Apply Gemini Optimization Recommendations Handler
  const handleApplyOptimization = async (result: OptimizationResult) => {
    try {
      setErrorAlert(null);
      await api.rebalancePortfolio(result.recommendedWeights);
      await loadUserData();
    } catch (err: any) {
      setErrorAlert("Strategic portfolio optimization rebalance failed");
    }
  };

  const handleQuizSubmit = (answer: string) => {
    setQuizAnswer(answer);
    if (answer === "B") {
      setQuizPassed(true);
    } else {
      setQuizPassed(false);
    }
  };

  const handleSignOut = () => {
    api.logout();
    setUser(null);
    setStocks([]);
    setSelectedStock(null);
    setSelectedCollection(null);
    setWatchlistSymbols([]);
    setTransactions([]);
  };

  // Render initial loading state
  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center gap-4" id="app-loading-screen">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-[#4facfe] to-[#00f2fe] p-[1.5px] shadow-[0_0_25px_rgba(79,172,254,0.4)] animate-pulse">
            <div className="h-full w-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
              <span className="font-display font-black text-sm text-transparent bg-clip-text bg-gradient-to-tr from-[#4facfe] to-[#00f2fe]">Æ</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <RefreshCw className="h-4 w-4 animate-spin text-brand-cyan" />
          <span className="text-xs font-mono text-slate-400 tracking-widest uppercase">Syncing Security Core...</span>
        </div>
      </div>
    );
  }

  // Render auth system screens if unauthenticated
  if (!user) {
    return (
      <AuthScreen 
        onAuthSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          setErrorAlert(null);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between font-sans selection:bg-brand-blue/35 selection:text-white" id="aetheris-root-canvas">
      
      {/* 1. Global Navigation Bar */}
      <header className="border-b border-[#1e293b] bg-[#07090e]/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          
          {/* Logo Brand Title (Matches screenshot design) */}
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#4facfe] to-[#00f2fe] p-[1.5px] shadow-[0_0_15px_rgba(79,172,254,0.3)]">
              <div className="h-full w-full bg-[#07090e] rounded-[7px] flex items-center justify-center">
                <span className="font-display font-black text-xs text-transparent bg-clip-text bg-gradient-to-tr from-[#4facfe] to-[#00f2fe]">Æ</span>
              </div>
            </div>
            <h1 className="font-display font-bold text-base tracking-wider text-white">
              AETHERIS
            </h1>
          </div>

          {/* Navigation Links (Includes custom "Market" overview trigger!) */}
          <nav className="hidden md:flex items-center gap-1.5">
            {([
              { id: "Terminal", label: "Terminal" },
              { id: "Market", label: "Market Overview" },
              { id: "Intelligence", label: "AI Intelligence" },
              { id: "Simulations", label: "Simulations" },
              { id: "Academy", label: "Academy" }
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setErrorAlert(null);
                }}
                className={`px-4 py-1.5 rounded-md text-xs font-mono font-medium tracking-wide transition-all relative cursor-pointer ${
                  activeTab === tab.id
                    ? "text-brand-cyan"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-[-16px] left-0 right-0 h-0.5 bg-brand-cyan shadow-[0_0_10px_#00f2fe]"></span>
                )}
              </button>
            ))}
          </nav>

          {/* Right Side Status (Matches screenshot copy with secure authentication hooks) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#0d111a] border border-slate-800 rounded-full px-3 py-1 font-mono text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-badge"></span>
              <span className="font-semibold uppercase tracking-wider">Live System Active</span>
            </div>
            
            {/* Quick Sign Out Action */}
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-rose-400 cursor-pointer transition-all"
              title="Logout session"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>

            <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-semibold text-slate-300 shadow">
              {(user.email || "Æ").substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Tab Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6">
        
        {/* Real-time Inline Error alerts banner */}
        {errorAlert && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/25 rounded-lg flex items-center justify-between gap-3 text-rose-400 text-xs font-mono animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorAlert}</span>
            </div>
            <button onClick={() => setErrorAlert(null)} className="p-0.5 hover:bg-rose-500/20 rounded cursor-pointer">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Real-time Inline Success alerts banner */}
        {successAlert && (
          <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-lg flex items-center justify-between gap-3 text-emerald-400 text-xs font-mono animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successAlert}</span>
            </div>
            <button onClick={() => setSuccessAlert(null)} className="p-0.5 hover:bg-emerald-500/20 rounded cursor-pointer">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        
        {/* TAB 1: Main Terminal Workspace (Screenshot default state) */}
        {activeTab === "Terminal" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="terminal-grid">
            
            {/* Left Sidebar: Watchlists and Collections (col-span-3) */}
            <aside className="lg:col-span-3 space-y-6">
              <Watchlist
                stocks={stocks}
                selectedStock={selectedStock}
                onSelectStock={(st) => {
                  setSelectedStock(st);
                  setSelectedCollection(null);
                }}
                selectedCollection={selectedCollection}
                onSelectCollection={(col) => {
                  setSelectedCollection(col);
                  if (col) {
                    const firstStock = stocks.find(s => col.symbols.includes(s.symbol));
                    if (firstStock) setSelectedStock(firstStock);
                  }
                }}
                watchlistSymbols={watchlistSymbols}
                onToggleWatchlist={handleToggleWatchlist}
              />
            </aside>

            {/* Central Workspace: Performance, Copilot, TradingTicket (col-span-6) */}
            <section className="lg:col-span-6 space-y-6">
              
              {/* Dynamic Metric Nodes Row (Matches middle-top of screenshot) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="portfolio-metrics-nodes">
                
                {/* Node 1: Portfolio Value */}
                <div className="bg-[#0d111a] border border-[#1e293b] p-4 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    Portfolio Value
                  </span>
                  <p className="text-lg font-display font-bold text-white mt-0.5">
                    ${portfolio.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] font-mono text-emerald-400 font-medium block mt-1">
                    +12.4% Overall
                  </span>
                </div>

                {/* Node 2: Buying Power */}
                <div className="bg-[#0d111a] border border-[#1e293b] p-4 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    Buying Power
                  </span>
                  <p className="text-lg font-display font-bold text-white mt-0.5">
                    ${portfolio.buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] font-mono text-slate-400 block mt-1">
                    Settled Cash
                  </span>
                </div>

                {/* Node 3: Risk Score */}
                <div className="bg-[#0d111a] border border-[#1e293b] p-4 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    Risk Score
                  </span>
                  <p className="text-lg font-display font-bold text-white mt-0.5">
                    {portfolioRiskMetrics.score}
                  </p>
                  <span className={`text-[10px] font-mono ${portfolioRiskMetrics.style} block mt-1`}>
                    {portfolioRiskMetrics.text}
                  </span>
                </div>

                {/* Node 4: Aetheris Alpha */}
                <div className="bg-[#0d111a] border border-[#1e293b] p-4 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    Aetheris Alpha
                  </span>
                  <p className="text-lg font-display font-bold text-brand-cyan mt-0.5">
                    {portfolioAlpha.val}
                  </p>
                  <span className="text-[10px] font-mono text-slate-400 block mt-1">
                    {portfolioAlpha.text}
                  </span>
                </div>
              </div>

              {/* Chart Switcher tabs bar */}
              <div className="flex items-center justify-between bg-[#07090e] border border-[#1e293b] p-1 rounded-lg">
                <span className="text-[10px] font-mono text-slate-400 px-3 font-semibold uppercase">Workspace Visualization</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setChartView("recharts")}
                    className={`px-3 py-1 text-[11px] font-mono rounded cursor-pointer transition-all ${
                      chartView === "recharts"
                        ? "bg-slate-900 text-white border border-slate-800"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Historical Parity Curve
                  </button>
                  <button
                    onClick={() => setChartView("tradingview")}
                    className={`px-3 py-1 text-[11px] font-mono rounded cursor-pointer transition-all ${
                      chartView === "tradingview"
                        ? "bg-brand-blue/15 text-brand-cyan border border-brand-cyan/25"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    TradingView Live Candlesticks
                  </button>
                </div>
              </div>

              {/* Dynamic Performance Area Chart vs Real Live TradingView widget */}
              {chartView === "recharts" ? (
                <PerformanceChart
                  data={portfolio.history}
                  stockSymbol={selectedCollection ? selectedCollection.name : (selectedStock ? selectedStock.symbol : undefined)}
                />
              ) : (
                <div className="h-[380px] bg-[#0d111a] border border-[#1e293b] rounded-lg overflow-hidden glowing-shadow flex flex-col justify-between">
                  <div className="bg-[#07090e] border-b border-[#1e293b] px-4 py-2 flex justify-between items-center text-xs">
                    <span className="font-mono text-slate-400 font-semibold uppercase">Real-Time Technical Stream: <span className="text-brand-cyan">{selectedStock?.symbol || "SPY"}</span></span>
                    <span className="text-[10px] text-slate-500 font-mono">BETA: {(selectedStock?.beta || 1.0).toFixed(2)}</span>
                  </div>
                  <div className="flex-1 w-full bg-[#0d111a]">
                    <TradingViewChart symbol={selectedStock?.symbol || "NASDAQ:AAPL"} />
                  </div>
                </div>
              )}

              {/* Copilot Chat & Stress Simulation Card */}
              <CopilotWidget portfolio={portfolio} />

              {/* Simulated Paper Trading Order Ticket */}
              {selectedStock && !selectedCollection && (
                <SimulatedTrade
                  stock={selectedStock}
                  portfolio={portfolio}
                  onExecuteTrade={handleExecuteTrade}
                />
              )}

              {selectedCollection && (
                <div className="bg-[#0d111a] border border-indigo-900/30 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="h-4 w-4 text-indigo-400" />
                    <h3 className="font-display font-semibold text-sm text-white">Thematic Collection Portfolio Summary</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
                    You are exploring the <span className="text-indigo-400 font-semibold">{selectedCollection.name}</span> AI Portfolio basket.
                    To execute trades on individual constituents of this index, select a specific asset from the Watchlist panel above.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-950/60 p-3.5 rounded border border-slate-900">
                    <div>
                      <span className="text-slate-500 block">Constituents:</span>
                      <span className="text-white font-medium">{selectedCollection.symbols.join(", ")}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Strategic Beta:</span>
                      <span className="text-emerald-400 font-semibold">Low Correlation Dynamic</span>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Right Sidebar: System Reasoning, Optimization & Transaction Ledger (col-span-3) */}
            <aside className="lg:col-span-3 space-y-6">
              
              <SystemReasoning
                portfolio={portfolio}
                onApplyOptimization={handleApplyOptimization}
              />

              {/* Active Holdings & Position Summary Panel */}
              <div className="bg-[#0d111a] border border-[#1e293b] rounded-lg p-5">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-brand-cyan" />
                    <h3 className="font-display font-semibold text-xs text-white uppercase tracking-wider">Active Assets</h3>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">{portfolio.holdings.length} Positions</span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {portfolio.holdings.length > 0 ? (
                    portfolio.holdings.map((h) => {
                      const stock = stocks.find(s => s.symbol === h.symbol);
                      const currentPrice = stock ? stock.price : h.avgPrice;
                      const profitLoss = (currentPrice - h.avgPrice) * h.shares;
                      const profitLossPct = ((currentPrice - h.avgPrice) / h.avgPrice) * 100;
                      return (
                        <div key={h.symbol} className="bg-[#07090e] border border-slate-900 p-2.5 rounded text-xs space-y-1 font-mono">
                          <div className="flex justify-between font-semibold">
                            <span className="text-white">{h.symbol}</span>
                            <span className={profitLoss >= 0 ? "text-emerald-400" : "text-rose-400"}>
                              {profitLoss >= 0 ? "+" : ""}${profitLoss.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>{h.shares.toFixed(2)} shares</span>
                            <span className={profitLoss >= 0 ? "text-emerald-500/80" : "text-rose-500/80"}>
                              {profitLoss >= 0 ? "+" : ""}{profitLossPct.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-[10px] text-slate-500 font-sans">
                      No active holdings. Place a simulated trade to begin.
                    </div>
                  )}
                </div>
              </div>

              {/* Secure Execution Ledger Card (Required Transaction History Panel) */}
              <div className="bg-[#0d111a] border border-[#1e293b] rounded-lg p-5">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-brand-cyan" />
                    <h3 className="font-display font-semibold text-xs text-white uppercase tracking-wider">Execution Ledger</h3>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">Live logs</span>
                </div>

                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                  {transactions.length > 0 ? (
                    transactions.map((tx: any) => (
                      <div key={tx.id} className="p-2 bg-slate-950/50 border border-slate-900 rounded text-[11px] font-mono flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={tx.type === "BUY" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                              {tx.type}
                            </span>
                            <span className="text-white font-semibold">{tx.symbol}</span>
                          </div>
                          <span className="text-[9px] text-slate-500 block">
                            {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-white block font-medium">{tx.shares.toFixed(2)} sh</span>
                          <span className="text-[10px] text-slate-400">@ ${tx.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-[10px] text-slate-500 font-sans">
                      No ledger transactions logged.
                    </div>
                  )}
                </div>
              </div>

            </aside>
          </div>
        )}

        {/* TAB 2: Custom Market Overview page */}
        {activeTab === "Market" && (
          <MarketOverview 
            onSelectStock={(st) => {
              setSelectedStock(st);
              setSelectedCollection(null);
            }} 
            onSwitchTab={(tab) => {
              setActiveTab(tab);
            }} 
          />
        )}

        {/* TAB 3: AI Market Intelligence sentiment analysis workspace */}
        {activeTab === "Intelligence" && (
          <div className="space-y-6 animate-fadeIn" id="market-intelligence-workspace">
            <div className="bg-[#0d111a] border border-[#1e293b] rounded-lg p-6 glowing-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-brand-cyan uppercase tracking-wider">
                    <Compass className="h-3.5 w-3.5" />
                    <span>Global AI Intelligence Hub</span>
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white mt-1">Advanced Risk-Parity Analytics</h2>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Analysis Layer v4.12
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sentiment Factor Node */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-900 text-xs font-mono space-y-2">
                  <span className="text-slate-500 block">NLP SENTIMENT INDEX</span>
                  <div className="text-lg font-bold text-emerald-400">72.4 / 100 (Bullish)</div>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                    AI transcript parses from 150+ technology company earnings conference calls indicate structural margins growth.
                  </p>
                </div>

                {/* Macro Factor Node */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-900 text-xs font-mono space-y-2">
                  <span className="text-slate-500 block">VOLATILITY DEVIATION</span>
                  <div className="text-lg font-bold text-white">0.82 (Low beta variance)</div>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                    Weighted portfolio volatility is currently well below historical standard deviations, pointing to solid consolidation.
                  </p>
                </div>

                {/* Correlation Node */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-900 text-xs font-mono space-y-2">
                  <span className="text-slate-500 block">CO-VARIANCE PARITY RATIO</span>
                  <div className="text-lg font-bold text-indigo-400">0.41 (Balanced diversification)</div>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                    Securities show a balanced layout, keeping drawdown impacts limited. Try our rebalancing rebalancing tool to optimize further.
                  </p>
                </div>
              </div>

              {/* Analytical Breakdown */}
              <div className="mt-8 border-t border-slate-800/80 pt-6">
                <h4 className="text-sm font-display font-semibold text-white mb-4">Thematic Sentiment Drills</h4>
                <div className="space-y-3.5">
                  {[
                    { title: "Generative AI Hyperscale Spending", impact: "Highly Positive", desc: "Corporate cloud infrastructure budget requests show continued strong momentum, directly lifting high-density microprocessors." },
                    { title: "Macroeconomic Interest Rate Progressions", impact: "Neutral / Positive", desc: "Steady federal rate adjustments maintain consistent liquidity spreads, giving support to medium and low-beta equities." },
                    { title: "Global Hardware Supply Chain Parity", impact: "Stable / Steady", desc: "High-density foundry processing lead times have successfully reverted to historical seasonal patterns, eliminating bottleneck volatility." }
                  ].map((drill, index) => (
                    <div key={index} className="bg-[#07090e] p-3.5 rounded border border-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-xs">
                      <div>
                        <span className="text-white font-medium font-display">{drill.title}</span>
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">{drill.desc}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap self-start md:self-auto">
                        {drill.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Simulations Engine Workspace */}
        {activeTab === "Simulations" && (
          <div className="space-y-6 animate-fadeIn" id="simulation-scenarios-workspace">
            <div className="bg-[#0d111a] border border-[#1e293b] rounded-lg p-6 glowing-shadow">
              <div className="flex items-center gap-1.5 text-xs font-mono text-brand-cyan uppercase tracking-wider mb-2">
                <Activity className="h-3.5 w-3.5" />
                <span>Macro Simulation stress cockpit</span>
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-4">System Stress Simulation</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mb-6 max-w-2xl">
                Test how your virtual paper trading holdings hold up against simulated systemic market shocks. Our simulator calculates instant portfolio value deviations and correlation drifts.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: "Interest Rate Cut Simulation",
                    desc: "Simulate a sudden -50bps federal funding rate cut. Accelerates growth assets, increases high-beta equity margins.",
                    action: "Simulate Cut",
                    impact: "+4.1% Value Change"
                  },
                  {
                    name: "Energy Supply Interruption Shock",
                    desc: "Simulate high oil & gas spot prices. Triggers structural cost headwind for logistics, increases defensive value hedges.",
                    action: "Simulate Crisis",
                    impact: "-3.5% Value Change"
                  },
                  {
                    name: "Enterprise Software Breakout",
                    desc: "Simulate rapid corporate tech integrations. High demand increases MSFT, AAPL software margins.",
                    action: "Simulate Breakout",
                    impact: "+6.8% Value Change"
                  }
                ].map((sim, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-lg border border-slate-900 text-xs flex flex-col justify-between gap-4">
                    <div className="space-y-1.5">
                      <span className="text-white font-medium font-display block">{sim.name}</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{sim.desc}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-brand-cyan font-bold">{sim.impact}</span>
                      <button
                        onClick={async () => {
                          try {
                            const modifier = sim.impact.startsWith("+") ? 1.04 : 0.96;
                            // Update totalValue in db via a strategic re-balancing nudge or portfolio multiplier simulation!
                            const updatedHoldings = portfolio.holdings.map(h => ({
                              ...h,
                              avgPrice: Number((h.avgPrice * modifier).toFixed(2))
                            }));
                            const targetVal = portfolio.buyingPower + updatedHoldings.reduce((sum, current) => {
                              const st = stocks.find(s => s.symbol === current.symbol);
                              const p = st ? st.price * modifier : current.avgPrice;
                              return sum + current.shares * p;
                            }, 0);
                            
                            // Re-fetch state
                            setPortfolio(prev => ({
                              ...prev,
                              history: prev.history.map(p => ({ ...p, value: Number((p.value * modifier).toFixed(2)) }))
                            }));
                            
                            setErrorAlert(null);
                            setSuccessAlert(`Macro Simulation Applied! The performance curves have adjusted to match the ${sim.name} scenario.`);
                          } catch (err: any) {
                            setErrorAlert("Failed to run macro scenario projection.");
                          }
                        }}
                        className="bg-brand-blue/15 hover:bg-brand-blue/30 border border-brand-cyan/25 text-white text-[10px] font-mono px-2.5 py-1 rounded transition-all cursor-pointer"
                      >
                        {sim.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Academy Investing Lessons */}
        {activeTab === "Academy" && (
          <div className="space-y-6 animate-fadeIn" id="academy-workspace">
            <div className="bg-[#0d111a] border border-[#1e293b] rounded-lg p-6 glowing-shadow">
              <div className="flex items-center gap-1.5 text-xs font-mono text-brand-cyan uppercase tracking-wider mb-2">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Premium Financial Academy</span>
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-6">Investment Academy & Strategy lessons</h2>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Lesson Sidebar Selector */}
                <div className="lg:col-span-4 space-y-2">
                  {[
                    { id: 1, title: "Lesson 1: Introduction to Portfolio Beta", difficulty: "Beginner" },
                    { id: 2, title: "Lesson 2: Risk-Parity Allocation Principles", difficulty: "Intermediate" },
                    { id: 3, title: "Lesson 3: Implied Volatility and Spreads", difficulty: "Advanced" }
                  ].map((less) => (
                    <button
                      key={less.id}
                      onClick={() => {
                        setActiveLesson(less.id);
                        setQuizAnswer(null);
                        setQuizPassed(null);
                      }}
                      className={`w-full text-left p-3.5 rounded-lg border text-xs transition-all cursor-pointer ${
                        activeLesson === less.id
                          ? "bg-brand-blue/10 border-brand-cyan/40 text-white"
                          : "bg-slate-950/40 border-slate-900 text-slate-400 hover:bg-slate-950 hover:text-white"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-display font-medium">{less.title}</span>
                        <span className="text-[9px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                          {less.difficulty}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Lesson Contents Screen */}
                <div className="lg:col-span-8 bg-slate-950/50 border border-slate-900 rounded-lg p-5 space-y-5">
                  {activeLesson === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-display font-semibold text-white">Lesson 1: Understanding Asset Beta (β)</h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        Beta measures a security&apos;s sensitivity or systematic volatility relative to the broader market index (e.g., the S&P 500). 
                        A benchmark index represents a beta score of <strong className="text-brand-cyan">1.0</strong>.
                      </p>
                      <div className="bg-[#07090e] p-3.5 rounded border border-[#1e293b] space-y-2 text-xs">
                        <p className="text-white font-medium">Core Rules:</p>
                        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 font-sans">
                          <li><strong>Beta &gt; 1.0:</strong> Elevated volatility. Highly cyclical (e.g. NVDA, TSLA). Offers higher potential returns, but steep drawdowns during corrections.</li>
                          <li><strong>Beta &lt; 1.0:</strong> Deflected volatility. Steady cash flow leaders (e.g. consumer staples, utility shares).</li>
                        </ul>
                      </div>

                      {/* Mini Quiz */}
                      <div className="border-t border-slate-800/80 pt-4 mt-4 space-y-3">
                        <span className="text-[10px] font-mono text-brand-cyan font-bold uppercase tracking-wider block">
                          Interactive Concept Check
                        </span>
                        <p className="text-xs text-white font-medium">
                          If the S&P 500 drops by 10% and Apple (AAPL) has a simulated beta of 1.2, what is Apple&apos;s expected percentage movement?
                        </p>

                        <div className="flex flex-col gap-2 pt-1.5">
                          {[
                            { key: "A", text: "Apple rises by 12%" },
                            { key: "B", text: "Apple drops by 12%" },
                            { key: "C", text: "Apple drops by exactly 10%" }
                          ].map((opt) => (
                            <button
                              key={opt.key}
                              onClick={() => handleQuizSubmit(opt.key)}
                              className={`w-full text-left p-3.5 rounded border text-xs font-sans transition-all cursor-pointer ${
                                quizAnswer === opt.key
                                  ? opt.key === "B"
                                    ? "bg-emerald-500/10 border-emerald-500/45 text-emerald-400"
                                    : "bg-rose-500/10 border-rose-500/45 text-rose-400"
                                  : "bg-[#07090e] border-slate-900 text-slate-300 hover:bg-slate-900"
                              }`}
                            >
                              <strong className="font-mono">{opt.key}.</strong> {opt.text}
                            </button>
                          ))}
                        </div>

                        {quizPassed === true && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-mono flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span>Correct! High-beta assets multiply systemic benchmark movements. Apple drops by 12%.</span>
                          </div>
                        )}
                        {quizPassed === false && (
                          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-mono">
                            Incorrect. Remember that Beta determines the scaling multiplier of market corrections. Try again!
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeLesson === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-display font-semibold text-white">Lesson 2: Risk-Parity Allocation Principles</h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        Risk parity is an investment philosophy that allocates capital based on risk contributions rather than nominal dollar weightings. 
                        In traditional 60/40 portfolios, equity volatility actually represents over 90% of total portfolio risk.
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        By matching asset weights to their inverse volatility profiles, risk parity creates a steady, resilient compounding curve.
                      </p>
                      <div className="p-4 bg-slate-900/40 border border-slate-800 rounded text-[11px] text-slate-400 leading-relaxed">
                        💡 <strong>Application:</strong> In the right-hand panel, our <strong className="text-brand-cyan">Optimize Portfolio</strong> model calculates risk weights dynamically to transition your concentrated technology stakes toward high-parity balances.
                      </div>
                    </div>
                  )}

                  {activeLesson === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-display font-semibold text-white">Lesson 3: Implied Volatility and Option Spreads</h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        Implied Volatility (IV) represents the market&apos;s forecast of a likely movement in a security&apos;s price. It is derived from active options pricing. 
                        Elevated IV points to massive expected swings (e.g. right before quarterly earnings season).
                      </p>
                      <div className="p-3.5 bg-[#07090e] border border-indigo-900/20 rounded font-mono text-[10px] space-y-1 text-slate-400">
                        <span className="text-indigo-400 font-semibold block uppercase">Simulating Earnings tomorrow:</span>
                        <span>NVDA Implied Move: ±8.4%</span>
                        <br />
                        <span>AAPL Implied Move: ±3.9%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 5. Bottom Ticker Tape & Status Margin (Matches screenshot layout) */}
      <footer className="border-t border-[#1e293b] bg-[#07090e] py-3.5">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono tracking-wider">
          
          {/* Moving Ticker */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-400 overflow-hidden text-center md:text-left" id="ticker-tape">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold">S&P 500</span>
              <span className="text-white font-semibold">{tickerPrices.sp500.toLocaleString()}</span>
              <span className={tickerPrices.spChange >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {tickerPrices.spChange >= 0 ? "+" : ""}{tickerPrices.spChange}%
              </span>
            </div>
            <div className="text-slate-600">|</div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold">NASDAQ</span>
              <span className="text-white font-semibold">{tickerPrices.nasdaq.toLocaleString()}</span>
              <span className={tickerPrices.ndChange >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {tickerPrices.ndChange >= 0 ? "+" : ""}{tickerPrices.ndChange}%
              </span>
            </div>
            <div className="text-slate-600">|</div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold">GOLD</span>
              <span className="text-white font-semibold">${tickerPrices.gold.toLocaleString()}</span>
              <span className={tickerPrices.goldChange >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {tickerPrices.goldChange >= 0 ? "+" : ""}{tickerPrices.goldChange}%
              </span>
            </div>
            <div className="text-slate-600">|</div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold">BTC/USD</span>
              <span className="text-white font-semibold">${tickerPrices.btc.toLocaleString()}</span>
              <span className={tickerPrices.btcChange >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {tickerPrices.btcChange >= 0 ? "+" : ""}{tickerPrices.btcChange}%
              </span>
            </div>
            <div className="text-slate-600">|</div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold">VIX</span>
              <span className="text-white font-semibold">{tickerPrices.vix.toLocaleString()}</span>
              <span className={tickerPrices.vixChange >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {tickerPrices.vixChange >= 0 ? "+" : ""}{tickerPrices.vixChange}%
              </span>
            </div>
          </div>

          {/* Infrastructure Metrics (Matches bottom-right screenshot style) */}
          <div className="flex items-center gap-4 text-slate-500 uppercase shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-badge"></span>
              <span>Network Stable</span>
            </div>
            <span>Latency 19ms</span>
          </div>
          
        </div>
      </footer>
    </div>
  );
}
