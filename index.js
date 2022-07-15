import { data } from "./data.js"

const res = data.reduce((acc, curr) => {
    const name = curr.who.slice(0, -1 * " - OoO".length)
    if (!acc.hasOwnProperty(name)) {
        acc[name] = []
    }
    acc[name].push([curr.start, curr.end])
    return acc
})

console.log(res)

