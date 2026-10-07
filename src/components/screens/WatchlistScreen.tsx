import React, { useState } from 'react';
import {
  Star,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  History,
  AlertCircle
} from 'lucide-react';
import { MarketAsset, PortfolioPosition, TradeOrder, PriceAlert } from '../../types/market';
import { Sparkline } from '../Sparkline';

interface WatchlistScreenProps {
  assets: MarketAsset[];
  watchlistSymbols: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectSymbol: (symbol: string) => void;
  onOpenOrderFor: (symbol: string) => void;
  positions: PortfolioPosition[];
  cashBalance: number;
  orders: TradeOrder[];
  onClosePosition: (symbol: string) => void;
  alerts: PriceAlert[];
  onAddAlert: (symbol: string, price: number, condition: 'above' | 'below') => void;
  onDeleteAlert: (id: string) => void;
}

export const WatchlistScreen: React.FC<WatchlistScreenProps> = ({
  assets,
  watchlistSymbols,
  onToggleWatchlist,
  onSelectSymbol,
  onOpenOrderFor,
  positions,
  cashBalance,
  orders,
  onClosePosition,
  alerts,
  onAddAlert,
  onDeleteAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'portfolio' | 'alerts' | 'history'>('watchlist');
  const [newAlertSymbol, setNewAlertSymbol] = useState('NVDA');
  const [newAlertPrice, setNewAlertPrice] = useState(145);
  const [newAlertCondition, setNewAlertCondition] = useState<'above' | 'below'>('above');
  const [showAddAlertModal, setShowAddAlertModal] = useState(false);

  // Compute portfolio metrics
  const positionsWithAsset = positions.map((p) => {
    const a = assets.find((x) => x.symbol === p.symbol);
    const curPrice = a ? a.price : p.currentPrice;
    const marketValue = p.shares * curPrice;
    const totalCost = p.shares * p.avgCost;
    const pnl = marketValue - totalCost;
    const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
    const todayPnl = a ? (a.change * p.shares) : 0;
    return {
      ...p,
      asset: a,
      curPrice,
      marketValue,
      totalCost,
      pnl,
      pnlPercent,
      todayPnl,
    };
  });

  const totalPositionsValue = positionsWithAsset.reduce((acc, p) => acc + p.marketValue, 0);
  const totalCostBasis = positionsWithAsset.reduce((acc, p) => acc + p.totalCost, 0);
  const totalEquity = totalPositionsValue + cashBalance;
  const totalUnrealizedPnL = totalPositionsValue - totalCostBasis;
  const totalUnrealizedPnLPercent = totalCostBasis > 0 ? (totalUnrealizedPnL / totalCostBasis) * 100 : 0;
  const todayTotalPnL = positionsWithAsset.reduce((acc, p) => acc + p.todayPnl, 0);

  // Filter assets in watchlist
  const watchlistedAssets = assets.filter((a) => watchlistSymbols.includes(a.symbol));

  const handleCreateAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAlertPrice > 0) {
      onAddAlert(newAlertSymbol, newAlertPrice, newAlertCondition);
      setShowAddAlertModal(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. PORTFOLIO SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl p-4.5 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#787B86] uppercase tracking-wider block mb-1">
              Total Account Equity
            </span>
            <div className="text-[26px] font-black tabular-nums tracking-tight text-[#131722]">
              ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="pt-2 border-t border-[#F0F3FA] flex items-center justify-between text-xs">
            <span className="text-[#787B86]">Buying Power</span>
            <span className="font-bold tabular-nums text-[#131722]">
              ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl p-4.5 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#787B86] uppercase tracking-wider block mb-1">
              Total Unrealized P&L
            </span>
            <div
              className={`text-[26px] font-black tabular-nums tracking-tight ${
                totalUnrealizedPnL >= 0 ? 'text-[#089981]' : 'text-[#F23645]'
              }`}
            >
              {totalUnrealizedPnL >= 0 ? '+' : ''}$
              {totalUnrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="pt-2 border-t border-[#F0F3FA] flex items-center justify-between text-xs">
            <span className="text-[#787B86]">Return on Capital</span>
            <span
              className={`font-bold tabular-nums ${
                totalUnrealizedPnLPercent >= 0 ? 'text-[#089981]' : 'text-[#F23645]'
              }`}
            >
              {totalUnrealizedPnLPercent >= 0 ? '+' : ''}
              {totalUnrealizedPnLPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl p-4.5 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#787B86] uppercase tracking-wider block mb-1">
              Today's P&L
            </span>
            <div
              className={`text-[26px] font-black tabular-nums tracking-tight ${
                todayTotalPnL >= 0 ? 'text-[#089981]' : 'text-[#F23645]'
              }`}
            >
              {todayTotalPnL >= 0 ? '+' : ''}$
              {todayTotalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="pt-2 border-t border-[#F0F3FA] flex items-center justify-between text-xs">
            <span className="text-[#787B86]">Day Change</span>
            <span
              className={`font-bold tabular-nums ${
                todayTotalPnL >= 0 ? 'text-[#089981]' : 'text-[#F23645]'
              }`}
            >
              {todayTotalPnL >= 0 ? '+1.14%' : '-0.85%'}
            </span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl p-4.5 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#787B86] uppercase tracking-wider block mb-1">
              Open Positions
            </span>
            <div className="text-[26px] font-black tabular-nums tracking-tight text-[#131722]">
              {positions.length}
            </div>
          </div>
          <div className="pt-2 border-t border-[#F0F3FA] flex items-center justify-between text-xs">
            <span className="text-[#787B86]">Active Alerts</span>
            <span className="font-bold tabular-nums text-[#2962ff]">{alerts.length}</span>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center justify-between border-b border-[#E0E3EB] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'watchlist'
                ? 'bg-[#131722] text-white shadow-2xs'
                : 'text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA]'
            }`}
          >
            My Watchlist ({watchlistedAssets.length})
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'portfolio'
                ? 'bg-[#131722] text-white shadow-2xs'
                : 'text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA]'
            }`}
          >
            Paper Portfolio ({positions.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'alerts'
                ? 'bg-[#131722] text-white shadow-2xs'
                : 'text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA]'
            }`}
          >
            Price Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-[#131722] text-white shadow-2xs'
                : 'text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA]'
            }`}
          >
            Order Ledger ({orders.length})
          </button>
        </div>

        {activeTab === 'alerts' && (
          <button
            onClick={() => setShowAddAlertModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2962ff] text-white text-xs font-bold hover:bg-[#1e53e5] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Alert</span>
          </button>
        )}
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB A: WATCHLIST TABLE */}
      {activeTab === 'watchlist' && (
        <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl overflow-hidden shadow-2xs">
          {watchlistedAssets.length === 0 ? (
            <div className="py-16 text-center text-[#787B86]">
              <Star className="w-10 h-10 mx-auto mb-2 text-[#c3c5d8]" />
              <h4 className="text-base font-bold text-[#131722]">Your Watchlist is Empty</h4>
              <p className="text-xs text-[#787B86] max-w-sm mx-auto mt-1">
                Star any asset from the Overview or Chart Terminal screens to track prices and deltas in real-time.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F0F3FA] text-[11px] font-semibold uppercase text-[#787B86] tracking-wider bg-[#faf9ff]">
                    <th className="py-3 px-5">Symbol</th>
                    <th className="py-3 px-4">Name & Sector</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-right">Change ($)</th>
                    <th className="py-3 px-4 text-right">Change (%)</th>
                    <th className="py-3 px-4 text-right">Volume</th>
                    <th className="py-3 px-4 text-center">Trend</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F3FA] text-sm">
                  {watchlistedAssets.map((asset) => {
                    const isPos = asset.changePercent >= 0;
                    return (
                      <tr
                        key={asset.symbol}
                        onClick={() => onSelectSymbol(asset.symbol)}
                        className="hover:bg-[#F0F3FA] transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-5 font-bold text-[#131722] group-hover:text-[#2962ff]">
                          {asset.symbol}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs font-semibold text-[#131722]">{asset.name}</div>
                          <div className="text-[11px] text-[#787B86]">{asset.sector}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold tabular-nums text-[#131722]">
                          ${asset.price.toFixed(2)}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-semibold tabular-nums ${
                            isPos ? 'text-[#089981]' : 'text-[#F23645]'
                          }`}
                        >
                          {isPos ? '+' : ''}${asset.change.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums ${
                              isPos ? 'bg-[#089981]/12 text-[#089981]' : 'bg-[#F23645]/12 text-[#F23645]'
                            }`}
                          >
                            {isPos ? '+' : ''}
                            {asset.changePercent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-xs tabular-nums text-[#434656]">
                          {asset.volume}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="w-20 mx-auto">
                            <Sparkline data={asset.sparkline} isPositive={isPos} width={80} height={22} />
                          </div>
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
                              className="p-1 rounded-md text-[#787B86] hover:text-[#F23645] transition-colors"
                              title="Remove from Watchlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB B: PORTFOLIO HOLDINGS */}
      {activeTab === 'portfolio' && (
        <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl overflow-hidden shadow-2xs">
          {positionsWithAsset.length === 0 ? (
            <div className="py-16 text-center text-[#787B86]">
              <Briefcase className="w-10 h-10 mx-auto mb-2 text-[#c3c5d8]" />
              <h4 className="text-base font-bold text-[#131722]">No Open Positions</h4>
              <p className="text-xs text-[#787B86] max-w-sm mx-auto mt-1">
                You have $100,000 in paper trading capital. Place orders using the "Trade" button to start building your simulated portfolio.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F0F3FA] text-[11px] font-semibold uppercase text-[#787B86] tracking-wider bg-[#faf9ff]">
                    <th className="py-3 px-5">Instrument</th>
                    <th className="py-3 px-4 text-right">Shares</th>
                    <th className="py-3 px-4 text-right">Avg Cost</th>
                    <th className="py-3 px-4 text-right">Current Price</th>
                    <th className="py-3 px-4 text-right">Market Value</th>
                    <th className="py-3 px-4 text-right">Unrealized P&L</th>
                    <th className="py-3 px-4 text-right">Return (%)</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F3FA] text-sm">
                  {positionsWithAsset.map((pos) => {
                    const isPos = pos.pnl >= 0;
                    return (
                      <tr
                        key={pos.symbol}
                        onClick={() => onSelectSymbol(pos.symbol)}
                        className="hover:bg-[#F0F3FA] transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-5">
                          <div className="font-bold text-[#131722] group-hover:text-[#2962ff]">
                            {pos.symbol}
                          </div>
                          <div className="text-xs text-[#787B86]">{pos.asset?.name || pos.symbol}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold tabular-nums text-[#131722]">
                          {pos.shares}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#434656]">
                          ${pos.avgCost.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold tabular-nums text-[#131722]">
                          ${pos.curPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold tabular-nums text-[#131722]">
                          ${pos.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-bold tabular-nums ${
                            isPos ? 'text-[#089981]' : 'text-[#F23645]'
                          }`}
                        >
                          {isPos ? '+' : ''}${pos.pnl.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums ${
                              isPos ? 'bg-[#089981]/12 text-[#089981]' : 'bg-[#F23645]/12 text-[#F23645]'
                            }`}
                          >
                            {isPos ? '+' : ''}
                            {pos.pnlPercent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenOrderFor(pos.symbol);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#2962ff] text-white hover:bg-[#1e53e5] transition-colors"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onClosePosition(pos.symbol);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#F0F3FA] text-[#F23645] hover:bg-[#ffdad6] transition-colors"
                            >
                              Close
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB C: PRICE ALERTS */}
      {activeTab === 'alerts' && (
        <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#131722]">Active Price Triggers</h3>
              <p className="text-xs text-[#787B86]">
                Notifies in real time when market prices breach threshold targets.
              </p>
            </div>
          </div>

          {alerts.length === 0 ? (
            <div className="py-12 text-center text-[#787B86]">
              <Bell className="w-10 h-10 mx-auto mb-2 text-[#c3c5d8]" />
              <p className="text-sm font-semibold text-[#131722]">No Active Price Alerts</p>
              <p className="text-xs text-[#787B86] mt-1">Set an alert to receive threshold notifications.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {alerts.map((al) => {
                const currentAst = assets.find((a) => a.symbol === al.symbol);
                const curPrice = currentAst ? currentAst.price : 0;
                const isTriggered =
                  al.condition === 'above' ? curPrice >= al.targetPrice : curPrice <= al.targetPrice;

                return (
                  <div
                    key={al.id}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                      isTriggered
                        ? 'bg-[#ebfbee] border-[#51cf66]'
                        : 'bg-[#faf9ff] border-[#E0E3EB]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#131722]">{al.symbol}</span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            al.condition === 'above'
                              ? 'bg-[#089981]/15 text-[#089981]'
                              : 'bg-[#F23645]/15 text-[#F23645]'
                          }`}
                        >
                          {al.condition} ${al.targetPrice.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-[#787B86] mt-1">
                        Current: <strong className="text-[#131722] tabular-nums">${curPrice.toFixed(2)}</strong>
                      </p>
                      {isTriggered && (
                        <p className="text-[11px] font-bold text-[#089981] mt-0.5 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Target Triggered
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteAlert(al.id)}
                      className="p-1.5 text-[#787B86] hover:text-[#F23645] rounded-lg transition-colors"
                      title="Delete Alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB D: ORDER HISTORY LEDGER */}
      {activeTab === 'history' && (
        <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl overflow-hidden shadow-2xs">
          {orders.length === 0 ? (
            <div className="py-16 text-center text-[#787B86]">
              <History className="w-10 h-10 mx-auto mb-2 text-[#c3c5d8]" />
              <h4 className="text-base font-bold text-[#131722]">No Past Orders</h4>
              <p className="text-xs text-[#787B86] max-w-sm mx-auto mt-1">
                Your execution logs and filled trade history will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#F0F3FA] font-semibold uppercase text-[#787B86] tracking-wider bg-[#faf9ff]">
                    <th className="py-3 px-5">Time</th>
                    <th className="py-3 px-4">Instrument</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Order Type</th>
                    <th className="py-3 px-4 text-right">Shares</th>
                    <th className="py-3 px-4 text-right">Filled Price</th>
                    <th className="py-3 px-5 text-right">Total Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F3FA]">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#F0F3FA]">
                      <td className="py-3 px-5 tabular-nums text-[#787B86]">
                        {new Date(ord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#131722]">{ord.symbol}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                            ord.side === 'buy'
                              ? 'bg-[#089981]/12 text-[#089981]'
                              : 'bg-[#F23645]/12 text-[#F23645]'
                          }`}
                        >
                          {ord.side}
                        </span>
                      </td>
                      <td className="py-3 px-4 uppercase text-[#787B86] font-medium">{ord.type}</td>
                      <td className="py-3 px-4 text-right font-bold tabular-nums text-[#131722]">
                        {ord.shares}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-[#131722]">
                        ${ord.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-5 text-right font-bold tabular-nums text-[#131722]">
                        ${ord.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD ALERT */}
      {showAddAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131722]/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#FFFFFF] rounded-2xl border border-[#E0E3EB] p-5 shadow-2xl">
            <h3 className="text-base font-bold text-[#131722] mb-3">Create Price Alert</h3>
            <form onSubmit={handleCreateAlertSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#787B86] mb-1">Symbol</label>
                <select
                  value={newAlertSymbol}
                  onChange={(e) => {
                    setNewAlertSymbol(e.target.value);
                    const a = assets.find((x) => x.symbol === e.target.value);
                    if (a) setNewAlertPrice(Number((a.price * 1.05).toFixed(2)));
                  }}
                  className="w-full px-3 py-2 bg-[#F0F3FA] rounded-xl text-xs font-bold text-[#131722] border border-[#E0E3EB] focus:outline-none"
                >
                  {assets.map((a) => (
                    <option key={a.symbol} value={a.symbol}>
                      {a.symbol} (${a.price.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#787B86] mb-1">Trigger Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewAlertCondition('above')}
                    className={`py-1.5 text-xs font-bold rounded-lg ${
                      newAlertCondition === 'above'
                        ? 'bg-[#089981] text-white'
                        : 'bg-[#F0F3FA] text-[#787B86]'
                    }`}
                  >
                    Rises Above ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAlertCondition('below')}
                    className={`py-1.5 text-xs font-bold rounded-lg ${
                      newAlertCondition === 'below'
                        ? 'bg-[#F23645] text-white'
                        : 'bg-[#F0F3FA] text-[#787B86]'
                    }`}
                  >
                    Falls Below ($)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#787B86] mb-1">Target Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newAlertPrice}
                  onChange={(e) => setNewAlertPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E0E3EB] rounded-xl text-sm font-bold tabular-nums text-[#131722] focus:border-[#2962ff] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAlertModal(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#F0F3FA] text-[#787B86] hover:bg-[#EAECEF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#2962ff] text-white hover:bg-[#1e53e5]"
                >
                  Save Trigger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
