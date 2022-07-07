import { useReducer } from 'react';
import './MainPage.css';

import { Calendar } from './Calendar';
import { MemberSelector } from './MemberSelector';
import { events } from '../utils/member';
import { allNames } from '../utils/data';

const mainReducerFn = (state, action) => {
    return state
}

export const MainPage = () => {
    const [state, dispatch] = useReducer(mainReducerFn, {
        events: events,
        allMemberName: allNames,
    })

    return (
        <div className="mainPage">
            <Calendar events={state.events} />
            <MemberSelector members={state.allMemberName} dispatch={dispatch} />
        </div>
    )
}