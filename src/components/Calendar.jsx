import React from "react";
import "./Calendar.css"

import '@fullcalendar/react/dist/vdom';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule"

export function Calendar({ events, showWeekends, showComments }) {
    return (
        <div className="calendar">
            <FullCalendar
                firstDay={1}
                locale="en"
                themeSystem="Simplex"
                initialView="dayGridMonth"
                weekends={showWeekends}
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
