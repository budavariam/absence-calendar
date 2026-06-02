import { useEffect, useReducer, useState } from 'react';
import './MainPage.css';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import TuneIcon from '@mui/icons-material/Tune';
import GroupIcon from '@mui/icons-material/Group';
import EventNoteIcon from '@mui/icons-material/EventNote';
import StarIcon from '@mui/icons-material/Star';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Calendar } from './Calendar';
import { TableView } from './TableView';
import { MemberSelector } from './MemberSelector';
import { calculateEvents, calculateMemberInfo, calculateMembers } from '../utils/member';
import { DISPATCH_ACTION, LOCALSTORAGE_DEFAULT, LOCALSTORAGE_KEY } from '../utils/constants';
import { EventData } from './EventData';
import { FavouritesData } from './FavouritesData';
import { anonimizeNames, anonimizeEvents } from '../utils/anonymous';
import { CSVConverter } from './Importer';
import { WeekendToggle } from './WeekendToggle';

const VIEW_TYPE = {
    CALENDAR: 'calendar',
    TABLE: 'table',
}

const LOCALSTORAGE_KEY_SIDEBAR = 'SIDEBAR_COLLAPSED';

const mainReducerFn = (state, action) => {
    if (!action || !action.type) return state

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
            const { events, errors } = calculateEvents(state.rawData, state.memberInfo, newSelection, state.inclusiveEndDate)
            return { ...state, selectedMembers: newSelection, events, eventErrors: errors }
        }
        case DISPATCH_ACTION.UPDATE_FAVOURITES: {
            try {
                const tgt = anonimizeNames(JSON.parse(action.value), state.anonMapping)
                return { ...state, favourites: new Set(tgt) }
            } catch (err) {
                console.error("Failed to update favourite members list:", action)
            }
            return state
        }
        case DISPATCH_ACTION.UPDATE_EVENT: {
            try {
                const updatedEventObj = anonimizeEvents(JSON.parse(action.value)).events
                const allMemberName = calculateMembers(updatedEventObj)
                const memberInfo = calculateMemberInfo(allMemberName)
                const { events, errors } = calculateEvents(updatedEventObj, memberInfo, state.selectedMembers, state.inclusiveEndDate)
                return { ...state, rawData: updatedEventObj, allMemberName, memberInfo, events, eventErrors: errors }
            } catch (err) {
                console.error("Failed to parse events", err)
            }
            return state
        }
        case DISPATCH_ACTION.TOGGLE_WEEKENDS: {
            return { ...state, showWeekends: !state.showWeekends }
        }
        case DISPATCH_ACTION.TOGGLE_INCLUSIVE_END: {
            const inclusiveEndDate = !state.inclusiveEndDate
            const { events, errors } = calculateEvents(state.rawData, state.memberInfo, state.selectedMembers, inclusiveEndDate)
            return { ...state, inclusiveEndDate, events, eventErrors: errors }
        }
        case DISPATCH_ACTION.TOGGLE_SHOW_COMMENTS: {
            return { ...state, showComments: !state.showComments }
        }
        default:
            return state
    }
}

const persistedMembers = window.localStorage.getItem(LOCALSTORAGE_KEY.SELECTEDMEMBERS) || LOCALSTORAGE_DEFAULT.SELECTEDMEMBERS
const persistedSelection = JSON.parse(persistedMembers)

const SECTION_ICONS = [
    { label: 'View', icon: <TuneIcon fontSize="small" /> },
    { label: 'Members', icon: <GroupIcon fontSize="small" /> },
    { label: 'Event Data', icon: <EventNoteIcon fontSize="small" /> },
    { label: 'Favourites', icon: <StarIcon fontSize="small" /> },
    { label: 'CSV Import', icon: <UploadFileIcon fontSize="small" /> },
]

