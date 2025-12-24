import React from 'react';

const ActionIcon = ({ icon, count, color }) => (
    <div className={`flex items-center gap-1.5 group cursor-pointer transition-colors ${color}`}>
        {icon}
        {count && <span className="text-xs font-medium">{count}</span>}
    </div>
);

export default ActionIcon;
