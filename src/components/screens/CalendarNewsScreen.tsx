import React, { useState } from 'react';
import { Calendar, Globe, AlertTriangle, ChevronRight, X, ExternalLink, Bookmark } from 'lucide-react';
import { EconomicEvent, NewsArticle } from '../../types/market';

interface CalendarNewsScreenProps {
  events: EconomicEvent[];
  news: NewsArticle[];
  onSelectSymbol: (symbol: string) => void;
}

export const CalendarNewsScreen: React.FC<CalendarNewsScreenProps> = ({
  events,
  news,
  onSelectSymbol,
}) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'news'>('calendar');
  const [impactFilter, setImpactFilter] = useState<'All' | 'High'>('All');
  const [newsCategory, setNewsCategory] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const filteredEvents =
    impactFilter === 'High' ? events.filter((e) => e.impact === 'High') : events;

  const filteredNews =
    newsCategory === 'All' ? news : news.filter((n) => n.category === newsCategory);

  return (
    <div className="space-y-5 pb-12 select-none">
      {/* 1. HEADER & TAB SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0E3EB] pb-3">
        <div>
          <h2 className="text-[20px] font-bold text-[#131722] tracking-tight">
            Economic Calendar & News Wire
          </h2>
          <p className="text-xs text-[#787B86]">
            Macro releases, central bank decisions, and real-time market sentiment
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#F0F3FA] rounded-full self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'bg-[#131722] text-white shadow-2xs'
                : 'text-[#787B86] hover:text-[#131722]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Economic Releases ({events.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'news'
                ? 'bg-[#131722] text-white shadow-2xs'
                : 'text-[#787B86] hover:text-[#131722]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>News Wire ({news.length})</span>
          </button>
        </div>
      </div>

      {/* 2. ECONOMIC CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          {/* Calendar Toolbar */}
          <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#131722]">Impact Filter:</span>
              <div className="flex items-center gap-1 p-0.5 bg-[#F0F3FA] rounded-lg">
                <button
                  onClick={() => setImpactFilter('All')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    impactFilter === 'All' ? 'bg-[#131722] text-white' : 'text-[#787B86]'
                  }`}
                >
                  All Impacts
                </button>
                <button
                  onClick={() => setImpactFilter('High')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    impactFilter === 'High' ? 'bg-[#F23645] text-white' : 'text-[#787B86]'
                  }`}
                >
                  High Impact Only
                </button>
              </div>
            </div>

            <div className="text-xs text-[#787B86] hidden sm:block">
              Timezone: <strong className="text-[#131722]">US Eastern (EDT)</strong>
            </div>
          </div>

          {/* Calendar Table */}
          <div className="bg-[#FFFFFF] border border-[#E0E3EB] rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F0F3FA] text-[11px] font-semibold uppercase text-[#787B86] tracking-wider bg-[#faf9ff]">
                    <th className="py-3 px-5">Date & Time</th>
                    <th className="py-3 px-4">Region</th>
                    <th className="py-3 px-4">Event Name</th>
                    <th className="py-3 px-4 text-center">Impact</th>
                    <th className="py-3 px-4 text-right">Forecast</th>
                    <th className="py-3 px-5 text-right">Previous</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F3FA] text-sm">
                  {filteredEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-[#F0F3FA] transition-colors">
                      <td className="py-3 px-5">
                        <span className="font-bold text-[#131722]">{ev.date}</span>
                        <span className="text-xs text-[#787B86] block">{ev.time}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#131722]">
                          <span>{ev.flag}</span>
                          <span>{ev.country}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#131722]">{ev.title}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            ev.impact === 'High'
                              ? 'bg-[#F23645]/15 text-[#F23645]'
                              : ev.impact === 'Medium'
                              ? 'bg-[#fab005]/20 text-[#d97706]'
                              : 'bg-[#F0F3FA] text-[#787B86]'
                          }`}
                        >
                          {ev.impact}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-xs font-bold text-[#131722]">
                        {ev.forecast || '—'}
                      </td>
                      <td className="py-3 px-5 text-right tabular-nums text-xs text-[#787B86]">
                        {ev.previous || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. NEWS WIRE VIEW */}
      {activeTab === 'news' && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {['All', 'Tech', 'Macro', 'Energy', 'Crypto', 'Earnings'].map((cat) => (
              <button
                key={cat}
                onClick={() => setNewsCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  newsCategory === cat
                    ? 'bg-[#131722] text-white shadow-2xs'
                    : 'bg-[#FFFFFF] border border-[#E0E3EB] text-[#787B86] hover:text-[#131722]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* News Feed Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNews.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedArticle(item)}
                className="bg-[#FFFFFF] border border-[#E0E3EB] hover:border-[#2962ff] rounded-2xl p-5 transition-all hover:shadow-xs cursor-pointer group flex flex-col justify-between"
              >
                <div>
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

                  <h3 className="text-[16px] font-bold text-[#131722] group-hover:text-[#2962ff] transition-colors leading-snug mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#434656] line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F0F3FA] flex items-center justify-between text-xs text-[#787B86]">
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
                  <span className="font-medium text-[#2962ff] flex items-center gap-1 group-hover:underline">
                    <span>Read Article</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ARTICLE READER MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131722]/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-[#FFFFFF] rounded-2xl border border-[#E0E3EB] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E3EB] bg-[#faf9ff]">
              <div className="flex items-center gap-2 text-xs text-[#787B86]">
                <span className="font-bold text-[#131722]">{selectedArticle.source}</span>
                <span>·</span>
                <span>{selectedArticle.timeAgo}</span>
                <span>·</span>
                <span className="text-[#089981] font-semibold">{selectedArticle.sentiment} Sentiment</span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1 rounded-full text-[#787B86] hover:text-[#131722]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <h2 className="text-[20px] font-extrabold text-[#131722] leading-snug">
                {selectedArticle.title}
              </h2>

              <p className="text-sm text-[#434656] leading-relaxed">
                {selectedArticle.summary}
              </p>

              <div className="p-4 bg-[#faf9ff] rounded-xl border border-[#E0E3EB] space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#131722]">
                  Key Analyst Takeaways
                </h4>
                <ul className="text-xs text-[#434656] space-y-1.5 list-disc pl-4">
                  <li>Market consensus confirms ongoing acceleration across capital expenditure cycles.</li>
                  <li>Cross-asset volatility skew remains contained as macroeconomic indicators align with soft landing.</li>
                  <li>Institutional portfolio managers maintain active overweight positioning in market leaders.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#787B86] mb-2">
                  Impacted Securities
                </h4>
                <div className="flex items-center gap-2">
                  {selectedArticle.relatedTickers.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        onSelectSymbol(t);
                        setSelectedArticle(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#F0F3FA] hover:bg-[#ebedfa] text-[#131722] font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <span>{t}</span>
                      <ExternalLink className="w-3 h-3 text-[#787B86]" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-[#E0E3EB] bg-[#faf9ff] flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#131722] text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
