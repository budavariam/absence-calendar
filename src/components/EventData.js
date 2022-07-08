import TextareaAutosize from '@mui/material/TextareaAutosize';
import { useEffect, useState } from 'react';
import { DISPATCH_ACTION, LOCALSTORAGE_DEFAULT, LOCALSTORAGE_KEY } from '../utils/constants';
import "./EventData.css"

export const EventData = ({ dispatch }) => {
    const [rawEventData, setRawEventData] = useState(() => {
        return window.localStorage.getItem(LOCALSTORAGE_KEY.RAWEVENTDATA) || LOCALSTORAGE_DEFAULT.RAWEVENTDATA
    })

    useEffect(() => {
        window.localStorage.setItem(LOCALSTORAGE_KEY.RAWEVENTDATA, rawEventData)
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
            onBlur={() => {
                dispatch({ type: DISPATCH_ACTION.UPDATE_EVENT, value: rawEventData })
            }}
        />
    </div>
}