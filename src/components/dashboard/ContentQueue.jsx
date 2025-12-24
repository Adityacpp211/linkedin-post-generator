import React from 'react';
import { Newspaper, Archive, Check, XCircle, Trash2 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const ContentQueue = ({
    trends,
    queueFilter,
    setQueueFilter,
    updateStatus,
    onDeleteTopic
}) => {
    // Filter queue items based on selected tab
    const filteredQueue = trends.filter(t => {
        if (queueFilter === 'All') return true;
        return t.status === queueFilter;
    });

    return (
        <div className="h-full flex flex-col bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
            {/* Queue Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Newspaper size={20} className="text-indigo-400" />
                        Content Queue
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Manage and moderate generated content.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-white/5">
                    {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setQueueFilter(status)}
                            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${queueFilter === status
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* List View */}
            <div className="flex-1 overflow-y-auto p-2">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#0F1117] z-10 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                            <th className="p-4 border-b border-white/5">Status</th>
                            <th className="p-4 border-b border-white/5">Topic</th>
                            <th className="p-4 border-b border-white/5">Category</th>
                            <th className="p-4 border-b border-white/5 text-right">Score</th>
                            <th className="p-4 border-b border-white/5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {filteredQueue.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <Archive size={32} className="opacity-20" />
                                        <span>No items found in {queueFilter} queue.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredQueue.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                                >
                                    <td className="p-4">
                                        <StatusBadge status={item.status} />
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-slate-200">{item.title}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{item.source}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs bg-white/5 px-2 py-1 rounded text-slate-400 border border-white/5">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-mono text-slate-400">
                                        {item.score}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            {item.status !== 'Approved' && (
                                                <button
                                                    onClick={() => updateStatus(item.id, 'Approved')}
                                                    className="p-1.5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-md transition-colors"
                                                    title="Approve"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                            {item.status !== 'Rejected' && (
                                                <button
                                                    onClick={() => updateStatus(item.id, 'Rejected')}
                                                    className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
                                                    title="Reject"
                                                >
                                                    <XCircle size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => onDeleteTopic(e, item.id)}
                                                className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white rounded-md transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContentQueue;
