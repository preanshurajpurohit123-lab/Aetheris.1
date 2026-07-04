import React, { useState, useMemo } from "react";
import { Stock, PortfolioState } from "../types";
import { DollarSign, ShieldCheck, TrendingUp, AlertCircle, HelpCircle } from "lucide-react";

interface SimulatedTradeProps {
  stock: Stock;
  portfolio: PortfolioState;
  onExecuteTrade: (symbol: string, shares: number, price: number, type: "BUY" | "SELL") => void;
}

export default function SimulatedTrade({ stock, portfolio, onExecuteTrade }: SimulatedTradeProps) {
  const [sharesInput, setSharesInput] = useState<number | "">("");
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [showEducation, setShowEducation] = useState(false);

  // Find user's existing shares in their holding
  const existingHolding = useMemo(() => {
    return portfolio.holdings.find(h => h.symbol === stock.symbol);
  }, [portfolio.holdings, stock.symbol]);

  // Calculations
  const calculatedCost = useMemo(() => {
    if (!sharesInput || sharesInput <= 0) return 0;
    return sharesInput * stock.price;
  }, [sharesInput, stock.price]);

  const remainingCash = useMemo(() => {
    if (tradeType === "BUY") {
      return portfolio.buyingPower - calculatedCost;
    } else {
      return portfolio.buyingPower + calculatedCost;
    }
  }, [portfolio.buyingPower, tradeType, calculatedCost]);

  const canExecute = useMemo(() => {
    if (!sharesInput || sharesInput <= 0) return false;
    if (tradeType === "BUY") {
      return portfolio.buyingPower >= calculatedCost;
    } else {
      return existingHolding ? existingHolding.shares >= sharesInput : false;
    }
  }, [sharesInput, tradeType, calculatedCost, portfolio.buyingPower, existingHolding]);

  const handleTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharesInput || sharesInput <= 0 || !canExecute) return;

    onExecuteTrade(stock.symbol, Number(sharesInput), stock.price, tradeType);
    setSharesInput("");
  };

  return (
    <div className="bg-[#0d111a] border border-[#1e293b] rounded-lg p-5 glowing-shadow" id="simulated-trading-module">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-brand-cyan" />
          <h3 className="font-display font-semibold text-sm text-white tracking-wide">
            Simulated Execution Core
          </h3>
        </div>
        <button
          onClick={() => setShowEducation(!showEducation)}
          className="text-xs font-mono text-slate-400 hover:text-brand-cyan flex items-center gap-1 cursor-pointer"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Academy Tip</span>
        </button>
      </div>

      {showEducation && (
        <div className="bg-brand-blue/10 border border-brand-cyan/20 rounded-lg p-3.5 mb-4 text-xs space-y-2 animate-fadeIn">
          <p className="text-white font-medium">Educational Concept: Limit Orders vs Paper Executions</p>
          <p className="text-slate-300 leading-relaxed font-sans">
            Paper trading is an education system designed to build structural investing muscle without raw loss risk. Placing a 
            <span className="text-brand-cyan"> simulated order</span> immediately tests transaction logic against real-time market spreads.
          </p>
          <p className="text-[10px] text-slate-500 font-mono">
            Key Rule: Avoid chasing FOMO. Balance positions with strict beta risk-parity margins.
          </p>
        </div>
      )}

      {/* Trade Type Selection */}
      <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950 p-1 rounded-lg border border-slate-900">
        <button
          type="button"
          onClick={() => {
            setTradeType("BUY");
            setSharesInput("");
          }}
          className={`py-1.5 text-xs font-mono font-medium rounded transition-all cursor-pointer ${
            tradeType === "BUY"
              ? "bg-brand-blue/15 text-brand-cyan border border-brand-cyan/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Simulate BUY
        </button>
        <button
          type="button"
          onClick={() => {
            setTradeType("SELL");
            setSharesInput("");
          }}
          className={`py-1.5 text-xs font-mono font-medium rounded transition-all cursor-pointer ${
            tradeType === "SELL"
              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Simulate SELL
        </button>
      </div>

      <form onSubmit={handleTrade} className="space-y-4">
        {/* Statistics Bar */}
        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-900 text-xs font-mono space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Asset Price:</span>
            <span className="text-white">${stock.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Available Capital:</span>
            <span className="text-brand-cyan">${portfolio.buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Existing Holding:</span>
            <span className="text-white">
              {existingHolding ? `${existingHolding.shares.toFixed(1)} shares` : "0 shares"}
            </span>
          </div>
        </div>

        {/* Shares input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Shares Quantity
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              min="0.0001"
              value={sharesInput}
              onChange={(e) => {
                const val = e.target.value;
                setSharesInput(val === "" ? "" : Number(val));
              }}
              placeholder="0.0000"
              className="w-full bg-slate-950 border border-[#1e293b] text-white px-3.5 py-2.5 rounded-lg text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-brand-cyan/40"
              required
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-mono text-slate-500">SHARES</span>
          </div>
        </div>

        {/* Breakdown Panel */}
        {sharesInput !== "" && sharesInput > 0 && (
          <div className="bg-slate-950/40 p-3 rounded-lg border border-[#1e293b]/50 text-[11px] font-mono space-y-1 animate-fadeIn">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Valuation:</span>
              <span className="text-white">${calculatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Resulting Capital:</span>
              <span className={remainingCash < 0 ? "text-rose-400 font-semibold" : "text-slate-400"}>
                ${remainingCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {tradeType === "BUY" && portfolio.buyingPower < calculatedCost && (
              <div className="flex items-center gap-1 text-rose-400 text-[10px] mt-2">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>Error: Capital insufficient for execution.</span>
              </div>
            )}
            {tradeType === "SELL" && (!existingHolding || existingHolding.shares < sharesInput) && (
              <div className="flex items-center gap-1 text-rose-400 text-[10px] mt-2">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>Error: Insufficient shares for settlement.</span>
              </div>
            )}
          </div>
        )}

        {/* Call-to-action button */}
        <button
          type="submit"
          disabled={!canExecute}
          className={`w-full py-2.5 px-4 font-display font-semibold text-xs rounded-lg transition-all duration-200 cursor-pointer ${
            tradeType === "BUY"
              ? "bg-brand-blue hover:bg-brand-blue/90 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950"
              : "bg-rose-500 hover:bg-rose-600 disabled:bg-slate-800 disabled:text-slate-600 text-white"
          }`}
        >
          {tradeType === "BUY" ? "Execute Paper BUY" : "Execute Paper SELL"}
        </button>
      </form>
    </div>
  );
}
