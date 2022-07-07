import './MainPage.css';
import { Calendar } from './Calendar';
import { MemberSelector } from './MemberSelector';

export const MainPage = () => {
    return (
        <div className="mainPage">
            <Calendar />
            <MemberSelector />
        </div>
    )
}