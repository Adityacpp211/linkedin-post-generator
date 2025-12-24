import React from 'react';
import {
    ChevronDown, Sparkles, Loader2, Newspaper, CheckCircle2, Square, Play,
    Image as ImageIcon, MessageSquare, Repeat, Heart, Share2, Users, Check, Send
} from 'lucide-react';
import ActionIcon from '../common/ActionIcon';

const PreviewPanel = ({
    currentTrend,
    generatedPreviewText,
    isGeneratingPreview,
    onGeneratePreview,
    draftTone,
    setDraftTone,
    isRefining,
    onRefine,
    isSimulating,
    onSimulate,
    simulatedComments,
    isGeneratingImage,
    postImages,
    onGenerateImage,
    isGeneratingAudio,
    isPlayingAudio,
    onToggleAudio,
    onApprove
}) => {
    return (
        <div className="lg:col-span-5 h-full flex flex-col">
            <div className="flex-1 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/5 flex flex-col overflow-hidden shadow-2xl relative ring-1 ring-white/5">

                {/* Controls Header */}
                <div className="p-4 border-b border-white/5 flex flex-col gap-4 bg-black/20">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Live Output Preview</span>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 group">
                            <select
                                value={draftTone}
                                onChange={(e) => setDraftTone(e.target.value)}
                                className="w-full appearance-none bg-black/40 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer hover:bg-slate-800/50"
                            >
                                <option value="enthusiastic">🚀 Tone: Hype / Viral</option>
                                <option value="skeptical">🧐 Tone: Skeptical</option>
                                <option value="executive">👔 Tone: Executive</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-slate-300" />
                        </div>

                        <button
                            onClick={onGeneratePreview}
                            disabled={isGeneratingPreview || !currentTrend}
                            className="text-xs bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-indigo-900/20 whitespace-nowrap font-medium"
                        >
                            {isGeneratingPreview ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            {isGeneratingPreview ? 'Drafting...' : 'Draft'}
                        </button>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 p-6 flex flex-col items-center overflow-y-auto bg-gradient-to-br from-slate-900 to-black relative">
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                    {/* Mock Twitter Post */}
                    {!currentTrend ? (
                        <div className="text-slate-600 flex flex-col items-center gap-2 mt-20">
                            <Newspaper size={32} />
                            <span className="text-sm">Select a trend to preview</span>
                        </div>
                    ) : (
                        <div className="w-full max-w-sm flex flex-col gap-4">
                            <div className="bg-black/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl relative z-10 transition-all duration-500">
                                {isGeneratingPreview && (
                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={32} className="text-indigo-400 animate-spin" />
                                            <span className="text-xs font-mono text-indigo-300 tracking-widest">GENERATING COPY...</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        N
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-bold text-white text-[15px]">Nexus Tech Bot</span>
                                            <CheckCircle2 size={14} className="text-blue-400 fill-blue-400/20" />
                                            <span className="text-slate-500 text-[14px]">@nexus_ai · just now</span>
                                        </div>

                                        <div className="mt-2 text-[15px] text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                                            {generatedPreviewText ? (
                                                generatedPreviewText
                                            ) : (
                                                <>
                                                    <span className="text-indigo-400 font-bold">Waiting for draft...</span>
                                                    <br />
                                                    Select "Draft" above to generate a viral post for:
                                                    <br />
                                                    "{currentTrend.title}"
                                                </>
                                            )}
                                        </div>

                                        {/* Audio Player and Refine Tools */}
                                        {generatedPreviewText && !isGeneratingPreview && (
                                            <div className="flex flex-col gap-2 mt-3 mb-1">
                                                {/* Audio Player Row */}
                                                <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                                                    <button
                                                        onClick={onToggleAudio}
                                                        disabled={isGeneratingAudio}
                                                        className={`p-2 rounded-full transition-all ${isPlayingAudio
                                                            ? 'bg-indigo-500 text-white animate-pulse'
                                                            : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                                                            }`}
                                                    >
                                                        {isGeneratingAudio ? <Loader2 size={14} className="animate-spin" /> : isPlayingAudio ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                                                    </button>
                                                    <div className="flex-1 flex flex-col justify-center">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">AI Audio Brief</span>
                                                        <div className="h-1 w-full bg-slate-700 rounded-full mt-1 overflow-hidden">
                                                            {isPlayingAudio && <div className="h-full bg-indigo-500 animate-[progress_2s_ease-in-out_infinite] w-full origin-left"></div>}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Refine Tools */}
                                                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                                    <button onClick={() => onRefine("Make it shorter")} disabled={isRefining} className="text-[10px] bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white px-2 py-1 rounded border border-slate-700 transition-colors whitespace-nowrap">Shorten</button>
                                                    <button onClick={() => onRefine("Make it more professional")} disabled={isRefining} className="text-[10px] bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white px-2 py-1 rounded border border-slate-700 transition-colors whitespace-nowrap">Pro</button>
                                                    <button onClick={() => onRefine("Make it savage/sarcastic")} disabled={isRefining} className="text-[10px] bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white px-2 py-1 rounded border border-slate-700 transition-colors whitespace-nowrap">Savage</button>
                                                    {isRefining && <Loader2 size={12} className="animate-spin text-indigo-400" />}
                                                </div>
                                            </div>
                                        )}

                                        {/* Link Card with Image Generation */}
                                        <div className="mt-3 rounded-xl border border-slate-800 overflow-hidden bg-slate-900/50 group/card cursor-pointer hover:border-slate-700 transition-colors">
                                            <div className="h-40 bg-slate-900 w-full relative group overflow-hidden">
                                                {/* Image Display */}
                                                {postImages[currentTrend.id] ? (
                                                    <img
                                                        src={postImages[currentTrend.id]}
                                                        alt="Generated visual"
                                                        className="w-full h-full object-cover transform group-hover/card:scale-105 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-800/50 to-slate-900/50">
                                                        <ImageIcon className="text-slate-700 mb-2" size={32} />
                                                        <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">No Visual Asset</span>
                                                    </div>
                                                )}

                                                {/* Image Generation Overlay Button */}
                                                <div className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300 ${postImages[currentTrend.id] ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                                                    <button
                                                        onClick={onGenerateImage}
                                                        disabled={isGeneratingImage}
                                                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all hover:scale-105"
                                                    >
                                                        {isGeneratingImage ? <Loader2 size={12} className="animate-spin" /> : <ImageIcon size={12} />}
                                                        {isGeneratingImage ? 'Rendering 8K...' : 'Generate Visual ✨'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="bg-black/40 p-3 backdrop-blur-md">
                                                <div className="text-slate-500 text-xs font-mono mb-0.5">{currentTrend.source?.toLowerCase() || 'unknown'}.com</div>
                                                <div className="text-slate-200 text-sm font-medium truncate">{currentTrend.title}</div>
                                            </div>
                                        </div>

                                        {/* Tweet Actions */}
                                        <div className="flex justify-between mt-4 text-slate-500 max-w-[90%]">
                                            <ActionIcon icon={<MessageSquare size={18} />} count="12" color="hover:text-blue-400" />
                                            <ActionIcon icon={<Repeat size={18} />} count="4" color="hover:text-green-400" />
                                            <ActionIcon icon={<Heart size={18} />} count="89" color="hover:text-pink-400" />
                                            <ActionIcon icon={<Share2 size={18} />} count="" color="hover:text-blue-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Oracle Simulator Section */}
                            {generatedPreviewText && (
                                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                            <Users size={14} className="text-indigo-400" /> Oracle Simulator
                                        </h4>
                                        <button
                                            onClick={onSimulate}
                                            disabled={isSimulating}
                                            className="text-[10px] text-indigo-300 hover:text-white hover:bg-indigo-900/50 px-2 py-1 rounded transition-colors"
                                        >
                                            {isSimulating ? "Predicting..." : "Simulate Reactions"}
                                        </button>
                                    </div>

                                    {isSimulating ? (
                                        <div className="flex justify-center py-4">
                                            <Loader2 size={20} className="text-indigo-400 animate-spin" />
                                        </div>
                                    ) : simulatedComments[currentTrend.id] ? (
                                        <div className="space-y-3">
                                            {simulatedComments[currentTrend.id].map((comment, i) => (
                                                <div key={i} className="flex gap-2 text-xs">
                                                    <div className={`w-1 h-full rounded-full shrink-0 mt-1 ${comment.sentiment === 'positive' ? 'bg-emerald-500' :
                                                        comment.sentiment === 'negative' ? 'bg-rose-500' : 'bg-amber-500'
                                                        }`}></div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="font-bold text-slate-300">{comment.user}</span>
                                                            <span className="text-slate-600">{comment.handle}</span>
                                                        </div>
                                                        <p className="text-slate-400 leading-relaxed">{comment.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-slate-600 text-xs italic">
                                            Run simulator to predict audience engagement.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Footer */}
                <div className="p-4 border-t border-white/5 flex justify-between items-center bg-black/20">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Schedule</span>
                        <span className="text-xs text-slate-300 font-mono">Mon, Oct 24 • 09:00 AM</span>
                    </div>
                    <button
                        onClick={onApprove}
                        disabled={!currentTrend || currentTrend.status === 'Approved'}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg ${currentTrend?.status === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 cursor-default'
                            : 'bg-white text-black hover:bg-slate-200 hover:scale-105'
                            }`}
                    >
                        {currentTrend?.status === 'Approved' ? <Check size={16} /> : <Send size={16} />}
                        {currentTrend?.status === 'Approved' ? 'Queued' : 'Approve & Queue'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreviewPanel;
