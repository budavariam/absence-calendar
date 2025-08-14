import TextareaAutosize from '@mui/material/TextareaAutosize';
import { DISPATCH_ACTION, LOCALSTORAGE_DEFAULT, LOCALSTORAGE_KEY } from '../utils/constants';
import "./FavouritesData.css"
import { useLocalStorageSync } from './useLocalStorageSync';

export const FavouritesData = ({ dispatch }) => {
    const [rawFavouritesData, setRawFavouritesData] = useLocalStorageSync(
        LOCALSTORAGE_KEY.FAVOURITE_MEMBERS,
        LOCALSTORAGE_DEFAULT.FAVOURITE_MEMBERS
    );

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
