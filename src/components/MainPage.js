import { useEffect, useReducer } from 'react';
import './MainPage.css';

import { Calendar } from './Calendar';
import { MemberSelector } from './MemberSelector';
import { calculateEvents, calculateMemberInfo, calculateMembers } from '../utils/member';
import { DISPATCH_ACTION, LOCALSTORAGE_DEFAULT, LOCALSTORAGE_KEY } from '../utils/constants';
import { EventData } from './EventData';
import { FavouritesData } from './FavouritesData';
import { anonimizeNames, anonimizeEvents } from '../utils/anonymous';

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
                    state.memberInfo,
                    newSelection
                ),
            }
        }
        case DISPATCH_ACTION.UPDATE_FAVOURITES: {
            try {
                const tgt = anonimizeNames(JSON.parse(action.value), state.anonMapping)
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
                const updatedEventObj = anonimizeEvents(JSON.parse(value))
                const allMemberName = calculateMembers(updatedEventObj)
                const memberInfo = calculateMemberInfo(allMemberName)
                return {
                    ...state,
                    rawData: updatedEventObj,
                    allMemberName: allMemberName,
                    memberInfo: memberInfo,
                    events: calculateEvents(updatedEventObj, memberInfo, state.selectedMembers)
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
        let rawAnonMapping = {}
        try {
            let { events, anonMapping } = anonimizeEvents(JSON.parse(eventDataStr))
            rawEventData = events
            rawAnonMapping = anonMapping
        } catch (err) {
            console.error("Failed to load rawEventData", err)
        }
        const allMemberName = calculateMembers(rawEventData)
        const memberInfo = calculateMemberInfo(allMemberName)
        let favourites = new Set()
        const favouritesStr = window.localStorage.getItem(LOCALSTORAGE_KEY.FAVOURITE_MEMBERS) || LOCALSTORAGE_DEFAULT.FAVOURITE_MEMBERS
        try {
            const rawFavouritesData = anonimizeNames(JSON.parse(favouritesStr), rawAnonMapping)
            favourites = new Set(rawFavouritesData)
        } catch (err) {
            console.error("Failed to load favouritesData", err)
        }

        return {
            rawData: rawEventData,
            events: calculateEvents(rawEventData, memberInfo, selectedMembers),
            memberInfo: memberInfo,
            allMemberName: allMemberName,
            selectedMembers: selectedMembers,
            favourites: favourites,
            anonMapping: rawAnonMapping,
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
                    memberInfo={state.memberInfo}
                    selectedMembers={state.selectedMembers} />
                <EventData dispatch={dispatch} />
                <FavouritesData dispatch={dispatch} />
            </aside>
        </div>
    )
}