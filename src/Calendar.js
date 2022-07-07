import React from "react";

import distinctColors from 'distinct-colors'
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
import { names, data, formatName } from "./data";
import { anonymous } from "./anonymous";

const anonymize = false

const palette = distinctColors({
    count: names.length, 
})

const memberInfo = names.reduce((acc, memberName) => {
  if (!acc.hasOwnProperty(memberName)) {
      acc[memberName] = []
  }
  acc[memberName] = {
    color: palette.pop(),
    anonNick: anonymous.pop(),
  }
  return acc
}, {})


const interested = new Set(names)

const events = data.map((curr) => {
    const name = formatName(curr.who)
    if (!interested.has(name)) {
        return {
            "title": "",
            "start": "",
            "end": "",
            valid: false,
        }
    }
    console.log(curr, name)
    return {
        "title": anonymize ? memberInfo[name].anonNick : name,
        "start": curr.start,
        "end": curr.end,
        color: memberInfo[name].color,
        valid: true,
    }
})

console.log(events)

// const res = data.reduce((acc, curr) => {
//   const name = curr.who.slice(0, -1 * " - OoO".length)
//   if (!interested.has(name)) {
//     return acc
//   }
//   if (!acc.hasOwnProperty(name)) {
//       acc[name] = []
//   }
//   acc[name].push([curr.start, curr.end])
//   return acc
// })

export function Calendar() {
    let firstDay = 1;

    return (
        <div className="App">
            <FullCalendar
                firstDay={firstDay}
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
