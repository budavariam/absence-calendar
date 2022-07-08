import distinctColors from 'distinct-colors'
import { formatName, allNames } from "./data";
import { anonymize, anonymous } from "../utils/anonymous";

export const calculateEvents = (eventData, selectedMembers) => {
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
        return {
            title: anonymize ? memberInfo[name].anonNick : name,
            start: curr.start,
            end: curr.end,
            color: memberInfo[name].color,
            valid: true,
        }
    })
}