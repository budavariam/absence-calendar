import { useMemo } from 'react';
import './TableView.css';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function toDateStr(date) {
    return date.toISOString().split('T')[0];
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

export function TableView({ events, memberInfo, selectedMembers, allMemberName, showWeekends }) {
    const dates = useMemo(() => {
        const result = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < 90; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            if (!showWeekends && isWeekend(d)) continue;
            result.push(d);
        }
        return result;
    }, [showWeekends]);

    // memberName -> [{ start, end, colorHex }]
    const memberEvents = useMemo(() => {
        const lookup = {};
        for (const event of events) {
            if (!lookup[event.title]) lookup[event.title] = [];
            lookup[event.title].push({
                start: event.start,
                end: event.end,
                colorHex: event.color.hex(),
            });
        }
        return lookup;
    }, [events]);

    const visibleMembers = useMemo(() => {
        return allMemberName.filter(m => selectedMembers.has(m));
    }, [allMemberName, selectedMembers]);

    function getVacationColor(memberName, dateStr) {
        const evts = memberEvents[memberName];
        if (!evts) return null;
        for (const evt of evts) {
            if (dateStr >= evt.start && dateStr < evt.end) {
                return evt.colorHex;
            }
        }
        return null;
    }

    return (
        <div className="table-view">
            <div className="table-scroll">
                <table className="absence-table">
                    <thead>
                        <tr>
                            <th className="col-member-header">Member</th>
                            {dates.map(d => {
                                const weekend = isWeekend(d);
                                return (
                                    <th
                                        key={toDateStr(d)}
                                        className={`col-date-header${weekend ? ' weekend' : ''}`}
                                    >
                                        <div>{MONTH_NAMES[d.getMonth()]} {d.getDate()}</div>
                                        <div>{DAY_NAMES[d.getDay()]}</div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {visibleMembers.map(member => {
                            const memberColor = memberInfo[member]?.color?.hex();
                            return (
                                <tr key={member}>
                                    <td
                                        className="col-member-name"
                                        style={{ borderLeft: `4px solid ${memberColor || '#ccc'}` }}
                                    >
                                        {member}
                                    </td>
                                    {dates.map(d => {
                                        const dateStr = toDateStr(d);
                                        const bgColor = getVacationColor(member, dateStr);
                                        const weekend = isWeekend(d);
                                        return (
                                            <td
                                                key={dateStr}
                                                className={`col-day-cell${weekend ? ' weekend' : ''}`}
                                                style={bgColor ? { backgroundColor: bgColor } : {}}
                                            />
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
