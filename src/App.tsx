/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header, ScreenTab } from './components/Header';
import { TickerTape } from './components/TickerTape';
import { QuickSearchModal } from './components/QuickSearchModal';
import { OrderModal } from './components/OrderModal';
import { OverviewScreen } from './components/screens/OverviewScreen';
import { ChartTerminalScreen } from './components/screens/ChartTerminalScreen';
import { WatchlistScreen } from './components/screens/WatchlistScreen';
import { HeatmapScreen } from './components/screens/HeatmapScreen';
import { CalendarNewsScreen } from './components/screens/CalendarNewsScreen';

import {
  INITIAL_INDICES,
  INITIAL_ASSETS,
  INITIAL_SECTORS,
  INITIAL_ECONOMIC_EVENTS,
  INITIAL_NEWS
} from './data/marketData';
import {
  MarketIndex,
  MarketAsset,
  PortfolioPosition,
  TradeOrder,
  PriceAlert
} from './types/market';
import { Bell, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Screens & Navigation
  const [activeScreen, setActiveScreen] = useState<ScreenTab>('overview');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NVDA');

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderModalSymbol, setOrderModalSymbol] = useState<string>('NVDA');

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(true);
  const [recentFlash, setRecentFlash] = useState<Record<string, 'up' | 'down'>>({});

  // Market Data State
  const [indices, setIndices] = useState<MarketIndex[]>(() => {
    const saved = localStorage.getItem('mp_indices');
    return saved ? JSON.parse(saved) : INITIAL_INDICES;
  });

  const [assets, setAssets] = useState<MarketAsset[]>(() => {
    const saved = localStorage.getItem('mp_assets');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  // Watchlist State
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(() => {
    const saved = localStorage.getItem('mp_watchlist');
    return saved ? JSON.parse(saved) : ['NVDA', 'AAPL', 'MSFT', 'BTC-USD', 'AMZN'];
  });

  // Paper Portfolio State
  const [cashBalance, setCashBalance] = useState<number>(() => {
    const saved = localStorage.getItem('mp_cash');
    return saved ? JSON.parse(saved) : 64250.0;
  });

  const [positions, setPositions] = useState<PortfolioPosition[]>(() => {
    const saved = localStorage.getItem('mp_positions');
    return saved
      ? JSON.parse(saved)
      : [
          { symbol: 'NVDA', shares: 50, avgCost: 125.4, currentPrice: 139.85 },
          { symbol: 'AAPL', shares: 80, avgCost: 218.5, currentPrice: 231.4 },
          { symbol: 'MSFT', shares: 40, avgCost: 408.0, currentPrice: 422.18 },
        ];
  });

  const [orders, setOrders] = useState<TradeOrder[]>(() => {
    const saved = localStorage.getItem('mp_orders');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'ord-1',
            symbol: 'NVDA',
            side: 'buy',
            type: 'market',
            shares: 50,
            price: 125.4,
            total: 6270.0,
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
            status: 'filled',
          },
          {
            id: 'ord-2',
            symbol: 'AAPL',
            side: 'buy',
            type: 'limit',
            shares: 80,
            price: 218.5,
            total: 17480.0,
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
            status: 'filled',
          },
        ];
  });

  // Alerts State
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem('mp_alerts');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'alt-1',
            symbol: 'NVDA',
            targetPrice: 145.0,
            condition: 'above',
            createdAt: Date.now() - 3600000,
            triggered: false,
          },
          {
            id: 'alt-2',
            symbol: 'TSLA',
            targetPrice: 215.0,
            condition: 'below',
            createdAt: Date.now() - 7200000,
            triggered: false,
          },
        ];
  });

  // Toast Notification
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('mp_watchlist', JSON.stringify(watchlistSymbols));
  }, [watchlistSymbols]);

  useEffect(() => {
    localStorage.setItem('mp_positions', JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem('mp_cash', JSON.stringify(cashBalance));
  }, [cashBalance]);

  useEffect(() => {
    localStorage.setItem('mp_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('mp_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Live Market Tick Simulation Engine
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Pick 2-3 random assets to nudge
      const numToUpdate = Math.floor(Math.random() * 2) + 2;
      const flashUpdates: Record<string, 'up' | 'down'> = {};

      setAssets((prevAssets) => {
        return prevAssets.map((asset) => {
          // 40% probability of tick for any given asset
          if (Math.random() > 0.4) return asset;

          const deltaPercent = (Math.random() - 0.48) * 0.4; // slight upward bias
          const priceChange = asset.price * (deltaPercent / 100);
          const newPrice = Math.max(1, Number((asset.price + priceChange).toFixed(2)));
          const totalChange = Number((newPrice - asset.prevClose).toFixed(2));
          const totalChangePercent = Number(((totalChange / asset.prevClose) * 100).toFixed(2));

          const direction = priceChange >= 0 ? 'up' : 'down';
          flashUpdates[asset.symbol] = direction;

          // Check alerts
          alerts.forEach((alert) => {
            if (alert.symbol === asset.symbol && !alert.triggered) {
              if (
                (alert.condition === 'above' && newPrice >= alert.targetPrice) ||
                (alert.condition === 'below' && newPrice <= alert.targetPrice)
              ) {
                setToastNotification(
                  `Price Alert Triggered: ${asset.symbol} crossed $${alert.targetPrice.toFixed(2)} (Now $${newPrice.toFixed(2)})`
                );
              }
            }
          });

          // Update sparkline
          const newSparkline = [...asset.sparkline.slice(1), newPrice];

          return {
            ...asset,
            price: newPrice,
            change: totalChange,
            changePercent: totalChangePercent,
            dayHigh: Math.max(asset.dayHigh, newPrice),
            dayLow: Math.min(asset.dayLow, newPrice),
            sparkline: newSparkline,
          };
        });
      });

      // Also gently update S&P 500 or Nasdaq indices
      setIndices((prevIndices) => {
        return prevIndices.map((idx) => {
          if (Math.random() > 0.5) return idx;
          const idxDelta = (Math.random() - 0.48) * (idx.price * 0.0008);
          const newIdxPrice = Number((idx.price + idxDelta).toFixed(2));
          const newIdxChange = Number((idx.change + idxDelta).toFixed(2));
          const newIdxPercent = Number(((newIdxChange / (newIdxPrice - newIdxChange)) * 100).toFixed(2));

          flashUpdates[idx.symbol] = idxDelta >= 0 ? 'up' : 'down';

          return {
            ...idx,
            price: newIdxPrice,
            change: newIdxChange,
            changePercent: newIdxPercent,
            sparkline: [...idx.sparkline.slice(1), newIdxPrice],
          };
        });
      });

      setRecentFlash((prev) => ({ ...prev, ...flashUpdates }));

      // Clear flash after 800ms
      setTimeout(() => {
        setRecentFlash({});
      }, 800);
    }, 2800);

    return () => clearInterval(interval);
  }, [isSimulating, alerts]);

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Symbol Navigation Handler
  const handleSelectSymbol = useCallback((symbol: string) => {
    // If index selected, redirect to S&P 500 or stock equivalent
    const matchedAsset = assets.find((a) => a.symbol === symbol);
    if (matchedAsset) {
      setSelectedSymbol(symbol);
    } else {
      setSelectedSymbol('NVDA');
    }
    setActiveScreen('terminal');
  }, [assets]);

  // Watchlist Toggle Handler
  const handleToggleWatchlist = useCallback((symbol: string) => {
    setWatchlistSymbols((prev) => {
      if (prev.includes(symbol)) {
        return prev.filter((s) => s !== symbol);
      } else {
        return [...prev, symbol];
      }
    });
  }, []);

  const isWatchlisted = useCallback(
    (symbol: string) => watchlistSymbols.includes(symbol),
    [watchlistSymbols]
  );

  // Open Order Modal for specific symbol
  const handleOpenOrderFor = useCallback((symbol: string) => {
    setOrderModalSymbol(symbol);
    setIsOrderModalOpen(true);
  }, []);

  // Execute Order
  const handleExecuteOrder = (orderData: Omit<TradeOrder, 'id' | 'timestamp' | 'status'>): boolean => {
    const orderId = `ord-${Date.now()}`;
    const newOrder: TradeOrder = {
      ...orderData,
      id: orderId,
      timestamp: Date.now(),
      status: 'filled',
    };

    if (orderData.side === 'buy') {
      if (orderData.total > cashBalance) return false;
      setCashBalance((prev) => prev - orderData.total);

      setPositions((prev) => {
        const existing = prev.find((p) => p.symbol === orderData.symbol);
        if (existing) {
          const totalShares = existing.shares + orderData.shares;
          const totalCost = existing.shares * existing.avgCost + orderData.total;
          const avgCost = totalCost / totalShares;
          return prev.map((p) =>
            p.symbol === orderData.symbol
              ? { ...p, shares: totalShares, avgCost: Number(avgCost.toFixed(2)) }
              : p
          );
        } else {
          return [
            ...prev,
            {
              symbol: orderData.symbol,
              shares: orderData.shares,
              avgCost: orderData.price,
              currentPrice: orderData.price,
            },
          ];
        }
      });
    } else {
      // Sell
      setCashBalance((prev) => prev + orderData.total);
      setPositions((prev) => {
        const existing = prev.find((p) => p.symbol === orderData.symbol);
        if (!existing) return prev;
        if (existing.shares <= orderData.shares) {
          return prev.filter((p) => p.symbol !== orderData.symbol);
        } else {
          return prev.map((p) =>
            p.symbol === orderData.symbol
              ? { ...p, shares: p.shares - orderData.shares }
              : p
          );
        }
      });
    }

    setOrders((prev) => [newOrder, ...prev]);
    setToastNotification(
      `Order Executed: ${orderData.side.toUpperCase()} ${orderData.shares} ${orderData.symbol} @ $${orderData.price.toFixed(2)}`
    );
    return true;
  };

  // Close Entire Position
  const handleClosePosition = (symbol: string) => {
    const pos = positions.find((p) => p.symbol === symbol);
    if (!pos) return;
    const currentAsset = assets.find((a) => a.symbol === symbol);
    const price = currentAsset ? currentAsset.price : pos.currentPrice;
    const total = pos.shares * price;

    handleExecuteOrder({
      symbol,
      side: 'sell',
      type: 'market',
      shares: pos.shares,
      price,
      total,
    });
  };

  // Alerts Management
  const handleAddAlert = (symbol: string, targetPrice: number, condition: 'above' | 'below') => {
    const newAlert: PriceAlert = {
      id: `alt-${Date.now()}`,
      symbol,
      targetPrice,
      condition,
      createdAt: Date.now(),
      triggered: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setToastNotification(`Price trigger set for ${symbol} at $${targetPrice.toFixed(2)}`);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#faf9ff] text-[#131722] flex flex-col antialiased">
      {/* 1. TOP HEADER (Strict 3-zone contract) */}
      <Header
        activeScreen={activeScreen}
        onScreenChange={setActiveScreen}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenOrderModal={() => handleOpenOrderFor(selectedSymbol)}
        isSimulating={isSimulating}
        onToggleSimulating={() => setIsSimulating(!isSimulating)}
      />

      {/* 2. REAL-TIME TICKER TAPE */}
      <TickerTape
        indices={indices}
        assets={assets}
        onSelectSymbol={handleSelectSymbol}
        recentFlash={recentFlash}
      />

      {/* 3. MAIN WORKSPACE VIEWPORT */}
      <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {activeScreen === 'overview' && (
          <OverviewScreen
            indices={indices}
            assets={assets}
            sectors={INITIAL_SECTORS}
            news={INITIAL_NEWS}
            onSelectSymbol={handleSelectSymbol}
            onOpenOrderFor={handleOpenOrderFor}
            onToggleWatchlist={handleToggleWatchlist}
            isWatchlisted={isWatchlisted}
            onViewAllNews={() => setActiveScreen('calendar')}
            onViewAllHeatmap={() => setActiveScreen('heatmap')}
          />
        )}

        {activeScreen === 'terminal' && (
          <ChartTerminalScreen
            selectedSymbol={selectedSymbol}
            assets={assets}
            onSelectSymbol={handleSelectSymbol}
            onOpenOrderFor={handleOpenOrderFor}
            onToggleWatchlist={handleToggleWatchlist}
            isWatchlisted={isWatchlisted}
          />
        )}

        {activeScreen === 'watchlist' && (
          <WatchlistScreen
            assets={assets}
            watchlistSymbols={watchlistSymbols}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectSymbol={handleSelectSymbol}
            onOpenOrderFor={handleOpenOrderFor}
            positions={positions}
            cashBalance={cashBalance}
            orders={orders}
            onClosePosition={handleClosePosition}
            alerts={alerts}
            onAddAlert={handleAddAlert}
            onDeleteAlert={handleDeleteAlert}
          />
        )}

        {activeScreen === 'heatmap' && (
          <HeatmapScreen
            assets={assets}
            onSelectSymbol={handleSelectSymbol}
            onOpenOrderFor={handleOpenOrderFor}
            onToggleWatchlist={handleToggleWatchlist}
            isWatchlisted={isWatchlisted}
          />
        )}

        {activeScreen === 'calendar' && (
          <CalendarNewsScreen
            events={INITIAL_ECONOMIC_EVENTS}
            news={INITIAL_NEWS}
            onSelectSymbol={handleSelectSymbol}
          />
        )}
      </main>

      {/* 4. COMMAND PALETTE SEARCH MODAL (Ctrl+K) */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        assets={assets}
        indices={indices}
        onSelectSymbol={handleSelectSymbol}
        onToggleWatchlist={handleToggleWatchlist}
        isWatchlisted={isWatchlisted}
        onOpenOrderFor={handleOpenOrderFor}
      />

      {/* 5. PAPER TRADING ORDER TICKET MODAL */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        assets={assets}
        initialSymbol={orderModalSymbol}
        cashBalance={cashBalance}
        onExecuteOrder={handleExecuteOrder}
      />

      {/* 6. TOAST NOTIFICATION BANNER */}
      {toastNotification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#131722] text-white rounded-xl shadow-xl text-xs font-semibold animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#089981] shrink-0" />
          <span>{toastNotification}</span>
          <button
            onClick={() => setToastNotification(null)}
            className="ml-2 text-[#787B86] hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
