import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown, ArrowRight, Star, ShoppingCart } from 'lucide-react';
import { MarketAsset, MarketIndex } from '../types/market';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: MarketAsset[];
  indices: MarketIndex[];
  onSelectSymbol: (symbol: string) => void;
  onToggleWatchlist: (symbol: string) => void;
  isWatchlisted: (symbol: string) => boolean;
  onOpenOrderFor: (symbol: string) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  assets,
  indices,
  onSelectSymbol,
  onToggleWatchlist,
  isWatchlisted,
  onOpenOrderFor,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Search through indices and assets
  const combinedList = [
    ...indices.map((i) => ({
      symbol: i.symbol,
      name: i.name,
      price: i.price,
      changePercent: i.changePercent,
      sector: 'Index',
      isIndex: true,
    })),
    ...assets.map((a) => ({
      symbol: a.symbol,
      name: a.name,
      price: a.price,
      changePercent: a.changePercent,
      sector: a.sector,
      isIndex: false,
    })),
  ];

  const filtered = query.trim()
    ? combinedList.filter(
        (item) =>
          item.symbol.toLowerCase().includes(query.toLowerCase()) ||
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.sector.toLowerCase().includes(query.toLowerCase())
      )
    : combinedList.slice(0, 8);

  const handleSelect = (symbol: string) => {
    onSelectSymbol(symbol);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#131722]/50 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-[#FFFFFF] rounded-2xl border border-[#E0E3EB] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E0E3EB] bg-[#faf9ff]">
          <Search className="w-5 h-5 text-[#787B86] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search symbol, company name, or sector (e.g., NVDA, Apple, Tech)..."
            className="flex-1 bg-transparent text-[15px] font-medium text-[#131722] placeholder-[#787B86] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#787B86] hover:text-[#131722] rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 bg-[#F0F3FA] text-[#787B86] hover:text-[#131722] rounded-md transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Quick Chips */}
        {!query && (
          <div className="px-4 py-2 bg-[#FFFFFF] border-b border-[#F0F3FA] flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
            <span className="text-[#787B86] font-medium">Quick Picks:</span>
            {['NVDA', 'AAPL', 'MSFT', 'BTC-USD', 'TSLA', 'S&P 500'].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSelect(chip)}
                className="px-2.5 py-1 rounded-full bg-[#F0F3FA] hover:bg-[#EAECEF] text-[#131722] font-semibold transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        <div className="overflow-y-auto divide-y divide-[#F0F3FA] p-2 flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#787B86]">
              <p className="text-sm font-medium">No symbols match "{query}"</p>
              <p className="text-xs text-[#737687] mt-1">Try searching by ticker (e.g. AAPL) or sector (e.g. Energy)</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isPos = item.changePercent >= 0;
              const watchlisted = !item.isIndex && isWatchlisted(item.symbol);

              return (
                <div
                  key={item.symbol}
                  onClick={() => handleSelect(item.symbol)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors group ${
                    idx === selectedIndex ? 'bg-[#F0F3FA]' : 'hover:bg-[#faf9ff]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F0F3FA] flex items-center justify-center font-bold text-xs text-[#131722] group-hover:bg-[#2962ff] group-hover:text-white transition-colors">
                      {item.symbol.substring(0, 4)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[14px] text-[#131722]">
                          {item.symbol}
                        </span>
                        <span className="text-[11px] font-medium text-[#787B86]">
                          {item.sector}
                        </span>
                      </div>
                      <p className="text-xs text-[#434656] truncate max-w-[240px] sm:max-w-xs">
                        {item.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[14px] font-bold tabular-nums text-[#131722]">
                        ${item.price > 1000
                          ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : item.price.toFixed(2)}
                      </p>
                      <p
                        className={`text-xs font-semibold tabular-nums flex items-center justify-end gap-0.5 ${
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
                      </p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      {!item.isIndex && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWatchlist(item.symbol);
                            }}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              watchlisted
                                ? 'bg-[#ffeedb] border-[#ffa94d] text-[#e8590c]'
                                : 'bg-[#FFFFFF] border-[#E0E3EB] text-[#787B86] hover:text-[#131722]'
                            }`}
                            title={watchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                          >
                            <Star className={`w-3.5 h-3.5 ${watchlisted ? 'fill-[#e8590c]' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenOrderFor(item.symbol);
                              onClose();
                            }}
                            className="p-1.5 rounded-lg bg-[#2962ff] text-white hover:bg-[#1e53e5] transition-colors"
                            title="Trade"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <ArrowRight className="w-4 h-4 text-[#787B86] group-hover:text-[#2962ff] group-hover:translate-x-0.5 transition-all ml-1" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#faf9ff] border-t border-[#E0E3EB] flex items-center justify-between text-[11px] text-[#787B86]">
          <span>Tip: Press ESC to close, click any ticker to load chart</span>
          <span className="font-medium text-[#131722]">{filtered.length} instruments available</span>
        </div>
      </div>
    </div>
  );
};