// Only the accordion sections — no header
const SidebarSections = ({ state, dispatch, currentView, setCurrentView, onViewChange }) => (
    <div className="sidebar-sections">
        <Accordion defaultExpanded disableGutters elevation={0} square>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" fontWeight="bold">View</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <ToggleButtonGroup
                    value={currentView}
                    exclusive
                    onChange={(_, v) => { if (v) { setCurrentView(v); onViewChange?.(); } }}
                    size="small"
                    fullWidth
                >
                    <ToggleButton value={VIEW_TYPE.CALENDAR}>Calendar</ToggleButton>
                    <ToggleButton value={VIEW_TYPE.TABLE}>Table</ToggleButton>
                </ToggleButtonGroup>
                <WeekendToggle dispatch={dispatch} showWeekends={state.showWeekends} />
                <FormControlLabel
                    sx={{ mt: 0.5, ml: 0 }}
                    control={
                        <Switch
                            checked={state.showComments}
                            onChange={() => dispatch({ type: DISPATCH_ACTION.TOGGLE_SHOW_COMMENTS })}
                            size="small"
                        />
                    }
                    label={<Typography variant="body2">Show comments on events</Typography>}
                />
            </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded disableGutters elevation={0} square>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" fontWeight="bold">Members</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
                <MemberSelector
                    members={state.allMemberName}
                    dispatch={dispatch}
                    favourites={state.favourites}
                    memberInfo={state.memberInfo}
                    selectedMembers={state.selectedMembers}
                />
            </AccordionDetails>
        </Accordion>

        <Accordion disableGutters elevation={0} square>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" fontWeight="bold">Event Data</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <EventData dispatch={dispatch} />
                <FormControlLabel
                    sx={{ mt: 1, ml: 0 }}
                    control={
                        <Switch
                            checked={state.inclusiveEndDate}
                            onChange={() => dispatch({ type: DISPATCH_ACTION.TOGGLE_INCLUSIVE_END })}
                            size="small"
                        />
                    }
                    label={<Typography variant="body2">End date is inclusive</Typography>}
                />
                {state.eventErrors.length > 0 && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                        {state.eventErrors.map((e, i) => (
                            <div key={i}>{e}</div>
                        ))}
                    </Alert>
                )}
            </AccordionDetails>
        </Accordion>

        <Accordion disableGutters elevation={0} square>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" fontWeight="bold">Favourites</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <FavouritesData dispatch={dispatch} />
            </AccordionDetails>
        </Accordion>

        <Accordion disableGutters elevation={0} square>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" fontWeight="bold">CSV Import</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <CSVConverter dispatch={dispatch} />
            </AccordionDetails>
        </Accordion>
    </div>
)

