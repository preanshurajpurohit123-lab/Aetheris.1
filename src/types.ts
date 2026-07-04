export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number; // raw price change
  changePercent: number; // e.g. 1.24 for 1.24%
  volume: string;
  marketCap: string;
  peRatio?: number;
  dividendYield?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  description?: string;
  history: ChartPoint[];
}

export interface ChartPoint {
  date: string;
  value: number;
}

export interface Holding {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
}

export interface PortfolioState {
  totalValue: number;
  buyingPower: number;
  holdings: Holding[];
  history: ChartPoint[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface OptimizationWeight {
  symbol: string;
  targetWeight: number;
  rationale: string;
}

export interface OptimizationResult {
  rationale: string;
  rebalancingRationale: string;
  recommendedWeights: OptimizationWeight[];
  estimatedRiskChange: string;
  estimatedAlphaImpact: string;
}

export interface SimulationScenario {
  name: string;
  probability: string;
  impact: string;
  outlook: string;
  relevance: "high" | "medium" | "low";
}

export interface VolatilityResult {
  summary: string;
  scenarios: SimulationScenario[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  symbols: string[];
}
