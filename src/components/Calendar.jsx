import React, { useState, useMemo } from "react";
import "./Calendar.css"

import '@fullcalendar/react/dist/vdom';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule"

export function Calendar({ events, showWeekends, showComments, openGlobalWeekends }) {
    const [viewRange, setViewRange] = useState(null);

    // Only force weekends open when a @-event actually lands on a weekend
    // within the currently rendered date range
    const hasGlobalWeekendInRange = useMemo(() => {
        if (!openGlobalWeekends || showWeekends || !viewRange) return false;
        for (const event of events) {
            if (!event.global) continue;
            const start = new Date(event.start + 'T00:00:00');
            const end = new Date(event.end + 'T00:00:00');
            for (const d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                const day = d.getDay();
                if ((day === 0 || day === 6) && d >= viewRange.start && d < viewRange.end) {
                    return true;
                }
            }
        }
        return false;
    }, [events, openGlobalWeekends, showWeekends, viewRange]);

    return (
        <div className="calendar">
            <FullCalendar
                firstDay={1}
                locale="en"
                themeSystem="Simplex"
                initialView="dayGridMonth"
                weekends={showWeekends || hasGlobalWeekendInRange}
                datesSet={(info) => setViewRange({ start: info.start, end: info.end })}
                eventTimeFormat={{ hour: 'numeric', minute: '2-digit' }}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, rrulePlugin]}
                events={events}
                dayCellClassNames={(arg) => arg.date.getMonth() % 2 === 0 ? 'month-even' : 'month-odd'}
                eventContent={(arg) => {
                    const comment = arg.event.extendedProps?.comment;
                    return (
                        <div title={comment || undefined} style={{ overflow: 'hidden', width: '100%', padding: '0 2px' }}>
                            <b style={{ fontSize: '0.85em' }}>{arg.event.title}</b>
                            {showComments && comment && (
                                <span className="fc-event-comment">{comment}</span>
                            )}
                        </div>
                    );
                }}
                views={{
                    threeMonths: {
                        type: 'dayGrid',
                        duration: { months: 3 },
                        buttonText: '3 months',
                    }
                }}
                headerToolbar={{
                    left: 'dayGridMonth,threeMonths,timeGridWeek',
                    center: 'title'
                }}
            />
        </div>
    );
}
