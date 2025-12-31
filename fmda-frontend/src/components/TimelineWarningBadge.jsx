import React from 'react';

/**
 * Timeline Warning Badge Component
 * Displays color-coded status badge with icon
 */
const TimelineWarningBadge = ({ status, message, icon, badge, compact = false }) => {
    if (!status || status === 'unknown' || status === 'not-applicable') {
        return null;
    }

    if (compact) {
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${badge}`}>
                <span>{icon}</span>
                <span className="uppercase">{status.replace('-', ' ')}</span>
            </span>
        );
    }

    return (
        <div className={`inline-flex items-start gap-2 px-3 py-2 rounded-lg border ${badge}`}>
            <span className="text-lg">{icon}</span>
            <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider">
                    {status.replace('-', ' ')}
                </p>
                {message && (
                    <p className="text-xs mt-0.5 opacity-90">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default TimelineWarningBadge;
