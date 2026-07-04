import { Stock, Holding, ChartPoint, PortfolioState, ChatMessage, SimulationScenario } from "../types";

const API_BASE = "/api";

// Manage custom Bearer tokens for secure session retrieval inside iframe
export function getStoredToken(): string | null {
  return localStorage.getItem("aetheris_session_token");
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem("aetheris_session_token", token);
  } else {
    localStorage.removeItem("aetheris_session_token");
  }
}

// Global fetch wrapper that injects Bearer token
async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  async signup(email: string, password: string) {
    const data = await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    setStoredToken(data.token);
    return data;
  },

  async login(email: string, password: string) {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    setStoredToken(data.token);
    return data;
  },

  async logout() {
    setStoredToken(null);
  },

  async getSession() {
    try {
      const token = getStoredToken();
      if (!token) return null;
      return await apiFetch("/auth/session");
    } catch (e) {
      setStoredToken(null);
      return null;
    }
  },

  async forgotPassword(email: string) {
    return await apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    });
  },

  async resetPassword(email: string, code: string, newPassword: string) {
    return await apiFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, newPassword })
    });
  },

  async verifyEmail(email: string, code: string) {
    const data = await apiFetch("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code })
    });
    if (data.token) {
      setStoredToken(data.token);
    }
    return data;
  },

  async googleLogin(email: string) {
    const data = await apiFetch("/auth/google", {
      method: "POST",
      body: JSON.stringify({ email })
    });
    setStoredToken(data.token);
    return data;
  },

  // Portfolio
  async getPortfolio(): Promise<PortfolioState> {
    return await apiFetch("/portfolio");
  },

  async executeTrade(symbol: string, shares: number, type: "BUY" | "SELL") {
    return await apiFetch("/portfolio/trade", {
      method: "POST",
      body: JSON.stringify({ symbol, shares, type })
    });
  },

  // Transactions
  async getTransactions(): Promise<any[]> {
    return await apiFetch("/transactions");
  },

  // Watchlist
  async getWatchlist(): Promise<string[]> {
    const res = await apiFetch("/watchlist");
    return Array.isArray(res) ? res : (res?.symbols || []);
  },

  async toggleWatchlist(symbol: string): Promise<string[]> {
    const res = await apiFetch("/watchlist/toggle", {
      method: "POST",
      body: JSON.stringify({ symbol })
    });
    return Array.isArray(res) ? res : (res?.symbols || []);
  },

  async addToWatchlist(symbol: string): Promise<string[]> {
    return this.toggleWatchlist(symbol);
  },

  async removeFromWatchlist(symbol: string): Promise<string[]> {
    return this.toggleWatchlist(symbol);
  },

  async rebalancePortfolio(weights: any[]): Promise<any> {
    return await apiFetch("/portfolio/rebalance", {
      method: "POST",
      body: JSON.stringify({ weights })
    });
  },

  // Market & Stocks
  async getStocks(): Promise<Stock[]> {
    return await apiFetch("/stocks");
  },

  async getMarketOverview(): Promise<{
    gainers: Stock[];
    losers: Stock[];
    indices: {
      sp500: { price: number; change: number; changePercent: number };
      nasdaq: { price: number; change: number; changePercent: number };
      vix: { price: number; change: number; changePercent: number };
    };
  }> {
    return await apiFetch("/market/overview");
  },

  // Gemini AI Proxies
  async copilotChat(message: string, portfolio: PortfolioState, chatHistory: { role: string; content: string }[]) {
    return await apiFetch("/gemini/copilot", {
      method: "POST",
      body: JSON.stringify({ message, portfolio, chatHistory })
    });
  },

  async optimizePortfolio(portfolio: PortfolioState) {
    return await apiFetch("/gemini/optimize", {
      method: "POST",
      body: JSON.stringify({ portfolio })
    });
  },

  async simulateVolatility(portfolio: PortfolioState) {
    return await apiFetch("/gemini/simulate-volatility", {
      method: "POST",
      body: JSON.stringify({ portfolio })
    });
  }
};
