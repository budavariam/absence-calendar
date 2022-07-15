import distinctColors from 'distinct-colors'
// import chroma from "chroma-js";

export const junk = " - OoO"
export const formatName = (memberName) => memberName.replace(junk, "")

export const calculateEvents = (eventData, allMembers, selectedMembers) => {
    const palette = distinctColors({
        count: allMembers.length,
        lightMax: 70,
    })

    // NOTE: it could be calculated when generating the allMembers list
    const memberInfo = allMembers.reduce((acc, memberName, i) => {
        if (!acc.hasOwnProperty(memberName)) {
            acc[memberName] = []
        }
        acc[memberName] = {
            color: palette[i],
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
            // more info: https://fullcalendar.io/docs/v3/event-object
            title: name,
            start: curr.start,
            end: curr.end,
            color: memberInfo[name].color,
            textColor: 'white', // TODO: chroma get mathing color
            valid: true,
        }
    }).filter(m => m.valid)
}

export const calculateMembers = (eventData) => {
    return [...new Set(eventData.map((event) => {
        return formatName(event.who)
    }))].sort((a, b) => a.localeCompare(b))
}