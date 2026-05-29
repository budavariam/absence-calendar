import distinctColors from 'distinct-colors'
// import chroma from "chroma-js";

export const junk = " - OoO"
export const formatName = (memberName) => memberName.replace(junk, "")

// Normalize DD-MM-YYYY → YYYY-MM-DD; pass through anything else as-is
const normalizeDate = (dateStr) => {
    if (!dateStr) return dateStr
    const match = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/)
    if (match) return `${match[3]}-${match[2]}-${match[1]}`
    return dateStr
}

const VALID_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const validateDate = (dateStr) => {
    if (!dateStr) return 'missing'
    if (!VALID_DATE_RE.test(dateStr)) return `unrecognized format "${dateStr}" (expected YYYY-MM-DD)`
    const d = new Date(dateStr + 'T00:00:00')
    if (isNaN(d.getTime())) return `not a real date "${dateStr}"`
    return null
}

const addOneDay = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
}

export const calculateMemberInfo = (allMembers) => {
    const palette = distinctColors({
        count: allMembers.length,
        lightMax: 70,
    })

    const memberInfo = allMembers.reduce((acc, memberName, i) => {
        acc[memberName] = { color: palette[i] }
        return acc
    }, {})
    return memberInfo
}

// Returns { events, errors }
export const calculateEvents = (eventData, memberInfo, selectedMembers, inclusiveEndDate = false) => {
    const errorSet = new Set()

    const events = eventData.map((curr) => {
        const name = formatName(curr.who)
        if (!selectedMembers.has(name)) return { valid: false }

        const info = memberInfo[name]
        if (!info) {
            errorSet.add(`No color info for member "${name}"`)
            return { valid: false }
        }

        const startDate = normalizeDate(curr.start)
        const endDate = normalizeDate(curr.end)

        const startErr = validateDate(startDate)
        const endErr = validateDate(endDate)
        if (startErr) errorSet.add(`"${name}" start: ${startErr}`)
        if (endErr) errorSet.add(`"${name}" end: ${endErr}`)
        if (startErr || endErr) return { valid: false }

        const tentative = curr.tentative === true

        return {
            title: name,
            start: startDate,
            end: inclusiveEndDate ? addOneDay(endDate) : endDate,
            color: info.color,
            textColor: 'white',
            tentative,
            classNames: tentative ? ['tentative'] : [],
            valid: true,
        }
    }).filter(m => m.valid)

    return { events, errors: [...errorSet] }
}

export const calculateMembers = (eventData) => {
    return [...new Set(eventData.map((event) => {
        return formatName(event.who)
    }))].sort((a, b) => a.localeCompare(b))
}
