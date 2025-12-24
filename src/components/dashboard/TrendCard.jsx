import React from 'react';
import { Trash2, Globe, Microscope, Loader2 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const TrendCard = ({
    trend,
    isSelected,
    onClick,
    onDelete,
    onAnalyze,
    isAnalyzing
}) => {
    return (
        <div
            onClick={onClick}
            className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 group relative overflow-hidden backdrop-blur-sm ${isSelected
                ? 'bg-gradient-to-r from-indigo-900/40 to-slate-900/40 border-indigo-500/50 shadow-xl shadow-indigo-900/20'
                : 'bg-slate-900/40 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                }`}
        >
            {/* Active Indicator Line */}
            {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-fuchsia-400 shadow-[0_0_10px_rgba(167,139,250,0.5)]"></div>
            )}

            <div className="flex justify-between items-start mb-2 pl-3">
                <span className="text-xs font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                    {trend.category}
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 bg-black/40 px-2 py-1 rounded border border-slate-800">
                        virality: {trend.score}%
                    </span>
                    <button
                        onClick={(e) => onDelete(e, trend.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors"
                    >
                        <Trash2 size={12} />
                    </button>
                    <StatusBadge status={trend.status} />
                </div>
            </div>

            <div className="pl-3 relative z-10">
                <h4 className={`text-lg font-semibold mb-1 transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                    {trend.title}
                </h4>
                <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">{trend.summary}</p>

                {trend.analysis && (
                    <div className="mt-4 p-4 bg-black/40 rounded-xl border border-indigo-500/10 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-2">
                            <Microscope size={12} /> INTELLIGENCE REPORT
                        </div>
                        <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-mono">
                            {trend.analysis}
                        </div>
                    </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Globe size={12} />
                        {trend.source}
                    </div>

                    <button
                        onClick={(e) => onAnalyze(e, trend.id)}
                        disabled={isAnalyzing || trend.analysis}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${trend.analysis
                            ? 'bg-slate-800/30 text-slate-500 cursor-default border border-transparent'
                            : 'bg-slate-800/80 hover:bg-indigo-600/20 text-indigo-300 hover:text-indigo-200 border border-slate-700 hover:border-indigo-500/50'
                            }`}
                    >
                        {isAnalyzing ? (
                            <Loader2 size={12} className="animate-spin text-indigo-400" />
                        ) : (
                            <Microscope size={12} className={trend.analysis ? 'text-slate-500' : 'text-indigo-400'} />
                        )}
                        {isAnalyzing ? 'Processing...' : trend.analysis ? 'Analyzed' : 'Deep Dive'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrendCard;
