import { create } from "zustand";
import { Stock, PortfolioState, Collection } from "../types";
import { api } from "../lib/api";

interface AppState {
  user: any;
  loadingUser: boolean;
  errorAlert: string | null;
  successAlert: string | null;
  activeTab: "Terminal" | "Market" | "Intelligence" | "Simulations" | "Academy";
  chartView: "recharts" | "tradingview";
  stocks: Stock[];
  selectedStock: Stock | null;
  selectedCollection: Collection | null;
  watchlistSymbols: string[];
  transactions: any[];
  portfolio: PortfolioState;
  
  // Actions
  setUser: (user: any) => void;
  setLoadingUser: (loading: boolean) => void;
  setErrorAlert: (error: string | null) => void;
  setSuccessAlert: (success: string | null) => void;
  setActiveTab: (tab: "Terminal" | "Market" | "Intelligence" | "Simulations" | "Academy") => void;
  setChartView: (view: "recharts" | "tradingview") => void;
  setSelectedStock: (stock: Stock | null) => void;
  setSelectedCollection: (collection: Collection | null) => void;
  setWatchlistSymbols: (symbols: string[]) => void;
  
  // Async Hydration & Actions
  checkSession: () => Promise<void>;
  loadUserData: () => Promise<void>;
  executeTrade: (symbol: string, shares: number, type: "BUY" | "SELL") => Promise<void>;
  toggleWatchlist: (symbol: string) => Promise<void>;
  applyOptimization: (weights: any[]) => Promise<void>;
  logout: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  loadingUser: true,
  errorAlert: null,
  successAlert: null,
  activeTab: "Terminal",
  chartView: "tradingview",
  stocks: [],
  selectedStock: null,
  selectedCollection: null,
  watchlistSymbols: [],
  transactions: [],
  portfolio: {
    totalValue: 1242591.42,
    buyingPower: 1000000.00,
    holdings: [],
    history: []
  },

  setUser: (user) => set({ user }),
  setLoadingUser: (loadingUser) => set({ loadingUser }),
  setErrorAlert: (errorAlert) => set({ errorAlert }),
  setSuccessAlert: (successAlert) => set({ successAlert }),
  setActiveTab: (activeTab) => set({ activeTab, errorAlert: null, successAlert: null }),
  setChartView: (chartView) => set({ chartView }),
  setSelectedStock: (selectedStock) => set({ selectedStock, selectedCollection: null }),
  setSelectedCollection: (selectedCollection) => set({ selectedCollection }),
  setWatchlistSymbols: (watchlistSymbols) => set({ watchlistSymbols }),

  checkSession: async () => {
    try {
      const sessionUser = await api.getSession();
      set({ user: sessionUser, loadingUser: false });
    } catch (err) {
      set({ user: null, loadingUser: false });
    }
  },

  loadUserData: async () => {
    const { user, selectedStock } = get();
    if (!user) return;
    try {
      const [stList, port, wl, txs] = await Promise.all([
        api.getStocks(),
        api.getPortfolio(),
        api.getWatchlist(),
        api.getTransactions()
      ]);

      const updates: Partial<AppState> = {
        stocks: stList,
        portfolio: port,
        watchlistSymbols: wl,
        transactions: txs
      };

      if (stList.length > 0 && !selectedStock) {
        updates.selectedStock = stList[0];
      }

      set(updates);
    } catch (err: any) {
      console.error("Error fetching secure metrics from ledger:", err);
    }
  },

  executeTrade: async (symbol: string, shares: number, type: "BUY" | "SELL") => {
    set({ errorAlert: null, successAlert: null });
    try {
      await api.executeTrade(symbol, shares, type);
      await get().loadUserData();
      set({ successAlert: `Simulated transaction logged successfully: ${type} ${shares} shares of ${symbol}` });
    } catch (err: any) {
      set({ errorAlert: err.message || "Failed to execute transaction on system ledger" });
      throw err;
    }
  },

  toggleWatchlist: async (symbol: string) => {
    set({ errorAlert: null });
    try {
      const isCurrentlyWatchlisted = get().watchlistSymbols.includes(symbol);
      let updatedSymbols: string[];
      if (isCurrentlyWatchlisted) {
        updatedSymbols = await api.removeFromWatchlist(symbol);
        set({ successAlert: `${symbol} removed from watchlist.` });
      } else {
        updatedSymbols = await api.addToWatchlist(symbol);
        set({ successAlert: `${symbol} added to watchlist.` });
      }
      set({ watchlistSymbols: updatedSymbols });
    } catch (err: any) {
      set({ errorAlert: "Failed to sync watchlist change with cloud ledger" });
    }
  },

  applyOptimization: async (weights: any[]) => {
    set({ errorAlert: null, successAlert: null });
    try {
      await api.rebalancePortfolio(weights);
      await get().loadUserData();
      set({ successAlert: "Strategic portfolio optimization rebalance successfully executed" });
    } catch (err: any) {
      set({ errorAlert: "Strategic portfolio optimization rebalance failed" });
    }
  },

  logout: () => {
    api.logout();
    set({
      user: null,
      stocks: [],
      selectedStock: null,
      selectedCollection: null,
      watchlistSymbols: [],
      transactions: [],
      errorAlert: null,
      successAlert: null
    });
  }
}));
