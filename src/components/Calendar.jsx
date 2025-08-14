import React from "react";
import "./Calendar.css"

import '@fullcalendar/react/dist/vdom';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule"

export function Calendar({ events }) {
    return (
        <div className="calendar">
            <FullCalendar
                firstDay={1}
                locale="en"
                // header={{
                //   left: "prev,next",
                //   center: "title",
                //   right: "dayGridMonth,timeGridWeek,timeGridDay"
                // }}
                themeSystem="Simplex"
                initialView="dayGridMonth"
                weekends={false}
                eventTimeFormat={{ hour: 'numeric', minute: '2-digit' }}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, rrulePlugin]}
                events={events}
                headerToolbar={{
                    left: 'dayGridMonth,timeGridWeek',
                    center: 'title'
                }}
            />
        </div>
    );
}
