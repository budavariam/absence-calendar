import React, { useState, useMemo } from 'react';
import { FixedSizeList } from 'react-window';
import "./MemberSelector.css"
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { DISPATCH_ACTION } from '../utils/constants';

function renderRow(props) {
    console.log("row", props)
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

    const [name, setName] = useState('');
    const handleChange = (event) => {
        setName(event.target.value);
    };

    const filteredMembers = useMemo(() => members.filter((member) => {
        if (name.length <= 3) {
            // do not change selection under 3 letters
            return true
        }
        return member.toLocaleLowerCase().indexOf(name.toLocaleLowerCase()) > -1
    }), [members, name])

    return (
        <div className='memberSelector'>
            <TextField
                fullWidth
                id="member-filter"
                label="Filter Members"
                variant="standard"
                value={name}
                onChange={handleChange}
            />
            <Box
                sx={{
                    width: '100%',
                    height: 400,
                    maxWidth: 360,
                    bgcolor: 'background.paper',
                    border: '1px solid gray',
                }}
            >
                <FixedSizeList
                    height={400}
                    width={360}
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
