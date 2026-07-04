export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Holding {
  symbol: string;
  shares: number;
  averagePrice: number;
}

export interface Portfolio {
  buyingPower: number;
  totalValue: number;
  holdings: Holding[];
}

export interface Watchlist {
  symbols: string[];
}

export interface Transaction {
  id: string;
  userId: string;
  symbol: string;
  shares: number;
  price: number;
  type: 'BUY' | 'SELL';
  timestamp: string;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  history: { date: string; price: number }[];
}

export class RelationalDatabase {
  private users: Map<string, User & { passwordHash: string }> = new Map();
  private portfolios: Map<string, Portfolio> = new Map();
  private watchlists: Map<string, Watchlist> = new Map();
  private transactions: Map<string, Transaction[]> = new Map();
  private stocks: Map<string, Stock> = new Map();

  constructor() {
    this.seedStocks();
  }

  private seedStocks() {
    const initialStocks: Stock[] = [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, change: 1.25, changePercent: 0.72, volume: '52M', marketCap: '$2.7T', history: [] },
      { symbol: 'MSFT', name: 'Microsoft Corporation', price: 420.20, change: -2.30, changePercent: -0.54, volume: '22M', marketCap: '$3.1T', history: [] },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 152.10, change: 0.85, changePercent: 0.56, volume: '28M', marketCap: '$1.9T', history: [] },
      { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 178.40, change: 3.10, changePercent: 1.77, volume: '35M', marketCap: '$1.8T', history: [] },
      { symbol: 'TSLA', name: 'Tesla, Inc.', price: 171.05, change: -4.50, changePercent: -2.56, volume: '81M', marketCap: '$540B', history: [] },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.12, change: 12.40, changePercent: 1.44, volume: '48M', marketCap: '$2.2T', history: [] },
    ];
    initialStocks.forEach(s => this.stocks.set(s.symbol, s));
  }

  getUserById(id: string): User | undefined {
    const u = this.users.get(id);
    if (!u) return undefined;
    return { id: u.id, email: u.email, createdAt: u.createdAt };
  }

  getPortfolio(userId: string): Portfolio {
    if (!this.portfolios.has(userId)) {
      this.portfolios.set(userId, { buyingPower: 100000, totalValue: 100000, holdings: [] });
    }
    return this.portfolios.get(userId)!;
  }

  getHoldings(userId: string): Holding[] {
    return this.getPortfolio(userId).holdings;
  }

  executeTrade(userId: string, symbol: string, shares: number, type: 'BUY' | 'SELL', price: number, timestamp: string): void {
    const portfolio = this.getPortfolio(userId);
    const stock = this.stocks.get(symbol);
    if (!stock) throw new Error('Stock not found');

    const tradeValue = price * shares;

    if (type === 'BUY') {
      if (portfolio.buyingPower < tradeValue) {
        throw new Error('Insufficient buying power');
      }
      portfolio.buyingPower -= tradeValue;
      const existing = portfolio.holdings.find(h => h.symbol === symbol);
      if (existing) {
        const totalCost = (existing.shares * existing.averagePrice) + tradeValue;
        existing.shares += shares;
        existing.averagePrice = totalCost / existing.shares;
      } else {
        portfolio.holdings.push({ symbol, shares, averagePrice: price });
      }
    } else {
      const existing = portfolio.holdings.find(h => h.symbol === symbol);
      if (!existing || existing.shares < shares) {
        throw new Error('Insufficient shares');
      }
      portfolio.buyingPower += tradeValue;
      existing.shares -= shares;
      if (existing.shares === 0) {
        portfolio.holdings = portfolio.holdings.filter(h => h.symbol !== symbol);
      }
    }

    // Update total value
    this.updatePortfolioValue(userId);
  }

  private updatePortfolioValue(userId: string) {
    const portfolio = this.portfolios.get(userId);
    if (!portfolio) return;
    let holdingsValue = 0;
    portfolio.holdings.forEach(h => {
      const stock = this.stocks.get(h.symbol);
      const currentPrice = stock ? stock.price : h.averagePrice;
      holdingsValue += h.shares * currentPrice;
    });
    portfolio.totalValue = portfolio.buyingPower + holdingsValue;
  }

  getWatchlist(userId: string): Watchlist {
    if (!this.watchlists.has(userId)) {
      this.watchlists.set(userId, { symbols: ['AAPL', 'MSFT', 'GOOGL'] });
    }
    return this.watchlists.get(userId)!;
  }

  toggleWatchlist(userId: string, symbol: string): Watchlist {
    const wl = this.getWatchlist(userId);
    if (wl.symbols.includes(symbol)) {
      wl.symbols = wl.symbols.filter(s => s !== symbol);
    } else {
      wl.symbols.push(symbol);
    }
    return wl;
  }

  getTransactions(userId: string): Transaction[] {
    return this.transactions.get(userId) || [];
  }

  rebalancePortfolio(userId: string, weights: { symbol: string; targetWeight: number }[]): void {
    const portfolio = this.getPortfolio(userId);
    let totalValue = portfolio.buyingPower;
    
    // Sum current holdings using current prices
    portfolio.holdings.forEach(h => {
      const stock = this.stocks.get(h.symbol);
      const price = stock ? stock.price : h.averagePrice;
      totalValue += h.shares * price;
    });

    // We will clear existing holdings and rebuild based on weights
    const newHoldings: Holding[] = [];
    let allocatedValue = 0;

    // Determine scale of weights: decimal (sum <= 1.5) or percentage (sum > 1.5)
    let isPercent = false;
    const sum = weights.reduce((acc, w) => acc + w.targetWeight, 0);
    if (sum > 1.5) {
      isPercent = true;
    }

    weights.forEach(w => {
      const stock = this.stocks.get(w.symbol);
      if (!stock) return;

      const factor = isPercent ? (w.targetWeight / 100) : w.targetWeight;
      const targetValue = totalValue * factor;
      const targetShares = Math.floor(targetValue / stock.price);
      
      if (targetShares > 0) {
        newHoldings.push({
          symbol: w.symbol,
          shares: targetShares,
          averagePrice: stock.price
        });
        allocatedValue += targetShares * stock.price;
      }
    });

    portfolio.holdings = newHoldings;
    portfolio.buyingPower = Math.max(0, totalValue - allocatedValue);
    this.updatePortfolioValue(userId);
  }

  addTransaction(tx: Transaction): void {
    const list = this.getTransactions(tx.userId);
    list.push(tx);
    this.transactions.set(tx.userId, list);
  }

  getStocks(): Stock[] {
    return Array.from(this.stocks.values());
  }

  getStockBySymbol(symbol: string): Stock | undefined {
    return this.stocks.get(symbol);
  }

  getUserByEmail(email: string): User | undefined {
    const u = Array.from(this.users.values()).find(user => user.email === email);
    return u ? { id: u.id, email: u.email, createdAt: u.createdAt } : undefined;
  }

  updatePassword(email: string, passwordHash: string): boolean {
    const u = Array.from(this.users.values()).find(user => user.email === email);
    if (!u) return false;
    this.users.set(u.id, { ...u, passwordHash });
    return true;
  }

  authenticateUser(email: string, passwordHash: string): User | undefined {
    const u = Array.from(this.users.values()).find(user => user.email === email && user.passwordHash === passwordHash);
    return u ? { id: u.id, email: u.email, createdAt: u.createdAt } : undefined;
  }

  registerUserWithId(id: string, email: string, passwordHash: string): User {
    const u = { id, email, passwordHash, createdAt: new Date().toISOString() };
    this.users.set(id, u);
    return { id: u.id, email: u.email, createdAt: u.createdAt };
  }

  registerUser(email: string, passwordHash: string): User {
    const id = Math.random().toString(36).substr(2, 9);
    return this.registerUserWithId(id, email, passwordHash);
  }
}

export const db = new RelationalDatabase();
