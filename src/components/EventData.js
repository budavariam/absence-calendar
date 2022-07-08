import TextareaAutosize from '@mui/material/TextareaAutosize';
import { useEffect, useState } from 'react';
import "./EventData.css"

export const EventData = () => {
    const [rawEventData, setRawEventData] = useState(() => {
        return window.localStorage.getItem("rawEventData") || "[]"
    })

    useEffect(() => {
        window.localStorage.setItem("rawEventData", rawEventData)
    }, [rawEventData])

    return <div className="eventData">
        <TextareaAutosize
            maxRows={4}
            aria-label="maximum height"
            placeholder=""
            style={{ width: 300 }}
            value={rawEventData}
            onChange={(e) => {
                setRawEventData(e.target.value)
            }}
        />
    </div>
}