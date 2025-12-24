import React from 'react';
import { Sparkles, Plus, RefreshCw, Loader2, Search } from 'lucide-react';
import TrendCard from './TrendCard';

const TrendList = ({
    trends,
    selectedTrendId,
    onSelectTrend,
    onAddTopic,
    onRegenerateTrends,
    isGeneratingTrends,
    searchQuery,
    onDeleteTopic,
    onAnalyzeTrend,
    analyzingIds
}) => {
    return (
        <div className="lg:col-span-7 flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 drop-shadow-lg">
                        <Sparkles size={18} className="text-fuchsia-400" />
                        Agent Findings
                    </h3>
                    <p className="text-sm text-slate-400">Top {trends.length} signals detected this week.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onAddTopic} className="p-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/50 transition-colors">
                        <Plus size={16} />
                    </button>
                    <button
                        onClick={onRegenerateTrends}
                        disabled={isGeneratingTrends}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600/80 hover:bg-indigo-500/80 backdrop-blur-md text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 border border-indigo-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGeneratingTrends ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        {isGeneratingTrends ? 'Scanning...' : 'Scan Network'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-10">
                {trends.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-700/50 rounded-xl">
                        <Search size={24} className="mb-2 opacity-50" />
                        <span>No trends found matching "{searchQuery}"</span>
                    </div>
                ) : (
                    trends.map((trend) => (
                        <TrendCard
                            key={trend.id}
                            trend={trend}
                            isSelected={selectedTrendId === trend.id}
                            onClick={() => onSelectTrend(trend.id)}
                            onDelete={onDeleteTopic}
                            onAnalyze={onAnalyzeTrend}
                            isAnalyzing={analyzingIds.has(trend.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default TrendList;
