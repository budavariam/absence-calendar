import React from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";

export function Calendar({events}) {
    return (
        <div className="App">
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
                plugins={[dayGridPlugin]}
                events={events}
            />
        </div>
    );
}
