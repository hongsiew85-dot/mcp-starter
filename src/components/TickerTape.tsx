import React from 'react';
import { MarketIndex, MarketAsset } from '../types/market';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerTapeProps {
  indices: MarketIndex[];
  assets: MarketAsset[];
  onSelectSymbol: (symbol: string) => void;
  recentFlash: Record<string, 'up' | 'down'>;
}

export const TickerTape: React.FC<TickerTapeProps> = ({
  indices,
  assets,
  onSelectSymbol,
  recentFlash,
}) => {
  // Combine top indices and top 5 assets for tape
  const tapeItems = [
    ...indices.map((idx) => ({
      symbol: idx.symbol,
      name: idx.name,
      price: idx.price,
      change: idx.change,
      changePercent: idx.changePercent,
      isIndex: true,
    })),
    ...assets.slice(0, 8).map((ast) => ({
      symbol: ast.symbol,
      name: ast.name,
      price: ast.price,
      change: ast.change,
      changePercent: ast.changePercent,
      isIndex: false,
    })),
  ];

  return (
    <div className="bg-[#FFFFFF] border-b border-[#E0E3EB] py-1.5 px-4 overflow-x-auto no-scrollbar select-none">
      <div className="flex items-center gap-6 min-w-max text-[12px]">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#787B86] uppercase tracking-wider pl-1 pr-2 border-r border-[#E0E3EB]">
          <span>Markets</span>
        </div>

        {tapeItems.map((item) => {
          const isPos = item.change >= 0;
          const flash = recentFlash[item.symbol];

          return (
            <button
              key={item.symbol}
              onClick={() => onSelectSymbol(item.symbol)}
              className={`flex items-center gap-2 px-2 py-0.5 rounded-md hover:bg-[#F0F3FA] transition-colors text-left group ${
                flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''
              }`}
            >
              <span className="font-semibold text-[#131722] group-hover:text-[#2962ff] transition-colors">
                {item.symbol}
              </span>

              <span className="tabular-nums font-medium text-[#131722]">
                {item.price > 1000
                  ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : item.price.toFixed(2)}
              </span>

              <span
                className={`tabular-nums font-semibold flex items-center gap-0.5 ${
                  isPos ? 'text-[#089981]' : 'text-[#F23645]'
                }`}
              >
                {isPos ? (
                  <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                ) : (
                  <TrendingDown className="w-3 h-3 stroke-[2.5]" />
                )}
                <span>
                  {isPos ? '+' : ''}
                  {item.changePercent.toFixed(2)}%
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
