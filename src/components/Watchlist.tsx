import React, { useState } from "react";
import { Stock, Collection } from "../types";
import { AI_COLLECTIONS } from "../data";
import { Activity, ShieldCheck, Zap, Star, Search, PlusCircle } from "lucide-react";

interface WatchlistProps {
  stocks: Stock[];
  selectedStock: Stock | null;
  onSelectStock: (stock: Stock) => void;
  selectedCollection: Collection | null;
  onSelectCollection: (collection: Collection | null) => void;
  watchlistSymbols: string[];
  onToggleWatchlist: (symbol: string) => void;
}

export default function Watchlist({
  stocks,
  selectedStock,
  onSelectStock,
  selectedCollection,
  onSelectCollection,
  watchlistSymbols,
  onToggleWatchlist
}: WatchlistProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Get a matching collection icon
  const getCollectionIcon = (id: string) => {
    switch (id) {
      case "semi_surge":
        return <Zap className="h-4 w-4 text-amber-400" />;
      case "renewable_alpha":
        return <ShieldCheck className="h-4 w-4 text-emerald-400" />;
      case "macro_hedge":
        return <Activity className="h-4 w-4 text-purple-400" />;
      default:
        return <Activity className="h-4 w-4 text-blue-400" />;
    }
  };

  // Filter stocks based on search query
  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Divide stocks into Watchlisted (Primary) and Other Securities for search/discovery
  const watchlistedStocks = filteredStocks.filter(s => watchlistSymbols.includes(s.symbol));
  const otherStocks = filteredStocks.filter(s => !watchlistSymbols.includes(s.symbol));

  const renderStockRow = (stock: Stock) => {
    const isSelected = selectedStock?.symbol === stock.symbol && !selectedCollection;
    const isPositive = stock.changePercent >= 0;
    const isWatchlisted = watchlistSymbols.includes(stock.symbol);

    return (
      <div
        key={stock.symbol}
        className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all duration-200 border relative group ${
          isSelected
            ? "bg-brand-blue/10 border-brand-cyan/35 shadow-sm"
            : "bg-[#0d111a]/60 hover:bg-[#0d111a] border-[#1e293b]/50 hover:border-slate-700"
        }`}
      >
        {/* Toggle Watchlist Star (Left Side) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist(stock.symbol);
          }}
          className="p-1 rounded text-slate-500 hover:text-amber-400 hover:bg-slate-800/40 transition-all cursor-pointer mr-1"
          title={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
        >
          <Star className={`h-3.5 w-3.5 ${isWatchlisted ? "fill-amber-400 text-amber-400 animate-pulse" : "text-slate-600"}`} />
        </button>

        {/* Selection Area click mapping */}
        <button
          onClick={() => {
            onSelectCollection(null);
            onSelectStock(stock);
          }}
          className="flex-1 flex items-center justify-between text-left cursor-pointer outline-none"
        >
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-semibold text-xs text-white tracking-wide">
                {stock.symbol}
              </span>
              <span className="text-[9px] font-mono text-slate-500 truncate max-w-[70px]">
                {stock.name}
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 block">
              Vol: {stock.volume}
            </span>
          </div>

          <div className="text-right shrink-0">
            <div className="font-mono text-xs font-semibold text-white">
              ${stock.price.toFixed(2)}
            </div>
            <div
              className={`font-mono text-[10px] font-medium ${
                isPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isPositive ? "+" : ""}
              {stock.changePercent.toFixed(2)}%
            </div>
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5" id="watchlist-sidebar">
      
      {/* Dynamic Search & Quote Finder */}
      <div className="bg-[#0d111a]/40 border border-[#1e293b]/40 rounded-lg p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#07090e] border border-slate-800 focus:border-brand-cyan/40 rounded-md pl-8 pr-3 py-1.5 text-[11px] font-mono text-white placeholder-slate-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Watchlist Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
            Watchlist Prime
          </span>
          <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            {watchlistSymbols.length} Tickers
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {watchlistedStocks.length > 0 ? (
            watchlistedStocks.map(renderStockRow)
          ) : (
            <div className="text-center py-6 px-4 border border-dashed border-slate-800/60 rounded-lg bg-slate-950/20">
              <Star className="h-5 w-5 text-slate-700 mx-auto mb-1.5" />
              <p className="text-[10px] font-sans text-slate-500">
                No active watchlisted tickers. Star items below to add.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Other Markets / Discover Section */}
      {otherStocks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
              Global Indices & Equities
            </span>
            <span className="text-[9px] font-mono text-slate-500">Available</span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1">
            {otherStocks.map(renderStockRow)}
          </div>
        </div>
      )}

      {/* AI Collections Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
            AI Baskets & Themes
          </span>
          <span className="text-[9px] font-mono text-indigo-400 font-semibold uppercase">Alpha Node</span>
        </div>

        <div className="flex flex-col gap-2">
          {AI_COLLECTIONS.map((col) => {
            const isSelected = selectedCollection?.id === col.id;

            return (
              <button
                key={col.id}
                onClick={() => onSelectCollection(isSelected ? null : col)}
                className={`w-full p-3 rounded-lg text-left transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? "bg-[#6366f1]/10 border-[#6366f1]/40 shadow-sm"
                    : "bg-[#0d111a]/40 hover:bg-[#0d111a] border-[#1e293b]/30 hover:border-indigo-900/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  {getCollectionIcon(col.id)}
                  <span className="font-display font-medium text-[11px] text-white">
                    {col.name}
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 mt-1 line-clamp-2 leading-relaxed font-sans">
                  {col.description}
                </p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {col.symbols.map((sym) => {
                    const matchedStock = stocks.find(s => s.symbol === sym);
                    return (
                      <span
                        key={sym}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (matchedStock) {
                            onSelectCollection(null);
                            onSelectStock(matchedStock);
                          } else {
                            // Create a high-fidelity temporary Stock object so it can be loaded
                            const tempStock: Stock = {
                              symbol: sym,
                              name: sym === "TSMC" ? "TSMC ADR" : sym === "GLD" ? "SPDR Gold Shares" : sym === "VIX" ? "Volatility Index" : sym,
                              price: sym === "GLD" ? 210.40 : sym === "TSMC" ? 141.20 : 100.00,
                              change: 0.00,
                              changePercent: 0.00,
                              volume: "1.2M",
                              marketCap: "N/A",
                              peRatio: 0,
                              dividendYield: 0,
                              fiftyTwoWeekHigh: 100.00,
                              fiftyTwoWeekLow: 100.00,
                              description: `${sym} index tracking representation.`,
                              history: []
                            };
                            onSelectCollection(null);
                            onSelectStock(tempStock);
                          }
                        }}
                        className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-slate-900/80 hover:bg-brand-blue/30 text-slate-300 border border-slate-800/50 hover:border-brand-cyan/40 cursor-pointer transition-all"
                      >
                        {sym}
                      </span>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
