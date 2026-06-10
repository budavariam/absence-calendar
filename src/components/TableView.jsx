import { useMemo, useState } from 'react';
import './TableView.css';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import TableRowsIcon from '@mui/icons-material/TableRows';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const RANGE_DAYS = { week: 7, month: 30, '3months': 90 };

function toDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

function formatTitle(dates) {
    if (!dates.length) return '';
    const first = dates[0];
    const last = dates[dates.length - 1];
    const startStr = `${MONTH_NAMES[first.getMonth()]} ${first.getDate()}`;
    const endStr = `${MONTH_NAMES[last.getMonth()]} ${last.getDate()}`;
    const year = last.getFullYear();
    if (first.getFullYear() !== last.getFullYear()) {
        return `${startStr}, ${first.getFullYear()} – ${endStr}, ${year}`;
    }
    return `${startStr} – ${endStr}, ${year}`;
}

export function TableView({ events, memberInfo, selectedMembers, allMemberName, showWeekends, showComments, openGlobalWeekends }) {
    const [rangeType, setRangeType] = useState('month');
    const [offset, setOffset] = useState(0);
    const [pivoted, setPivoted] = useState(false);

    const startOfToday = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const todayStr = useMemo(() => toDateStr(startOfToday), [startOfToday]);

    // dateStr -> array of @-event names on that date
    const globalDatesMap = useMemo(() => {
        const map = {};
        for (const event of events) {
            if (!event.global) continue;
            // iterate every date in the event range
            const start = new Date(event.start + 'T00:00:00');
            const end = new Date(event.end + 'T00:00:00');
            for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                const ds = toDateStr(d);
                if (!map[ds]) map[ds] = [];
                map[ds].push(event.title);
            }
        }
        return map;
    }, [events]);

    const dates = useMemo(() => {
        const result = [];
        const rangeDays = RANGE_DAYS[rangeType];
        for (let i = 0; i < rangeDays; i++) {
            const d = new Date(startOfToday);
            d.setDate(startOfToday.getDate() + offset + i);
            const weekend = isWeekend(d);
            if (!showWeekends && weekend) {
                // include weekend if it has a global @-event and bridge-day toggle is on
                if (!openGlobalWeekends || !globalDatesMap[toDateStr(d)]) continue;
            }
            result.push(d);
        }
        return result;
    }, [startOfToday, rangeType, offset, showWeekends, openGlobalWeekends, globalDatesMap]);

    // memberName -> [{ start, end, colorHex, tentative, comment }]
    const memberEvents = useMemo(() => {
        const lookup = {};
        for (const event of events) {
            if (event.global) continue;   // global events handled separately
            if (!lookup[event.title]) lookup[event.title] = [];
            lookup[event.title].push({
                start: event.start,
                end: event.end,
                colorHex: event.color.hex(),
                tentative: event.tentative === true,
                comment: event.comment || '',
            });
        }
        return lookup;
    }, [events]);

    const visibleMembers = useMemo(() => {
        return allMemberName.filter(m => selectedMembers.has(m));
    }, [allMemberName, selectedMembers]);

    function getVacationEvent(memberName, dateStr) {
        const evts = memberEvents[memberName];
        if (!evts) return null;
        for (const evt of evts) {
            if (dateStr >= evt.start && dateStr < evt.end) return evt;
        }
        return null;
    }

    const step = RANGE_DAYS[rangeType];

    function renderDateHeader(d) {
        const weekend = isWeekend(d);
        const isToday = toDateStr(d) === todayStr;
        const monthClass = d.getMonth() % 2 === 0 ? 'month-even' : 'month-odd';
        const globalNames = globalDatesMap[toDateStr(d)];
        return (
            <th
                key={toDateStr(d)}
                className={`col-date-header ${monthClass}${weekend ? ' weekend' : ''}${isToday ? ' today' : ''}${globalNames ? ' global-day' : ''}`}
            >
                <div>{MONTH_NAMES[d.getMonth()]} {d.getDate()}</div>
                <div>{DAY_NAMES[d.getDay()]}</div>
                {globalNames && <div className="global-day-label">{globalNames.join(', ')}</div>}
            </th>
        );
    }

    function renderDayCell(member, d) {
        const dateStr = toDateStr(d);
        const vacEvent = getVacationEvent(member, dateStr);
        const weekend = isWeekend(d);
        const isToday = dateStr === todayStr;
        const monthClass = d.getMonth() % 2 === 0 ? 'month-even' : 'month-odd';
        const isGlobalDay = !!globalDatesMap[dateStr];
        return (
            <td
                key={dateStr}
                title={vacEvent?.comment || undefined}
                className={`col-day-cell ${monthClass}${weekend ? ' weekend' : ''}${vacEvent?.tentative ? ' tentative' : ''}${isToday ? ' today' : ''}${isGlobalDay && !vacEvent ? ' global-day' : ''}`}
                style={vacEvent ? { backgroundColor: vacEvent.colorHex } : {}}
            >
                {showComments && vacEvent?.comment && (
                    <span className="event-comment">{vacEvent.comment}</span>
                )}
            </td>
        );
    }

    return (
        <div className="table-view">
            <div className="table-toolbar">
                <div className="toolbar-left">
                    <ToggleButtonGroup
                        value={rangeType}
                        exclusive
                        onChange={(_, v) => v && setRangeType(v)}
                        size="small"
                        className="toolbar-range-group"
                    >
                        <ToggleButton value="month" className="toolbar-range-btn">month</ToggleButton>
                        <ToggleButton value="3months" className="toolbar-range-btn">3 months</ToggleButton>
                        <ToggleButton value="week" className="toolbar-range-btn">week</ToggleButton>
                    </ToggleButtonGroup>
                    <ToggleButton
                        value="pivoted"
                        selected={pivoted}
                        onChange={() => setPivoted(p => !p)}
                        size="small"
                        title="Pivot table"
                        className={`toolbar-pivot-btn${pivoted ? ' pivot-active' : ''}`}
                    >
                        {pivoted ? <TableRowsIcon fontSize="small" /> : <ViewColumnIcon fontSize="small" />}
                    </ToggleButton>
                </div>

                <div className="toolbar-center">
                    {formatTitle(dates)}
                </div>

                <div className="toolbar-right">
                    <Button
                        size="small"
                        onClick={() => setOffset(0)}
                        className="toolbar-today-btn"
                    >
                        today
                    </Button>
                    <div className="toolbar-nav-group">
                        <IconButton size="small" onClick={() => setOffset(o => o - step)} title="Previous" className="toolbar-nav-btn">
                            <ChevronLeftIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setOffset(o => o + step)} title="Next" className="toolbar-nav-btn">
                            <ChevronRightIcon fontSize="small" />
                        </IconButton>
                    </div>
                </div>
            </div>

            <div className="table-scroll">
                {!pivoted ? (
                    <table className="absence-table">
                        <thead>
                            <tr>
                                <th className="col-member-header">Member</th>
                                {dates.map(d => renderDateHeader(d))}
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
                                        {dates.map(d => renderDayCell(member, d))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <table className="absence-table">
                        <thead>
                            <tr>
                                <th className="col-member-header">Date</th>
                                {visibleMembers.map(member => {
                                    const memberColor = memberInfo[member]?.color?.hex();
                                    return (
                                        <th
                                            key={member}
                                            className="col-date-header"
                                            style={{ borderTop: `3px solid ${memberColor || '#ccc'}` }}
                                        >
                                            {member}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {dates.map(d => {
                                const dateStr = toDateStr(d);
                                const weekend = isWeekend(d);
                                const isToday = dateStr === todayStr;
                                const monthClass = d.getMonth() % 2 === 0 ? 'month-even' : 'month-odd';
                                const globalNames = globalDatesMap[dateStr];
                                return (
                                    <tr key={dateStr} className={weekend ? 'weekend-row' : ''}>
                                        <td className={`col-member-name ${monthClass}${isToday ? ' today' : ''}${globalNames ? ' global-day' : ''}`}>
                                            <div>{MONTH_NAMES[d.getMonth()]} {d.getDate()}</div>
                                            <div style={{ fontSize: 10, color: '#888' }}>{DAY_NAMES[d.getDay()]}</div>
                                            {globalNames && <div className="global-day-label">{globalNames.join(', ')}</div>}
                                        </td>
                                        {visibleMembers.map(member => {
                                            const vacEvent = getVacationEvent(member, dateStr);
                                            return (
                                                <td
                                                    key={member}
                                                    title={vacEvent?.comment || undefined}
                                                    className={`col-day-cell ${monthClass}${vacEvent?.tentative ? ' tentative' : ''}${isToday ? ' today' : ''}${globalNames && !vacEvent ? ' global-day' : ''}`}
                                                    style={vacEvent ? { backgroundColor: vacEvent.colorHex } : {}}
                                                >
                                                    {showComments && vacEvent?.comment && (
                                                        <span className="event-comment">{vacEvent.comment}</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
