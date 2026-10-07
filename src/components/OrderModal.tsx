import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { MarketAsset, TradeOrder } from '../types/market';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: MarketAsset[];
  initialSymbol?: string;
  cashBalance: number;
  onExecuteOrder: (order: Omit<TradeOrder, 'id' | 'timestamp' | 'status'>) => boolean;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  assets,
  initialSymbol = 'NVDA',
  cashBalance,
  onExecuteOrder,
}) => {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [shares, setShares] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialSymbol) {
      setSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  const currentAsset = assets.find((a) => a.symbol === symbol) || assets[0];

  useEffect(() => {
    if (currentAsset) {
      setLimitPrice(currentAsset.price);
    }
  }, [currentAsset?.symbol]);

  if (!isOpen) return null;

  const executionPrice = orderType === 'market' ? currentAsset.price : limitPrice;
  const estimatedTotal = executionPrice * (shares || 0);
  const canAfford = side === 'sell' || estimatedTotal <= cashBalance;

  const handleQuickShares = (qty: number) => {
    setShares(qty);
  };

  const handleMaxShares = () => {
    if (side === 'buy') {
      const max = Math.floor(cashBalance / (executionPrice || 1));
      setShares(Math.max(1, max));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shares || shares <= 0) {
      setErrorMessage('Please enter a valid number of shares.');
      return;
    }

    if (side === 'buy' && estimatedTotal > cashBalance) {
      setErrorMessage(`Insufficient cash balance ($${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} available).`);
      return;
    }

    const success = onExecuteOrder({
      symbol: currentAsset.symbol,
      side,
      type: orderType,
      shares,
      price: executionPrice,
      total: estimatedTotal,
    });

    if (success) {
      setSuccessMessage(
        `Order Filled: ${side.toUpperCase()} ${shares} shares of ${currentAsset.symbol} @ $${executionPrice.toFixed(2)}`
      );
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131722]/50 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-md bg-[#FFFFFF] rounded-2xl border border-[#E0E3EB] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E3EB] bg-[#faf9ff]">
          <div>
            <h3 className="text-[17px] font-bold text-[#131722]">Order Ticket</h3>
            <p className="text-xs text-[#787B86]">Paper Trading Simulator</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMessage ? (
          <div className="p-8 text-center flex flex-col items-center">
            <CheckCircle2 className="w-14 h-14 text-[#089981] mb-3 animate-bounce" />
            <h4 className="text-lg font-bold text-[#131722]">Execution Confirmed</h4>
            <p className="text-sm text-[#434656] mt-1 text-center font-medium">
              {successMessage}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Symbol Selector & Live Quote */}
            <div>
              <label className="block text-xs font-semibold text-[#787B86] uppercase tracking-wider mb-1.5">
                Instrument
              </label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0F3FA] border border-[#E0E3EB]">
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="bg-transparent font-bold text-sm text-[#131722] focus:outline-none cursor-pointer"
                >
                  {assets.map((a) => (
                    <option key={a.symbol} value={a.symbol}>
                      {a.symbol} — {a.name}
                    </option>
                  ))}
                </select>
                <div className="text-right">
                  <div className="font-bold text-sm tabular-nums text-[#131722]">
                    ${currentAsset.price.toFixed(2)}
                  </div>
                  <div
                    className={`text-xs font-semibold tabular-nums ${
                      currentAsset.changePercent >= 0 ? 'text-[#089981]' : 'text-[#F23645]'
                    }`}
                  >
                    {currentAsset.changePercent >= 0 ? '+' : ''}
                    {currentAsset.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Buy / Sell Segmented Button */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F0F3FA] rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setSide('buy');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  side === 'buy'
                    ? 'bg-[#089981] text-white shadow-xs'
                    : 'text-[#434656] hover:text-[#131722]'
                }`}
              >
                BUY / LONG
              </button>
              <button
                type="button"
                onClick={() => {
                  setSide('sell');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  side === 'sell'
                    ? 'bg-[#F23645] text-white shadow-xs'
                    : 'text-[#434656] hover:text-[#131722]'
                }`}
              >
                SELL / SHORT
              </button>
            </div>

            {/* Order Type Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#787B86] uppercase tracking-wider mb-1.5">
                Order Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['market', 'limit', 'stop'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setOrderType(t)}
                    className={`py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all ${
                      orderType === t
                        ? 'border-[#2962ff] bg-[#ebedfa] text-[#0049db]'
                        : 'border-[#E0E3EB] bg-[#FFFFFF] text-[#787B86] hover:bg-[#F0F3FA]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Limit Price Input if not Market */}
            {orderType !== 'market' && (
              <div>
                <label className="block text-xs font-semibold text-[#787B86] uppercase tracking-wider mb-1.5">
                  {orderType === 'limit' ? 'Limit Price ($)' : 'Stop Price ($)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E0E3EB] rounded-xl text-sm font-bold tabular-nums text-[#131722] focus:border-[#2962ff] focus:outline-none"
                />
              </div>
            )}

            {/* Shares Quantity */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#787B86] uppercase tracking-wider">
                  Quantity (Shares)
                </label>
                <div className="flex items-center gap-1">
                  {[5, 10, 50, 100].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => handleQuickShares(qty)}
                      className="px-2 py-0.5 text-[11px] font-semibold bg-[#F0F3FA] hover:bg-[#EAECEF] text-[#434656] rounded-md transition-colors"
                    >
                      +{qty}
                    </button>
                  ))}
                  {side === 'buy' && (
                    <button
                      type="button"
                      onClick={handleMaxShares}
                      className="px-2 py-0.5 text-[11px] font-bold bg-[#ebedfa] text-[#0049db] rounded-md"
                    >
                      MAX
                    </button>
                  )}
                </div>
              </div>
              <input
                type="number"
                min="1"
                step="1"
                value={shares || ''}
                onChange={(e) => {
                  setShares(parseInt(e.target.value, 10) || 0);
                  setErrorMessage(null);
                }}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E0E3EB] rounded-xl text-sm font-bold tabular-nums text-[#131722] focus:border-[#2962ff] focus:outline-none"
              />
            </div>

            {/* Calculations & Buying Power */}
            <div className="p-3 bg-[#faf9ff] rounded-xl border border-[#E0E3EB] text-xs space-y-1.5">
              <div className="flex justify-between text-[#787B86]">
                <span>Est. Unit Price</span>
                <span className="font-semibold tabular-nums text-[#131722]">
                  ${executionPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[#787B86]">
                <span>Commission / Exchange Fee</span>
                <span className="font-semibold text-[#089981]">FREE ($0.00)</span>
              </div>
              <div className="flex justify-between text-[#787B86]">
                <span>Available Cash</span>
                <span className="font-semibold tabular-nums text-[#131722]">
                  ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="pt-1.5 border-t border-[#E0E3EB] flex justify-between font-bold text-[13px]">
                <span className="text-[#131722]">Estimated Total</span>
                <span
                  className={`tabular-nums ${
                    !canAfford ? 'text-[#F23645]' : 'text-[#131722]'
                  }`}
                >
                  ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!canAfford || shares <= 0}
              className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all shadow-xs ${
                !canAfford || shares <= 0
                  ? 'bg-[#c3c5d8] cursor-not-allowed'
                  : side === 'buy'
                  ? 'bg-[#089981] hover:bg-[#07826d] active:scale-98'
                  : 'bg-[#F23645] hover:bg-[#d62837] active:scale-98'
              }`}
            >
              {side === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
