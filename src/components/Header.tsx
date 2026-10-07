import React from 'react';
import { Search, Activity, Play, Pause, Plus } from 'lucide-react';

export type ScreenTab = 'overview' | 'terminal' | 'watchlist' | 'heatmap' | 'calendar';

interface HeaderProps {
  activeScreen: ScreenTab;
  onScreenChange: (screen: ScreenTab) => void;
  onOpenSearch: () => void;
  onOpenOrderModal: () => void;
  isSimulating: boolean;
  onToggleSimulating: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeScreen,
  onScreenChange,
  onOpenSearch,
  onOpenOrderModal,
  isSimulating,
  onToggleSimulating,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E0E3EB] px-4 lg:px-8 py-3 select-none">
      <div className="max-w-[1536px] mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark in display face */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onScreenChange('overview')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
            title="Market Precision Home"
          >
            <div className="w-8 h-8 rounded-lg bg-[#2962ff] flex items-center justify-center shadow-xs group-hover:bg-[#1e53e5] transition-colors">
              <Activity className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <span className="text-[17px] font-extrabold tracking-tight text-[#131722] hover:text-[#2962ff] transition-colors">
              Market Precision
            </span>
          </button>
        </div>

        {/* Zone 2: Clean 4-6 text navigation links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          <button
            onClick={() => onScreenChange('overview')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap ${
              activeScreen === 'overview'
                ? 'bg-[#131722] text-[#FFFFFF] font-semibold'
                : 'text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onScreenChange('terminal')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap ${
              activeScreen === 'terminal'
                ? 'bg-[#131722] text-[#FFFFFF] font-semibold'
                : 'text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA]'
            }`}
          >
            Chart Terminal
          </button>
          <button
            onClick={() => onScreenChange('watchlist')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap ${
              activeScreen === 'watchlist'
                ? 'bg-[#131722] text-[#FFFFFF] font-semibold'
                : 'text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA]'
            }`}
          >
            Watchlist & Portfolio
          </button>
          <button
            onClick={() => onScreenChange('heatmap')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap ${
              activeScreen === 'heatmap'
                ? 'bg-[#131722] text-[#FFFFFF] font-semibold'
                : 'text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA]'
            }`}
          >
            Heatmap & Screener
          </button>
          <button
            onClick={() => onScreenChange('calendar')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap ${
              activeScreen === 'calendar'
                ? 'bg-[#131722] text-[#FFFFFF] font-semibold'
                : 'text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA]'
            }`}
          >
            Calendar & News
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions and quick utility controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Market Status Pill */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F0F3FA] text-[11px] font-medium text-[#434656]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#089981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#089981]"></span>
            </span>
            <span>US Markets Open</span>
          </div>

          {/* Quick Search Bar / Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0F3FA] text-[#787B86] hover:bg-[#EAECEF] hover:text-[#131722] text-[13px] transition-colors border border-transparent focus:border-[#2962ff] focus:outline-none"
            title="Search tickers, symbols or companies (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-[#787B86]" />
            <span className="hidden sm:inline">Search tickers...</span>
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold bg-[#FFFFFF] text-[#737687] rounded border border-[#E0E3EB]">
              ⌘K
            </kbd>
          </button>

          {/* Simulation Toggle */}
          <button
            onClick={onToggleSimulating}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
              isSimulating
                ? 'bg-[#ebedfa] border-[#c3c5d8] text-[#0049db]'
                : 'bg-[#F0F3FA] border-transparent text-[#787B86] hover:text-[#131722]'
            }`}
            title={isSimulating ? 'Pause live market ticks' : 'Resume live market ticks'}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3 h-3 text-[#0049db]" />
                <span className="hidden sm:inline">Live Ticks</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-[#787B86]" />
                <span className="hidden sm:inline">Paused</span>
              </>
            )}
          </button>

          {/* Primary Action: Trade Execution Ticket */}
          <button
            onClick={onOpenOrderModal}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#2962ff] hover:bg-[#1e53e5] text-white text-[13px] font-semibold transition-all shadow-xs active:scale-98 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Trade</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav strip */}
      <div className="flex md:hidden items-center gap-1 overflow-x-auto pt-2 pb-0.5 no-scrollbar">
        {(['overview', 'terminal', 'watchlist', 'heatmap', 'calendar'] as ScreenTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => onScreenChange(tab)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              activeScreen === tab
                ? 'bg-[#131722] text-white font-semibold'
                : 'bg-[#F0F3FA] text-[#787B86]'
            }`}
          >
            {tab === 'overview' && 'Overview'}
            {tab === 'terminal' && 'Terminal'}
            {tab === 'watchlist' && 'Watchlist'}
            {tab === 'heatmap' && 'Heatmap'}
            {tab === 'calendar' && 'Calendar'}
          </button>
        ))}
      </div>
    </header>
  );
};
