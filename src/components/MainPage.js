import { useEffect, useReducer } from 'react';
import './MainPage.css';

import { Calendar } from './Calendar';
import { MemberSelector } from './MemberSelector';
import { events } from '../utils/member';
import { allNames } from '../utils/data';
import { DISPATCH_ACTION } from '../utils/constants';

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
            return { ...state, selectedMembers: newSelection }
        }
        default: {
            return state
        }
    }
}

const persistedMembers = window.localStorage.getItem("selectedMembers") || "[]"
const persistedSelection = JSON.parse(persistedMembers)

export const MainPage = () => {
    const [state, dispatch] = useReducer(mainReducerFn, {
        events: events,
        allMemberName: allNames,
        selectedMembers: new Set(persistedSelection),
    })

    useEffect(() => {
        window.localStorage.setItem("selectedMembers", JSON.stringify([...state.selectedMembers]))
    }, [state.selectedMembers])

    return (
        <div className="mainPage">
            <Calendar
                events={state.events}
            />
            <MemberSelector
                members={state.allMemberName}
                dispatch={dispatch}
                selectedMembers={state.selectedMembers} />
        </div>
    )
}