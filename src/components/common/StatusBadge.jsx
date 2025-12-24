import React from 'react';

const StatusBadge = ({ status }) => {
    const styles = {
        Approved: 'text-emerald-400 bg-emerald-900/30 border-emerald-500/30',
        Pending: 'text-amber-400 bg-amber-900/30 border-amber-500/30',
        Rejected: 'text-rose-400 bg-rose-900/30 border-rose-500/30',
    };

    return (
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${styles[status] || styles.Pending}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
