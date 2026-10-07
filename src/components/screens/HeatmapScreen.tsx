import React, { useState } from 'react';
import { LayoutGrid, Filter, ArrowUpDown, ChevronRight, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { MarketAsset } from '../../types/market';

interface HeatmapScreenProps {
  assets: MarketAsset[];
  onSelectSymbol: (symbol: string) => void;
  onOpenOrderFor: (symbol: string) => void;
  onToggleWatchlist: (symbol: string) => void;
  isWatchlisted: (symbol: string) => boolean;
}

export const HeatmapScreen: React.FC<HeatmapScreenProps> = ({
  assets,
  onSelectSymbol,
  onOpenOrderFor,
  onToggleWatchlist,
  isWatchlisted,
}) => {
  const [activeView, setActiveView] = useState<'heatmap' | 'screener'>('heatmap');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [marketCapFilter, setMarketCapFilter] = useState('All');
  const [performanceFilter, setPerformanceFilter] = useState('All');
  const [peFilter, setPeFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'marketCap' | 'changePercent' | 'price' | 'volume'>('marketCap');
  const [sortAsc, setSortAsc] = useState(false);

  // Group assets by sector for treemap
  const sectors = Array.from(new Set(assets.map((a) => a.sector)));

  // Filtered assets for screener
  const filteredAssets = assets
    .filter((a) => (sectorFilter === 'All' ? true : a.sector === sectorFilter))
    .filter((a) => {
      if (marketCapFilter === 'Mega') return a.marketCapNum >= 200;
      if (marketCapFilter === 'Large') return a.marketCapNum < 200 && a.marketCapNum >= 10;
      return true;
    })
    .filter((a) => {
      if (performanceFilter === 'Gainers') return a.changePercent > 0;
      if (performanceFilter === 'Losers') return a.changePercent < 0;
      if (performanceFilter === 'HighVol') return Math.abs(a.changePercent) >= 2;
      return true;
    })
    .filter((a) => {
      if (peFilter === 'Low' && a.peRatio) return a.peRatio < 25;
      if (peFilter === 'Mid' && a.peRatio) return a.peRatio >= 25 && a.peRatio <= 50;
      if (peFilter === 'High' && a.peRatio) return a.peRatio > 50;
      return true;
    })
    .sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortBy === 'marketCap') {
        valA = a.marketCapNum;
        valB = b.marketCapNum;
      } else if (sortBy === 'changePercent') {
        valA = a.changePercent;
        valB = b.changePercent;
      } else if (sortBy === 'price') {
        valA = a.price;
        valB = b.price;
      } else if (sortBy === 'volume') {
        valA = a.volumeNum;
        valB = b.volumeNum;
      }
      return sortAsc ? valA - valB : valB - valA;
    });

  // Color mapping based on % change
  const getTileBg = (change: number) => {
    if (change >= 3) return 'bg-[#089981] text-white';
    if (change >= 1.5) return 'bg-[#0aa38b] text-white';
    if (change > 0) return 'bg-[#26a69a]/80 text-white';
    if (change <= -3) return 'bg-[#F23645] text-white';
    if (change <= -1.5) return 'bg-[#e53935] text-white';
    return 'bg-[#ef5350]/80 text-white';
  };

  return (
    <div className="space-y-5 pb-12 select-none">
      {/* 1. VIEW SWITCHER & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0E3EB] pb-3">
        <div>
          <h2 className="text-[20px] font-bold text-[#131722] tracking-tight">
            Market Heatmap & Multi-Factor Screener
          </h2>
          <p className="text-xs text-[#787B86]">
            S&P 500 visual capital allocation and high-density technical filter
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#F0F3FA] rounded-full self-start sm:self-auto">
          <button
            onClick={() => setActiveView('heatmap')}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
              activeView === 'heatmap'
                ? 'bg-[#131722] text-white shadow-2xs'
                : 'text-[#787B86] hover:text-[#131722]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Visual Heatmap</span>
          </button>
          <button
            onClick={() => setActiveView('screener')}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
              activeView === 'screener'
                ? 'bg-[#131722] text-white shadow-2xs'
                : 'text-[#787B86] hover:text-[#131722]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Stock Screener</span>
          </button>
        </div>
      </div>

      {/* 2. VIEW A: S&P 500 SECTOR HEATMAP */}
      {activeView === 'heatmap' && (
        <div className="space-y-4">
          {/* Color Legend */}
          <div className="flex items-center justify-between text-xs text-[#787B86] bg-[#FFFFFF] p-3 rounded-xl border border-[#E0E3EB]">
            <span className="font-semibold text-[#131722]">Performance Gradient:</span>
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              <span className="text-[#F23645]">-3% or lower</span>
              <div className="flex h-3 w-32 rounded overflow-hidden">
                <div className="bg-[#F23645] flex-1" />
                <div className="bg-[#ef5350] flex-1" />
                <div className="bg-[#e0e0e0] flex-1" />
                <div className="bg-[#26a69a] flex-1" />
                <div className="bg-[#089981] flex-1" />
              </div>
              <span className="text-[#089981]">+3% or higher</span>
            </div>
            <span className="hidden sm:inline text-[#787B86]">Tile size proportional to Market Capitalization</span>
          </div>

          {/* Sector Groups Treemap Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectors.map((sec) => {
              const secAssets = assets.filter((a) => a.sector === sec);
              return (
                <div
                  key={sec}
                  className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl p-4 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3 border-b border-[#F0F3FA] pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-[#131722]">
                      {sec}
                    </span>
                    <span className="text-[11px] text-[#787B86] font-medium">
                      {secAssets.length} tracked
                    </span>
                  </div>

                  {/* Grid of Ticker Tiles inside Sector */}
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    {secAssets.map((asset) => {
                      const isMega = asset.marketCapNum >= 1000;
                      return (
                        <div
                          key={asset.symbol}
                          onClick={() => onSelectSymbol(asset.symbol)}
                          className={`rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:scale-102 hover:shadow-md ${getTileBg(
                            asset.changePercent
                          )} ${isMega ? 'col-span-2 py-4' : 'col-span-1'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-black text-sm tracking-tight">
                                {asset.symbol}
                              </div>
                              <div className="text-[11px] opacity-80 truncate max-w-[130px]">
                                {asset.name}
                              </div>
                            </div>
                            <span className="text-[11px] font-bold opacity-80">
                              {asset.marketCap}
                            </span>
                          </div>

                          <div className="mt-3 flex items-baseline justify-between">
                            <span className="text-sm font-extrabold tabular-nums">
                              ${asset.price.toFixed(2)}
                            </span>
                            <span className="text-xs font-black tabular-nums">
                              {asset.changePercent >= 0 ? '+' : ''}
                              {asset.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. VIEW B: MULTI-FACTOR SCREENER */}
      {activeView === 'screener' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl p-4 flex flex-wrap items-center gap-3">
            {/* Sector */}
            <div>
              <label className="block text-[10px] font-bold text-[#787B86] uppercase mb-1">
                Sector
              </label>
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="bg-[#F0F3FA] px-3 py-1.5 rounded-lg text-xs font-bold text-[#131722] focus:outline-none"
              >
                <option value="All">All Sectors</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Market Cap */}
            <div>
              <label className="block text-[10px] font-bold text-[#787B86] uppercase mb-1">
                Market Cap
              </label>
              <select
                value={marketCapFilter}
                onChange={(e) => setMarketCapFilter(e.target.value)}
                className="bg-[#F0F3FA] px-3 py-1.5 rounded-lg text-xs font-bold text-[#131722] focus:outline-none"
              >
                <option value="All">All Sizes</option>
                <option value="Mega">Mega Cap ($200B+)</option>
                <option value="Large">Large Cap ($10B-$200B)</option>
              </select>
            </div>

            {/* Performance */}
            <div>
              <label className="block text-[10px] font-bold text-[#787B86] uppercase mb-1">
                Daily Return
              </label>
              <select
                value={performanceFilter}
                onChange={(e) => setPerformanceFilter(e.target.value)}
                className="bg-[#F0F3FA] px-3 py-1.5 rounded-lg text-xs font-bold text-[#131722] focus:outline-none"
              >
                <option value="All">All Movements</option>
                <option value="Gainers">Gainers Only (&gt;0%)</option>
                <option value="Losers">Decliners Only (&lt;0%)</option>
                <option value="HighVol">High Momentum (±2%+)</option>
              </select>
            </div>

            {/* P/E Ratio */}
            <div>
              <label className="block text-[10px] font-bold text-[#787B86] uppercase mb-1">
                P/E Valuation
              </label>
              <select
                value={peFilter}
                onChange={(e) => setPeFilter(e.target.value)}
                className="bg-[#F0F3FA] px-3 py-1.5 rounded-lg text-xs font-bold text-[#131722] focus:outline-none"
              >
                <option value="All">Any P/E</option>
                <option value="Low">Value (&lt; 25)</option>
                <option value="Mid">Moderate (25 - 50)</option>
                <option value="High">Growth (&gt; 50)</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSectorFilter('All');
                setMarketCapFilter('All');
                setPerformanceFilter('All');
                setPeFilter('All');
              }}
              className="mt-4 px-3 py-1.5 text-xs font-semibold text-[#787B86] hover:text-[#131722] transition-colors"
            >
              Reset Filters
            </button>
          </div>

          {/* Results Table */}
          <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl overflow-hidden shadow-2xs">
            <div className="px-5 py-3 border-b border-[#E0E3EB] flex items-center justify-between text-xs text-[#787B86]">
              <span className="font-semibold text-[#131722]">
                Showing {filteredAssets.length} Matching Securities
              </span>
              <span>Sorted by {sortBy}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F0F3FA] text-[11px] font-semibold uppercase text-[#787B86] tracking-wider bg-[#faf9ff]">
                    <th className="py-3 px-5">Symbol</th>
                    <th className="py-3 px-4">Company Name</th>
                    <th className="py-3 px-4">Sector</th>
                    <th
                      className="py-3 px-4 text-right cursor-pointer hover:text-[#131722]"
                      onClick={() => {
                        setSortBy('price');
                        setSortAsc(!sortAsc);
                      }}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Price</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 text-right cursor-pointer hover:text-[#131722]"
                      onClick={() => {
                        setSortBy('changePercent');
                        setSortAsc(!sortAsc);
                      }}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Change %</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 text-right cursor-pointer hover:text-[#131722]"
                      onClick={() => {
                        setSortBy('marketCap');
                        setSortAsc(!sortAsc);
                      }}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Market Cap</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-right">P/E Ratio</th>
                    <th className="py-3 px-4 text-right">Dividend</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F3FA] text-sm">
                  {filteredAssets.map((asset) => {
                    const isPos = asset.changePercent >= 0;
                    const inWatchlist = isWatchlisted(asset.symbol);

                    return (
                      <tr
                        key={asset.symbol}
                        onClick={() => onSelectSymbol(asset.symbol)}
                        className="hover:bg-[#F0F3FA] transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-5 font-bold text-[#131722] group-hover:text-[#2962ff]">
                          {asset.symbol}
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-[#131722] truncate max-w-[180px]">
                          {asset.name}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#787B86]">{asset.sector}</td>
                        <td className="py-3 px-4 text-right font-bold tabular-nums text-[#131722]">
                          ${asset.price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold tabular-nums ${
                              isPos ? 'bg-[#089981]/12 text-[#089981]' : 'bg-[#F23645]/12 text-[#F23645]'
                            }`}
                          >
                            {isPos ? '+' : ''}
                            {asset.changePercent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-xs font-medium text-[#434656]">
                          {asset.marketCap}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-xs text-[#434656]">
                          {asset.peRatio ? asset.peRatio.toFixed(1) : '—'}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-xs text-[#434656]">
                          {asset.dividendYield}
                        </td>
                        <td className="py-3 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenOrderFor(asset.symbol);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#2962ff] text-white hover:bg-[#1e53e5] transition-colors"
                            >
                              Trade
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleWatchlist(asset.symbol);
                              }}
                              className="p-1 text-[#787B86] hover:text-[#e8590c]"
                            >
                              <Star className={`w-4 h-4 ${inWatchlist ? 'fill-[#e8590c] text-[#e8590c]' : ''}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
