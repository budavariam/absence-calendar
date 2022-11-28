import TextareaAutosize from '@mui/material/TextareaAutosize';
import { useEffect, useState } from 'react';
import { DISPATCH_ACTION, LOCALSTORAGE_DEFAULT, LOCALSTORAGE_KEY } from '../utils/constants';
import "./FavouritesData.css"

export const FavouritesData = ({ dispatch }) => {
    const [rawFavouritesData, setRawFavouritesData] = useState(() => {
        return window.localStorage.getItem(LOCALSTORAGE_KEY.FAVOURITE_MEMBERS) || LOCALSTORAGE_DEFAULT.FAVOURITE_MEMBERS
    })

    useEffect(() => {
        window.localStorage.setItem(LOCALSTORAGE_KEY.FAVOURITE_MEMBERS, rawFavouritesData)
    }, [rawFavouritesData])

    return <div className="favourites-data">
        <TextareaAutosize
            maxRows={4}
            aria-label="maximum height"
            placeholder=""
            style={{ width: 300 }}
            value={rawFavouritesData}
            onChange={(e) => {
                setRawFavouritesData(e.target.value)
            }}
            onBlur={() => {
                dispatch({ type: DISPATCH_ACTION.UPDATE_FAVOURITES, value: rawFavouritesData })
            }}
        />
    </div>
}