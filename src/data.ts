import { Stock, Holding, ChartPoint, Collection } from "./types";

// Generate highly authentic historical data points for realistic charts
export function generateHistory(baseValue: number, days: number, variance: number, trend = 0.001): ChartPoint[] {
  const points: ChartPoint[] = [];
  let currentValue = baseValue;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    // Random walk with subtle trend
    const changePercent = (Math.random() - 0.48) * variance + trend;
    currentValue = currentValue * (1 + changePercent);
    
    points.push({
      date: dateStr,
      value: Number(currentValue.toFixed(2))
    });
  }
  return points;
}

export const INITIAL_STOCKS: Stock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 189.43,
    change: 2.32,
    changePercent: 1.24,
    volume: "52.4M",
    marketCap: "2.98T",
    peRatio: 28.4,
    dividendYield: 0.52,
    fiftyTwoWeekHigh: 199.62,
    fiftyTwoWeekLow: 164.08,
    description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. Its signature products include the iPhone, Mac, iPad, and Apple Watch.",
    history: generateHistory(180, 30, 0.02, 0.002)
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 824.11,
    change: 30.31,
    changePercent: 3.82,
    volume: "41.8M",
    marketCap: "2.06T",
    peRatio: 74.2,
    dividendYield: 0.02,
    fiftyTwoWeekHigh: 875.12,
    fiftyTwoWeekLow: 262.20,
    description: "NVIDIA Corporation focuses on personal computer graphics, graphics processing units, and also artificial intelligence solutions. It operates through two segments: Graphics and Compute & Networking.",
    history: generateHistory(780, 30, 0.04, 0.005)
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 171.05,
    change: -3.68,
    changePercent: -2.11,
    volume: "88.1M",
    marketCap: "545.2B",
    peRatio: 40.8,
    dividendYield: 0,
    fiftyTwoWeekHigh: 299.29,
    fiftyTwoWeekLow: 138.80,
    description: "Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally.",
    history: generateHistory(185, 30, 0.05, -0.003)
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 415.58,
    change: 0.21,
    changePercent: 0.05,
    volume: "22.3M",
    marketCap: "3.09T",
    peRatio: 36.1,
    dividendYield: 0.72,
    fiftyTwoWeekHigh: 430.82,
    fiftyTwoWeekLow: 315.18,
    description: "Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. Its Productivity and Business Processes segment includes Office, Exchange, SharePoint, and LinkedIn.",
    history: generateHistory(410, 30, 0.015, 0.001)
  }
];

// High-fidelity portfolio starting points matching the visual values perfectly
export const INITIAL_HOLDINGS: Holding[] = [
  { symbol: "AAPL", name: "Apple Inc.", shares: 1500, avgPrice: 175.50 },
  { symbol: "NVDA", name: "NVIDIA Corp.", shares: 650, avgPrice: 610.20 },
  { symbol: "TSLA", name: "Tesla, Inc.", shares: 1200, avgPrice: 188.40 },
  { symbol: "MSFT", name: "Microsoft Corp.", shares: 422.0835, avgPrice: 395.10 }
];

export const INITIAL_BUYING_POWER = 42105.00;

// Thematic portfolios (AI Collections)
export const AI_COLLECTIONS: Collection[] = [
  {
    id: "semi_surge",
    name: "Semiconductor Surge",
    description: "Focused exposure on foundational silicon, advanced foundry processing, and machine-learning compute nodes.",
    symbols: ["NVDA", "TSMC", "ASML", "AMD"]
  },
  {
    id: "renewable_alpha",
    name: "Renewable Alpha",
    description: "High-conviction green transition equities covering grid energy storage and clean solar technologies.",
    symbols: ["ENPH", "FSLR", "TSLA", "NEE"]
  },
  {
    id: "macro_hedge",
    name: "Macro Hedge Strategy",
    description: "Tactical safety hedges focusing on global treasury equivalents, gold indices, and premium risk-parity balances.",
    symbols: ["GLD", "TLT", "SHY", "VIX"]
  }
];
