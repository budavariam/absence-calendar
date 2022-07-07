import distinctColors from 'distinct-colors'
import { selectedNames, data, postFix, formatName, allNames } from "./data";
import { anonymize, anonymous } from "../utils/anonymous";

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




export const calculateEvents = (eventData, selectedMembers) => {
    debugger
    const palette = distinctColors({
        count: allNames.length,
    })

    const memberInfo = [...selectedMembers].reduce((acc, memberName) => {
        if (!acc.hasOwnProperty(memberName)) {
            acc[memberName] = []
        }
        acc[memberName] = {
            color: palette.pop() || 'black',
            anonNick: anonymous.pop() || 'anonymous',
        }
        return acc
    }, {})


    return eventData.map((curr) => {
        const name = formatName(curr.who)
        if (!selectedMembers.has(name)) {
            return {
                title: "",
                start: "",
                end: "",
                valid: false,
            }
        }
        console.log(curr, name)
        return {
            title: anonymize ? memberInfo[name].anonNick : name,
            start: curr.start,
            end: curr.end,
            color: memberInfo[name].color,
            valid: true,
        }
    })
}