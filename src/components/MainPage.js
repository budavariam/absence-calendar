import { useEffect, useReducer } from 'react';
import './MainPage.css';

import { Calendar } from './Calendar';
import { MemberSelector } from './MemberSelector';
import { calculateEvents, calculateMembers } from '../utils/member';
import { DISPATCH_ACTION, LOCALSTORAGE_DEFAULT, LOCALSTORAGE_KEY } from '../utils/constants';
import { EventData } from './EventData';
import { FavouritesData } from './FavouritesData';

const mainReducerFn = (state, action) => {
    if (!action || !action.type) {
        return state
    }
    switch (action.type) {
        case DISPATCH_ACTION.CHECK_MEMBER: {
            const tgt = action.value
            let newSelection = new Set()
            if (state.selectedMembers.has(tgt)) {
                newSelection = new Set(state.selectedMembers)
                newSelection.delete(tgt)
            } else {
                newSelection = new Set(state.selectedMembers).add(tgt)
            }
            return {
                ...state,
                selectedMembers: newSelection,
                events: calculateEvents(
                    state.rawData,
                    state.allMemberName,
                    newSelection
                ),
            }
        }
        case DISPATCH_ACTION.UPDATE_FAVOURITES: {
            try {
                const tgt = JSON.parse(action.value)
                let favourites = new Set(tgt)
                return {
                    ...state,
                    favourites: favourites,
                }
            } catch (err) {
                console.error("Failed to update favourite members list:", action)
            }
            return state
        }
        case DISPATCH_ACTION.UPDATE_EVENT: {
            const value = action.value
            try {
                const updatedEventObj = JSON.parse(value)
                const allMemberName = calculateMembers(updatedEventObj)
                return {
                    ...state,
                    rawData: updatedEventObj,
                    allMemberName: allMemberName,
                    events: calculateEvents(updatedEventObj, allMemberName, state.selectedMembers)
                }

            } catch (err) {
                console.error("Failed to parse events", err)
            }
            return state
        }
        default: {
            return state
        }
    }
}

const persistedMembers = window.localStorage.getItem(LOCALSTORAGE_KEY.SELECTEDMEMBERS) || LOCALSTORAGE_DEFAULT.SELECTEDMEMBERS
const persistedSelection = JSON.parse(persistedMembers)

export const MainPage = () => {
    const [state, dispatch] = useReducer(mainReducerFn, {}, () => {
        const selectedMembers = new Set(persistedSelection)
        const eventDataStr = window.localStorage.getItem(LOCALSTORAGE_KEY.RAWEVENTDATA) || LOCALSTORAGE_DEFAULT.RAWEVENTDATA
        let rawEventData = []
        try {
            rawEventData = JSON.parse(eventDataStr)
        } catch (err) {
            console.error("Failed to load rawEventData", err)
        }
        const allMemberName = calculateMembers(rawEventData)

        let favourites = new Set()
        const favouritesStr = window.localStorage.getItem(LOCALSTORAGE_KEY.FAVOURITE_MEMBERS) || LOCALSTORAGE_DEFAULT.FAVOURITE_MEMBERS
        try {
            const rawFavouritesData = JSON.parse(favouritesStr)
            favourites = new Set(rawFavouritesData)
        } catch (err) {
            console.error("Failed to load favouritesData", err)
        }

        return {
            rawData: rawEventData,
            events: calculateEvents(rawEventData, allMemberName, selectedMembers),
            allMemberName: allMemberName,
            selectedMembers: selectedMembers,
            favourites: favourites,
        }
    })

    useEffect(() => {
        window.localStorage.setItem(LOCALSTORAGE_KEY.SELECTEDMEMBERS, JSON.stringify([...state.selectedMembers]))
    }, [state.selectedMembers])

    // console.log("RENDER APP", state)
    return (
        <div className="mainPage">
            <Calendar
                events={state.events}
            />
            <aside className="member-controller">
                <MemberSelector
                    members={state.allMemberName}
                    dispatch={dispatch}
                    favourites={state.favourites}
                    selectedMembers={state.selectedMembers} />
                <EventData dispatch={dispatch} />
                <FavouritesData dispatch={dispatch} />
            </aside>
        </div>
    )
}