import React, { useState } from 'react';
import { ChevronRight, TrendingUp, TrendingDown, Star, ArrowUpRight, ArrowDownRight, BarChart2, ShieldAlert, Sparkles } from 'lucide-react';
import { MarketIndex, MarketAsset, SectorPerformance, NewsArticle } from '../../types/market';
import { Sparkline } from '../Sparkline';

interface OverviewScreenProps {
  indices: MarketIndex[];
  assets: MarketAsset[];
  sectors: SectorPerformance[];
  news: NewsArticle[];
  onSelectSymbol: (symbol: string) => void;
  onOpenOrderFor: (symbol: string) => void;
  onToggleWatchlist: (symbol: string) => void;
  isWatchlisted: (symbol: string) => boolean;
  onViewAllNews: () => void;
  onViewAllHeatmap: () => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  indices,
  assets,
  sectors,
  news,
  onSelectSymbol,
  onOpenOrderFor,
  onToggleWatchlist,
  isWatchlisted,
  onViewAllNews,
  onViewAllHeatmap,
}) => {
  const [moversTab, setMoversTab] = useState<'gainers' | 'losers' | 'active'>('gainers');

  // Filter movers
  const gainers = [...assets].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const losers = [...assets].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  const mostActive = [...assets].sort((a, b) => b.volumeNum - a.volumeNum).slice(0, 5);

  const currentMovers =
    moversTab === 'gainers' ? gainers : moversTab === 'losers' ? losers : mostActive;

  return (
    <div className="space-y-6 pb-12">
      {/* SECTION 1: Major Financial Index Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-bold text-[#131722] tracking-tight">
              Major Market Indices
            </h2>
            <span className="text-xs font-medium text-[#787B86]">· Real-time pricing</span>
          </div>
          <button
            onClick={() => onSelectSymbol('S&P 500')}
            className="text-xs font-semibold text-[#2962ff] hover:text-[#1e53e5] flex items-center gap-1 transition-colors"
          >
            <span>Launch Terminal</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {indices.slice(0, 4).map((idx) => {
            const isPos = idx.change >= 0;
            return (
              <div
                key={idx.id}
                onClick={() => onSelectSymbol(idx.symbol)}
                className="bg-[#FFFFFF] border border-[#E0E3EB] hover:border-[#2962ff] rounded-2xl p-4 transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Badge + Ticker + Chevron */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      {/* Circular Index Badge */}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-2xs"
                        style={{ backgroundColor: idx.badgeColor }}
                      >
                        {idx.badgeNumber}
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-[#131722] group-hover:text-[#2962ff] transition-colors leading-tight">
                          {idx.symbol}
                        </h3>
                        <p className="text-[11px] text-[#787B86] truncate max-w-[120px]">
                          {idx.name}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#787B86] group-hover:text-[#2962ff] group-hover:translate-x-0.5 transition-all" />
                  </div>

                  {/* Value Presentation */}
                  <div className="flex items-baseline justify-between gap-2 mb-3">
                    <span className="text-[24px] font-extrabold tabular-nums tracking-tight text-[#131722]">
                      {idx.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <div
                      className={`px-2.5 py-1 rounded-full text-[12px] font-bold tabular-nums flex items-center gap-0.5 ${
                        isPos
                          ? 'bg-[#089981]/12 text-[#089981]'
                          : 'bg-[#F23645]/12 text-[#F23645]'
                      }`}
                    >
                      {isPos ? (
                        <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                      )}
                      <span>
                        {isPos ? '+' : ''}
                        {idx.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sparkline & Range Footer */}
                <div className="pt-2 border-t border-[#F0F3FA] flex items-center justify-between">
                  <div className="text-[11px] text-[#787B86]">
                    <span className="tabular-nums font-medium">
                      {isPos ? '+' : ''}
                      {idx.change.toFixed(2)} pts
                    </span>
                  </div>
                  <div className="w-[100px] h-[28px] flex items-center justify-end">
                    <Sparkline data={idx.sparkline} isPositive={isPos} width={96} height={26} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Market Sentiment, Breadth & Sector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sentiment Gauge Card (Fear & Greed) */}
        <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-[#131722]">
                Market Sentiment
              </h3>
              <span className="text-[11px] font-semibold text-[#089981] bg-[#089981]/12 px-2.5 py-0.5 rounded-full">
                Greed (68)
              </span>
            </div>

            {/* Custom Speedometer Arc SVG */}
            <div className="relative flex flex-col items-center justify-center my-2">
              <svg viewBox="0 0 200 110" className="w-48 overflow-visible">
                {/* Arc Background Track */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#ebedfa"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                {/* Colored Zone Gradients */}
                <path
                  d="M 20 100 A 80 80 0 0 1 100 20"
                  fill="none"
                  stroke="#F23645"
                  strokeWidth="16"
                  strokeOpacity="0.8"
                />
                <path
                  d="M 100 20 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#089981"
                  strokeWidth="16"
                  strokeOpacity="0.8"
                  strokeDasharray="60 140"
                  strokeDashoffset="0"
                />
                {/* Needle */}
                <line
                  x1="100"
                  y1="100"
                  x2="135"
                  y2="45"
                  stroke="#131722"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="100" r="7" fill="#131722" />
                <circle cx="100" cy="100" r="3" fill="#FFFFFF" />
              </svg>
              <div className="text-center mt-1">
                <div className="text-[24px] font-black text-[#131722] tabular-nums">
                  68 <span className="text-xs font-normal text-[#787B86]">/ 100</span>
                </div>
                <p className="text-xs text-[#787B86] font-medium">
                  Moderate Greed · Risk-on Momentum
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#F0F3FA] text-center text-xs">
            <div>
              <span className="text-[#787B86] block text-[10px] uppercase font-semibold">Prev Close</span>
              <span className="font-bold text-[#131722] tabular-nums">65</span>
            </div>
            <div>
              <span className="text-[#787B86] block text-[10px] uppercase font-semibold">1 Wk Ago</span>
              <span className="font-bold text-[#131722] tabular-nums">58</span>
            </div>
            <div>
              <span className="text-[#787B86] block text-[10px] uppercase font-semibold">1 Mo Ago</span>
              <span className="font-bold text-[#131722] tabular-nums">52</span>
            </div>
          </div>
        </div>

        {/* Market Breadth & Advance/Decline */}
        <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-[#131722]">
                NYSE & NASDAQ Breadth
              </h3>
              <span className="text-xs text-[#787B86]">US Equities</span>
            </div>

            {/* Advance / Decline Bar */}
            <div className="space-y-3 my-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[#089981] flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  3,240 Advancers (68%)
                </span>
                <span className="text-[#F23645] flex items-center gap-1">
                  1,510 Decliners (32%)
                  <TrendingDown className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Visual Dual Meter */}
              <div className="h-3 w-full bg-[#F0F3FA] rounded-full overflow-hidden flex">
                <div className="bg-[#089981] h-full" style={{ width: '68%' }} />
                <div className="bg-[#F23645] h-full" style={{ width: '32%' }} />
              </div>

              <div className="p-3 bg-[#faf9ff] rounded-xl border border-[#E0E3EB] text-xs space-y-2 mt-4">
                <div className="flex justify-between">
                  <span className="text-[#787B86]">New 52-Week Highs</span>
                  <span className="font-bold text-[#089981] tabular-nums">184 symbols</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787B86]">New 52-Week Lows</span>
                  <span className="font-bold text-[#F23645] tabular-nums">29 symbols</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787B86]">Trading Volume Above 50D SMA</span>
                  <span className="font-bold text-[#131722] tabular-nums">74.2%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F0F3FA] flex items-center justify-between text-xs text-[#787B86]">
            <span>Vol Ratio: 2.14 Bullish</span>
            <span className="text-[#089981] font-semibold">Broad Market Expansion</span>
          </div>
        </div>

        {/* Sector Performance Highlights */}
        <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-[#131722]">
                Sector Heat Highlights
              </h3>
              <button
                onClick={onViewAllHeatmap}
                className="text-xs font-semibold text-[#2962ff] hover:underline"
              >
                View Heatmap
              </button>
            </div>

            <div className="space-y-2.5 my-1">
              {sectors.slice(0, 5).map((sec) => {
                const isPos = sec.changePercent >= 0;
                return (
                  <div key={sec.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 max-w-[170px]">
                      <span className="font-medium text-[#131722] truncate">{sec.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-[#F0F3FA] rounded-full overflow-hidden flex items-center justify-end">
                        <div
                          className={`h-full rounded-full ${
                            isPos ? 'bg-[#089981]' : 'bg-[#F23645]'
                          }`}
                          style={{ width: `${Math.min(100, Math.abs(sec.changePercent) * 35)}%` }}
                        />
                      </div>
                      <span
                        className={`tabular-nums font-bold w-14 text-right ${
                          isPos ? 'text-[#089981]' : 'text-[#F23645]'
                        }`}
                      >
                        {isPos ? '+' : ''}
                        {sec.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#F0F3FA] flex items-center justify-between text-xs">
            <span className="text-[#787B86]">Leading: Technology</span>
            <span className="text-[#089981] font-semibold">+1.84% today</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: Tabbed Market Movers Table */}
      <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl overflow-hidden shadow-2xs">
        {/* Tabs Bar */}
        <div className="px-5 py-3.5 border-b border-[#E0E3EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#2962ff]" />
            <h3 className="text-[16px] font-bold text-[#131722]">
              Market Movers
            </h3>
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#F0F3FA] rounded-full">
            <button
              onClick={() => setMoversTab('gainers')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                moversTab === 'gainers'
                  ? 'bg-[#131722] text-white shadow-2xs'
                  : 'text-[#787B86] hover:text-[#131722]'
              }`}
            >
              Top Gainers
            </button>
            <button
              onClick={() => setMoversTab('losers')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                moversTab === 'losers'
                  ? 'bg-[#131722] text-white shadow-2xs'
                  : 'text-[#787B86] hover:text-[#131722]'
              }`}
            >
              Top Decliners
            </button>
            <button
              onClick={() => setMoversTab('active')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                moversTab === 'active'
                  ? 'bg-[#131722] text-white shadow-2xs'
                  : 'text-[#787B86] hover:text-[#131722]'
              }`}
            >
              Most Active Volume
            </button>
          </div>
        </div>

        {/* Ticker Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F0F3FA] text-[11px] font-semibold uppercase text-[#787B86] tracking-wider bg-[#faf9ff]">
                <th className="py-2.5 px-5">Symbol / Company</th>
                <th className="py-2.5 px-4 text-right">Price</th>
                <th className="py-2.5 px-4 text-right">Change ($)</th>
                <th className="py-2.5 px-4 text-right">Change (%)</th>
                <th className="py-2.5 px-4 text-right">Volume</th>
                <th className="py-2.5 px-4 text-right">Market Cap</th>
                <th className="py-2.5 px-4 text-center">Trend</th>
                <th className="py-2.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F3FA] text-sm">
              {currentMovers.map((asset) => {
                const isPos = asset.changePercent >= 0;
                const inWatchlist = isWatchlisted(asset.symbol);

                return (
                  <tr
                    key={asset.symbol}
                    className="hover:bg-[#F0F3FA] transition-colors cursor-pointer group"
                    onClick={() => onSelectSymbol(asset.symbol)}
                  >
                    {/* Symbol & Name */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWatchlist(asset.symbol);
                          }}
                          className={`p-1 rounded-md text-[#787B86] hover:text-[#e8590c] transition-colors ${
                            inWatchlist ? 'text-[#e8590c]' : ''
                          }`}
                          title="Watchlist"
                        >
                          <Star className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-[#e8590c]' : ''}`} />
                        </button>
                        <div>
                          <div className="font-bold text-[#131722] group-hover:text-[#2962ff] transition-colors flex items-center gap-1.5">
                            <span>{asset.symbol}</span>
                            <span className="text-[11px] font-normal text-[#787B86] bg-[#F0F3FA] px-1.5 py-0.2 rounded">
                              {asset.exchange}
                            </span>
                          </div>
                          <div className="text-xs text-[#787B86] truncate max-w-[180px]">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 text-right font-bold tabular-nums text-[#131722]">
                      ${asset.price.toFixed(2)}
                    </td>

                    {/* Dollar Change */}
                    <td
                      className={`py-3 px-4 text-right font-semibold tabular-nums ${
                        isPos ? 'text-[#089981]' : 'text-[#F23645]'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {asset.change.toFixed(2)}
                    </td>

                    {/* Percentage Delta */}
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums ${
                          isPos
                            ? 'bg-[#089981]/12 text-[#089981]'
                            : 'bg-[#F23645]/12 text-[#F23645]'
                        }`}
                      >
                        {isPos ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    {/* Volume */}
                    <td className="py-3 px-4 text-right text-xs tabular-nums text-[#434656] font-medium">
                      {asset.volume}
                    </td>

                    {/* Market Cap */}
                    <td className="py-3 px-4 text-right text-xs tabular-nums text-[#434656] font-medium">
                      {asset.marketCap}
                    </td>

                    {/* Sparkline */}
                    <td className="py-3 px-4 text-center">
                      <div className="w-20 mx-auto">
                        <Sparkline data={asset.sparkline} isPositive={isPos} width={80} height={24} />
                      </div>
                    </td>

                    {/* Actions */}
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
                            onSelectSymbol(asset.symbol);
                          }}
                          className="p-1 rounded-md text-[#787B86] hover:text-[#131722] hover:bg-[#EAECEF] transition-colors"
                          title="Open Chart"
                        >
                          <ChevronRight className="w-4 h-4" />
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

      {/* SECTION 4: Live Financial News Stream */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-bold text-[#131722] tracking-tight">
              Real-Time Market Briefing
            </h2>
            <span className="text-xs text-[#787B86]">· Financial Wire</span>
          </div>
          <button
            onClick={onViewAllNews}
            className="text-xs font-semibold text-[#2962ff] hover:underline flex items-center gap-1"
          >
            <span>Full News Wire</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.slice(0, 4).map((item) => (
            <div
              key={item.id}
              onClick={onViewAllNews}
              className="bg-[#FFFFFF] border border-[#E0E3EB] hover:border-[#2962ff] rounded-2xl p-4.5 transition-all hover:shadow-xs cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Clean unboxed metadata with typographic separators */}
                <div className="flex items-center gap-2 text-xs text-[#787B86] mb-2 font-medium">
                  <span className="text-[#131722] font-semibold">{item.source}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.timeAgo}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`font-semibold ${
                      item.sentiment === 'Bullish'
                        ? 'text-[#089981]'
                        : item.sentiment === 'Bearish'
                        ? 'text-[#F23645]'
                        : 'text-[#787B86]'
                    }`}
                  >
                    {item.sentiment}
                  </span>
                </div>

                <h4 className="text-[15px] font-bold text-[#131722] group-hover:text-[#2962ff] transition-colors leading-snug mb-2">
                  {item.title}
                </h4>

                <p className="text-xs text-[#434656] line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-[#F0F3FA] flex items-center justify-between text-[11px] text-[#787B86]">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#787B86]">Tickers:</span>
                  {item.relatedTickers.map((t) => (
                    <span
                      key={t}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSymbol(t);
                      }}
                      className="px-1.5 py-0.5 rounded bg-[#F0F3FA] hover:bg-[#ebedfa] text-[#131722] font-bold cursor-pointer transition-colors"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <span>{item.readTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
