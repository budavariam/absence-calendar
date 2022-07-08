import distinctColors from 'distinct-colors'

export const junk = " - OoO"
export const formatName = (memberName) => memberName.replace(junk, "")

export const calculateEvents = (eventData, allMembers, selectedMembers) => {
    const palette = distinctColors({
        count: allMembers.length,
    })

    const memberInfo = [...selectedMembers].reduce((acc, memberName, i) => {
        if (!acc.hasOwnProperty(memberName)) {
            acc[memberName] = []
        }
        acc[memberName] = {
            color: palette[i],
        }
        return acc
    }, {})
    // console.log("calculateEvents", eventData)

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
            title: name,
            start: curr.start,
            end: curr.end,
            color: memberInfo[name].color,
            valid: true,
        }
    }).filter(m => m.valid)
}

export const calculateMembers = (eventData) => {
    return [...new Set(eventData.map((event) => {
        return formatName(event.who)
    }))].sort((a, b) => a.localeCompare(b))
}