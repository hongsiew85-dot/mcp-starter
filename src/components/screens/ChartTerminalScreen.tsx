import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Star,
  Plus,
  Maximize2,
  Clock,
  Layers,
  ChevronDown,
  BarChart,
  Sliders,
  DollarSign,
  Info
} from 'lucide-react';
import { MarketAsset, CandleData } from '../../types/market';
import { generateCandlesForSymbol } from '../../data/marketData';

interface ChartTerminalScreenProps {
  selectedSymbol: string;
  assets: MarketAsset[];
  onSelectSymbol: (symbol: string) => void;
  onOpenOrderFor: (symbol: string) => void;
  onToggleWatchlist: (symbol: string) => void;
  isWatchlisted: (symbol: string) => boolean;
}

type Timeframe = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'ALL';
type ChartType = 'candles' | 'area' | 'line';

export const ChartTerminalScreen: React.FC<ChartTerminalScreenProps> = ({
  selectedSymbol,
  assets,
  onSelectSymbol,
  onOpenOrderFor,
  onToggleWatchlist,
  isWatchlisted,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [showRSI, setShowRSI] = useState(true);

  // Active hover candle for crosshair inspect
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Quick Order panel state within sidebar
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderQty, setOrderQty] = useState<number>(10);

  // Find active asset
  const asset = assets.find((a) => a.symbol === selectedSymbol) || assets[0];

  // Generate candle data based on current price and selected timeframe
  const candles: CandleData[] = useMemo(() => {
    return generateCandlesForSymbol(asset.symbol, timeframe, asset.price);
  }, [asset.symbol, timeframe, asset.price]);

  // Derived indicator data
  const { smaValues, emaValues, bollingerBands, rsiValues, minPrice, maxPrice } = useMemo(() => {
    const closes = candles.map((c) => c.close);
    const n = closes.length;

    // Price bounds
    let minP = Math.min(...candles.map((c) => c.low));
    let maxP = Math.max(...candles.map((c) => c.high));
    const pad = (maxP - minP) * 0.08 || 1;
    minP -= pad;
    maxP += pad;

    // SMA 20
    const sma: (number | null)[] = [];
    const periodSMA = 14;
    for (let i = 0; i < n; i++) {
      if (i < periodSMA - 1) {
        sma.push(null);
      } else {
        const slice = closes.slice(i - periodSMA + 1, i + 1);
        const avg = slice.reduce((a, b) => a + b, 0) / periodSMA;
        sma.push(avg);
      }
    }

    // EMA 50
    const ema: (number | null)[] = [];
    const periodEMA = 20;
    const k = 2 / (periodEMA + 1);
    let prevEMA: number | null = null;
    for (let i = 0; i < n; i++) {
      if (i < periodEMA - 1) {
        ema.push(null);
      } else if (prevEMA === null) {
        const avg = closes.slice(0, periodEMA).reduce((a, b) => a + b, 0) / periodEMA;
        prevEMA = avg;
        ema.push(avg);
      } else {
        prevEMA = closes[i] * k + prevEMA * (1 - k);
        ema.push(prevEMA);
      }
    }

    // Bollinger Bands (20, 2)
    const bbUpper: (number | null)[] = [];
    const bbLower: (number | null)[] = [];
    const bbPeriod = 14;
    for (let i = 0; i < n; i++) {
      if (i < bbPeriod - 1) {
        bbUpper.push(null);
        bbLower.push(null);
      } else {
        const slice = closes.slice(i - bbPeriod + 1, i + 1);
        const avg = slice.reduce((a, b) => a + b, 0) / bbPeriod;
        const variance = slice.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / bbPeriod;
        const stdDev = Math.sqrt(variance);
        bbUpper.push(avg + stdDev * 2);
        bbLower.push(avg - stdDev * 2);
      }
    }

    // RSI 14
    const rsi: number[] = [];
    const rsiPeriod = 10;
    for (let i = 0; i < n; i++) {
      if (i < rsiPeriod) {
        rsi.push(50);
      } else {
        let gains = 0;
        let losses = 0;
        for (let j = i - rsiPeriod + 1; j <= i; j++) {
          const diff = closes[j] - closes[j - 1];
          if (diff >= 0) gains += diff;
          else losses += Math.abs(diff);
        }
        const avgGain = gains / rsiPeriod;
        const avgLoss = losses / rsiPeriod || 0.001;
        const rs = avgGain / avgLoss;
        const rsiVal = 100 - 100 / (1 + rs);
        rsi.push(Math.min(95, Math.max(5, rsiVal)));
      }
    }

    return {
      smaValues: sma,
      emaValues: ema,
      bollingerBands: { upper: bbUpper, lower: bbLower },
      rsiValues: rsi,
      minPrice: minP,
      maxPrice: maxP,
    };
  }, [candles]);

  const activeCandle = hoverIndex !== null ? candles[hoverIndex] : candles[candles.length - 1];
  const isPositive = asset.changePercent >= 0;
  const inWatchlist = isWatchlisted(asset.symbol);

  // SVG Chart Geometry
  const svgWidth = 860;
  const mainChartHeight = 320;
  const volumeChartHeight = showVolume ? 60 : 0;
  const rsiChartHeight = showRSI ? 80 : 0;
  const totalChartHeight = mainChartHeight + volumeChartHeight + rsiChartHeight;

  const candleWidth = Math.max(4, (svgWidth / candles.length) * 0.65);
  const maxVolume = Math.max(...candles.map((c) => c.volume), 1);

  // Price to Y coordinate in main chart
  const priceToY = (price: number) => {
    return (
      mainChartHeight -
      ((price - minPrice) / (maxPrice - minPrice || 1)) * (mainChartHeight - 20) -
      10
    );
  };

  // Generate Area/Line path
  const areaPath = useMemo(() => {
    const points = candles.map((c, i) => {
      const x = (i / (candles.length - 1)) * svgWidth;
      const y = priceToY(c.close);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const lineD = `M ${points.join(' L ')}`;
    const fillD = `${lineD} L ${svgWidth},${mainChartHeight} L 0,${mainChartHeight} Z`;
    return { lineD, fillD };
  }, [candles, minPrice, maxPrice]);

  return (
    <div className="space-y-4 pb-12 select-none">
      {/* 1. SYMBOL HEADER & COMPACT METRICS BAR */}
      <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Symbol Identifier & Selector */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={asset.symbol}
              onChange={(e) => onSelectSymbol(e.target.value)}
              className="appearance-none font-extrabold text-[22px] tracking-tight text-[#131722] bg-[#F0F3FA] hover:bg-[#EAECEF] border border-transparent hover:border-[#E0E3EB] py-1.5 pl-3.5 pr-9 rounded-xl cursor-pointer focus:outline-none focus:border-[#2962ff]"
            >
              {assets.map((a) => (
                <option key={a.symbol} value={a.symbol}>
                  {a.symbol} · {a.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#787B86] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="hidden sm:block">
            <h1 className="text-[15px] font-bold text-[#131722] leading-tight">{asset.name}</h1>
            <div className="flex items-center gap-2 text-xs text-[#787B86]">
              <span>{asset.exchange}</span>
              <span>·</span>
              <span>{asset.sector}</span>
              <span>·</span>
              <span>USD</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleWatchlist(asset.symbol)}
            className={`p-2 rounded-xl border transition-colors ml-auto sm:ml-0 ${
              inWatchlist
                ? 'bg-[#ffeedb] border-[#ffa94d] text-[#e8590c]'
                : 'bg-[#FFFFFF] border-[#E0E3EB] text-[#787B86] hover:text-[#131722]'
            }`}
            title="Toggle Watchlist"
          >
            <Star className={`w-4 h-4 ${inWatchlist ? 'fill-[#e8590c]' : ''}`} />
          </button>
        </div>

        {/* Live Big Price & Percentage Pill */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-[30px] font-black tabular-nums tracking-tight text-[#131722] leading-none">
              ${asset.price > 1000
                ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : asset.price.toFixed(2)}
            </div>
            <div className="flex items-center justify-end gap-1.5 mt-1">
              <span
                className={`tabular-nums font-bold text-sm flex items-center ${
                  isPositive ? 'text-[#089981]' : 'text-[#F23645]'
                }`}
              >
                {isPositive ? '+' : ''}
                {asset.change.toFixed(2)}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums flex items-center gap-0.5 ${
                  isPositive ? 'bg-[#089981]/12 text-[#089981]' : 'bg-[#F23645]/12 text-[#F23645]'
                }`}
              >
                {isPositive ? <TrendingUp className="w-3 h-3 stroke-[2.5]" /> : <TrendingDown className="w-3 h-3 stroke-[2.5]" />}
                <span>
                  {isPositive ? '+' : ''}
                  {asset.changePercent.toFixed(2)}%
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={() => onOpenOrderFor(asset.symbol)}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2962ff] hover:bg-[#1e53e5] text-white text-xs font-bold transition-all shadow-xs active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Buy / Sell</span>
          </button>
        </div>
      </div>

      {/* 2. KEY STATS METRICS RIBBON */}
      <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl px-5 py-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between min-w-max gap-6 text-xs">
          <div>
            <span className="text-[#787B86] block text-[10px] uppercase font-semibold">Open</span>
            <span className="font-bold text-[#131722] tabular-nums">${asset.openPrice.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[#787B86] block text-[10px] uppercase font-semibold">Day High</span>
            <span className="font-bold text-[#089981] tabular-nums">${asset.dayHigh.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[#787B86] block text-[10px] uppercase font-semibold">Day Low</span>
            <span className="font-bold text-[#F23645] tabular-nums">${asset.dayLow.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[#787B86] block text-[10px] uppercase font-semibold">Prev Close</span>
            <span className="font-bold text-[#131722] tabular-nums">${asset.prevClose.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[#787B86] block text-[10px] uppercase font-semibold">52W Range</span>
            <span className="font-bold text-[#131722] tabular-nums">
              ${asset.low52w.toFixed(0)} - ${asset.high52w.toFixed(0)}
            </span>
          </div>
          <div>
            <span className="text-[#787B86] block text-[10px] uppercase font-semibold">Volume / Avg</span>
            <span className="font-bold text-[#131722] tabular-nums">{asset.volume} / {asset.avgVolume}</span>
          </div>
          <div>
            <span className="text-[#787B86] block text-[10px] uppercase font-semibold">Mkt Cap</span>
            <span className="font-bold text-[#131722] tabular-nums">{asset.marketCap}</span>
          </div>
          <div>
            <span className="text-[#787B86] block text-[10px] uppercase font-semibold">P/E Ratio</span>
            <span className="font-bold text-[#131722] tabular-nums">{asset.peRatio ? asset.peRatio.toFixed(1) : 'N/A'}</span>
          </div>
          <div>
            <span className="text-[#787B86] block text-[10px] uppercase font-semibold">Beta</span>
            <span className="font-bold text-[#131722] tabular-nums">{asset.beta.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN TERMINAL WORKSPACE (CHART + SIDEBAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* LEFT / CENTER: Interactive Trading Chart Viewport (3 Columns) */}
        <div className="lg:col-span-3 bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          {/* Top Chart Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E0E3EB]">
            {/* Timeframe selector */}
            <div className="flex items-center gap-1 bg-[#F0F3FA] p-1 rounded-full text-xs font-semibold">
              {(['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'ALL'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-full transition-colors ${
                    timeframe === tf
                      ? 'bg-[#131722] text-white shadow-2xs'
                      : 'text-[#787B86] hover:text-[#131722]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Chart Type & Indicator Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#F0F3FA] p-1 rounded-full text-xs font-medium">
                <button
                  onClick={() => setChartType('candles')}
                  className={`px-2.5 py-1 rounded-full transition-colors ${
                    chartType === 'candles' ? 'bg-[#131722] text-white' : 'text-[#787B86] hover:text-[#131722]'
                  }`}
                >
                  Candles
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`px-2.5 py-1 rounded-full transition-colors ${
                    chartType === 'area' ? 'bg-[#131722] text-white' : 'text-[#787B86] hover:text-[#131722]'
                  }`}
                >
                  Mountain Area
                </button>
              </div>

              {/* Technical Indicator Chips */}
              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => setShowSMA(!showSMA)}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                    showSMA
                      ? 'bg-[#fff9db] border-[#fab005] text-[#e67700]'
                      : 'bg-[#FFFFFF] border-[#E0E3EB] text-[#787B86]'
                  }`}
                >
                  SMA 20
                </button>
                <button
                  onClick={() => setShowEMA(!showEMA)}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                    showEMA
                      ? 'bg-[#f3f0ff] border-[#845ef7] text-[#5f3dc4]'
                      : 'bg-[#FFFFFF] border-[#E0E3EB] text-[#787B86]'
                  }`}
                >
                  EMA 50
                </button>
                <button
                  onClick={() => setShowBollinger(!showBollinger)}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                    showBollinger
                      ? 'bg-[#e7f5ff] border-[#339af0] text-[#1c7ed6]'
                      : 'bg-[#FFFFFF] border-[#E0E3EB] text-[#787B86]'
                  }`}
                >
                  Bollinger
                </button>
                <button
                  onClick={() => setShowRSI(!showRSI)}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                    showRSI
                      ? 'bg-[#ebfbee] border-[#51cf66] text-[#2b8a3e]'
                      : 'bg-[#FFFFFF] border-[#E0E3EB] text-[#787B86]'
                  }`}
                >
                  RSI
                </button>
              </div>
            </div>
          </div>

          {/* Real-Time Crosshair Readout Header */}
          <div className="py-2.5 px-2 flex items-center justify-between text-xs text-[#787B86] border-b border-[#F0F3FA] bg-[#faf9ff]/70 rounded-lg my-1">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[#131722]">{activeCandle.dateStr}</span>
              <span className="tabular-nums">O: <strong className="text-[#131722]">${activeCandle.open.toFixed(2)}</strong></span>
              <span className="tabular-nums">H: <strong className="text-[#089981]">${activeCandle.high.toFixed(2)}</strong></span>
              <span className="tabular-nums">L: <strong className="text-[#F23645]">${activeCandle.low.toFixed(2)}</strong></span>
              <span className="tabular-nums">C: <strong className="text-[#131722]">${activeCandle.close.toFixed(2)}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="tabular-nums">Vol: <strong className="text-[#131722]">{(activeCandle.volume / 1000).toFixed(1)}K</strong></span>
              {showSMA && hoverIndex !== null && smaValues[hoverIndex] && (
                <span className="tabular-nums text-[#e67700] hidden sm:inline">SMA: ${smaValues[hoverIndex]?.toFixed(2)}</span>
              )}
            </div>
          </div>

          {/* SVG CHART CANVAS VIEWPORT */}
          <div className="relative w-full overflow-hidden my-2">
            <svg
              viewBox={`0 0 ${svgWidth} ${totalChartHeight}`}
              className="w-full h-auto cursor-crosshair overflow-visible"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, x / rect.width));
                const index = Math.round(ratio * (candles.length - 1));
                setHoverIndex(index);
              }}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2962ff" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#2962ff" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
                const y = mainChartHeight * ratio;
                const priceLevel = maxPrice - ratio * (maxPrice - minPrice);
                return (
                  <g key={ratio}>
                    <line
                      x1="0"
                      y1={y}
                      x2={svgWidth}
                      y2={y}
                      stroke="#E0E3EB"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />
                    <text
                      x={svgWidth - 6}
                      y={y - 4}
                      textAnchor="end"
                      fill="#787B86"
                      fontSize="10"
                      className="tabular-nums font-mono"
                    >
                      ${priceLevel.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {/* Bollinger Bands Shaded Area */}
              {showBollinger && (
                <g opacity="0.6">
                  {candles.map((_, i) => {
                    const u = bollingerBands.upper[i];
                    const l = bollingerBands.lower[i];
                    if (u === null || l === null) return null;
                    const x = (i / (candles.length - 1)) * svgWidth;
                    return (
                      <line
                        key={`bb-${i}`}
                        x1={x}
                        y1={priceToY(u)}
                        x2={x}
                        y2={priceToY(l)}
                        stroke="#339af0"
                        strokeWidth={candleWidth}
                        strokeOpacity="0.1"
                      />
                    );
                  })}
                </g>
              )}

              {/* Chart Render: Mountain Area or Candlesticks */}
              {chartType === 'area' ? (
                <g>
                  <path d={areaPath.fillD} fill="url(#areaGrad)" />
                  <path d={areaPath.lineD} fill="none" stroke="#2962ff" strokeWidth="2.5" />
                </g>
              ) : (
                /* Candlesticks */
                <g>
                  {candles.map((c, i) => {
                    const x = (i / (candles.length - 1)) * svgWidth;
                    const isGreen = c.close >= c.open;
                    const color = isGreen ? '#089981' : '#F23645';

                    const yOpen = priceToY(c.open);
                    const yClose = priceToY(c.close);
                    const yHigh = priceToY(c.high);
                    const yLow = priceToY(c.low);

                    const candleTop = Math.min(yOpen, yClose);
                    const candleBodyHeight = Math.max(2, Math.abs(yClose - yOpen));

                    return (
                      <g key={c.timestamp}>
                        {/* High/Low Wick */}
                        <line
                          x1={x}
                          y1={yHigh}
                          x2={x}
                          y2={yLow}
                          stroke={color}
                          strokeWidth="1.2"
                        />
                        {/* Open/Close Body */}
                        <rect
                          x={x - candleWidth / 2}
                          y={candleTop}
                          width={candleWidth}
                          height={candleBodyHeight}
                          fill={color}
                          rx="1"
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* SMA 20 Overlay Line */}
              {showSMA && (
                <path
                  d={smaValues
                    .map((val, i) => {
                      if (val === null) return '';
                      const x = (i / (candles.length - 1)) * svgWidth;
                      const y = priceToY(val);
                      return `${i === 13 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#fab005"
                  strokeWidth="2"
                />
              )}

              {/* EMA 50 Overlay Line */}
              {showEMA && (
                <path
                  d={emaValues
                    .map((val, i) => {
                      if (val === null) return '';
                      const x = (i / (candles.length - 1)) * svgWidth;
                      const y = priceToY(val);
                      return `${i === 19 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#845ef7"
                  strokeWidth="2"
                />
              )}

              {/* VOLUME SUB-CHART */}
              {showVolume && (
                <g transform={`translate(0, ${mainChartHeight})`}>
                  <line x1="0" y1="0" x2={svgWidth} y2="0" stroke="#E0E3EB" strokeWidth="1" />
                  <text x="6" y="14" fill="#787B86" fontSize="10" fontWeight="bold">
                    VOLUME
                  </text>
                  {candles.map((c, i) => {
                    const x = (i / (candles.length - 1)) * svgWidth;
                    const h = (c.volume / maxVolume) * (volumeChartHeight - 16);
                    const color = c.close >= c.open ? '#089981' : '#F23645';
                    return (
                      <rect
                        key={`vol-${i}`}
                        x={x - candleWidth / 2}
                        y={volumeChartHeight - h}
                        width={candleWidth}
                        height={Math.max(1, h)}
                        fill={color}
                        opacity="0.6"
                      />
                    );
                  })}
                </g>
              )}

              {/* RSI 14 SUB-CHART */}
              {showRSI && (
                <g transform={`translate(0, ${mainChartHeight + volumeChartHeight})`}>
                  <line x1="0" y1="0" x2={svgWidth} y2="0" stroke="#E0E3EB" strokeWidth="1" />
                  <text x="6" y="14" fill="#787B86" fontSize="10" fontWeight="bold">
                    RSI (14): {hoverIndex !== null ? rsiValues[hoverIndex]?.toFixed(1) : rsiValues[rsiValues.length - 1]?.toFixed(1)}
                  </text>
                  {/* 70 Overbought & 30 Oversold Guidelines */}
                  <line
                    x1="0"
                    y1={rsiChartHeight * 0.3}
                    x2={svgWidth}
                    y2={rsiChartHeight * 0.3}
                    stroke="#F23645"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  <line
                    x1="0"
                    y1={rsiChartHeight * 0.7}
                    x2={svgWidth}
                    y2={rsiChartHeight * 0.7}
                    stroke="#089981"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  {/* RSI Curve */}
                  <path
                    d={rsiValues
                      .map((val, i) => {
                        const x = (i / (candles.length - 1)) * svgWidth;
                        const y = rsiChartHeight - (val / 100) * rsiChartHeight;
                        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#2b8a3e"
                    strokeWidth="1.8"
                  />
                </g>
              )}

              {/* Crosshair Cursor Tracking */}
              {hoverIndex !== null && (
                <g>
                  {/* Vertical Crosshair */}
                  <line
                    x1={(hoverIndex / (candles.length - 1)) * svgWidth}
                    y1="0"
                    x2={(hoverIndex / (candles.length - 1)) * svgWidth}
                    y2={totalChartHeight}
                    stroke="#131722"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                    opacity="0.6"
                  />
                  {/* Horizontal Crosshair in main area */}
                  <line
                    x1="0"
                    y1={priceToY(activeCandle.close)}
                    x2={svgWidth}
                    y2={priceToY(activeCandle.close)}
                    stroke="#131722"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                    opacity="0.6"
                  />
                </g>
              )}
            </svg>
          </div>

          {/* Time axis footer */}
          <div className="pt-2 border-t border-[#F0F3FA] flex items-center justify-between text-[11px] text-[#787B86]">
            <span>{candles[0]?.dateStr}</span>
            <span>{candles[Math.floor(candles.length / 2)]?.dateStr}</span>
            <span className="font-semibold text-[#131722]">{candles[candles.length - 1]?.dateStr}</span>
          </div>
        </div>

        {/* RIGHT: High-Utility Trading Sidebar (1 Column) */}
        <div className="space-y-4">
          {/* A. Level 2 Depth of Market / Order Book */}
          <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#131722] uppercase tracking-wider">
                Order Book Depth (L2)
              </h3>
              <span className="text-[10px] font-semibold text-[#787B86] bg-[#F0F3FA] px-2 py-0.5 rounded">
                Spread $0.02
              </span>
            </div>

            <div className="text-[11px] space-y-1">
              {/* Asks (Sell Orders - Crimson) */}
              {[
                { price: asset.price + 0.08, size: 2400, depth: 85 },
                { price: asset.price + 0.05, size: 1800, depth: 65 },
                { price: asset.price + 0.02, size: 950, depth: 35 },
              ].map((ask, idx) => (
                <div key={idx} className="relative flex justify-between py-0.5 px-1 rounded overflow-hidden">
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-[#F23645]/15"
                    style={{ width: `${ask.depth}%` }}
                  />
                  <span className="relative z-10 font-bold tabular-nums text-[#F23645]">
                    ${ask.price.toFixed(2)}
                  </span>
                  <span className="relative z-10 tabular-nums text-[#787B86] font-medium">
                    {ask.size}
                  </span>
                </div>
              ))}

              {/* Mid Market Quote Divider */}
              <div className="py-1 px-1 my-0.5 border-y border-[#E0E3EB] bg-[#faf9ff] flex justify-between items-center font-black text-xs">
                <span className="text-[#131722]">${asset.price.toFixed(2)}</span>
                <span className="text-[10px] font-semibold text-[#089981]">Last Traded</span>
              </div>

              {/* Bids (Buy Orders - Green) */}
              {[
                { price: asset.price - 0.01, size: 1200, depth: 40 },
                { price: asset.price - 0.04, size: 2100, depth: 70 },
                { price: asset.price - 0.07, size: 3400, depth: 95 },
              ].map((bid, idx) => (
                <div key={idx} className="relative flex justify-between py-0.5 px-1 rounded overflow-hidden">
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-[#089981]/15"
                    style={{ width: `${bid.depth}%` }}
                  />
                  <span className="relative z-10 font-bold tabular-nums text-[#089981]">
                    ${bid.price.toFixed(2)}
                  </span>
                  <span className="relative z-10 tabular-nums text-[#787B86] font-medium">
                    {bid.size}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* B. Wall Street Analyst Consensus */}
          <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl p-4">
            <h3 className="text-xs font-bold text-[#131722] uppercase tracking-wider mb-2">
              Analyst Target & Rating
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#787B86]">Mean 12M Target:</span>
                <span className="font-extrabold text-[#131722] tabular-nums text-[14px]">
                  ${asset.analystConsensus.targetPrice.toFixed(2)}
                </span>
              </div>

              {/* Consensus Breakdown Bars */}
              <div>
                <div className="flex justify-between text-[11px] mb-1 font-semibold">
                  <span className="text-[#089981]">{asset.analystConsensus.buy} Buy</span>
                  <span className="text-[#787B86]">{asset.analystConsensus.hold} Hold</span>
                  <span className="text-[#F23645]">{asset.analystConsensus.sell} Sell</span>
                </div>
                <div className="h-2 w-full bg-[#F0F3FA] rounded-full overflow-hidden flex">
                  <div
                    className="bg-[#089981] h-full"
                    style={{
                      width: `${(asset.analystConsensus.buy / (asset.analystConsensus.buy + asset.analystConsensus.hold + asset.analystConsensus.sell)) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-[#c3c5d8] h-full"
                    style={{
                      width: `${(asset.analystConsensus.hold / (asset.analystConsensus.buy + asset.analystConsensus.hold + asset.analystConsensus.sell)) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-[#F23645] h-full"
                    style={{
                      width: `${(asset.analystConsensus.sell / (asset.analystConsensus.buy + asset.analystConsensus.hold + asset.analystConsensus.sell)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-[#787B86] pt-1">
                <span>Low: ${asset.analystConsensus.lowTarget.toFixed(0)}</span>
                <span className="text-[#089981] font-bold">
                  +{(((asset.analystConsensus.targetPrice - asset.price) / asset.price) * 100).toFixed(1)}% Upside
                </span>
                <span>High: ${asset.analystConsensus.highTarget.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* C. Quick Trade Execution Box */}
          <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl p-4">
            <h3 className="text-xs font-bold text-[#131722] uppercase tracking-wider mb-2">
              Quick Ticket: {asset.symbol}
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderSide('buy')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    orderSide === 'buy'
                      ? 'bg-[#089981] text-white shadow-xs'
                      : 'bg-[#F0F3FA] text-[#787B86]'
                  }`}
                >
                  Buy / Long
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSide('sell')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    orderSide === 'sell'
                      ? 'bg-[#F23645] text-white shadow-xs'
                      : 'bg-[#F0F3FA] text-[#787B86]'
                  }`}
                >
                  Sell / Short
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={orderQty}
                  onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-2.5 py-1.5 bg-[#F0F3FA] rounded-lg text-xs font-bold tabular-nums text-[#131722] focus:bg-white focus:outline-none focus:border-[#2962ff] border border-transparent"
                  placeholder="Shares"
                />
                <button
                  type="button"
                  onClick={() => onOpenOrderFor(asset.symbol)}
                  className="px-4 py-1.5 rounded-lg bg-[#2962ff] text-white text-xs font-bold hover:bg-[#1e53e5] whitespace-nowrap transition-colors"
                >
                  Execute
                </button>
              </div>

              <p className="text-[11px] text-[#787B86]">
                Est: ${(orderQty * asset.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. COMPANY PROFILE & RECENT SEC / EARNINGS CONTEXT */}
      <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl p-5">
        <h3 className="text-[15px] font-bold text-[#131722] mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-[#2962ff]" />
          <span>About {asset.name}</span>
        </h3>
        <p className="text-xs text-[#434656] leading-relaxed max-w-4xl">
          {asset.description}
        </p>
      </div>
    </div>
  );
};