export const MainPage = () => {
    const [state, dispatch] = useReducer(mainReducerFn, {}, () => {
        const selectedMembers = new Set(persistedSelection)
        const eventDataStr = window.localStorage.getItem(LOCALSTORAGE_KEY.RAWEVENTDATA) || LOCALSTORAGE_DEFAULT.RAWEVENTDATA
        let rawEventData = []
        let allMemberName = []
        let memberInfo = {}
        let rawAnonMapping = {}
        try {
            let { events: evts, anonMapping } = anonimizeEvents(JSON.parse(eventDataStr))
            rawEventData = evts
            rawAnonMapping = anonMapping
            allMemberName = calculateMembers(rawEventData)
            memberInfo = calculateMemberInfo(allMemberName)
        } catch (err) {
            console.error("Failed to load rawEventData", err, { eventDataStr })
        }
        let favourites = new Set()
        try {
            const favouritesStr = window.localStorage.getItem(LOCALSTORAGE_KEY.FAVOURITE_MEMBERS) || LOCALSTORAGE_DEFAULT.FAVOURITE_MEMBERS
            const rawFavouritesData = anonimizeNames(JSON.parse(favouritesStr), rawAnonMapping)
            favourites = new Set(rawFavouritesData)
        } catch (err) {
            console.error("Failed to load favouritesData", err)
        }

        const showWeekends = (window.localStorage.getItem(LOCALSTORAGE_KEY.SHOW_WEEKENDS) || LOCALSTORAGE_DEFAULT.SHOW_WEEKENDS) === 'true'
        const inclusiveEndDate = (window.localStorage.getItem(LOCALSTORAGE_KEY.INCLUSIVE_END_DATE) || LOCALSTORAGE_DEFAULT.INCLUSIVE_END_DATE) === 'true'
        const showComments = (window.localStorage.getItem(LOCALSTORAGE_KEY.SHOW_COMMENTS) || LOCALSTORAGE_DEFAULT.SHOW_COMMENTS) === 'true'

        const { events, errors } = calculateEvents(rawEventData, memberInfo, selectedMembers, inclusiveEndDate)

        return {
            rawData: rawEventData,
            events,
            eventErrors: errors,
            memberInfo,
            allMemberName,
            selectedMembers,
            favourites,
            anonMapping: rawAnonMapping,
            showWeekends,
            inclusiveEndDate,
            showComments,
        }
    })

    const [currentView, setCurrentView] = useState(VIEW_TYPE.CALENDAR)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(
        () => window.localStorage.getItem(LOCALSTORAGE_KEY_SIDEBAR) === 'true'
    )
    const isMobile = useMediaQuery('(max-width: 768px)')

    useEffect(() => {
        window.localStorage.setItem(LOCALSTORAGE_KEY.SELECTEDMEMBERS, JSON.stringify([...state.selectedMembers]))
    }, [state.selectedMembers])

    useEffect(() => {
        window.localStorage.setItem(LOCALSTORAGE_KEY.SHOW_WEEKENDS, String(state.showWeekends))
    }, [state.showWeekends])

    useEffect(() => {
        window.localStorage.setItem(LOCALSTORAGE_KEY.INCLUSIVE_END_DATE, String(state.inclusiveEndDate))
    }, [state.inclusiveEndDate])

    useEffect(() => {
        window.localStorage.setItem(LOCALSTORAGE_KEY.SHOW_COMMENTS, String(state.showComments))
    }, [state.showComments])

    useEffect(() => {
        window.localStorage.setItem(LOCALSTORAGE_KEY_SIDEBAR, String(sidebarCollapsed))
        // FullCalendar sizes itself once — fire a resize after the CSS transition (0.2s) completes
        const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 220)
        return () => clearTimeout(t)
    }, [sidebarCollapsed])

    const mainContent = currentView === VIEW_TYPE.CALENDAR ? (
        <Calendar events={state.events} showWeekends={state.showWeekends} showComments={state.showComments} />
    ) : (
        <TableView
            events={state.events}
            memberInfo={state.memberInfo}
            selectedMembers={state.selectedMembers}
            allMemberName={state.allMemberName}
            showWeekends={state.showWeekends}
            showComments={state.showComments}
        />
    )

    if (isMobile) {
        return (
            <div className="mainPage mainPage--mobile">
                <header className="mobile-topbar">
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                        Absence Calendar
                    </Typography>
                    <IconButton
                        size="medium"
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Open menu"
                        sx={{ color: 'inherit' }}
                    >
                        <MenuIcon />
                    </IconButton>
                </header>

                <div className="main-content">
                    {mainContent}
                </div>

                <Drawer
                    anchor="right"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    PaperProps={{ className: 'mobile-drawer-paper' }}
                >
                    <div className="sidebar-header">
                        <Typography variant="h6" fontWeight="bold" noWrap sx={{ flex: 1, minWidth: 0 }}>
                            Absence Calendar
                        </Typography>
                        <IconButton size="small" onClick={() => setDrawerOpen(false)} sx={{ ml: 1, flexShrink: 0 }}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                    <SidebarSections
                        state={state}
                        dispatch={dispatch}
                        currentView={currentView}
                        setCurrentView={setCurrentView}
                        onViewChange={() => setDrawerOpen(false)}
                    />
                </Drawer>
            </div>
        )
    }

    return (
        <div className="mainPage">
            <div className="main-content">
                {mainContent}
            </div>

            <aside className={`sidebar${sidebarCollapsed ? ' sidebar--collapsed' : ''}`}>
                {sidebarCollapsed ? (
                    <div className="sidebar-icon-strip">
                        <Tooltip title="Expand menu" placement="left">
                            <IconButton
                                size="small"
                                onClick={() => setSidebarCollapsed(false)}
                                className="sidebar-icon-btn"
                            >
                                <ChevronLeftIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        {SECTION_ICONS.map(({ label, icon }) => (
                            <Tooltip key={label} title={label} placement="left">
                                <IconButton
                                    size="small"
                                    onClick={() => setSidebarCollapsed(false)}
                                    className="sidebar-icon-btn"
                                >
                                    {icon}
                                </IconButton>
                            </Tooltip>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="sidebar-header">
                            <Typography variant="h6" fontWeight="bold" noWrap sx={{ flex: 1, minWidth: 0 }}>
                                Absence Calendar
                            </Typography>
                            <Tooltip title="Collapse menu" placement="left">
                                <IconButton
                                    size="small"
                                    onClick={() => setSidebarCollapsed(true)}
                                    sx={{ ml: 1, flexShrink: 0 }}
                                >
                                    <ChevronRightIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </div>
                        <SidebarSections
                            state={state}
                            dispatch={dispatch}
                            currentView={currentView}
                            setCurrentView={setCurrentView}
                        />
                    </>
                )}
            </aside>
        </div>
    )
}
