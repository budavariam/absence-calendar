import React, { useReducer, useMemo } from 'react';
import { FixedSizeList } from 'react-window';
import "./MemberSelector.css"
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import { DISPATCH_ACTION } from '../utils/constants';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Star from '@mui/icons-material/Star';
import StarOutline from '@mui/icons-material/StarOutline';
import ClearAllIcon from '@mui/icons-material/ClearAll';

const FILTER_ACTION = {
    SET_NAME: 'SET_NAME',
    TOGGLE_SELECTED: 'TOGGLE_SELECTED',
    TOGGLE_FAVOURITES: 'TOGGLE_FAVOURITES',
}

const filterReducer = (state, action) => {
    switch (action.type) {
        case FILTER_ACTION.SET_NAME:
            return { ...state, filterByName: action.value }
        case FILTER_ACTION.TOGGLE_SELECTED:
            return { ...state, showOnlySelected: !state.showOnlySelected }
        case FILTER_ACTION.TOGGLE_FAVOURITES:
            return { ...state, showOnlyFavourites: !state.showOnlyFavourites }
        default:
            return state
    }
}

function renderRow(props) {
    const { index, style, data } = props;
    const value = data.filteredMembers[index]
    const labelId = `checkbox-list-label-${value}`;
    let checkboxStyle = {}
    try {
        const lineColor = data.memberInfo[value].color.hex()
        checkboxStyle = {color: lineColor}
    } catch (err) {
        console.warn("missing color for line", data, err)
    }
    const isFavourite = data.favourites.has(value)
    return (
        <ListItem
            style={style}
            key={index}
            secondaryAction={
                <IconButton
                    edge="end"
                    size="small"
                    aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                    onClick={data.handleFavouriteToggle(value)}
                >
                    {isFavourite ? <Star fontSize="small" sx={{ color: '#f5a623' }} /> : <StarOutline fontSize="small" />}
                </IconButton>
            }
            disablePadding
        >
            <ListItemButton role={undefined} onClick={data.handleToggle(value)} dense>
                <ListItemIcon>
                    <Checkbox
                        style={checkboxStyle}
                        edge="start"
                        checked={data.selectedMembers.has(value)}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': labelId }}
                    />
                </ListItemIcon>
                <ListItemText id={labelId} primary={value} />
            </ListItemButton>
        </ListItem>
    );
}

export function MemberSelector({ members, selectedMembers, favourites, memberInfo, dispatch }) {
    const handleToggle = (value) => () => {
        dispatch({ type: DISPATCH_ACTION.CHECK_MEMBER, value: value })
    };

    const handleFavouriteToggle = (value) => () => {
        const newFavourites = new Set(favourites)
        if (newFavourites.has(value)) {
            newFavourites.delete(value)
        } else {
            newFavourites.add(value)
        }
        dispatch({ type: DISPATCH_ACTION.UPDATE_FAVOURITES, value: JSON.stringify([...newFavourites]) })
    };

    const [filterState, filterDispatch] = useReducer(filterReducer, {
        filterByName: '',
        showOnlySelected: false,
        showOnlyFavourites: false,
    })
    const { filterByName, showOnlySelected, showOnlyFavourites } = filterState

    const filteredMembers = useMemo(() => members.filter((member) => {
        if (!showOnlySelected && !showOnlyFavourites && filterByName.length < 3) {
            return true
        }
        const searchFoundUser = member.toLocaleLowerCase().indexOf(filterByName.toLocaleLowerCase()) > -1

        if (showOnlySelected && !showOnlyFavourites) {
            return searchFoundUser && selectedMembers.has(member)
        } else if (!showOnlySelected && showOnlyFavourites) {
            // NOTE: intentionally do not search in favourites in this case
            return favourites.has(member)
        } else if (showOnlySelected && showOnlyFavourites) {
            return searchFoundUser && selectedMembers.has(member) && favourites.has(member)
        }
        return searchFoundUser
    }), [members, filterByName, selectedMembers, showOnlySelected, favourites, showOnlyFavourites])

    const handleMouseDown = (event) => {
        event.preventDefault();
    };

    return (
        <div className='memberSelector'>
            <FormControl sx={{ mx: 1, mt: -1, mb: 1, width: '25ch' }} variant="standard">
                <InputLabel htmlFor="member-filter">Member Filter</InputLabel>
                <Input
                    id="member-filter"
                    type="text"
                    value={filterByName}
                    onChange={(e) => filterDispatch({ type: FILTER_ACTION.SET_NAME, value: e.target.value })}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                title="Toggle select all/none members"
                                aria-label="Toggle select all/none members"
                                onClick={() => dispatch({ type: DISPATCH_ACTION.CLEAR_ALL_MEMBERS, filteredMembers })}
                                onMouseDown={handleMouseDown}
                            >
                                <ClearAllIcon />
                            </IconButton>
                            <IconButton
                                title="Toggle member visibility"
                                aria-label="Toggle member visibility"
                                onClick={() => filterDispatch({ type: FILTER_ACTION.TOGGLE_SELECTED })}
                                onMouseDown={handleMouseDown}
                            >
                                {showOnlySelected ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
                            </IconButton>
                            <IconButton
                                title="Toggle favourites visibility"
                                aria-label="Toggle favourites visibility"
                                onClick={() => filterDispatch({ type: FILTER_ACTION.TOGGLE_FAVOURITES })}
                                onMouseDown={handleMouseDown}
                            >
                                {showOnlyFavourites ? <Star /> : <StarOutline />}
                            </IconButton>
                        </InputAdornment>
                    }
                />
            </FormControl>
            <Box
                sx={{
                    width: '100%',
                    height: 300,
                    maxWidth: 300,
                    bgcolor: 'background.paper',
                    border: '1px solid gray',
                }}
            >
                <FixedSizeList
                    height={300}
                    width={300}
                    itemSize={46}
                    itemCount={filteredMembers.length}
                    overscanCount={5}
                    itemData={{
                        handleToggle: handleToggle,
                        handleFavouriteToggle: handleFavouriteToggle,
                        filteredMembers: filteredMembers,
                        selectedMembers: selectedMembers,
                        favourites: favourites,
                        memberInfo: memberInfo,
                    }}
                >
                    {renderRow}
                </FixedSizeList>
            </Box>
        </div>
    );
}
