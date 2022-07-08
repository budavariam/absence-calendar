import React, { useState, useMemo } from 'react';
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

function renderRow(props) {
    // console.log("row", props)
    const { index, style, data } = props;
    const value = data.filteredMembers[index]
    const labelId = `checkbox-list-label-${value}`;
    return (
        <ListItem
            style={style}
            key={index}
            secondaryAction={
                <IconButton edge="end" aria-label="comments" />
            }
            disablePadding
        >
            <ListItemButton role={undefined} onClick={data.handleToggle(value)} dense>
                <ListItemIcon>
                    <Checkbox
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

export function MemberSelector({ members, selectedMembers, dispatch }) {
    const handleToggle = (value) => () => {
        dispatch({ type: DISPATCH_ACTION.CHECK_MEMBER, value: value })
    };

    const [filterByName, setName] = useState('');
    const [showOnlySelected, setShowOnlySelected] = useState(false);
    const handleChange = (event) => {
        setName(event.target.value);
    };

    const filteredMembers = useMemo(() => members.filter((member) => {
        if (!showOnlySelected && filterByName.length < 3) {
            // do not change selection under 3 letters
            return true
        }
        const searchFoundUser = member.toLocaleLowerCase().indexOf(filterByName.toLocaleLowerCase()) > -1
        if (showOnlySelected) {
            return selectedMembers.has(member) && searchFoundUser
        }
        return searchFoundUser
    }), [members, filterByName, selectedMembers, showOnlySelected])

    const handleClickShowMembers = () => {
        setShowOnlySelected((prev) => !prev)
    };

    const handleMouseDownShowMembers = (event) => {
        event.preventDefault();
    };

    return (
        <div className='memberSelector'>
            <FormControl sx={{ m: 1, width: '25ch' }} variant="standard">
                <InputLabel htmlFor="member-filter">Member Filter</InputLabel>
                <Input
                    id="member-filter"
                    type="text"
                    value={filterByName}
                    onChange={handleChange}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle member visibility"
                                onClick={handleClickShowMembers}
                                onMouseDown={handleMouseDownShowMembers}
                            >
                                {showOnlySelected ? <CheckBoxOutlineBlankIcon /> : <CheckBoxIcon />}
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
                        filteredMembers: filteredMembers,
                        selectedMembers: selectedMembers,
                    }}
                >
                    {renderRow}
                </FixedSizeList>
            </Box>
        </div>
    );
}
