export type AssetClass = 'stock' | 'crypto' | 'commodity' | 'forex' | 'index';

export interface MarketIndex {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  badgeNumber: string;
  badgeColor: string; // e.g. 'bullish', 'bearish', 'neutral'
  sparkline: number[];
  high52w: number;
  low52w: number;
  dayHigh: number;
  dayLow: number;
}

export interface AnalystConsensus {
  buy: number;
  hold: number;
  sell: number;
  targetPrice: number;
  lowTarget: number;
  highTarget: number;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  volumeNum: number;
  avgVolume: string;
  marketCap: string;
  marketCapNum: number; // in billions
  peRatio: number | null;
  beta: number;
  dividendYield: string;
  eps: number;
  high52w: number;
  low52w: number;
  dayHigh: number;
  dayLow: number;
  openPrice: number;
  prevClose: number;
  sparkline: number[];
  analystConsensus: AnalystConsensus;
  description: string;
  exchange: string;
}

export interface CandleData {
  timestamp: number;
  dateStr: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PortfolioPosition {
  symbol: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
}

export interface TradeOrder {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  shares: number;
  price: number;
  total: number;
  timestamp: number;
  status: 'filled' | 'pending' | 'cancelled';
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: number;
  triggered: boolean;
}

export interface SectorPerformance {
  name: string;
  changePercent: number;
  weight: number; // % of total market
  topMover: string;
}

export interface EconomicEvent {
  id: string;
  time: string;
  date: string;
  country: string;
  flag: string;
  title: string;
  impact: 'High' | 'Medium' | 'Low';
  actual?: string;
  forecast?: string;
  previous?: string;
  betterThanExpected?: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  timeAgo: string;
  category: 'Macro' | 'Tech' | 'Earnings' | 'Crypto' | 'Energy';
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  relatedTickers: string[];
  readTime: string;
}
