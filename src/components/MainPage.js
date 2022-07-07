import { useReducer } from 'react';
import './MainPage.css';

import { Calendar } from './Calendar';
import { MemberSelector } from './MemberSelector';
import { events, memberInfo } from '../utils/member';

const mainReducerFn = (state, action) => {
    return state
}

export const MainPage = () => {
    const [state, dispatch] = useReducer(mainReducerFn, {
        events: events,
        members: memberInfo,
    })

    return (
        <div className="mainPage">
            <Calendar events={state.events} />
            <MemberSelector members={state.members} dispatch={dispatch} />
        </div>
    )
}